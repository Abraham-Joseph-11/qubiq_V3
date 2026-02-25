/**
 * ESP32 Blockly - Main Application (OttoBlockly Style)
 */

class ESP32BlocklyApp {
    constructor() {
        this.workspace = null;
        this.currentLanguage = 'arduino';
        this.uiLanguage = 'en';
        this.currentLevel = 1;
        this.codePanelVisible = true;
        this.port = null;
        this.writer = null;
        this.reader = null;
        this.lastEmmiScript = '';
        this.emmiExporter = new EMMIScriptExporter();
        this.awsSdkLoadPromise = null;
        this.serialListenersAttached = false;
        this.usbDisconnectInProgress = false;
        this.usbHealthIntervalId = null;
        this.usbNoSignalCount = 0;
        this.usbEverHadSignal = false;
        this.lastSerialRxAt = 0;
        this.uploadConfirmationResolver = null;
        this.uploadConfirmationRejecter = null;
        this.uploadConfirmationToken = ':$#$:';
        this.uploadConfirmationTimeoutMs = 12000;
        this.toastHideTimeoutId = null;
        this.serialBuffer = '';
        this.aiRequestInFlight = false;
        this.aiBlockTypeMap = this.buildDefaultBlocklyMap();
        this.init();
    }

    init() {
        this.initBlockly();
        window.loadEmmiProgramToBlockly = (program) => this.loadEmmiProgramToBlockly(program);
        this.bindEvents();
        this.hideLoading();
        this.switchLanguage('arduino');
        console.log('ESP32 Blockly initialized');
    }

    initBlockly() {
        const blocklyDiv = document.getElementById('blockly-workspace');
        const codePanel = document.getElementById('code-panel');

        // Calculate workspace width (minus code panel)
        const codePanelWidth = codePanel ? codePanel.offsetWidth : 300;

        this.workspace = Blockly.inject(blocklyDiv, {
            toolbox: ESP32Toolbox,
            grid: { spacing: 20, length: 3, colour: '#8a9aaa', snap: true },
            zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
            trashcan: true,
            move: { scrollbars: true, drag: true, wheel: true },
            renderer: 'geras',
            theme: Blockly.Themes.Classic
        });

        // Register Dynamic Variable Category
        this.workspace.registerToolboxCategoryCallback('VARIABLE_DYNAMIC', this.getVariableCategory.bind(this));
        this.workspace.registerButtonCallback('CREATE_VARIABLE', () => this.openVariableModal());

        // Add change listener for code generation
        this.workspace.addChangeListener((event) => {
            if (event.type !== Blockly.Events.UI) {
                this.updateCode();
            }
        });

        // Handle window resize (Standard)
        window.addEventListener('resize', () => {
            Blockly.svgResize(this.workspace);
        });

        // Advanced Resizing: Use ResizeObserver to detect container size changes
        // This fixes issues where the sidebar gets "stuck" when panels open/close
        const resizeObserver = new ResizeObserver(() => {
            Blockly.svgResize(this.workspace);
        });
        resizeObserver.observe(blocklyDiv);
    }

    buildDefaultBlocklyMap() {
        return {
            base: {
                type: 'base_setup_loop',
                setupInput: 'SETUP',
                loopInput: 'LOOP'
            },
            blocks: {
                delay: 'custom_wait',
                setVar: 'custom_variable_set',
                changeVar: 'custom_variable_change',
                if: 'custom_controls_if',
                while: 'custom_controls_whileUntil',
                for: 'custom_controls_for',
                break: 'custom_flow_statements',
                logicCompare: 'logic_compare',
                logicAnd: 'custom_logic_and',
                mathArithmetic: 'math_arithmetic',
                forVarName: 'i'
            },
            value: {
                number: 'math_number',
                text: 'custom_text_value',
                variable: 'custom_variable_get',
                touch: 'emmi_touch_read',
                mic: 'emmi_mic_read',
                light: 'emmi_light_read'
            },
            commandMap: {
                ERN: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_RED', STATE: 'HIGH' } },
                ERF: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_RED', STATE: 'LOW' } },
                EGN: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_GREEN', STATE: 'HIGH' } },
                EGF: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_GREEN', STATE: 'LOW' } },
                EBN: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_BLUE', STATE: 'HIGH' } },
                EBF: { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_BLUE', STATE: 'LOW' } },
                EAN: [
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_RED', STATE: 'HIGH' } },
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_GREEN', STATE: 'HIGH' } },
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_BLUE', STATE: 'HIGH' } }
                ],
                EAF: [
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_RED', STATE: 'LOW' } },
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_GREEN', STATE: 'LOW' } },
                    { type: 'emmi_eyes_digital', fields: { PIN: 'PIN_EYE_BLUE', STATE: 'LOW' } }
                ],
                MF: { type: 'emmi_wheels_simple', fields: { DIRECTION: 'FORWARD', SPEED: '180', STEP: '1' } },
                MB: { type: 'emmi_wheels_simple', fields: { DIRECTION: 'BACKWARD', SPEED: '180', STEP: '1' } },
                ML: { type: 'emmi_wheels_simple', fields: { DIRECTION: 'LEFT', SPEED: '180', STEP: '1' } },
                MR: { type: 'emmi_wheels_simple', fields: { DIRECTION: 'RIGHT', SPEED: '180', STEP: '1' } },
                BS: { type: 'emmi_buzzer_stop', fields: { PIN: 'PIN_BUZZER' } },
                X: { type: 'custom_flow_statements', fields: { FLOW: 'BREAK' } }
            }
        };
    }

    appendAiChatMessage(role, message, kind = 'assistant') {
        const container = document.getElementById('ai-chat-output');
        if (!container || !message) return;

        // Remove welcome message on first real message
        const welcome = container.querySelector('.chatbot-welcome');
        if (welcome) welcome.remove();

        const item = document.createElement('div');
        item.className = 'ai-chat-msg ' + (kind || 'assistant');
        item.textContent = (role ? role + ': ' : '') + message;
        container.appendChild(item);
        container.scrollTop = container.scrollHeight;
    }

    showTypingIndicator() {
        const container = document.getElementById('ai-chat-output');
        if (!container) return;
        // Remove existing typing indicator
        this.removeTypingIndicator();
        const typing = document.createElement('div');
        typing.className = 'chatbot-typing';
        typing.id = 'chatbot-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    removeTypingIndicator() {
        const el = document.getElementById('chatbot-typing');
        if (el) el.remove();
    }

    toggleChatbot(forceOpen) {
        const panel = document.getElementById('chatbot-panel');
        const toggle = document.getElementById('chatbot-toggle');
        const backdrop = document.getElementById('chatbot-backdrop');
        if (!panel) return;

        const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');

        panel.classList.toggle('open', shouldOpen);
        if (toggle) toggle.classList.toggle('active', shouldOpen);
        if (backdrop) backdrop.classList.toggle('visible', shouldOpen);

        if (shouldOpen) {
            const input = document.getElementById('ai-prompt-input');
            if (input) setTimeout(() => input.focus(), 350);
        }
    }

    clearChatMessages() {
        const container = document.getElementById('ai-chat-output');
        if (!container) return;
        container.innerHTML = '<div class="chatbot-welcome"><i class="fas fa-wand-magic-sparkles"></i><p>Describe what you want your EMMI robot to do and I\'ll generate the blocks for you.</p></div>';
    }

    getApiBaseCandidates() {
        const bases = [];
        const add = (value) => {
            if (!value || typeof value !== 'string') return;
            const cleaned = value.replace(/\/$/, '');
            if (!bases.includes(cleaned)) {
                bases.push(cleaned);
            }
        };

        add('');

        if (typeof window !== 'undefined') {
            if (typeof window.EMMI_API_BASE_URL === 'string') {
                add(window.EMMI_API_BASE_URL);
            }
            try {
                const stored = window.localStorage.getItem('emmi_api_base_url');
                if (stored) add(stored);
            } catch (_) {
                // localStorage access may fail in restricted environments
            }
        }

        return bases;
    }

    getDirectAiConfig() {
        const readStored = (key) => {
            try {
                return window.localStorage.getItem(key) || '';
            } catch (_) {
                return '';
            }
        };

        const provider = (window.EMMI_AI_PROVIDER || readStored('emmi_ai_provider') || 'openrouter').toLowerCase();
        const model = window.EMMI_AI_MODEL || readStored('emmi_ai_model') || 'openai/gpt-4.1-mini';
        const baseUrl = (window.OPENROUTER_BASE_URL || readStored('emmi_openrouter_base_url') || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
        const apiKey = window.OPENROUTER_API_KEY || readStored('emmi_openrouter_api_key') || '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';
        return { provider, model, baseUrl, apiKey };
    }

    extractFirstJsonObject(text) {
        if (typeof text !== 'string') return null;
        const trimmed = text.trim();
        try {
            return JSON.parse(trimmed);
        } catch (_) {
            const start = trimmed.indexOf('{');
            const end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                try {
                    return JSON.parse(trimmed.slice(start, end + 1));
                } catch (_) {
                    return null;
                }
            }
            return null;
        }
    }

    sanitizeScalarValue(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim().slice(0, 120);
        return 0;
    }

    sanitizeExpr(expr, warnings) {
        if (!expr || typeof expr !== 'object') {
            warnings.push('Invalid condition replaced with 1==0.');
            return { op: '==', left: 1, right: 0 };
        }
        const op = typeof expr.op === 'string' ? expr.op.trim() : '';
        const validOps = new Set(['==', '!=', '>', '>=', '<', '<=']);
        const safeOp = validOps.has(op) ? op : '==';
        if (safeOp !== op) {
            warnings.push('Unsupported expression operator replaced with ==.');
        }
        return {
            op: safeOp,
            left: this.sanitizeScalarValue(expr.left),
            right: this.sanitizeScalarValue(expr.right)
        };
    }

    sanitizeNodeList(nodes, warnings, depth = 0) {
        if (!Array.isArray(nodes) || depth > 6) return [];
        const out = [];

        for (const raw of nodes.slice(0, 200)) {
            if (!raw || typeof raw !== 'object') continue;
            const type = typeof raw.type === 'string' ? raw.type.trim() : '';

            switch (type) {
                case 'cmd': {
                    const cmd = typeof raw.cmd === 'string' ? raw.cmd.trim().toUpperCase() : '';
                    if (cmd) out.push({ type: 'cmd', cmd });
                    break;
                }
                case 'delay':
                    out.push({ type: 'delay', ms: Math.max(0, Math.round(Number(raw.ms) || 0)) });
                    break;
                case 'set_var': {
                    const varType = typeof raw.varType === 'string' ? raw.varType.toUpperCase() : 'I';
                    const safeType = /^[IFCSB]$/.test(varType) ? varType : 'I';
                    const index = Math.max(1, Math.min(5, Math.round(Number(raw.index) || 1)));
                    const op = raw.op === '+' ? '+' : '=';
                    out.push({
                        type: 'set_var',
                        varType: safeType,
                        index,
                        op,
                        value: this.sanitizeScalarValue(raw.value)
                    });
                    break;
                }
                case 'if':
                    out.push({
                        type: 'if',
                        expr: this.sanitizeExpr(raw.expr, warnings),
                        then: this.sanitizeNodeList(raw.then, warnings, depth + 1),
                        else: this.sanitizeNodeList(raw.else, warnings, depth + 1)
                    });
                    break;
                case 'while':
                    out.push({
                        type: 'while',
                        expr: this.sanitizeExpr(raw.expr, warnings),
                        body: this.sanitizeNodeList(raw.body, warnings, depth + 1)
                    });
                    break;
                case 'for': {
                    let step = Math.round(Number(raw.step) || 1);
                    if (step === 0) step = 1;
                    out.push({
                        type: 'for',
                        start: Math.round(Number(raw.start) || 0),
                        end: Math.round(Number(raw.end) || 0),
                        step,
                        body: this.sanitizeNodeList(raw.body, warnings, depth + 1)
                    });
                    break;
                }
                case 'switch': {
                    const cases = Array.isArray(raw.cases) ? raw.cases.slice(0, 12).map((entry) => ({
                        match: this.sanitizeScalarValue(entry && entry.match),
                        body: this.sanitizeNodeList(entry && entry.body, warnings, depth + 1)
                    })) : [];
                    out.push({
                        type: 'switch',
                        value: this.sanitizeScalarValue(raw.value),
                        cases,
                        default: this.sanitizeNodeList(raw.default, warnings, depth + 1)
                    });
                    break;
                }
                case 'break':
                    out.push({ type: 'break' });
                    break;
                default:
                    if (type) {
                        warnings.push('Skipped unsupported node type: ' + type);
                    }
            }
        }

        return out;
    }

    sanitizeProgram(program, warnings) {
        const source = program && typeof program === 'object' ? program : {};

        // Log warnings for bad AI-generated init flags (diagnostic only)
        const allowedInit = new Set(['E', 'B', 'M', 'T', 'A', 'V']);
        const btFlags = [];
        for (const raw of (Array.isArray(source.initFlags) ? source.initFlags : [])) {
            const token = typeof raw === 'string' ? raw.trim() : '';
            if (!token) continue;
            if (/^R".*"$/.test(token)) {
                btFlags.push(token);
            } else if (!allowedInit.has(token)) {
                warnings.push('Dropped unsupported init flag: ' + token);
            }
        }

        const setup = this.sanitizeNodeList(source.setup, warnings, 0);
        const loop = this.sanitizeNodeList(source.loop, warnings, 0);

        // Infer hardware init flags from commands actually used in the program
        const inferred = this.inferInitFlags(setup, loop);
        const initFlags = inferred.concat(btFlags);

        return { initFlags, setup, loop };
    }

    /**
     * Walk sanitized AST nodes and infer which hardware init flags are needed.
     * Returns an ordered array like ['E', 'M', 'T'] based on commands and
     * sensor references found in the program.
     */
    inferInitFlags(setup, loop) {
        const flags = new Set();

        const scanValue = (val) => {
            if (typeof val !== 'string') return;
            const s = val.trim().toUpperCase();
            if (s === 'TR') flags.add('T');
            else if (s === 'AR') flags.add('A');
            else if (s === 'VR') flags.add('V');
        };

        const scanExpr = (expr) => {
            if (!expr || typeof expr !== 'object') return;
            scanValue(expr.left);
            scanValue(expr.right);
        };

        const scanNodes = (nodes) => {
            if (!Array.isArray(nodes)) return;
            for (const node of nodes) {
                if (!node || typeof node !== 'object') continue;
                switch (node.type) {
                    case 'cmd': {
                        const cmd = typeof node.cmd === 'string' ? node.cmd.toUpperCase() : '';
                        if (/^E[RGBA][NF]$/.test(cmd)) flags.add('E');
                        else if (/^M[FBLRS]$/.test(cmd)) flags.add('M');
                        else if (/^B[SNF]/.test(cmd) || /^B[NF]\d/.test(cmd)) flags.add('B');
                        break;
                    }
                    case 'set_var':
                        scanValue(typeof node.value === 'string' ? node.value : '');
                        break;
                    case 'if':
                        scanExpr(node.expr);
                        scanNodes(node.then);
                        scanNodes(node.else);
                        break;
                    case 'while':
                        scanExpr(node.expr);
                        scanNodes(node.body);
                        break;
                    case 'for':
                        scanNodes(node.body);
                        break;
                    case 'switch':
                        scanValue(typeof node.value === 'string' ? node.value : '');
                        if (Array.isArray(node.cases)) {
                            for (const c of node.cases) {
                                if (c) scanNodes(c.body);
                            }
                        }
                        scanNodes(node.default);
                        break;
                }
            }
        };

        scanNodes(setup);
        scanNodes(loop);

        const order = ['E', 'B', 'M', 'T', 'A', 'V'];
        return order.filter((f) => flags.has(f));
    }

    hasProgramActions(program) {
        const setup = Array.isArray(program?.setup) ? program.setup.length : 0;
        const loop = Array.isArray(program?.loop) ? program.loop.length : 0;
        return (setup + loop) > 0;
    }

    parseRequestedDelayMs(text) {
        const matchMs = text.match(/(\d{2,5})\s*(ms|msec|millisecond)/i);
        if (matchMs) return Math.max(20, Math.min(10000, Number(matchMs[1])));
        const matchSec = text.match(/(\d{1,3})\s*(s|sec|second)/i);
        if (matchSec) return Math.max(20, Math.min(10000, Number(matchSec[1]) * 1000));
        return 500;
    }

    serializeValueToken(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        if (typeof value === 'boolean') return value ? '1' : '0';
        if (typeof value !== 'string') return '0';

        const token = value.trim();
        if (!token) return '""';
        if (/^-?\d+(\.\d+)?$/.test(token)) return token;
        if (/^[IFCSB][1-5]$/.test(token)) return token;
        if (/^(TR|AR|VR)$/.test(token)) return token;
        if (/^(["']).*\1$/.test(token)) return token;
        return '"' + token.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    serializeExprToken(expr) {
        const opMap = { '==': '=', '!=': '!=', '>': '>', '>=': '>=', '<': '<', '<=': '<=' };
        const op = opMap[expr.op] || '=';
        return 'O' + op + ',' + this.serializeValueToken(expr.left) + ',' + this.serializeValueToken(expr.right);
    }

    serializeNodeTokens(nodes) {
        const out = [];
        for (const node of (Array.isArray(nodes) ? nodes : [])) {
            switch (node.type) {
                case 'cmd':
                    out.push(node.cmd);
                    break;
                case 'delay':
                    out.push('D' + String(Math.max(0, Math.round(node.ms))));
                    break;
                case 'set_var':
                    out.push('G(' + node.varType + ',' + node.index + ',' + node.op + ',' + this.serializeValueToken(node.value) + ')');
                    break;
                case 'if': {
                    const thenBody = this.serializeNodeTokens(node.then);
                    const elseBody = this.serializeNodeTokens(node.else);
                    out.push('C(' + this.serializeExprToken(node.expr) + '){' + (thenBody.length ? '|' + thenBody.join('|') + '|' : '') + '}{' + (elseBody.length ? '|' + elseBody.join('|') + '|' : '') + '}');
                    break;
                }
                case 'while': {
                    const body = this.serializeNodeTokens(node.body);
                    out.push('W(' + this.serializeExprToken(node.expr) + '){' + (body.length ? '|' + body.join('|') + '|' : '') + '}');
                    break;
                }
                case 'for': {
                    const body = this.serializeNodeTokens(node.body);
                    out.push('F(' + node.start + '-' + node.end + ',' + node.step + '){' + (body.length ? '|' + body.join('|') + '|' : '') + '}');
                    break;
                }
                case 'switch': {
                    const parts = [];
                    for (const entry of (Array.isArray(node.cases) ? node.cases : [])) {
                        const body = this.serializeNodeTokens(entry.body);
                        parts.push('(' + this.serializeValueToken(entry.match) + '){' + (body.length ? '|' + body.join('|') + '|' : '') + '}');
                    }
                    const defaultBody = this.serializeNodeTokens(node.default);
                    parts.push('(D){' + (defaultBody.length ? '|' + defaultBody.join('|') + '|' : '') + '}');
                    out.push('K(' + this.serializeValueToken(node.value) + ', ' + parts.join(' ') + ')');
                    break;
                }
                case 'break':
                    out.push('X');
                    break;
                default:
                    break;
            }
        }
        return out;
    }

    buildScriptFromProgram(program) {
        const init = (Array.isArray(program.initFlags) ? program.initFlags : []).join('|');
        const setup = this.serializeNodeTokens(program.setup).join('|');
        const loop = this.serializeNodeTokens(program.loop).join('|');
        return '|I|' + init + '|S|' + setup + '|L|' + loop + '|';
    }

    buildHeuristicAiPayload(message) {
        const text = String(message || '').toLowerCase();

        const hasState = text.includes('i1') || text.includes('state');
        const hasTouch = text.includes('touch');
        const hasRgb = text.includes('green') && text.includes('red') && text.includes('blue');
        if (hasState && hasTouch && hasRgb) {
            const delay = text.includes('500') || text.includes('debounce') ? 500 : 300;
            const program = {
                initFlags: ['E', 'T'],
                setup: [{ type: 'set_var', varType: 'I', index: 1, op: '=', value: 0 }],
                loop: [
                    {
                        type: 'if',
                        expr: { op: '==', left: 'TR', right: 1 },
                        then: [
                            { type: 'set_var', varType: 'I', index: 1, op: '+', value: 1 },
                            {
                                type: 'if',
                                expr: { op: '>', left: 'I1', right: 2 },
                                then: [{ type: 'set_var', varType: 'I', index: 1, op: '=', value: 0 }],
                                else: []
                            },
                            { type: 'delay', ms: delay }
                        ],
                        else: []
                    },
                    {
                        type: 'switch',
                        value: 'I1',
                        cases: [
                            { match: 0, body: [{ type: 'cmd', cmd: 'EAF' }, { type: 'cmd', cmd: 'EGN' }] },
                            { match: 1, body: [{ type: 'cmd', cmd: 'EAF' }, { type: 'cmd', cmd: 'ERN' }] },
                            { match: 2, body: [{ type: 'cmd', cmd: 'EAF' }, { type: 'cmd', cmd: 'EBN' }] }
                        ],
                        default: [{ type: 'cmd', cmd: 'EAF' }]
                    }
                ]
            };

            return {
                program,
                explanation: 'Touch increments I1 with wrap-around and updates LED color by state.',
                warnings: ['Using local heuristic translator.']
            };
        }

        const mentionsEyes = text.includes('led') || text.includes('eye') || text.includes('eyes') || text.includes('rgb');
        if (!mentionsEyes) {
            return null;
        }

        const delay = this.parseRequestedDelayMs(text);
        const color = text.includes('green') ? 'green'
            : text.includes('blue') ? 'blue'
                : text.includes('all') ? 'all'
                    : 'red';
        const tokenPair = {
            red: ['ERN', 'ERF'],
            green: ['EGN', 'EGF'],
            blue: ['EBN', 'EBF'],
            all: ['EAN', 'EAF']
        }[color];

        const wantsBlink = text.includes('blink') || text.includes('blinking') || text.includes('flash') || text.includes('toggle');
        const wantsOff = text.includes(' off') || text.includes('switch off') || text.includes('turn off') || text.includes('disable');

        const loop = [];
        if (wantsBlink) {
            loop.push({ type: 'cmd', cmd: tokenPair[0] });
            loop.push({ type: 'delay', ms: delay });
            loop.push({ type: 'cmd', cmd: tokenPair[1] });
            loop.push({ type: 'delay', ms: delay });
        } else {
            loop.push({ type: 'cmd', cmd: wantsOff ? tokenPair[1] : tokenPair[0] });
        }

        const program = {
            initFlags: ['E'],
            setup: [],
            loop
        };

        return {
            program,
            explanation: wantsBlink
                ? ('Blinking ' + color + ' LED by toggling eyes on/off with a delay.')
                : ('Setting ' + color + ' LED ' + (wantsOff ? 'off' : 'on') + '.'),
            warnings: ['Using local heuristic translator.']
        };
    }

    async requestDirectAiTranslation(mode, message) {
        const config = this.getDirectAiConfig();
        const warnings = ['Using direct browser AI mode (no backend route).'];

        const heuristic = this.buildHeuristicAiPayload(message);

        if (config.provider !== 'openrouter' || !config.apiKey) {
            if (heuristic) {
                const script = this.buildScriptFromProgram(heuristic.program);
                return mode === 'legacy'
                    ? { script, explanation: heuristic.explanation, warnings: warnings.concat(heuristic.warnings) }
                    : { program: heuristic.program, script, explanation: heuristic.explanation, warnings: warnings.concat(heuristic.warnings) };
            }
            throw new Error('Set OpenRouter key in browser: localStorage.setItem("emmi_openrouter_api_key","<key>")');
        }

        const systemPrompt = [
            'You convert user intent into an EMMI robot program as JSON AST.',
            'Return ONLY valid JSON. No markdown fences, no commentary outside JSON.',
            '',
            'RESPONSE SHAPE:',
            '{"program":{"initFlags":[],"setup":[],"loop":[]},"explanation":"...","warnings":[]}',
            '',
            'NODE TYPES (use these exactly):',
            '- {"type":"cmd","cmd":"TOKEN"} — hardware command (see VALID TOKENS below)',
            '- {"type":"delay","ms":500} — pause in milliseconds',
            '- {"type":"set_var","varType":"I","index":1,"op":"=","value":0} — variable. varType: I|F|C|S|B, index: 1-5, op: "=" or "+"',
            '- {"type":"if","expr":{"op":"==","left":"TR","right":1},"then":[...],"else":[]}',
            '- {"type":"while","expr":{...},"body":[...]}',
            '- {"type":"for","start":0,"end":10,"step":1,"body":[...]}',
            '- {"type":"switch","value":"I1","cases":[{"match":0,"body":[...]}],"default":[...]}',
            '- {"type":"break"}',
            '',
            'VALID CMD TOKENS (use ONLY these in cmd nodes):',
            'Eyes: ERN(red on), ERF(red off), EGN(green on), EGF(green off), EBN(blue on), EBF(blue off), EAN(all on), EAF(all off)',
            'Motors: MF(forward), MB(backward), ML(left), MR(right), MS(stop)',
            'Buzzer: BS(stop)',
            'IMPORTANT: Do NOT invent tokens. Only use the tokens listed above.',
            '',
            'SENSOR VALUES (use in expr left/right, NOT as cmd):',
            'TR = touch sensor, AR = audio/mic, VR = light/LDR',
            '',
            'VARIABLE REFS: I1-I5(int), F1-F5(float), C1-C5(char), S1-S5(string), B1-B5(bool)',
            '',
            'EXPRESSION: {"op":"==","left":"TR","right":1}  ops: ==, !=, >, >=, <, <=',
            '',
            'INIT FLAGS: E=Eyes, B=Buzzer, M=Motors, T=Touch, A=Audio, V=Light',
            'Include only flags for hardware actually used.',
            '',
            'RULES:',
            '- AR is ACTIVE-LOW: AR==0 means noise detected, AR==1 means quiet',
            '- VR is INVERSE: brighter light -> lower value; direct light ~600',
            '- For LED blink: use cmd on + delay + cmd off + delay in loop',
            '- Use conservative safe defaults when ambiguous',
            '- Keep explanation and warnings concise',
            '',
            'EXAMPLE — blink red LED every 500ms:',
            '{"program":{"initFlags":["E"],"setup":[],"loop":[{"type":"cmd","cmd":"ERN"},{"type":"delay","ms":500},{"type":"cmd","cmd":"ERF"},{"type":"delay","ms":500}]},"explanation":"Blinks red LED on/off every 500ms.","warnings":[]}'
        ].join('\n');

        const response = await fetch(config.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + config.apiKey
            },
            body: JSON.stringify({
                model: config.model,
                temperature: 0.2,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify({ message }) }
                ]
            })
        });

        if (!response.ok) {
            if (heuristic) {
                const script = this.buildScriptFromProgram(heuristic.program);
                warnings.push('AI request failed, used local heuristic fallback.');
                return mode === 'legacy'
                    ? { script, explanation: heuristic.explanation, warnings: warnings.concat(heuristic.warnings) }
                    : { program: heuristic.program, script, explanation: heuristic.explanation, warnings: warnings.concat(heuristic.warnings) };
            }
            const text = await response.text();
            throw new Error('Direct AI request failed: ' + response.status + ' ' + text);
        }

        const body = await response.json();
        const content = body && body.choices && body.choices[0] && body.choices[0].message
            ? body.choices[0].message.content
            : '';
        const parsed = this.extractFirstJsonObject(content);
        if (!parsed) {
            throw new Error('AI returned invalid JSON.');
        }

        const sanitizeWarnings = [];
        const rawProgram = parsed.program && typeof parsed.program === 'object' ? parsed.program : parsed;
        let safeProgram = this.sanitizeProgram(rawProgram, sanitizeWarnings);
        let script = this.buildScriptFromProgram(safeProgram);

        if (!this.hasProgramActions(safeProgram) && heuristic) {
            safeProgram = heuristic.program;
            script = this.buildScriptFromProgram(safeProgram);
            sanitizeWarnings.push('AI returned empty program. Applied heuristic block generation.');
        }

        const validation = this.emmiExporter.validateScript(script);
        if (!validation.valid) {
            if (heuristic) {
                safeProgram = heuristic.program;
                script = this.buildScriptFromProgram(safeProgram);
                sanitizeWarnings.push('AI output invalid. Applied heuristic block generation.');
            } else {
                throw new Error('Generated script invalid: ' + validation.error);
            }
        }

        const explanation = typeof parsed.explanation === 'string' && parsed.explanation.trim()
            ? parsed.explanation.trim()
            : 'Program generated successfully.';
        const mergedWarnings = warnings
            .concat(Array.isArray(parsed.warnings) ? parsed.warnings.map((w) => String(w)) : [])
            .concat(sanitizeWarnings);

        if (mode === 'legacy') {
            return { script, explanation, warnings: mergedWarnings };
        }

        return {
            program: safeProgram,
            script,
            explanation,
            warnings: mergedWarnings
        };
    }

    async requestTranslation(endpoint, message) {
        const candidates = this.getApiBaseCandidates();
        let lastError = null;

        for (const base of candidates) {
            const url = (base || '') + endpoint;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                let payload = null;
                try {
                    payload = await response.json();
                } catch (err) {
                    payload = null;
                }

                if (response.ok) {
                    return payload || {};
                }

                if (response.status === 404) {
                    lastError = new Error('Endpoint not found at ' + (base || 'current origin'));
                    continue;
                }

                const errMessage = payload && payload.error
                    ? payload.error
                    : ('Request failed (' + response.status + ')');
                throw new Error(errMessage);
            } catch (err) {
                lastError = err;
            }
        }

        const mode = endpoint.includes('translate-blockly') ? 'blockly' : 'legacy';
        return this.requestDirectAiTranslation(mode, message);
    }

    getAiTranslateMode() {
        return document.getElementById('ai-translate-mode')?.value || 'blockly';
    }

    loadEmmiProgramToBlockly(program) {
        if (!window.EMMIBlocklyMapper || typeof window.EMMIBlocklyMapper.loadProgramIntoWorkspace !== 'function') {
            throw new Error('Blockly mapper is not loaded.');
        }
        if (!this.workspace) {
            throw new Error('Blockly workspace is not ready.');
        }

        const result = window.EMMIBlocklyMapper.loadProgramIntoWorkspace(
            this.workspace,
            program,
            this.aiBlockTypeMap
        );

        this.updateCode();
        return result;
    }

    async handleAiGenerate() {
        if (this.aiRequestInFlight) return;

        const input = document.getElementById('ai-prompt-input');
        const button = document.getElementById('btn-ai-generate');
        const message = (input?.value || '').trim();
        if (!message) {
            this.showToast('Please enter a description for AI generation.', 'error');
            return;
        }

        // Auto-open chatbot panel
        this.toggleChatbot(true);

        const mode = this.getAiTranslateMode();
        const endpoint = mode === 'legacy' ? '/api/translate' : '/api/translate-blockly';
        this.aiRequestInFlight = true;
        if (button) button.disabled = true;
        if (input) input.value = '';

        this.appendAiChatMessage('You', message, 'user');
        this.showTypingIndicator();

        try {
            const payload = await this.requestTranslation(endpoint, message);

            this.removeTypingIndicator();

            if (payload.explanation) {
                this.appendAiChatMessage('AI', payload.explanation, 'assistant');
            }

            const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
            for (const warning of warnings) {
                this.appendAiChatMessage('Warning', warning, 'warn');
            }

            if (typeof payload.script === 'string' && payload.script.trim()) {
                this.lastEmmiScript = payload.script;
                this.appendAiChatMessage('Script', payload.script, 'assistant');
            }

            if (mode !== 'legacy' && payload.program) {
                const mapped = this.loadEmmiProgramToBlockly(payload.program);
                const mapperWarnings = Array.isArray(mapped?.warnings) ? mapped.warnings : [];
                for (const warning of mapperWarnings) {
                    this.appendAiChatMessage('Blockly', warning, 'warn');
                }
                this.showToast('AI program loaded into Blockly.', 'success');
            } else {
                this.showToast('AI translation complete.', 'success');
            }
        } catch (err) {
            this.removeTypingIndicator();
            this.appendAiChatMessage('Error', err.message, 'error');
            this.showToast(err.message, 'error', { persistent: true, showClose: true });
        } finally {
            this.aiRequestInFlight = false;
            if (button) button.disabled = false;
        }
    }

    updateDynamicControls(mode) {
        const cloudInput = document.getElementById('input-cloud-id');
        const connectBtn = document.getElementById('btn_connect');
        const connectLabel = document.getElementById('lbl_connect');
        const connectIcon = connectBtn?.querySelector('i');

        if (!cloudInput || !connectBtn) return;

        console.log('Switching to mode:', mode);
        this.showToast('Switched to ' + mode + ' Mode');

        if (mode === 'Cloud') {
            cloudInput.style.display = 'block';
            connectBtn.style.display = 'none';
        } else {
            cloudInput.style.display = 'none';
            connectBtn.style.display = 'flex';

            if (mode === 'USB') {
                if (this.isUsbActuallyConnected()) {
                    connectLabel.textContent = 'Disconnect';
                    connectIcon.className = 'fas fa-unlink';
                    connectBtn.title = 'Disconnect USB Serial';
                    connectBtn.classList.add('connected');
                } else {
                    connectLabel.textContent = 'Connect USB';
                    connectIcon.className = 'fas fa-plug';
                    connectBtn.title = 'Connect via USB Serial';
                    connectBtn.classList.remove('connected');
                }
            } else if (mode === 'BLE') {
                connectLabel.textContent = 'Connect BLE';
                connectIcon.className = 'fab fa-bluetooth-b';
                connectBtn.title = 'Connect via Bluetooth';
                connectBtn.classList.remove('connected');
            }
        }
    }

    isUsbActuallyConnected() {
        return Boolean(this.port && (this.port.readable || this.port.writable));
    }

    updateUsbButtonState(isConnected) {
        const btn = document.getElementById('btn_connect');
        const label = document.getElementById('lbl_connect');
        const icon = btn?.querySelector('i');

        if (label) label.textContent = isConnected ? 'Disconnect' : 'Connect USB';
        if (btn) {
            btn.classList.toggle('connected', isConnected);
            btn.title = isConnected ? 'Disconnect USB Serial' : 'Connect via USB Serial';
        }
        if (icon) {
            icon.className = isConnected ? 'fas fa-unlink' : 'fas fa-plug';
        }
    }

    startUsbHealthMonitor() {
        this.stopUsbHealthMonitor();
        this.usbHealthIntervalId = setInterval(() => {
            this.checkUsbHealth().catch((err) => {
                console.warn('USB health check failed:', err);
            });
        }, 1500);
    }

    stopUsbHealthMonitor() {
        if (this.usbHealthIntervalId) {
            clearInterval(this.usbHealthIntervalId);
            this.usbHealthIntervalId = null;
        }
    }

    async checkUsbHealth() {
        if (!this.port || this.usbDisconnectInProgress) return;

        if (!this.isUsbActuallyConnected()) {
            await this.cleanupUsbConnection({
                showToast: true,
                message: 'USB connection lost',
                toastType: 'error',
                tryClosePort: false
            });
            return;
        }

        if ('serial' in navigator && typeof navigator.serial.getPorts === 'function') {
            try {
                const ports = await navigator.serial.getPorts();
                if (!ports.includes(this.port)) {
                    await this.cleanupUsbConnection({
                        showToast: true,
                        message: 'USB device removed',
                        toastType: 'error',
                        tryClosePort: false
                    });
                    return;
                }
            } catch (err) {
                console.warn('navigator.serial.getPorts check failed:', err);
            }
        }

        if (typeof this.port.getSignals === 'function') {
            try {
                const signals = await this.port.getSignals();
                const hasAnySignal = Boolean(
                    signals.clearToSend ||
                    signals.dataSetReady ||
                    signals.dataCarrierDetect ||
                    signals.ringIndicator
                );

                if (hasAnySignal) {
                    this.usbEverHadSignal = true;
                    this.usbNoSignalCount = 0;
                } else if (this.usbEverHadSignal) {
                    this.usbNoSignalCount += 1;
                    if (this.usbNoSignalCount >= 3) {
                        await this.cleanupUsbConnection({
                            showToast: true,
                            message: 'ESP32 appears powered off',
                            toastType: 'error',
                            tryClosePort: false
                        });
                    }
                }
            } catch (err) {
                await this.cleanupUsbConnection({
                    showToast: true,
                    message: 'USB connection lost',
                    toastType: 'error',
                    tryClosePort: false
                });
            }
        }
    }

    async cleanupUsbConnection({
        showToast = false,
        message = '',
        toastType = 'info',
        tryClosePort = true
    } = {}) {
        if (this.usbDisconnectInProgress) return;
        this.usbDisconnectInProgress = true;
        this.keepReading = false;

        try {
            if (this.reader) {
                try {
                    await this.reader.cancel();
                } catch (err) {
                    console.warn('Reader cancel during cleanup failed:', err);
                }
            }

            if (this.writer) {
                try {
                    this.writer.releaseLock();
                } catch (err) {
                    console.warn('Writer release during cleanup failed:', err);
                }
            }

            if (tryClosePort && this.port && (this.port.readable || this.port.writable)) {
                try {
                    await this.port.close();
                } catch (err) {
                    console.warn('Port close during cleanup failed:', err);
                }
            }
        } finally {
            if (this.uploadConfirmationRejecter) {
                this.uploadConfirmationRejecter(new Error('USB disconnected while waiting for ESP32 confirmation.'));
            }
            this.stopUsbHealthMonitor();
            this.reader = null;
            this.writer = null;
            this.port = null;
            this.usbNoSignalCount = 0;
            this.usbEverHadSignal = false;
            this.lastSerialRxAt = 0;
            this.serialBuffer = '';
            this.usbDisconnectInProgress = false;
            this.updateUsbButtonState(false);
            this.updateDynamicControls(this.getSelectedBotMode());
        }

        if (showToast && message) {
            this.showToast(message, toastType);
        }
    }

    handleSerialDisconnectEvent(event) {
        if (!this.port) return;
        const disconnectedPort = event?.port || event?.target || null;
        if (disconnectedPort && disconnectedPort !== this.port) {
            return;
        }

        console.warn('Serial disconnect event detected', event);
        this.cleanupUsbConnection({
            showToast: true,
            message: 'USB device removed',
            toastType: 'error',
            tryClosePort: false
        });
    }

    bindEvents() {
        // Toolbar buttons

        // Toolbar buttons
        document.getElementById('btn-new')?.addEventListener('click', () => this.newProject());
        document.getElementById('btn-open')?.addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveProject());
        document.getElementById('btn-block-creator')?.addEventListener('click', () => window.open('block-creator.html', '_blank'));
        // File input
        document.getElementById('file-input')?.addEventListener('change', (e) => this.loadProject(e));

        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchLanguage(tab.dataset.lang));
        });

        // Code actions
        document.getElementById('btn_copy')?.addEventListener('click', () => this.copyCode());
        document.getElementById('btn_saveino')?.addEventListener('click', () => this.downloadCode());
        document.getElementById('btn_send_emmi')?.addEventListener('click', () => this.sendCurrentEmmiScript());
        document.getElementById('btn_upload_last_emmi')?.addEventListener('click', () => this.sendLastEmmiScript());

        // Language selector
        document.getElementById('languageMenu')?.addEventListener('change', (e) => this.setUILanguage(e.target.value));

        // Board selector - Update toolbox when board changes
        document.getElementById('board-select')?.addEventListener('change', (e) => this.changeBoardType(e.target.value));

        // Code Preview Toggle
        document.getElementById('btn_preview')?.addEventListener('click', () => this.toggleCodePanel());

        // Firmware Upload Toggle
        document.getElementById('firmware-input')?.addEventListener('change', (e) => this.handleFirmwareSelect(e));

        // Ensure title is correct
        const btnToggle = document.getElementById('btn_toggle');
        if (btnToggle) btnToggle.title = "Upload Firmware";

        // Run Button
        document.getElementById('btn_run')?.addEventListener('click', () => {
            this.sendCurrentEmmiScript();
        });

        document.getElementById('btn-ai-generate')?.addEventListener('click', () => this.handleAiGenerate());
        document.getElementById('ai-prompt-input')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleAiGenerate();
            }
        });

        // Chatbot panel controls
        document.getElementById('chatbot-toggle')?.addEventListener('click', () => this.toggleChatbot());
        document.getElementById('chatbot-close')?.addEventListener('click', () => this.toggleChatbot(false));
        document.getElementById('chatbot-clear')?.addEventListener('click', () => this.clearChatMessages());

        // Create and attach backdrop for mobile
        if (!document.getElementById('chatbot-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'chatbot-backdrop';
            backdrop.className = 'chatbot-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', () => this.toggleChatbot(false));
        }

        // Bot Mode Segmented Control
        // Bot Mode Segmented Control
        document.querySelectorAll('input[name="bot-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateDynamicControls(e.target.value);
                }
            });
        });

        // Variable Modal
        // Use optional chaining carefully, or check existence
        const btnCloseVar = document.getElementById('btn-close-variable');
        if (btnCloseVar) btnCloseVar.addEventListener('click', () => this.closeVariableModal());

        const btnConfirmVar = document.getElementById('btn-confirm-variable');
        if (btnConfirmVar) {
            btnConfirmVar.addEventListener('click', () => {
                console.log('OK Button Clicked');
                this.confirmVariable();
            });
        }

        const outputVar = document.getElementById('variable-name-input');
        if (outputVar) {
            outputVar.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.confirmVariable();
            });
        }

        // Connect Button
        document.getElementById('btn_connect')?.addEventListener('click', async () => {
            const mode = document.querySelector('input[name="bot-mode"]:checked').value;
            if (mode === 'USB') {
                if (this.port) {
                    await this.disconnectUSB();
                } else {
                    await this.connectUSB();
                }
            } else if (mode === 'BLE') {
                this.showToast('Scanning for BLE Devices...', 'info');
                // Mock BLE connection
                setTimeout(() => this.showToast('Connected to EMMI-BOT (BLE)', 'success'), 1500);
            }
        });

        // Initialize controls state
        this.updateDynamicControls('USB');

        // Serial connect/disconnect listeners
        if ('serial' in navigator && !this.serialListenersAttached) {
            navigator.serial.addEventListener('disconnect', (event) => this.handleSerialDisconnectEvent(event));
            this.serialListenersAttached = true;
        }

        // Firmware Update Button
        document.getElementById('btn_firmware')?.addEventListener('click', () => {
            this.showToast('Checking for Firmware Updates...', 'info');
            // Mock firmware check
            setTimeout(() => {
                this.showToast('Firmware is up to date!', 'success');
            }, 1500);
        });

        // Window control buttons
        document.getElementById('btn_max')?.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });

        // Serial Monitor Events
        document.getElementById('btn_search')?.addEventListener('click', () => this.toggleSerialMonitor());
        document.getElementById('btn-close-serial')?.addEventListener('click', () => this.closeSerialMonitor());
        document.getElementById('btn-send-serial')?.addEventListener('click', () => this.sendSerial());
        document.getElementById('btn-clear-serial')?.addEventListener('click', () => {
            document.getElementById('serial-output').textContent = '';
        });
        document.getElementById('serial-input')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.sendSerial();
        });
    }

    async connectUSB() {
        if ('serial' in navigator) {
            try {
                this.port = await navigator.serial.requestPort();
                await this.port.open({ baudRate: 115200 });

                this.showToast('USB Connected!', 'success');
                this.updateUsbButtonState(true);
                this.usbNoSignalCount = 0;
                this.usbEverHadSignal = false;
                this.lastSerialRxAt = Date.now();
                this.serialBuffer = '';

                // Start reading loop
                this.keepReading = true;
                this.readLoop();
                this.startUsbHealthMonitor();

            } catch (err) {
                console.error('Serial Connection Error:', err);
                this.port = null;
                this.updateUsbButtonState(false);
                this.showToast('Failed to connect: ' + err.message, 'error');
            }
        } else {
            this.showToast('Web Serial API not supported.', 'error');
        }
    }

    async disconnectUSB() {
        if (!this.port) {
            this.updateUsbButtonState(false);
            return;
        }

        try {
            await this.cleanupUsbConnection({
                showToast: true,
                message: 'USB Disconnected',
                toastType: 'info',
                tryClosePort: true
            });
        } catch (err) {
            console.error('Error closing port:', err);
            this.showToast('Error disconnecting: ' + err.message, 'error');
        }
    }

    async readLoop() {
        let readError = null;

        while (this.port && this.keepReading) {
            if (!this.port.readable) {
                break;
            }

            this.reader = this.port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        // Reader has been canceled.
                        break;
                    }
                    if (value) {
                        const text = new TextDecoder().decode(value);
                        this.lastSerialRxAt = Date.now();
                        this.usbNoSignalCount = 0;
                        this.handleIncomingSerialText(text);
                        this.writeToSerialMonitor(text);
                    }
                }
            } catch (error) {
                console.error('Read error:', error);
                readError = error;
                break;
            } finally {
                try {
                    this.reader.releaseLock();
                } catch (err) {
                    console.warn('Reader release error:', err);
                }
                this.reader = null;
            }
        }

        if (this.keepReading && this.port && !this.isUsbActuallyConnected()) {
            await this.cleanupUsbConnection({
                showToast: true,
                message: 'USB device removed',
                toastType: 'error',
                tryClosePort: false
            });
            return;
        }

        if (this.keepReading && readError && this.port) {
            await this.cleanupUsbConnection({
                showToast: true,
                message: 'USB connection lost',
                toastType: 'error',
                tryClosePort: false
            });
        }
    }

    writeToSerialMonitor(text) {
        const output = document.getElementById('serial-output');
        if (output) {
            const timestamp = document.getElementById('chk-timestamp')?.checked;
            if (timestamp) {
                const now = new Date();
                const time = now.toLocaleTimeString('en-GB') + '.' + String(now.getMilliseconds()).padStart(3, '0');
                const tsPrefix = `[${time}] -> `;

                // Check if we are at the start of a new line (or buffer empty)
                // Note: we check output.textContent to see if the previous print ended with a newline
                const isAtStart = output.textContent.length === 0 || output.textContent.endsWith('\n');

                if (isAtStart) {
                    text = tsPrefix + text;
                }

                // Replace all newlines that are NOT at the very end of the string
                // This splits the chunk into lines and timestamps them, but leaves the final newline alone
                // so the NEXT chunk will generate a fresh timestamp for the next line.
                text = text.replace(/\n(?!$)/g, '\n' + tsPrefix);
            }

            output.textContent += text;

            if (document.getElementById('chk-autoscroll')?.checked) {
                output.scrollTop = output.scrollHeight;
            }
        }
    }

    handleIncomingSerialText(text) {
        if (!text) return;

        this.serialBuffer += text;
        if (this.serialBuffer.length > 4096) {
            this.serialBuffer = this.serialBuffer.slice(-4096);
        }

        if (this.uploadConfirmationResolver && this.serialBuffer.includes(this.uploadConfirmationToken)) {
            this.serialBuffer = '';
            this.uploadConfirmationResolver();
        }
    }

    waitForUploadConfirmation() {
        if (this.serialBuffer.includes(this.uploadConfirmationToken)) {
            this.serialBuffer = '';
            return Promise.resolve();
        }

        if (this.uploadConfirmationRejecter) {
            this.uploadConfirmationRejecter(new Error('Previous upload confirmation wait was replaced.'));
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                if (this.uploadConfirmationRejecter) {
                    this.uploadConfirmationRejecter(
                        new Error('Upload failed: no response from ESP32. Check if EMMI BOT V2 is turned on or if another product is connected.')
                    );
                }
            }, this.uploadConfirmationTimeoutMs);

            const complete = () => {
                clearTimeout(timeoutId);
                this.uploadConfirmationResolver = null;
                this.uploadConfirmationRejecter = null;
                resolve();
            };

            const fail = (error) => {
                clearTimeout(timeoutId);
                this.uploadConfirmationResolver = null;
                this.uploadConfirmationRejecter = null;
                reject(error instanceof Error ? error : new Error(String(error)));
            };

            this.uploadConfirmationResolver = complete;
            this.uploadConfirmationRejecter = fail;
        });
    }

    async sendSerial() {
        if (!this.port || !this.port.writable) {
            this.showToast('Not connected!', 'error');
            return;
        }

        const input = document.getElementById('serial-input');
        const text = input.value;
        if (!text) return;

        const writer = this.port.writable.getWriter();
        try {
            const data = new TextEncoder().encode(text + '\n'); // Add newline
            await writer.write(data);
            input.value = '';
            // Echo locally?
            this.writeToSerialMonitor('> ' + text + '\n');
        } catch (err) {
            console.error('Write error:', err);
            this.showToast('Failed to send', 'error');
        } finally {
            writer.releaseLock();
        }
    }

    generateEmmiScript() {
        const generated = this.emmiExporter.generateFromWorkspace(this.workspace);
        const validation = this.emmiExporter.validateScript(generated.script);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        this.lastEmmiScript = generated.script;
        return generated;
    }

    async sendEmmiScriptToSerial(script) {
        if (!script || !script.trim()) {
            throw new Error('EMMI script is empty.');
        }

        if (!this.port) {
            await this.connectUSB();
        }
        if (!this.port) {
            throw new Error('Serial port unavailable.');
        }
        if (!this.port.writable) {
            await this.port.open({ baudRate: 115200 });
        }

        const writer = this.port.writable.getWriter();
        try {
            console.log('EMMI TX:', script);
            const payload = new TextEncoder().encode(script + '\n');
            await writer.write(payload);
            this.writeToSerialMonitor('> EMMI TX: ' + script + '\n');
        } catch (err) {
            console.error('EMMI send failed:', err);
            throw new Error('Failed to send EMMI script: ' + err.message);
        } finally {
            writer.releaseLock();
        }
    }

    getSelectedBotMode() {
        const selected = document.querySelector('input[name="bot-mode"]:checked');
        return selected ? selected.value : 'USB';
    }

    getCloudConfig() {
        let config = null;

        const direct = localStorage.getItem('emmiCloudConfig');
        if (direct) {
            try {
                config = JSON.parse(direct);
            } catch (err) {
                console.warn('Invalid emmiCloudConfig in localStorage:', err);
            }
        }

        if (!config) {
            const creatorRaw = localStorage.getItem('blockCreatorData');
            if (creatorRaw) {
                try {
                    const creatorData = JSON.parse(creatorRaw);
                    config = creatorData.cloudConfig || null;
                } catch (err) {
                    console.warn('Invalid blockCreatorData in localStorage:', err);
                }
            }
        }

        return {
            accessKeyId: config?.accessKeyId || '',
            secretAccessKey: config?.secretAccessKey || '',
            region: config?.region || '',
            bucketName: config?.bucketName || ''
        };
    }

    validateCloudConfig(config) {
        if (!config.accessKeyId) {
            throw new Error('Cloud config missing Access Key ID. Set it in Block Creator > Cloud Settings.');
        }
        if (!config.secretAccessKey) {
            throw new Error('Cloud config missing Secret Access Key. Set it in Block Creator > Cloud Settings.');
        }
        if (!config.region) {
            throw new Error('Cloud config missing Region. Set it in Block Creator > Cloud Settings.');
        }
        if (!config.bucketName) {
            throw new Error('Cloud config missing Bucket Name. Set it in Block Creator > Cloud Settings.');
        }
    }

    buildCloudCorsHelp(error, bucketName) {
        const raw = (error && (error.message || error.code || String(error))) || 'Unknown cloud error';
        const needsLocalhost = window.location.protocol === 'file:';
        const endpointOrigin = window.location.origin || 'null';

        let help = 'Cloud upload failed: ' + raw + '.';
        help += ' Ensure S3 CORS allows your app origin and required methods/headers.';
        if (needsLocalhost) {
            help += ' You are running from file:// (origin null); run via http://localhost instead.';
        }
        help += ' Bucket: ' + bucketName + ', Origin: ' + endpointOrigin + '.';
        return help;
    }

    async ensureAwsSdkLoaded() {
        if (window.AWS && window.AWS.S3) {
            return;
        }

        if (!this.awsSdkLoadPromise) {
            this.awsSdkLoadPromise = new Promise((resolve, reject) => {
                const existing = document.getElementById('aws-sdk-script');
                if (existing) {
                    existing.addEventListener('load', () => resolve());
                    existing.addEventListener('error', () => reject(new Error('Failed to load AWS SDK script.')));
                    return;
                }

                const script = document.createElement('script');
                script.id = 'aws-sdk-script';
                script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1563.0.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load AWS SDK script.'));
                document.head.appendChild(script);
            });
        }

        await this.awsSdkLoadPromise;
    }

    async sendEmmiScriptToCloud(script) {
        if (!script || !script.trim()) {
            throw new Error('EMMI script is empty.');
        }

        if (window.location.protocol === 'file:') {
            throw new Error('Cloud upload requires HTTP/HTTPS origin. Open the app via localhost (not file://).');
        }

        const cloudDeviceId = (document.getElementById('input-cloud-id')?.value || '').trim();
        if (!cloudDeviceId) {
            throw new Error('Cloud Device ID is required in Cloud mode.');
        }

        const cloudConfig = this.getCloudConfig();
        this.validateCloudConfig(cloudConfig);
        await this.ensureAwsSdkLoaded();

        window.AWS.config.update({
            accessKeyId: cloudConfig.accessKeyId,
            secretAccessKey: cloudConfig.secretAccessKey,
            region: cloudConfig.region
        });

        const s3 = new window.AWS.S3({ apiVersion: '2006-03-01' });
        const devicePrefix = cloudDeviceId + '/';

        let prefixExists = false;
        try {
            const listing = await s3.listObjectsV2({
                Bucket: cloudConfig.bucketName,
                Prefix: devicePrefix,
                MaxKeys: 1
            }).promise();
            prefixExists = Array.isArray(listing.Contents) && listing.Contents.length > 0;
        } catch (err) {
            console.error('Cloud directory check failed:', err);
            throw new Error(this.buildCloudCorsHelp(err, cloudConfig.bucketName));
        }

        if (!prefixExists) {
            throw new Error('Device directory "' + devicePrefix + '" not found in bucket "' + cloudConfig.bucketName + '".');
        }

        const commandKey = devicePrefix + cloudDeviceId + '_cmd.txt';
        const checkKey = devicePrefix + cloudDeviceId + '_check.txt';

        console.log('Cloud TX:', {
            bucket: cloudConfig.bucketName,
            prefix: devicePrefix,
            commandKey,
            checkKey,
            payload: script
        });

        try {
            await s3.putObject({
                Bucket: cloudConfig.bucketName,
                Key: commandKey,
                Body: script,
                ContentType: 'text/plain'
            }).promise();

            await s3.putObject({
                Bucket: cloudConfig.bucketName,
                Key: checkKey,
                Body: '1',
                ContentType: 'text/plain'
            }).promise();
        } catch (err) {
            console.error('Cloud upload failed:', err);
            throw new Error(this.buildCloudCorsHelp(err, cloudConfig.bucketName));
        }
    }

    async sendCurrentEmmiScript() {
        try {
            const generated = this.generateEmmiScript();
            const mode = this.getSelectedBotMode();

            if (mode === 'Cloud') {
                this.showToast('Sending EMMI script to cloud...', 'info');
                await this.sendEmmiScriptToCloud(generated.script);
                this.showToast('Cloud upload completed successfully.', 'success');
            } else {
                if (mode === 'USB') {
                    this.serialBuffer = '';
                    this.showToast('Uploading command...', 'info', {
                        persistent: true,
                        showClose: true
                    });
                } else {
                    this.showToast('Sending EMMI script...', 'info');
                }

                await this.sendEmmiScriptToSerial(generated.script);

                if (mode === 'USB') {
                    await this.waitForUploadConfirmation();
                    this.showToast('Upload successful.', 'success', {
                        durationMs: 2000,
                        showClose: true
                    });
                } else {
                    this.showToast('EMMI script sent successfully.', 'success');
                }
            }

            if (this.currentLanguage === 'emmi') {
                this.updateCode();
            }
        } catch (err) {
            this.showToast(err.message, 'error', {
                persistent: true,
                showClose: true
            });
        }
    }

    async sendLastEmmiScript() {
        try {
            if (!this.lastEmmiScript) {
                const generated = this.generateEmmiScript();
                this.lastEmmiScript = generated.script;
            }

            const mode = this.getSelectedBotMode();
            if (mode === 'Cloud') {
                await this.sendEmmiScriptToCloud(this.lastEmmiScript);
                this.showToast('Last EMMI script uploaded to cloud!', 'success');
            } else {
                await this.sendEmmiScriptToSerial(this.lastEmmiScript);
                this.showToast('Last EMMI script sent!', 'success');
            }
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    toggleSerialMonitor() {
        const modal = document.getElementById('serial-monitor-modal');
        if (modal.classList.contains('hidden')) {
            this.openSerialMonitor();
        } else {
            this.closeSerialMonitor();
        }
    }

    toggleCodePanel() {
        const panel = document.getElementById('code-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            // Trigger resize for Blockly
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }
    }

    openSerialMonitor() {
        document.getElementById('serial-monitor-modal').classList.remove('hidden');
    }

    closeSerialMonitor() {
        document.getElementById('serial-monitor-modal').classList.add('hidden');
    }

    uploadFirmware() {
        const input = document.getElementById('firmware-input');
        if (input) {
            this.showToast('Select .bin file to upload', 'info');
            input.click();
        } else {
            console.error('Firmware input element not found!');
            this.showToast('Internal Error: Input missing', 'error');
        }
    }

    async handleFirmwareSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.port) {
            this.showToast('Please connect USB first', 'error');
            return;
        }

        let LoaderClass, TransportClass;

        // 1. Check globals (fallback)
        if (window.esptool && window.esptool.ESPLoader && window.esptool.Transport) {
            LoaderClass = window.esptool.ESPLoader;
            TransportClass = window.esptool.Transport;
        }

        if (!LoaderClass) {
            this.showToast('Loading flasher library...', 'info');
            try {
                // Use JSPM for reliable ESM conversion
                const module = await import('https://jspm.dev/esptool-js');

                // Handle JSPM export structure
                if (module.default && module.default.ESPLoader) {
                    LoaderClass = module.default.ESPLoader;
                    TransportClass = module.default.Transport;
                } else if (module.ESPLoader) {
                    LoaderClass = module.ESPLoader;
                    TransportClass = module.Transport;
                } else if (module.default && module.default.default && module.default.default.ESPLoader) {
                    // Sometimes nested defaults occur
                    LoaderClass = module.default.default.ESPLoader;
                    TransportClass = module.default.default.Transport;
                }

                console.log("esptool loaded via JSPM:", module);

            } catch (e) {
                console.error("Failed to load esptool module:", e);
                this.showToast('Error loading library: ' + e.message, 'error');
                return;
            }
        }

        if (!LoaderClass || !TransportClass) {
            this.showToast('Error: esptool classes not found', 'error');
            return;
        }

        this.showToast('Preparing to flash...', 'info');
        this.openSerialMonitor();
        this.writeToSerialMonitor('\n--- STARTING FIRMWARE UPLOAD ---\n');

        try {
            // Stop reading so esptool can take over
            await this.stopReadingOnly();

            // Read file
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileData = e.target.result;

                try {
                    // Initialize Transport
                    const transport = new TransportClass(this.port);

                    // Initialize ESPLoader
                    // Emulation of terminal for esptool
                    const terminal = {
                        clean: () => { },
                        writeLine: (data) => this.writeToSerialMonitor(data + '\n'),
                        write: (data) => this.writeToSerialMonitor(data)
                    };

                    // Try object-based constructor first (modern esptool-js)
                    let esploader;
                    try {
                        esploader = new LoaderClass({
                            transport: transport,
                            baudrate: 115200,
                            terminal: terminal
                        });
                    } catch (e) {
                        // Fallback to positional arguments
                        esploader = new LoaderClass(
                            transport,
                            115200,
                            terminal,
                            460800
                        );
                    }

                    this.writeToSerialMonitor('Connecting to bootloader...\n');

                    // Force chip type to esp32 which might skip some auto-detection steps that fail
                    // esploader.chip = "esp32"; 

                    try {
                        await esploader.main_fn();
                        await esploader.flash_id();
                    } catch (e) {
                        this.writeToSerialMonitor('Connection failed. Retrying with default options...\n');
                        console.error("First connect attempt failed:", e);
                        // Retry logic? For now, re-throw to catch block
                        throw e;
                    }

                    this.writeToSerialMonitor('Flashing file: ' + file.name + '...\n');

                    // Standard offset 0x10000 for app
                    const offset = 0x10000;

                    // Ensure fileArray is correctly formatted for write_flash
                    const fileArray = [{ data: fileData, address: offset }];

                    await esploader.write_flash(
                        {
                            fileArray: fileArray,
                            flashSize: 'keep',
                            flashMode: 'keep',
                            flashFreq: 'keep',
                            eraseAll: false,
                            compress: true,
                        }
                    );

                    this.writeToSerialMonitor('\n--- FLASH COMPLETE ---\n');
                    this.showToast('Upload Successful!', 'success');

                } catch (err) {
                    console.error('Flash error:', err);
                    this.writeToSerialMonitor('\nError: ' + err.message + '\n');
                    this.showToast('Upload Failed', 'error');
                } finally {
                    // Reset input
                    event.target.value = '';

                    // Re-enable reading loop
                    this.writeToSerialMonitor('Restarting Serial Monitor...\n');
                    // We need to re-open port because esptool closed it or left it in unknown state?
                    // esptool usually leaves it open or closed?
                    // Safe to try connecting again.
                    // But we have this.port. 
                    // We just need to start readLoop again.
                    // But port might need opening if esptool closed it.
                    // Let's assume we need to re-open.
                    if (!this.port.readable) {
                        try {
                            await this.port.open({ baudRate: 115200 });
                        } catch (e) {
                            console.warn("Could not re-open port:", e);
                        }
                    }
                    this.keepReading = true;
                    this.readLoop();
                    this.startUsbHealthMonitor();
                }
            };
            reader.readAsBinaryString(file);

        } catch (err) {
            console.error(err);
            // Restart reader if failed preparation
            this.keepReading = true;
            this.readLoop();
            this.startUsbHealthMonitor();
        }
    }

    async stopReadingOnly() {
        this.stopUsbHealthMonitor();
        this.keepReading = false;
        if (this.reader) {
            await this.reader.cancel();
        }
        if (this.writer) {
            this.writer.releaseLock();
            this.writer = null;
        }
        // Wait for loop to exit
        await new Promise(resolve => setTimeout(resolve, 100));

        // Close port so esptool can open it
        if (this.port && this.port.readable) {
            await this.port.close();
        }
        // Do NOT set this.port = null
    }

    setUILanguage(lang) {
        this.uiLanguage = lang;
        const t = EMMITranslations[lang] || EMMITranslations['en'];

        // Update Toolbox
        ESP32Toolbox = getLocalizedToolbox(lang);
        this.workspace.updateToolbox(ESP32Toolbox);

        // Update UI Text elements
        document.getElementById('labelToolboxDefinition').textContent = t['LEVEL'];
        document.getElementById('labelToolboxDefinition').textContent = t['LEVEL'];

        // Update button titles (tooltips)
        document.getElementById('btn-new').title = t['NEW'];
        document.getElementById('btn-save').title = t['SAVE'];
        document.getElementById('btn-open').title = t['OPEN'];
        document.getElementById('btn-undo').title = t['UNDO'];
        document.getElementById('btn-redo').title = t['REDO'];

        this.showToast('Language: ' + document.getElementById('languageMenu').options[document.getElementById('languageMenu').selectedIndex].text);
    }

    setLevel(level) {
        this.currentLevel = level;
        document.querySelectorAll('.btn-level').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn_level' + level)?.classList.add('active');
        this.showToast('Level ' + level + ' selected');
    }

    changeBoardType(boardType) {
        // Update global toolbox with new board configuration
        ESP32Toolbox = getToolboxForBoard(boardType);

        // Update the workspace toolbox
        this.workspace.updateToolbox(ESP32Toolbox);

        // Show notification
        const boardNames = {
            'emmi-bot-v2': 'EMMI BOT V2',
            'flipper': 'Flipper',
            'explorer-kit': 'Explorer Kit',
            'emmi-bypedal': 'EMMI BYPEDAL'
        };

        this.showToast('Switched to ' + (boardNames[boardType] || boardType), 'info');
    }

    updateCode() {
        let code = '';
        try {
            switch (this.currentLanguage) {
                case 'arduino':
                    code = arduinoGenerator.workspaceToCode(this.workspace);
                    if (!code.trim()) code = 'void setup() {\n\n}\n\nvoid loop() {\n\n}';
                    break;
                case 'python':
                    code = pythonGenerator.workspaceToCode(this.workspace);
                    if (!code.trim()) code = '# MicroPython code\n\nwhile True:\n    pass';
                    break;
                case 'java':
                    code = javaGenerator.workspaceToCode(this.workspace);
                    if (!code.trim()) code = '// ESP32 Java style Code\n// Note: This is pseudocode for educational purposes\n\npublic class ESP32Program {\n\n}';
                    break;
                case 'emmi': {
                    const emmi = this.generateEmmiScript();
                    code = emmi.pretty + '\n\nMinified:\n' + emmi.script;
                    break;
                }
            }
        } catch (e) {
            code = '// Error: ' + e.message;
            console.error('Code generation error:', e);
        }

        const codeOutput = document.getElementById('code-output');
        if (codeOutput) {
            codeOutput.textContent = code;
            codeOutput.className = 'language-' + (this.currentLanguage === 'arduino' ? 'cpp' : (this.currentLanguage === 'emmi' ? 'none' : this.currentLanguage));
            if (window.Prism) {
                Prism.highlightElement(codeOutput);
            }
        }
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });
        this.updateCode();
    }

    newProject() {
        if (confirm('Create a new project? Current work will be lost.')) {
            this.workspace.clear();
            // document.getElementById('project-name').value = 'NewProject';
            this.showToast('New project created');
        }
    }

    saveProject() {
        const xml = Blockly.Xml.workspaceToDom(this.workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        // Prompt for filename
        let projectName = prompt('Enter project name:', 'esp32_project');
        if (!projectName) projectName = 'esp32_project';
        // Sanitize filename
        projectName = projectName.replace(/[^a-z0-9_\-]/gi, '_');

        const projectData = {
            name: projectName,
            board: document.getElementById('board-select').value,
            blocks: xmlText,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = projectName + '.bloc';
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Project saved');
    }

    loadProject(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                this.workspace.clear();
                const xml = Blockly.utils.xml.textToDom(projectData.blocks);
                Blockly.Xml.domToWorkspace(xml, this.workspace);
                // document.getElementById('project-name').value = projectData.name || 'Loaded';
                this.showToast('Project loaded');
            } catch (err) {
                try {
                    this.workspace.clear();
                    const xml = Blockly.utils.xml.textToDom(e.target.result);
                    Blockly.Xml.domToWorkspace(xml, this.workspace);
                    this.showToast('XML loaded');
                } catch (xmlErr) {
                    this.showToast('Error loading', 'error');
                }
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    copyCode() {
        const code = document.getElementById('code-output')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
            this.showToast('Copied!', 'success');
        }).catch(() => {
            this.showToast('Copy failed', 'error');
        });
    }

    downloadCode() {
        const code = document.getElementById('code-output')?.textContent || '';

        let projectName = prompt('Enter file name:', 'code');
        if (!projectName) projectName = 'code';
        // Sanitize filename
        projectName = projectName.replace(/[^a-z0-9_\-]/gi, '_');
        const extensions = { arduino: '.ino', python: '.py', java: '.java', emmi: '.emmi' };
        const ext = extensions[this.currentLanguage];

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = projectName + ext;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Saved');
    }

    showToast(message, type = 'info', options = {}) {
        const toastOptions = options && typeof options === 'object' ? options : {};
        const persistent = Boolean(toastOptions.persistent);
        const durationMs = Number.isFinite(toastOptions.durationMs) ? toastOptions.durationMs : 2000;
        const showClose = typeof toastOptions.showClose === 'boolean' ? toastOptions.showClose : persistent;

        if (this.toastHideTimeoutId) {
            clearTimeout(this.toastHideTimeoutId);
            this.toastHideTimeoutId = null;
        }

        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;

        const text = document.createElement('span');
        text.className = 'toast-message';
        text.textContent = message;
        toast.appendChild(text);

        const hideToast = () => {
            if (this.toastHideTimeoutId) {
                clearTimeout(this.toastHideTimeoutId);
                this.toastHideTimeoutId = null;
            }
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        };

        if (showClose) {
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'toast-close';
            closeBtn.setAttribute('aria-label', 'Close notification');
            closeBtn.textContent = 'x';
            closeBtn.addEventListener('click', hideToast);
            toast.appendChild(closeBtn);
        }

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        if (!persistent) {
            this.toastHideTimeoutId = setTimeout(hideToast, Math.max(500, durationMs));
        }
    }

    // ===========================================
    // Variable Modal & Dynamic Category
    // ===========================================

    openVariableModal() {
        const modal = document.getElementById('variable-modal');
        const input = document.getElementById('variable-name-input');
        if (modal) {
            modal.classList.remove('hidden');
            input.value = '';
            input.focus();
        }
    }

    closeVariableModal() {
        const modal = document.getElementById('variable-modal');
        if (modal) modal.classList.add('hidden');
    }

    confirmVariable() {
        console.log('Confirming variable...');
        const input = document.getElementById('variable-name-input');
        const name = input.value.trim();
        if (name) {
            try {
                // Use getVariableMap() to avoid deprecation warning
                const existingVar = this.workspace.getVariableMap().getVariable(name);
                if (existingVar) {
                    this.showToast('Variable "' + name + '" already exists', 'info');
                    this.closeVariableModal();
                } else {
                    // createVariable is on workspace, generally safe, but let's see.
                    // Some blockly versions prefer workspace.getVariableMap().createVariable? 
                    // No, usually createVariable is on workspace.
                    const newVar = this.workspace.getVariableMap().createVariable(name);
                    console.log('Created variable object:', newVar);
                    this.showToast('Variable "' + name + '" created', 'success');
                    this.closeVariableModal();

                    // Refresh toolbox to show new blocks
                    console.log('Refreshing toolbox after creation...');
                    this.workspace.updateToolbox(ESP32Toolbox);
                }
            } catch (e) {
                console.error('Error in confirmVariable:', e);
                this.showToast('Error: ' + e.message, 'error');
            }
        } else {
            this.showToast('Please enter a variable name', 'error');
        }
    }

    getVariableCategory(workspace) {
        var xmlList = [];

        // 1. "Make a Variable" Button
        var button = document.createElement('button');
        button.setAttribute('text', 'make a variable');
        button.setAttribute('callbackKey', 'CREATE_VARIABLE');
        xmlList.push(button);

        // 2. Add Generic Variable Blocks (if any variables exist)
        // We only add one set of blocks. The 'VAR' field in these blocks 
        // will automatically become a dropdown listing all variables.
        var variables = this.workspace.getVariableMap().getAllVariables();
        console.log('Main Workspace has ' + variables.length + ' variables');

        if (variables.length > 0) {
            var firstVar = variables[0];
            var varName = firstVar.name;
            var varId = firstVar.getId();

            // Block: Declare
            var blockDeclare = document.createElement('block');
            blockDeclare.setAttribute('type', 'custom_variable_declare');
            var fieldVar = document.createElement('field');
            fieldVar.setAttribute('name', 'VAR');
            fieldVar.setAttribute('id', varId);
            fieldVar.textContent = varName;
            blockDeclare.appendChild(fieldVar);
            // Default Type
            var fieldType = document.createElement('field');
            fieldType.setAttribute('name', 'TYPE');
            fieldType.textContent = 'char';
            blockDeclare.appendChild(fieldType);
            // Shadow Value
            var value = document.createElement('value');
            value.setAttribute('name', 'VALUE');
            var shadow = document.createElement('shadow');
            shadow.setAttribute('type', 'math_number');
            var fieldNum = document.createElement('field');
            fieldNum.setAttribute('name', 'NUM');
            fieldNum.textContent = '0';
            shadow.appendChild(fieldNum);
            value.appendChild(shadow);
            blockDeclare.appendChild(value);
            xmlList.push(blockDeclare);

            // Block: Set
            var blockSet = document.createElement('block');
            blockSet.setAttribute('type', 'custom_variable_set');
            var fieldVarSet = document.createElement('field');
            fieldVarSet.setAttribute('name', 'VAR');
            fieldVarSet.setAttribute('id', varId);
            fieldVarSet.textContent = varName;
            blockSet.appendChild(fieldVarSet);
            // Shadow Value
            var valueSet = document.createElement('value');
            valueSet.setAttribute('name', 'VALUE');
            var shadowSet = document.createElement('shadow');
            shadowSet.setAttribute('type', 'math_number');
            var fieldNumSet = document.createElement('field');
            fieldNumSet.setAttribute('name', 'NUM');
            fieldNumSet.textContent = '0';
            shadowSet.appendChild(fieldNumSet);
            valueSet.appendChild(shadowSet);
            blockSet.appendChild(valueSet);
            xmlList.push(blockSet);

            // Block: Change
            var blockChange = document.createElement('block');
            blockChange.setAttribute('type', 'custom_variable_change');
            var fieldVarChange = document.createElement('field');
            fieldVarChange.setAttribute('name', 'VAR');
            fieldVarChange.setAttribute('id', varId);
            fieldVarChange.textContent = varName;
            blockChange.appendChild(fieldVarChange);
            // Shadow Value
            var valueChange = document.createElement('value');
            valueChange.setAttribute('name', 'VALUE');
            var shadowChange = document.createElement('shadow');
            shadowChange.setAttribute('type', 'math_number');
            var fieldNumChange = document.createElement('field');
            fieldNumChange.setAttribute('name', 'NUM');
            fieldNumChange.textContent = '1';
            shadowChange.appendChild(fieldNumChange);
            valueChange.appendChild(shadowChange);
            blockChange.appendChild(valueChange);
            xmlList.push(blockChange);

            // Block: Getter (Reporter)
            var blockGet = document.createElement('block');
            blockGet.setAttribute('type', 'custom_variable_get');
            var fieldVarGet = document.createElement('field');
            fieldVarGet.setAttribute('name', 'VAR');
            fieldVarGet.setAttribute('id', varId);
            fieldVarGet.textContent = varName;
            blockGet.appendChild(fieldVarGet);
            xmlList.push(blockGet);

            // Constants - Optional: Just one set for generic constant creation?
            // The user request was about "variables" specifically having dropdowns.
            // Constants using InputText likely don't need a list repeated unless we track them.
            // For now, let's include one set of Constant blocks as templates.

            // Block: Declare Constant
            var blockConst = document.createElement('block');
            blockConst.setAttribute('type', 'custom_constant_declare');
            var fieldVarConst = document.createElement('field');
            fieldVarConst.setAttribute('name', 'VAR');
            fieldVarConst.textContent = varName;
            blockConst.appendChild(fieldVarConst);
            var fieldTypeConst = document.createElement('field');
            fieldTypeConst.setAttribute('name', 'TYPE');
            fieldTypeConst.textContent = 'char';
            blockConst.appendChild(fieldTypeConst);
            var valueConst = document.createElement('value');
            valueConst.setAttribute('name', 'VALUE');
            var shadowConst = document.createElement('shadow');
            shadowConst.setAttribute('type', 'math_number');
            var fieldNumConst = document.createElement('field');
            fieldNumConst.setAttribute('name', 'NUM');
            fieldNumConst.textContent = '0';
            shadowConst.appendChild(fieldNumConst);
            valueConst.appendChild(shadowConst);
            blockConst.appendChild(valueConst);
            xmlList.push(blockConst);

            // Block: Set Constant
            var blockEquiv = document.createElement('block');
            blockEquiv.setAttribute('type', 'custom_constant_set');
            var fieldVarEquiv = document.createElement('field');
            fieldVarEquiv.setAttribute('name', 'VAR');
            fieldVarEquiv.textContent = varName;
            blockEquiv.appendChild(fieldVarEquiv);
            var valueEquiv = document.createElement('value');
            valueEquiv.setAttribute('name', 'VALUE');
            var shadowEquiv = document.createElement('shadow');
            shadowEquiv.setAttribute('type', 'math_number');
            var fieldNumEquiv = document.createElement('field');
            fieldNumEquiv.setAttribute('name', 'NUM');
            fieldNumEquiv.textContent = '0';
            shadowEquiv.appendChild(fieldNumEquiv);
            valueEquiv.appendChild(shadowEquiv);
            blockEquiv.appendChild(valueEquiv);
            xmlList.push(blockEquiv);
        }

        return xmlList;
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        setTimeout(() => overlay?.classList.add('hidden'), 500);
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ESP32BlocklyApp();
});
