/**
 * Block Creator Tool - Main Application Logic
 */

class BlockCreatorApp {
    constructor() {
        this.data = {
            boards: {},
            cloudConfig: {
                accessKeyId: '',
                secretAccessKey: '',
                region: '',
                bucketName: ''
            }
        };
        this.currentBoard = null;
        this.currentCategory = null;
        this.editingBoard = null;
        this.editingCategory = null;
        this.editingBlock = null;

        // Auto-sync properties
        this.autoSyncEnabled = false;
        this.directoryHandle = null;

        this.init();
    }

    init() {
        this.bindEvents();

        // Try to auto-import from main app first
        this.autoLoadData();

        console.log('Block Creator Tool initialized');
    }

    async autoLoadData() {
        // First, try to load from localStorage
        const saved = localStorage.getItem('blockCreatorData');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                console.log('Loaded data from localStorage');
            } catch (e) {
                console.error('Failed to load localStorage data:', e);
            }
        }

        this.ensureDataShape();
        this.loadCloudConfigFromStorage();

        // Then try to import from main app (silent - no error toast)
        try {
            await this.importFromMainAppSilent();
        } catch (err) {
            console.log('Auto-import skipped:', err.message);
            // If import fails and we have no data, use defaults
            if (!this.data.boards || Object.keys(this.data.boards).length === 0) {
                console.log('Initializing with default boards');
                this.initDefaultBoards();
                this.saveToStorage();
            }
        }

        // Always render after loading  
        this.renderBoards();
        this.renderCloudSettingsInputs();
    }

    // ===================================
    // EVENT BINDING
    // ===================================

    bindEvents() {
        // Header actions
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveToStorage());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportConfig());
        document.getElementById('btn-import')?.addEventListener('click', () => document.getElementById('file-import').click());
        document.getElementById('btn-import-app')?.addEventListener('click', () => this.importFromMainApp());
        document.getElementById('btn-cloud-settings')?.addEventListener('click', () => this.openCloudModal());
        document.getElementById('btn-save-cloud')?.addEventListener('click', () => this.saveCloudSettings());
        document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
            if (confirm('Clear all cached data and reset to defaults?')) {
                localStorage.removeItem('blockCreatorData');
                localStorage.removeItem('emmiCloudConfig');
                location.reload();
            }
        });
        document.getElementById('btn-auto-sync')?.addEventListener('click', () => this.toggleAutoSync());
        document.getElementById('btn-generate')?.addEventListener('click', () => this.generateFiles());
        document.getElementById('btn-sync-server')?.addEventListener('click', () => this.syncToServer());
        document.getElementById('btn-export-app')?.addEventListener('click', () => this.exportApp());

        // Board actions
        document.getElementById('btn-new-board')?.addEventListener('click', () => this.openBoardModal());
        document.getElementById('btn-save-board')?.addEventListener('click', () => this.saveBoard());

        // Category actions
        document.getElementById('btn-add-category')?.addEventListener('click', () => this.openCategoryModal());
        document.getElementById('btn-save-category')?.addEventListener('click', () => this.saveCategory());

        // Block actions
        document.getElementById('btn-add-block')?.addEventListener('click', () => this.openBlockModal());
        document.getElementById('btn-save-block')?.addEventListener('click', () => this.saveBlock());

        // Modal close buttons
        document.querySelectorAll('.btn-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = btn.getAttribute('data-modal');
                if (modalId) this.closeModal(modalId);
            });
        });

        // File import
        document.getElementById('file-import')?.addEventListener('change', (e) => this.importConfig(e));

        // Code editor tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchCodeTab(tab.dataset.lang));
        });

        // Color sync
        document.getElementById('category-colour')?.addEventListener('input', (e) => {
            document.getElementById('category-colour-text').value = e.target.value;
        });

        // Emoji picker
        document.getElementById('btn-emoji-picker')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('emoji-picker').classList.toggle('hidden');
        });

        // Emoji selection
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const emoji = btn.textContent;
                const nameInput = document.getElementById('category-name');
                const currentValue = nameInput.value;

                // If field is empty or starts with emoji, replace; otherwise prepend
                if (!currentValue || /^[\p{Emoji}]/u.test(currentValue)) {
                    nameInput.value = emoji + ' ';
                } else {
                    nameInput.value = emoji + ' ' + currentValue;
                }

                document.getElementById('emoji-picker').classList.add('hidden');
                nameInput.focus();
            });
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', () => {
            document.getElementById('emoji-picker')?.classList.add('hidden');
        });
    }

    // ===================================
    // DATA MANAGEMENT
    // ===================================

    ensureDataShape() {
        if (!this.data || typeof this.data !== 'object') {
            this.data = {};
        }
        if (!this.data.boards || typeof this.data.boards !== 'object') {
            this.data.boards = {};
        }
        if (!this.data.cloudConfig || typeof this.data.cloudConfig !== 'object') {
            this.data.cloudConfig = {
                accessKeyId: '',
                secretAccessKey: '',
                region: '',
                bucketName: ''
            };
        } else {
            this.data.cloudConfig = {
                accessKeyId: this.data.cloudConfig.accessKeyId || '',
                secretAccessKey: this.data.cloudConfig.secretAccessKey || '',
                region: this.data.cloudConfig.region || '',
                bucketName: this.data.cloudConfig.bucketName || ''
            };
        }
    }

    loadCloudConfigFromStorage() {
        const savedCloud = localStorage.getItem('emmiCloudConfig');
        if (!savedCloud) return;
        try {
            const cloudConfig = JSON.parse(savedCloud);
            this.data.cloudConfig = {
                accessKeyId: cloudConfig.accessKeyId || this.data.cloudConfig.accessKeyId || '',
                secretAccessKey: cloudConfig.secretAccessKey || this.data.cloudConfig.secretAccessKey || '',
                region: cloudConfig.region || this.data.cloudConfig.region || '',
                bucketName: cloudConfig.bucketName || this.data.cloudConfig.bucketName || ''
            };
            console.log('Loaded cloud settings from localStorage');
        } catch (err) {
            console.warn('Failed to parse cloud settings:', err);
        }
    }

    renderCloudSettingsInputs() {
        const cfg = this.data.cloudConfig || {};
        const access = document.getElementById('cloud-access-key');
        const secret = document.getElementById('cloud-secret-key');
        const region = document.getElementById('cloud-region');
        const bucket = document.getElementById('cloud-bucket');
        if (access) access.value = cfg.accessKeyId || '';
        if (secret) secret.value = cfg.secretAccessKey || '';
        if (region) region.value = cfg.region || '';
        if (bucket) bucket.value = cfg.bucketName || '';
    }

    initDefaultBoards() {
        // Initialize with existing boards and toolbox structure from main app  
        // Common categories are NOT included in device boards
        this.data.boards = {
            'common': {
                name: 'Common Blocks',
                categories: [
                    {
                        id: 'structure',
                        name: '🔧 Structure',
                        colour: '#3949AB',
                        blocks: [
                            {
                                id: 'base_setup_loop',
                                name: 'Setup and Loop',
                                colour: '#3949AB',
                                tooltip: 'Main program structure with setup and loop',
                                type: 'statement',
                                code: {
                                    arduino: 'void setup() {\n  {{SETUP}}\n}\n\nvoid loop() {\n  {{LOOP}}\n}',
                                    python: '# Setup\n{{SETUP}}\n\n# Loop\nwhile True:\n    {{LOOP}}',
                                    java: 'public void setup() {\n    {{SETUP}}\n}\n\npublic void loop() {\n    {{LOOP}}\n}',
                                    custom: ''
                                }
                            }
                        ]
                    },
                    {
                        id: 'timing',
                        name: '⏱️ Timing',
                        colour: '#424242',
                        blocks: []
                    },
                    {
                        id: 'arduino',
                        name: '🎛️ Arduino',
                        colour: '#5E35B1',
                        blocks: []
                    },
                    {
                        id: 'control',
                        name: '🔄 Control',
                        colour: '#1976D2',
                        blocks: []
                    },
                    {
                        id: 'operators',
                        name: '🔢 Operators',
                        colour: '#388E3C',
                        blocks: []
                    },
                    {
                        id: 'variables',
                        name: '✖️ Variables',
                        colour: '#D32F2F',
                        blocks: []
                    },
                    {
                        id: 'communicate',
                        name: '🔔 Communicate',
                        colour: '#1976D2',
                        blocks: []
                    }
                ]
            },
            'emmi-bot-v2': {
                name: 'EMMI BOT V2',
                categories: [
                    {
                        id: 'eyes',
                        name: '👀 Eyes',
                        colour: '#424242',
                        blocks: []
                    },
                    {
                        id: 'wheels',
                        name: '💪 Wheels',
                        colour: '#5D4037',
                        blocks: []
                    },
                    {
                        id: 'buzzer',
                        name: '🔊 Buzzer',
                        colour: '#1976D2',
                        blocks: []
                    },
                    {
                        id: 'touch',
                        name: '☐ Touch',
                        colour: '#9E9E9E',
                        blocks: []
                    },
                    {
                        id: 'mic',
                        name: '🔦 Mic',
                        colour: '#424242',
                        blocks: []
                    },
                    {
                        id: 'light',
                        name: '💡 Light',
                        colour: '#FFA726',
                        blocks: []
                    }
                ]
            },
            'flipper': {
                name: 'Flipper',
                categories: []
            },
            'explorer-kit': {
                name: 'Explorer Kit',
                categories: []
            },
            'emmi-bipedal': {
                name: 'EMMI Bipedal',
                categories: []
            }
        };
    }

    async saveToStorage() {
        try {
            this.ensureDataShape();
            localStorage.setItem('blockCreatorData', JSON.stringify(this.data));
            localStorage.setItem('emmiCloudConfig', JSON.stringify(this.data.cloudConfig));
            this.showToast('Configuration saved!', 'success');

            console.log('Cloud config synced to localStorage:', {
                accessKeyId: this.data.cloudConfig.accessKeyId,
                secretAccessKey: this.data.cloudConfig.secretAccessKey ? '***' : '',
                region: this.data.cloudConfig.region,
                bucketName: this.data.cloudConfig.bucketName
            });

            // Auto-sync to project if enabled
            if (this.autoSyncEnabled) {
                await this.syncToProject();
            }
        } catch (e) {
            this.showToast('Failed to save: ' + e.message, 'error');
        }
    }

    exportConfig() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'block-config.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Configuration exported!', 'success');
    }

    importConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.data = JSON.parse(e.target.result);
                this.ensureDataShape();
                localStorage.setItem('emmiCloudConfig', JSON.stringify(this.data.cloudConfig));
                this.saveToStorage();
                this.renderBoards();
                this.renderCloudSettingsInputs();
                this.showToast('Configuration imported!', 'success');
            } catch (err) {
                this.showToast('Invalid configuration file', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    async importFromMainApp() {
        try {
            this.showToast('Importing from main app...', 'info');
            console.log('Starting import from main app...');

            // Load toolbox.js to get category structure
            console.log('Fetching toolbox.js...');
            const toolboxResponse = await fetch('./js/toolbox.js');
            if (!toolboxResponse.ok) {
                throw new Error(`Failed to load toolbox.js: ${toolboxResponse.status}`);
            }
            const toolboxText = await toolboxResponse.text();
            console.log('Toolbox loaded, length:', toolboxText.length);

            // Parse toolbox functions to extract board categories
            console.log('Parsing toolbox boards...');
            const boards = this.parseToolboxBoards(toolboxText);
            console.log('Parsed boards:', Object.keys(boards));

            // Log categories found
            Object.keys(boards).forEach(boardId => {
                console.log(`Board ${boardId}: ${boards[boardId].categories.length} categories`);
            });

            // Try to load and parse block definitions
            try {
                const blocksResponse = await fetch('./blocks/esp32_blocks.js');
                const blocksText = await blocksResponse.text();
                this.parseBlockDefinitions(blocksText, boards);
            } catch (e) {
                console.warn('Could not load block definitions:', e);
            }

            // Try to load generator files to get code
            await this.parseGenerators(boards);

            // Update data
            this.data.boards = boards;
            this.saveToStorage();
            this.renderBoards();

            // Auto-select EMMI BOT V2 if available
            if (boards['emmi-bot-v2']) {
                this.selectBoard('emmi-bot-v2');
            }

            console.log('Import complete!');
            this.showToast('Successfully imported from main app!', 'success');

        } catch (err) {
            console.error('Import error:', err);
            console.error('Error stack:', err.stack);
            this.showToast('Failed to import: ' + err.message + '. Check console (F12)', 'error');
        }
    }

    async importFromMainAppSilent() {
        // Silent version for auto-load - doesn't show error toast
        console.log('Starting silent import from main app...');

        const toolboxResponse = await fetch('./js/toolbox.js');
        if (!toolboxResponse.ok) {
            throw new Error(`Failed to load toolbox.js: ${toolboxResponse.status}`);
        }
        const toolboxText = await toolboxResponse.text();

        const boards = this.parseToolboxBoards(toolboxText);

        try {
            const blocksResponse = await fetch('./blocks/esp32_blocks.js');
            const blocksText = await blocksResponse.text();
            this.parseBlockDefinitions(blocksText, boards);
        } catch (e) {
            console.warn('Could not load block definitions:', e);
        }

        await this.parseGenerators(boards);

        this.data.boards = boards;
        this.saveToStorage();
        this.renderBoards();

        if (boards['emmi-bot-v2']) {
            this.selectBoard('emmi-bot-v2');
        }

        console.log('Silent import complete!');
    }

    // ===================================
    // AUTO-SYNC FUNCTIONALITY
    // ===================================

    async toggleAutoSync() {
        if (this.autoSyncEnabled) {
            // Disable auto-sync
            this.autoSyncEnabled = false;
            this.directoryHandle = null;
            this.updateAutoSyncButton();
            this.showToast('Auto-sync disabled', 'info');
        } else {
            // Enable auto-sync - request directory
            await this.enableAutoSync();
        }
    }

    async enableAutoSync() {
        // Check if File System Access API is supported
        if (!('showDirectoryPicker' in window)) {
            this.showToast('Auto-sync not supported in this browser. Use Chrome or Edge.', 'error');
            return;
        }

        try {
            // Request directory access
            this.directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            this.autoSyncEnabled = true;
            this.updateAutoSyncButton();
            this.showToast(`Auto-sync enabled for: ${this.directoryHandle.name}`, 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Failed to enable auto-sync:', err);
                this.showToast('Failed to enable auto-sync: ' + err.message, 'error');
            }
        }
    }

    updateAutoSyncButton() {
        const btn = document.getElementById('btn-auto-sync');
        const text = document.getElementById('auto-sync-text');

        if (this.autoSyncEnabled) {
            btn.classList.add('active');
            text.textContent = '✓ Auto-Sync ON';
        } else {
            btn.classList.remove('active');
            text.textContent = 'Enable Auto-Sync';
        }
    }

    async syncToProject() {
        if (!this.autoSyncEnabled || !this.directoryHandle) {
            return false;
        }

        try {
            this.showToast('Syncing files to project...', 'info');

            // Create/update toolbox.js
            await this.writeFileToProject('js/toolbox.js', this.generateToolboxFile());

            // Generate common blocks file (esp32_blocks.js) - includes base_setup_loop and custom common blocks
            await this.writeFileToProject('blocks/esp32_blocks.js', this.generateCommonBlocksFile());

            // Create/update block definition files for each board
            for (const [boardId, board] of Object.entries(this.data.boards)) {
                if (boardId === 'common') continue; // Common blocks are handled above

                const hasBlocks = board.categories.some(cat => cat.blocks && cat.blocks.length > 0);
                if (hasBlocks) {
                    await this.writeFileToProject(`blocks/${boardId}_blocks.js`, this.generateBlocksFile(boardId));
                    await this.writeFileToProject(`js/generators/arduino_${boardId}.js`, this.generateArduinoFile(boardId));
                    await this.writeFileToProject(`js/generators/python_${boardId}.js`, this.generatePythonFile(boardId));
                }
            }

            // Update index.html with board selector options
            await this.updateIndexHtmlBoards();

            this.showToast('✓ Files synced to project!', 'success');
            return true;
        } catch (err) {
            console.error('Sync error:', err);
            this.showToast('Sync failed: ' + err.message, 'error');
            return false;
        }
    }

    async updateIndexHtmlBoards() {
        try {
            // Read current index.html
            const fileHandle = await this.directoryHandle.getFileHandle('index.html');
            const file = await fileHandle.getFile();
            let content = await file.text();

            // Generate new board selector options
            let boardOptions = '';
            for (const [boardId, board] of Object.entries(this.data.boards)) {
                if (boardId === 'common') continue;
                const selected = boardId === 'emmi-bot-v2' ? ' selected' : '';
                boardOptions += `                <option value="${boardId}"${selected}>${board.name}</option>\n`;
            }

            // Replace the board-select options using regex
            const boardSelectRegex = /<select id="board-select">\s*([\s\S]*?)<\/select>/;
            const newBoardSelect = `<select id="board-select">\n${boardOptions}            </select>`;

            if (boardSelectRegex.test(content)) {
                content = content.replace(boardSelectRegex, newBoardSelect);

                // Write updated content
                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();
                console.log('Updated index.html board selector');
            }
        } catch (err) {
            console.warn('Could not update index.html boards:', err.message);
            // Non-fatal error - don't throw
        }
    }

    // ===================================
    // SERVER-SIDE SYNC & EXPORT
    // ===================================

    /**
     * Saves to localStorage, then POSTs all generated files to /api/sync-files
     * so they are written to disk by the Express server.
     */
    async syncToServer() {
        try {
            // Save to localStorage first
            this.ensureDataShape();
            localStorage.setItem('blockCreatorData', JSON.stringify(this.data));
            localStorage.setItem('emmiCloudConfig', JSON.stringify(this.data.cloudConfig));

            this.showToast('Syncing files to server...', 'info');

            const files = [];

            // 1. Toolbox
            files.push({ path: 'js/toolbox.js', content: this.generateToolboxFile() });

            // 2. Common blocks (esp32_blocks.js)
            files.push({ path: 'blocks/esp32_blocks.js', content: this.generateCommonBlocksFile() });

            // 3. Board-specific block definitions & generators
            for (const [boardId, board] of Object.entries(this.data.boards)) {
                if (boardId === 'common') continue;

                const hasBlocks = board.categories.some(cat => cat.blocks && cat.blocks.length > 0);
                if (!hasBlocks) continue;

                files.push({ path: `blocks/${boardId}_blocks.js`, content: this.generateBlocksFile(boardId) });
                files.push({ path: `js/generators/arduino_${boardId}.js`, content: this.generateArduinoFile(boardId) });
                files.push({ path: `js/generators/python_${boardId}.js`, content: this.generatePythonFile(boardId) });
            }

            // 4. Update index.html board selector options
            try {
                const indexResp = await fetch('./index.html');
                if (indexResp.ok) {
                    let indexContent = await indexResp.text();
                    let boardOptions = '';
                    for (const [boardId, board] of Object.entries(this.data.boards)) {
                        if (boardId === 'common') continue;
                        const selected = boardId === 'emmi-bot-v2' ? ' selected' : '';
                        boardOptions += `                <option value="${boardId}"${selected}>${board.name}</option>\n`;
                    }
                    const boardSelectRegex = /<select id="board-select">\s*([\s\S]*?)<\/select>/;
                    const newBoardSelect = `<select id="board-select">\n${boardOptions}            </select>`;
                    if (boardSelectRegex.test(indexContent)) {
                        indexContent = indexContent.replace(boardSelectRegex, newBoardSelect);
                        files.push({ path: 'index.html', content: indexContent });
                    }
                }
            } catch (e) {
                console.warn('Could not update index.html board selector:', e.message);
            }

            // POST to server
            const response = await fetch('/api/sync-files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });

            if (!response.ok) {
                const statusText = response.statusText || response.status;
                throw new Error(`Server responded with ${response.status} (${statusText}). Is the Express server running? Use "npm start" to launch it.`);
            }

            const result = await response.json();

            if (result.success) {
                this.showToast(`Synced ${result.written}/${result.total} files to project!`, 'success');
                console.log('[syncToServer] Results:', result.results);
            } else {
                this.showToast('Sync failed: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error('[syncToServer] Error:', err);
            this.showToast('Sync failed: ' + err.message, 'error');
        }
    }

    /**
     * Triggers download of the EMMI BOT Lite app as a ZIP (no editor files).
     */
    exportApp() {
        this.showToast('Preparing app export...', 'info');
        const link = document.createElement('a');
        link.href = '/api/export-app';
        link.download = 'emmi-bot-lite.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
            this.showToast('App export download started!', 'success');
        }, 500);
    }

    async writeFileToProject(relativePath, content) {
        const pathParts = relativePath.split('/');
        let currentHandle = this.directoryHandle;

        // Navigate/create directories
        for (let i = 0; i < pathParts.length - 1; i++) {
            try {
                currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
            } catch (err) {
                throw new Error(`Failed to access directory: ${pathParts[i]}`);
            }
        }

        // Write file
        const fileName = pathParts[pathParts.length - 1];
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        console.log(`Written: ${relativePath}`);
    }

    // ===================================
    // FILE GENERATION
    // ===================================

    generateCommonBlocksFile() {
        let code = `'use strict';

// ESP32 Structure Block - Setup and Loop (from Qubiq AI)

Blockly.Blocks["base_setup_loop"] = {
    init: function () {
        this.setColour("#3949AB");  // Material blue tone
        this.setHelpUrl("");

        // Setup section with styled field
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel("⚙️ Setup", "blocklyLabel"));
        this.appendStatementInput("DO")
            .setCheck(null);

        // Loop section with styled field  
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabel("🔁 Loop", "blocklyLabel"));
        this.appendStatementInput("LOOP")
            .setCheck(null);

        this.setInputsInline(false);
        this.setTooltip("Setup and Loop block for ESP32 programs");
        this.contextMenu = false;
        this.setDeletable(false);  // Make it non-deletable as it's the main program structure
    },
    getArduinoLoopsInstance: function () {
        return true;
    },
    onchange: function () {
        if (!this.workspace || !this.workspace.getAllBlocks) return;
        var blocks = this.workspace.getAllBlocks().filter(b => b.type == "base_setup_loop");
        if (blocks.length > 1) {
            // Only allow one base_setup_loop block
            this.workspace.undo(false);
        }
    }
};

// Arduino C++ Generator for base_setup_loop
if (typeof arduinoGenerator !== 'undefined') {
    arduinoGenerator.forBlock['base_setup_loop'] = function (block) {
        var setupCode = arduinoGenerator.statementToCode(block, "DO");
        var loopCode = arduinoGenerator.statementToCode(block, "LOOP");

        // Generate the full Arduino program
        var code = '';

        // Add includes
        if (arduinoGenerator.includes_) {
            for (var key in arduinoGenerator.includes_) {
                code += arduinoGenerator.includes_[key] + '\\n';
            }
            code += '\\n';
        }

        // Add variables
        if (arduinoGenerator.variables_) {
            for (var key in arduinoGenerator.variables_) {
                code += arduinoGenerator.variables_[key] + '\\n';
            }
            code += '\\n';
        }

        // Add setup function
        code += 'void setup() {\\n';
        if (setupCode) {
            code += setupCode;
        }
        code += '}\\n\\n';

        // Add loop function
        code += 'void loop() {\\n';
        if (loopCode) {
            code += loopCode;
        }
        code += '}\\n';

        return code;
    };
}

`;

        // Now add custom common blocks from all categories
        const commonBoard = this.data.boards['common'];
        if (commonBoard && commonBoard.categories) {
            commonBoard.categories.forEach(category => {
                if (!category.blocks || category.blocks.length === 0) return;

                // Filter out base_setup_loop since it's already defined above
                const customBlocks = category.blocks.filter(b => b.id !== 'base_setup_loop');
                if (customBlocks.length === 0) return;

                code += `// ${category.name} - Custom Common Blocks\n`;
                customBlocks.forEach(block => {
                    // Use the same generator as board-specific blocks
                    code += this.generateSingleBlockDefinition(block, category);

                    // Add Arduino generator
                    const pinDefs = {};
                    if (block.fields && block.fields.pins) {
                        block.fields.pins.forEach(p => {
                            if (p.value && p.pin) pinDefs[p.value] = p.pin;
                        });
                    }

                    code += `if (typeof arduinoGenerator !== 'undefined') {\n`;
                    code += this.generateSingleArduinoGenerator(block, pinDefs);
                    code += `}\n\n`;
                });
            });
        }

        code += `console.log('ESP32 blocks loaded successfully');
`;

        return code;
    }

    generateToolboxFile() {
        let code = `/**
 * Blockly Toolbox Configuration
 * Auto-generated by Block Creator Tool
 */

// Common categories shared by all boards
function getCommonCategories() {
    return [
`;

        // Add common categories
        const commonBoard = this.data.boards['common'];
        if (commonBoard && commonBoard.categories) {
            commonBoard.categories.forEach(cat => {
                const blocks = cat.blocks || [];
                const blockIds = blocks.map(b => `{ kind: 'block', type: '${b.id}' }`).join(', ');
                code += `        { kind: 'category', name: '${cat.name}', colour: '${cat.colour}', contents: [${blockIds}] },\n`;
            });
        }

        code += `    ];
}

`;

        // Add board-specific category functions
        for (const [boardId, board] of Object.entries(this.data.boards)) {
            if (boardId === 'common') continue;

            const funcName = boardId.split('-').map((word, i) =>
                i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            ).join('');

            code += `// ${board.name} specific categories
function get${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Categories() {
    return [
`;
            if (board.categories && board.categories.length > 0) {
                board.categories.forEach(cat => {
                    const blocks = cat.blocks || [];
                    const blockIds = blocks.map(b => `{ kind: 'block', type: '${b.id}' }`).join(', ');
                    code += `        { kind: 'category', name: '${cat.name}', colour: '${cat.colour}', contents: [${blockIds}] },\n`;
                });
            }

            code += `    ];
}

`;
        }

        // Add main toolbox function
        code += `// Main toolbox configuration
function getToolbox(boardType = 'emmi-bot-v2') {
    let categories = [];
    
    // Add common categories
    categories = categories.concat(getCommonCategories());
    
    // Add board-specific categories
    switch(boardType) {
`;

        for (const [boardId, board] of Object.entries(this.data.boards)) {
            if (boardId === 'common') continue;
            const funcName = boardId.split('-').map((word, i) =>
                i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            ).join('');
            code += `        case '${boardId}':
            categories = categories.concat(get${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Categories());
            break;
`;
        }

        code += `    }
    
    return {
        kind: 'categoryToolbox',
        contents: categories
    };
}

// Create the ESP32Toolbox variable expected by app.js (use let for reassignment on board change)
let ESP32Toolbox = getToolbox('emmi-bot-v2');

// Alias for app.js compatibility when changing board types
function getToolboxForBoard(boardType) {
    return getToolbox(boardType);
}
`;

        return code;
    }

    generateBlocksFile(boardId) {
        const board = this.data.boards[boardId];
        let code = `/**
 * ${board.name} - Block Definitions
 * Auto-generated by Block Creator Tool
 */

'use strict';

`;

        // Collect all pin definitions for this board
        const pinDefs = {};
        board.categories.forEach(category => {
            if (!category.blocks) return;
            category.blocks.forEach(block => {
                if (block.fields && block.fields.pins) {
                    block.fields.pins.forEach(p => {
                        if (p.value && p.pin) {
                            pinDefs[p.value] = p.pin;
                        }
                    });
                }
            });
        });

        // Write pin constants
        if (Object.keys(pinDefs).length > 0) {
            code += `// Pin Definitions\n`;
            Object.entries(pinDefs).forEach(([key, pin]) => {
                code += `const ${key}_DEF = ${pin};\n`;
            });
            code += `\n`;
        }

        // Generate block definitions for each category
        board.categories.forEach(category => {
            if (!category.blocks || category.blocks.length === 0) return;

            code += `// ===========================================\n`;
            code += `// ${category.name}\n`;
            code += `// ===========================================\n\n`;

            category.blocks.forEach(block => {
                code += this.generateSingleBlockDefinition(block, category);
            });
        });

        return code;
    }

    // Generate a single block definition matching EMMI BOT V2 style
    generateSingleBlockDefinition(block, category) {
        let code = '';
        const f = block.fields;

        if (f && f.template && f.template !== 'custom') {
            // Template-based block -- generate proper init with dropdowns
            code += `Blockly.Blocks['${block.id}'] = {\n`;
            code += `    init: function() {\n`;

            if (f.template === 'digital_write') {
                // Pattern: "digital write PIN [dropdown] to [state_dropdown]"
                code += `        this.appendDummyInput()\n`;
                code += `            .appendField("${block.name}")\n`;
                // Pin dropdown
                const pinOpts = (f.pins || []).map(p => `["${p.label}", "${p.value}"]`).join(', ');
                code += `            .appendField(new Blockly.FieldDropdown([${pinOpts}]), "PIN")\n`;
                code += `            .appendField("to")\n`;
                // State dropdown
                const stateOpts = (f.states || []).map(s => `["${s.label}", "${s.value}"]`).join(', ');
                code += `            .appendField(new Blockly.FieldDropdown([${stateOpts}]), "STATE");\n`;
                code += `        this.setPreviousStatement(true, null);\n`;
                code += `        this.setNextStatement(true, null);\n`;

            } else if (f.template === 'digital_read') {
                // Pattern: "digital state PIN [dropdown] [mode_dropdown]"
                code += `        this.appendDummyInput()\n`;
                code += `            .appendField("${block.name}")\n`;
                const pinOpts = (f.pins || []).map(p => `["${p.label}", "${p.value}"]`).join(', ');
                code += `            .appendField(new Blockly.FieldDropdown([${pinOpts}]), "PIN")\n`;
                // Mode dropdown
                const modeOpts = (f.modes || []).map(m => `["${m.label}", "${m.value}"]`).join(', ');
                if (modeOpts) {
                    code += `            .appendField(new Blockly.FieldDropdown([${modeOpts}]), "MODE");\n`;
                } else {
                    code += `;\n`;
                }
                code += `        this.setOutput(true, "Number");\n`;

            } else if (f.template === 'analog_read') {
                // Pattern: "analog read PIN [dropdown]"
                code += `        this.appendDummyInput()\n`;
                code += `            .appendField("${block.name}")\n`;
                const pinOpts = (f.pins || []).map(p => `["${p.label}", "${p.value}"]`).join(', ');
                code += `            .appendField(new Blockly.FieldDropdown([${pinOpts}]), "PIN");\n`;
                code += `        this.setOutput(true, "Number");\n`;
            }

            code += `        this.setColour("${block.colour || category.colour}");\n`;
            code += `        this.setTooltip("${(block.tooltip || '').replace(/"/g, '\\"')}");\n`;
            code += `        this.setHelpUrl("");\n`;
            code += `    }\n`;
            code += `};\n\n`;

        } else {
            // Custom / simple block (original behavior but improved)
            code += `Blockly.Blocks['${block.id}'] = {\n`;
            code += `    init: function() {\n`;
            code += `        this.appendDummyInput()\n`;
            code += `            .appendField("${block.name}");\n`;

            if (block.type === 'value') {
                code += `        this.setOutput(true, null);\n`;
            } else if (block.type === 'statement') {
                code += `        this.appendStatementInput("DO").setCheck(null);\n`;
                code += `        this.setPreviousStatement(true, null);\n`;
                code += `        this.setNextStatement(true, null);\n`;
            } else {
                code += `        this.setPreviousStatement(true, null);\n`;
                code += `        this.setNextStatement(true, null);\n`;
            }

            code += `        this.setColour("${block.colour || category.colour}");\n`;
            code += `        this.setTooltip("${(block.tooltip || '').replace(/"/g, '\\"')}");\n`;
            code += `        this.setHelpUrl("");\n`;
            code += `    }\n`;
            code += `};\n\n`;
        }

        return code;
    }

    generateArduinoFile(boardId) {
        const board = this.data.boards[boardId];
        let code = `/**
 * ${board.name} - Arduino Code Generators
 * Auto-generated by Block Creator Tool
 */

'use strict';

`;

        // Collect pin definitions
        const pinDefs = {};
        board.categories.forEach(category => {
            if (!category.blocks) return;
            category.blocks.forEach(block => {
                if (block.fields && block.fields.pins) {
                    block.fields.pins.forEach(p => {
                        if (p.value && p.pin) {
                            pinDefs[p.value] = p.pin;
                        }
                    });
                }
            });
        });

        // Write pin constant references (must match blocks file)
        if (Object.keys(pinDefs).length > 0) {
            code += `// Pin Definitions (must match block definitions file)\n`;
            Object.entries(pinDefs).forEach(([key, pin]) => {
                code += `const ${key}_GEN = ${pin};\n`;
            });
            code += `\n`;
        }

        board.categories.forEach(category => {
            if (!category.blocks || category.blocks.length === 0) return;

            code += `// ===========================================\n`;
            code += `// ${category.name}\n`;
            code += `// ===========================================\n\n`;

            category.blocks.forEach(block => {
                code += this.generateSingleArduinoGenerator(block, pinDefs);
            });
        });

        return code;
    }

    generateSingleArduinoGenerator(block, pinDefs) {
        let code = '';
        const f = block.fields;

        code += `arduinoGenerator.forBlock['${block.id}'] = function(block) {\n`;

        if (f && f.template && f.template !== 'custom') {
            if (f.template === 'digital_write') {
                // Get field values and resolve pin number
                code += `    var pinKey = block.getFieldValue('PIN');\n`;
                code += `    var state = block.getFieldValue('STATE');\n`;
                code += `    var pinNum;\n`;

                // Pin resolution switch
                (f.pins || []).forEach(p => {
                    code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                });

                // Setup code
                if (f.setupCode) {
                    const setupKey = `setup_${block.id}`;
                    // Generate setup for each pin
                    code += `\n    // Ensure setup\n`;
                    (f.pins || []).forEach(p => {
                        const setupLine = f.setupCode.replace(/\{\{PIN\}\}/g, p.pin);
                        code += `    arduinoGenerator.setupCode_['${setupKey}_${p.value}'] = '${setupLine}';\n`;
                    });
                }

                code += `\n    return 'digitalWrite(' + pinNum + ', ' + state + ');\\n';\n`;

            } else if (f.template === 'digital_read') {
                code += `    var pinKey = block.getFieldValue('PIN');\n`;
                if (f.modes && f.modes.length > 0) {
                    code += `    var mode = block.getFieldValue('MODE');\n`;
                }
                code += `    var pinNum;\n`;

                (f.pins || []).forEach(p => {
                    code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                });

                // Setup with mode
                if (f.setupCode && f.modes && f.modes.length > 0) {
                    const setupKey = `setup_${block.id}`;
                    code += `\n    arduinoGenerator.setupCode_['${setupKey}'] = 'pinMode(' + pinNum + ', ' + mode + ');';\n`;
                } else if (f.setupCode) {
                    const setupKey = `setup_${block.id}`;
                    (f.pins || []).forEach(p => {
                        const setupLine = f.setupCode.replace(/\{\{PIN\}\}/g, p.pin);
                        code += `    arduinoGenerator.setupCode_['${setupKey}_${p.value}'] = '${setupLine}';\n`;
                    });
                }

                code += `\n    return ['digitalRead(' + pinNum + ')', arduinoGenerator.ORDER_ATOMIC];\n`;

            } else if (f.template === 'analog_read') {
                code += `    var pinKey = block.getFieldValue('PIN');\n`;
                code += `    var pinNum;\n`;

                (f.pins || []).forEach(p => {
                    code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                });

                if (f.setupCode) {
                    const setupKey = `setup_${block.id}`;
                    (f.pins || []).forEach(p => {
                        const setupLine = f.setupCode.replace(/\{\{PIN\}\}/g, p.pin);
                        code += `    arduinoGenerator.setupCode_['${setupKey}_${p.value}'] = '${setupLine}';\n`;
                    });
                }

                code += `\n    return ['analogRead(' + pinNum + ')', arduinoGenerator.ORDER_ATOMIC];\n`;
            }
        } else {
            // Custom block - use raw code string
            const arduinoCode = block.code?.arduino || `// ${block.name}`;
            if (block.type === 'value') {
                code += `    return ['${arduinoCode.replace(/'/g, "\\'")}', arduinoGenerator.ORDER_ATOMIC];\n`;
            } else {
                code += `    return '${arduinoCode.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\\n';\n`;
            }
        }

        code += `};\n\n`;
        return code;
    }

    generatePythonFile(boardId) {
        const board = this.data.boards[boardId];
        let code = `/**
 * ${board.name} - Python Code Generators
 * Auto-generated by Block Creator Tool
 */

`;

        board.categories.forEach(category => {
            if (!category.blocks || category.blocks.length === 0) return;

            category.blocks.forEach(block => {
                const f = block.fields;

                if (f && f.template && f.template !== 'custom') {
                    code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;

                    if (f.template === 'digital_write') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var state = block.getFieldValue('STATE');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    var stateVal = (state === 'HIGH') ? '1' : '0';\n`;
                        code += `    return 'Pin(' + pinNum + ', Pin.OUT).value(' + stateVal + ')\\n';\n`;
                    } else if (f.template === 'digital_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['Pin(' + pinNum + ', Pin.IN).value()', pythonGenerator.ORDER_ATOMIC];\n`;
                    } else if (f.template === 'analog_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['ADC(Pin(' + pinNum + ')).read()', pythonGenerator.ORDER_ATOMIC];\n`;
                    }

                    code += `};\n\n`;
                } else {
                    // Custom block
                    const pythonCode = block.code?.python || `# ${block.name}`;
                    if (block.type === 'value') {
                        code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;
                        code += `    return ['${pythonCode.replace(/'/g, "\\'")}', pythonGenerator.ORDER_ATOMIC];\n`;
                        code += `};\n\n`;
                    } else {
                        code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;
                        code += `    return '${pythonCode.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\\n';\n`;
                        code += `};\n\n`;
                    }
                }
            });
        });

        return code;
    }

    parseToolboxBoards(toolboxText) {
        const boards = {};

        // First, parse common categories that all boards share
        const commonMatch = toolboxText.match(/function getCommonCategories\(\)[^{]*{[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/);
        let commonCategories = [];
        if (commonMatch) {
            commonCategories = this.parseCategoriesFromText(commonMatch[1]);
            console.log('Found common categories:', commonCategories.length);
        }

        // IMPORTANT: Create a 'common' board to store common blocks
        // This allows the Block Creator to properly track and sync common blocks
        boards['common'] = {
            name: 'Common Blocks',
            categories: commonCategories.map(cat => ({ ...cat, blocks: [...(cat.blocks || [])] }))
        };

        // Parse function for EMMI BOT V2
        const emmiBotMatch = toolboxText.match(/function getEmmiBotV2Categories\(\)[^{]*{[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/);
        if (emmiBotMatch) {
            const emmiBotSpecific = this.parseCategoriesFromText(emmiBotMatch[1]);
            boards['emmi-bot-v2'] = {
                name: 'EMMI BOT V2',
                categories: emmiBotSpecific
            };
        } else {
            boards['emmi-bot-v2'] = {
                name: 'EMMI BOT V2',
                categories: []
            };
        }

        // Flipper - board-specific categories only (common categories are separate now)
        const flipperMatch = toolboxText.match(/function getFlipperCategories\(\)[^{]*{[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/);
        boards['flipper'] = {
            name: 'Flipper',
            categories: flipperMatch ? this.parseCategoriesFromText(flipperMatch[1]) : []
        };

        // Explorer Kit - board-specific categories only
        const explorerMatch = toolboxText.match(/function getExplorerKitCategories\(\)[^{]*{[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/);
        boards['explorer-kit'] = {
            name: 'Explorer Kit',
            categories: explorerMatch ? this.parseCategoriesFromText(explorerMatch[1]) : []
        };

        // EMMI Bipedal - board-specific categories only
        const bipedalMatch = toolboxText.match(/function getEmmiBipedalCategories\(\)[^{]*{[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/);
        boards['emmi-bipedal'] = {
            name: 'EMMI Bipedal',
            categories: bipedalMatch ? this.parseCategoriesFromText(bipedalMatch[1]) : []
        };

        return boards;
    }

    parseCategoriesFromText(categoriesText) {
        const categories = [];
        const categoryMatches = categoriesText.matchAll(/{\s*kind:\s*'category',\s*name:\s*'([^']+)',\s*colour:\s*'([^']+)'[\s\S]*?contents:\s*\[([\s\S]*?)\]/g);

        for (const match of categoryMatches) {
            const name = match[1];
            const colour = match[2];
            const contentsText = match[3];

            // Generate ID from name (remove emoji and convert to lowercase with dashes)
            const id = name.replace(/[^\w\s]/g, '').trim().toLowerCase().replace(/\s+/g, '-');

            // Parse blocks in category
            const blocks = [];
            const blockMatches = contentsText.matchAll(/{\s*kind:\s*'block',\s*type:\s*'([^']+)'\s*}/g);
            for (const blockMatch of blockMatches) {
                blocks.push({
                    id: blockMatch[1],
                    name: blockMatch[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    colour: colour,
                    tooltip: '',
                    type: 'simple',
                    code: {
                        arduino: '',
                        python: '',
                        java: '',
                        custom: ''
                    }
                });
            }

            categories.push({
                id,
                name,
                colour,
                blocks
            });
        }

        return categories;
    }

    parseBlockDefinitions(blocksText, boards) {
        // Extract block definitions from Blockly.Blocks
        const blockMatches = blocksText.matchAll(/Blockly\.Blocks\['([^']+)'\]\s*=\s*{[\s\S]*?init:\s*function\(\)\s*{([\s\S]*?)}\s*}/g);

        for (const match of blockMatches) {
            const blockId = match[1];
            const initCode = match[2];

            // Find this block in our boards and update it
            for (const board of Object.values(boards)) {
                for (const category of board.categories) {
                    const block = category.blocks.find(b => b.id === blockId);
                    if (block) {
                        // Parse tooltip
                        const tooltipMatch = initCode.match(/setTooltip\(['"]([^'"]+)['"]\)/);
                        if (tooltipMatch) {
                            block.tooltip = tooltipMatch[1];
                        }

                        // Parse color
                        const colorMatch = initCode.match(/setColour\(['"]([^'"]+)['"]\)/);
                        if (colorMatch) {
                            block.colour = colorMatch[1];
                        }

                        // Determine block type
                        if (initCode.includes('setOutput')) {
                            block.type = 'value';
                        } else if (initCode.includes('appendStatementInput')) {
                            block.type = 'statement';
                        } else {
                            block.type = 'simple';
                        }
                    }
                }
            }
        }
    }

    async parseGenerators(boards) {
        // Dynamically load Arduino & Python generators for each board
        for (const boardId of Object.keys(boards)) {
            if (boardId === 'common') continue;

            // Try to load Arduino generator for this board
            try {
                const arduinoResponse = await fetch(`./js/generators/arduino_${boardId}.js`);
                if (!arduinoResponse.ok) continue;
                const arduinoText = await arduinoResponse.text();

                const generatorMatches = arduinoText.matchAll(/arduinoGenerator\.forBlock\['([^']+)'\]\s*=\s*function\([^)]*\)\s*{[\s\S]*?return\s+['"]([^'"]*)['"]/g);

                for (const match of generatorMatches) {
                    const blockId = match[1];
                    const code = match[2].replace(/\\n/g, '\n');

                    for (const board of Object.values(boards)) {
                        for (const category of board.categories) {
                            const block = category.blocks.find(b => b.id === blockId);
                            if (block) {
                                block.code.arduino = code;
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`Could not load Arduino generator for ${boardId}:`, e);
            }

            // Try to load Python generator for this board
            try {
                const pythonResponse = await fetch(`./js/generators/python_${boardId}.js`);
                if (!pythonResponse.ok) continue;
                const pythonText = await pythonResponse.text();

                const generatorMatches = pythonText.matchAll(/pythonGenerator\.forBlock\['([^']+)'\]\s*=\s*(?:function\([^)]*\)\s*{[\s\S]*?return\s+['"]([^']*)['"]\s*}|lambda[^:]*:\s*['"]([^']*)['"]\s*)/g);

                for (const match of generatorMatches) {
                    const blockId = match[1];
                    const code = (match[2] || match[3] || '').replace(/\\n/g, '\n');

                    for (const board of Object.values(boards)) {
                        for (const category of board.categories) {
                            const block = category.blocks.find(b => b.id === blockId);
                            if (block) {
                                block.code.python = code;
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`Could not load Python generator for ${boardId}:`, e);
            }
        }
    }

    // ===================================
    // BOARD MANAGEMENT
    // ===================================
    // BOARD MANAGEMENT
    // ===================================

    renderBoards() {
        const container = document.getElementById('board-list');
        container.innerHTML = '';

        Object.keys(this.data.boards).forEach(boardId => {
            const board = this.data.boards[boardId];
            const item = document.createElement('div');
            item.className = 'board-item' + (this.currentBoard === boardId ? ' active' : '');
            item.innerHTML = `
                <span class="board-item-name">${board.name}</span>
                <div class="board-item-actions">
                    <button class="item-btn" onclick="app.editBoard('${boardId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="item-btn" onclick="app.deleteBoard('${boardId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            item.onclick = (e) => {
                if (!e.target.closest('.board-item-actions')) {
                    this.selectBoard(boardId);
                }
            };
            container.appendChild(item);
        });
    }

    selectBoard(boardId) {
        this.currentBoard = boardId;
        this.currentCategory = null;
        this.renderBoards();
        this.renderCategories();
        this.renderBlocks();
        document.getElementById('btn-add-category').disabled = false;
        document.getElementById('current-board-name').textContent = this.data.boards[boardId].name;
    }

    openBoardModal(boardId = null) {
        this.editingBoard = boardId;
        const modal = document.getElementById('modal-board');
        const title = document.getElementById('board-modal-title');

        if (boardId) {
            title.textContent = 'Edit Board';
            const board = this.data.boards[boardId];
            document.getElementById('board-id').value = boardId;
            document.getElementById('board-id').disabled = true;
            document.getElementById('board-name').value = board.name;
        } else {
            title.textContent = 'New Board';
            document.getElementById('board-id').value = '';
            document.getElementById('board-id').disabled = false;
            document.getElementById('board-name').value = '';
        }

        modal.classList.remove('hidden');
    }

    saveBoard() {
        const id = document.getElementById('board-id').value.trim();
        const name = document.getElementById('board-name').value.trim();

        if (!id || !name) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        if (!this.editingBoard && this.data.boards[id]) {
            this.showToast('Board ID already exists', 'error');
            return;
        }

        if (this.editingBoard && this.editingBoard !== id) {
            // Renaming board
            this.data.boards[id] = this.data.boards[this.editingBoard];
            delete this.data.boards[this.editingBoard];
        }

        if (!this.data.boards[id]) {
            this.data.boards[id] = { name, categories: [] };
        } else {
            this.data.boards[id].name = name;
        }

        this.closeModal('modal-board');
        this.renderBoards();
        this.saveToStorage();
        this.showToast('Board saved!', 'success');
    }

    editBoard(boardId) {
        this.openBoardModal(boardId);
    }

    deleteBoard(boardId) {
        if (confirm(`Delete board "${this.data.boards[boardId].name}"?`)) {
            delete this.data.boards[boardId];
            if (this.currentBoard === boardId) {
                this.currentBoard = null;
                this.renderCategories();
                this.renderBlocks();
            }
            this.renderBoards();
            this.saveToStorage();
            this.showToast('Board deleted', 'info');
        }
    }

    // ===================================
    // CATEGORY MANAGEMENT
    // ===================================

    renderCategories() {
        const container = document.getElementById('category-list');

        if (!this.currentBoard) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-layer-group"></i>
                    <p>Select a board to manage categories</p>
                </div>
            `;
            return;
        }

        const categories = this.data.boards[this.currentBoard].categories;

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-layer-group"></i>
                    <p><strong>No categories yet for ${this.data.boards[this.currentBoard].name}</strong></p>
                    <p>Click "Add Category" below to create your first category.</p>
                    <p style="font-size: 12px; color: #666; margin-top: 8px;">
                        Examples: 🦾 Arms, 🚶 Walking, 📡 Sensors, etc.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        categories.forEach((cat, index) => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-info">
                    <div class="item-card-name">${cat.name}</div>
                    <div class="item-card-id">${cat.id}</div>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-primary" onclick="app.selectCategory(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="app.editCategory(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteCategory(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    selectCategory(index) {
        this.currentCategory = index;
        const cat = this.data.boards[this.currentBoard].categories[index];
        document.getElementById('btn-add-block').disabled = false;
        document.getElementById('current-category-name').textContent = cat.name;
        this.renderBlocks();
    }

    openCategoryModal(index = null) {
        this.editingCategory = index;
        const modal = document.getElementById('modal-category');
        const title = document.getElementById('category-modal-title');

        if (index !== null) {
            title.textContent = 'Edit Category';
            const cat = this.data.boards[this.currentBoard].categories[index];
            document.getElementById('category-id').value = cat.id;
            document.getElementById('category-name').value = cat.name;
            document.getElementById('category-colour').value = cat.colour;
            document.getElementById('category-colour-text').value = cat.colour;
        } else {
            title.textContent = 'New Category';
            document.getElementById('category-id').value = '';
            document.getElementById('category-name').value = '';
            document.getElementById('category-colour').value = '#424242';
            document.getElementById('category-colour-text').value = '#424242';
        }

        modal.classList.remove('hidden');
    }

    saveCategory() {
        const id = document.getElementById('category-id').value.trim();
        const name = document.getElementById('category-name').value.trim();
        const colour = document.getElementById('category-colour').value;

        if (!id || !name) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        const categories = this.data.boards[this.currentBoard].categories;

        if (this.editingCategory !== null) {
            categories[this.editingCategory] = { ...categories[this.editingCategory], id, name, colour };
        } else {
            const category = { id, name, colour, blocks: [] };

            // Handle quick-add blocks
            const quickAddTemplates = ['digital_write', 'digital_read', 'analog_read'];
            quickAddTemplates.forEach(template => {
                const checkbox = document.getElementById(`cat-quick-${template.replace('_', '-')}`);
                if (checkbox && checkbox.checked) {
                    const templateBlock = this.createTemplateBlock(
                        template, id, name, colour, this.currentBoard
                    );
                    if (templateBlock) {
                        category.blocks.push(templateBlock);
                    }
                    // Reset checkbox
                    checkbox.checked = false;
                }
            });

            categories.push(category);
        }

        this.closeModal('modal-category');
        this.renderCategories();
        this.saveToStorage();
        this.showToast('Category saved!', 'success');
    }

    editCategory(index) {
        this.openCategoryModal(index);
    }

    deleteCategory(index) {
        const cat = this.data.boards[this.currentBoard].categories[index];
        if (confirm(`Delete category "${cat.name}" and all its blocks?`)) {
            this.data.boards[this.currentBoard].categories.splice(index, 1);
            if (this.currentCategory === index) {
                this.currentCategory = null;
                this.renderBlocks();
            }
            this.renderCategories();
            this.saveToStorage();
            this.showToast('Category deleted', 'info');
        }
    }

    // ===================================
    // BLOCK MANAGEMENT
    // ===================================

    renderBlocks() {
        const container = document.getElementById('block-list');

        if (this.currentCategory === null) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <p>Select a category to manage blocks</p>
                </div>
            `;
            return;
        }

        const blocks = this.data.boards[this.currentBoard].categories[this.currentCategory].blocks;

        if (blocks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <p>No blocks yet. Click "Add Block" to create one.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        blocks.forEach((block, index) => {
            const card = document.createElement('div');
            card.className = 'item-card';
            const templateBadge = block.fields && block.fields.template && block.fields.template !== 'custom'
                ? `<span class="template-badge">${block.fields.template.replace('_', ' ')}</span>`
                : '';
            const typeBadge = `<span class="type-badge type-${block.type || 'simple'}">${block.type || 'simple'}</span>`;
            card.innerHTML = `
                <div class="item-card-info">
                    <div class="item-card-name">${block.name} ${templateBadge} ${typeBadge}</div>
                    <div class="item-card-id">${block.id}</div>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.editBlock(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteBlock(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ===================================
    // TEMPLATE HANDLING
    // ===================================

    onTemplateChange(template) {
        const pinSection = document.getElementById('pin-config-section');
        const stateSection = document.getElementById('state-config-section');
        const modeSection = document.getElementById('mode-config-section');
        const catName = this.currentCategory !== null
            ? this.data.boards[this.currentBoard].categories[this.currentCategory].name.replace(/[^\w\s]/g, '').trim().toLowerCase()
            : 'sensor';
        const boardId = this.currentBoard || 'emmi';
        const prefix = boardId.replace(/-/g, '_') + '_' + catName.replace(/\s+/g, '_');

        if (template === 'custom') {
            pinSection.style.display = 'none';
            return;
        }

        pinSection.style.display = 'block';
        stateSection.style.display = template === 'digital_write' ? 'block' : 'none';
        modeSection.style.display = template === 'digital_read' ? 'block' : 'none';

        // Pre-fill defaults based on template
        if (template === 'digital_write') {
            document.querySelector('input[name="block-type"][value="simple"]').checked = true;
            if (!document.getElementById('block-id').value) {
                document.getElementById('block-id').value = prefix + '_digital';
            }
            if (!document.getElementById('block-name').value) {
                document.getElementById('block-name').value = 'digital write PIN';
            }
            if (!document.getElementById('block-tooltip').value) {
                document.getElementById('block-tooltip').value = 'Control the digital state of the pin.';
            }
            // Set default pin options
            this.setDefaultPinOptions([
                { label: 'LED', value: 'PIN_LED', pin: '13' }
            ]);
            // Set default state options
            this.setDefaultStateOptions([
                { label: 'ON', value: 'HIGH' },
                { label: 'OFF', value: 'LOW' }
            ]);
            // Pre-fill code
            document.getElementById('code-arduino').value = 'digitalWrite({{PIN}}, {{STATE}});';
            document.getElementById('code-python').value = 'pin{{PIN}}.value({{STATE}})';
            document.getElementById('block-setup-code').value = 'pinMode({{PIN}}, OUTPUT);';
        } else if (template === 'digital_read') {
            document.querySelector('input[name="block-type"][value="value"]').checked = true;
            if (!document.getElementById('block-id').value) {
                document.getElementById('block-id').value = prefix + '_read';
            }
            if (!document.getElementById('block-name').value) {
                document.getElementById('block-name').value = 'digital state PIN';
            }
            if (!document.getElementById('block-tooltip').value) {
                document.getElementById('block-tooltip').value = 'Read digital state of sensor.';
            }
            this.setDefaultPinOptions([
                { label: 'SENSOR', value: 'PIN_SENSOR', pin: '32' }
            ]);
            this.setDefaultModeOptions([
                { label: 'pull-up', value: 'INPUT_PULLUP' },
                { label: 'pull-down', value: 'INPUT_PULLDOWN' },
                { label: 'input', value: 'INPUT' }
            ]);
            document.getElementById('code-arduino').value = 'digitalRead({{PIN}})';
            document.getElementById('code-python').value = 'pin{{PIN}}.value()';
            document.getElementById('block-setup-code').value = 'pinMode({{PIN}}, {{MODE}});';
        } else if (template === 'analog_read') {
            document.querySelector('input[name="block-type"][value="value"]').checked = true;
            if (!document.getElementById('block-id').value) {
                document.getElementById('block-id').value = prefix + '_read';
            }
            if (!document.getElementById('block-name').value) {
                document.getElementById('block-name').value = 'analog read PIN';
            }
            if (!document.getElementById('block-tooltip').value) {
                document.getElementById('block-tooltip').value = 'Read analog value from sensor.';
            }
            this.setDefaultPinOptions([
                { label: 'SENSOR', value: 'PIN_SENSOR', pin: '34' }
            ]);
            document.getElementById('code-arduino').value = 'analogRead({{PIN}})';
            document.getElementById('code-python').value = 'adc{{PIN}}.read()';
            document.getElementById('block-setup-code').value = 'pinMode({{PIN}}, INPUT);';
        }
    }

    setDefaultPinOptions(options) {
        const container = document.getElementById('pin-options-list');
        container.innerHTML = '';
        options.forEach(opt => this.addPinOption(opt.label, opt.value, opt.pin));
    }

    setDefaultStateOptions(options) {
        const container = document.getElementById('state-options-list');
        container.innerHTML = '';
        options.forEach(opt => this.addStateOption(opt.label, opt.value));
    }

    setDefaultModeOptions(options) {
        const container = document.getElementById('mode-options-list');
        container.innerHTML = '';
        options.forEach(opt => this.addModeOption(opt.label, opt.value));
    }

    addPinOption(label = '', value = '', pin = '') {
        const container = document.getElementById('pin-options-list');
        const row = document.createElement('div');
        row.className = 'pin-option-row';
        row.innerHTML = `
            <input type="text" class="pin-label" placeholder="Display label (e.g. Red)" value="${label}" />
            <input type="text" class="pin-value" placeholder="Value key (e.g. PIN_EYE_RED)" value="${value}" />
            <input type="text" class="pin-number" placeholder="GPIO # (e.g. 13)" value="${pin}" />
            <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
    }

    addStateOption(label = '', value = '') {
        const container = document.getElementById('state-options-list');
        const row = document.createElement('div');
        row.className = 'pin-option-row';
        row.innerHTML = `
            <input type="text" class="state-label" placeholder="Display (e.g. ON)" value="${label}" />
            <input type="text" class="state-value" placeholder="Value (e.g. HIGH)" value="${value}" />
            <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
    }

    addModeOption(label = '', value = '') {
        const container = document.getElementById('mode-options-list');
        const row = document.createElement('div');
        row.className = 'pin-option-row';
        row.innerHTML = `
            <input type="text" class="mode-label" placeholder="Display (e.g. pull-up)" value="${label}" />
            <input type="text" class="mode-value" placeholder="Value (e.g. INPUT_PULLUP)" value="${value}" />
            <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);
    }

    getFieldsFromUI() {
        const template = document.getElementById('block-template').value;
        if (template === 'custom') return null;

        const fields = {
            template: template,
            pins: [],
            states: [],
            modes: [],
            setupCode: document.getElementById('block-setup-code')?.value || ''
        };

        // Get pin options
        document.querySelectorAll('#pin-options-list .pin-option-row').forEach(row => {
            const label = row.querySelector('.pin-label')?.value?.trim();
            const value = row.querySelector('.pin-value')?.value?.trim();
            const pin = row.querySelector('.pin-number')?.value?.trim();
            if (label && value) {
                fields.pins.push({ label, value, pin: pin || '' });
            }
        });

        // Get state options (digital_write)
        if (template === 'digital_write') {
            document.querySelectorAll('#state-options-list .pin-option-row').forEach(row => {
                const label = row.querySelector('.state-label')?.value?.trim();
                const value = row.querySelector('.state-value')?.value?.trim();
                if (label && value) {
                    fields.states.push({ label, value });
                }
            });
        }

        // Get mode options (digital_read)
        if (template === 'digital_read') {
            document.querySelectorAll('#mode-options-list .pin-option-row').forEach(row => {
                const label = row.querySelector('.mode-label')?.value?.trim();
                const value = row.querySelector('.mode-value')?.value?.trim();
                if (label && value) {
                    fields.modes.push({ label, value });
                }
            });
        }

        return fields;
    }

    populateFieldsUI(fields) {
        if (!fields || !fields.template) {
            document.getElementById('block-template').value = 'custom';
            document.getElementById('pin-config-section').style.display = 'none';
            return;
        }

        document.getElementById('block-template').value = fields.template;
        document.getElementById('pin-config-section').style.display = 'block';

        // Pins
        const pinContainer = document.getElementById('pin-options-list');
        pinContainer.innerHTML = '';
        (fields.pins || []).forEach(p => this.addPinOption(p.label, p.value, p.pin));

        // States
        const stateSection = document.getElementById('state-config-section');
        const stateContainer = document.getElementById('state-options-list');
        stateContainer.innerHTML = '';
        if (fields.template === 'digital_write') {
            stateSection.style.display = 'block';
            (fields.states || []).forEach(s => this.addStateOption(s.label, s.value));
        } else {
            stateSection.style.display = 'none';
        }

        // Modes
        const modeSection = document.getElementById('mode-config-section');
        const modeContainer = document.getElementById('mode-options-list');
        modeContainer.innerHTML = '';
        if (fields.template === 'digital_read') {
            modeSection.style.display = 'block';
            (fields.modes || []).forEach(m => this.addModeOption(m.label, m.value));
        } else {
            modeSection.style.display = 'none';
        }

        // Setup code
        if (document.getElementById('block-setup-code')) {
            document.getElementById('block-setup-code').value = fields.setupCode || '';
        }
    }

    // Create a template block data object (used by quick-add in categories)
    createTemplateBlock(template, catId, catName, catColour, boardId) {
        const prefix = boardId.replace(/-/g, '_') + '_' + catId;
        const cleanName = catName.replace(/[^\w\s]/g, '').trim();

        if (template === 'digital_write') {
            return {
                id: prefix + '_digital',
                name: 'digital write PIN',
                colour: catColour,
                tooltip: `Control the digital state of ${cleanName}.`,
                type: 'simple',
                fields: {
                    template: 'digital_write',
                    pins: [{ label: cleanName, value: 'PIN_' + catId.toUpperCase(), pin: '13' }],
                    states: [{ label: 'ON', value: 'HIGH' }, { label: 'OFF', value: 'LOW' }],
                    modes: [],
                    setupCode: 'pinMode({{PIN}}, OUTPUT);'
                },
                code: {
                    arduino: 'digitalWrite({{PIN}}, {{STATE}});',
                    python: 'pin{{PIN}}.value({{STATE}})',
                    java: 'digitalWrite({{PIN}}, {{STATE}});',
                    custom: ''
                }
            };
        } else if (template === 'digital_read') {
            return {
                id: prefix + '_read',
                name: 'digital state PIN',
                colour: catColour,
                tooltip: `Read digital state of ${cleanName}.`,
                type: 'value',
                fields: {
                    template: 'digital_read',
                    pins: [{ label: cleanName.toUpperCase(), value: 'PIN_' + catId.toUpperCase(), pin: '32' }],
                    states: [],
                    modes: [
                        { label: 'pull-up', value: 'INPUT_PULLUP' },
                        { label: 'pull-down', value: 'INPUT_PULLDOWN' },
                        { label: 'input', value: 'INPUT' }
                    ],
                    setupCode: 'pinMode({{PIN}}, {{MODE}});'
                },
                code: {
                    arduino: 'digitalRead({{PIN}})',
                    python: 'pin{{PIN}}.value()',
                    java: 'digitalRead({{PIN}})',
                    custom: ''
                }
            };
        } else if (template === 'analog_read') {
            return {
                id: prefix + '_read',
                name: 'analog read PIN',
                colour: catColour,
                tooltip: `Read analog value from ${cleanName}.`,
                type: 'value',
                fields: {
                    template: 'analog_read',
                    pins: [{ label: cleanName.toUpperCase(), value: 'PIN_' + catId.toUpperCase(), pin: '34' }],
                    states: [],
                    modes: [],
                    setupCode: 'pinMode({{PIN}}, INPUT);'
                },
                code: {
                    arduino: 'analogRead({{PIN}})',
                    python: 'adc{{PIN}}.read()',
                    java: 'analogRead({{PIN}})',
                    custom: ''
                }
            };
        }
        return null;
    }

    // ===================================
    // BLOCK MODAL (open / save)
    // ===================================

    openBlockModal(index = null) {
        this.editingBlock = index;
        const modal = document.getElementById('modal-block');
        const title = document.getElementById('block-modal-title');

        if (index !== null) {
            title.textContent = 'Edit Block';
            const block = this.data.boards[this.currentBoard].categories[this.currentCategory].blocks[index];
            document.getElementById('block-id').value = block.id;
            document.getElementById('block-name').value = block.name;
            document.getElementById('block-colour').value = block.colour || '#424242';
            document.getElementById('block-tooltip').value = block.tooltip || '';
            document.querySelector(`input[name="block-type"][value="${block.type || 'simple'}"]`).checked = true;
            document.getElementById('code-arduino').value = block.code?.arduino || '';
            document.getElementById('code-python').value = block.code?.python || '';
            document.getElementById('code-java').value = block.code?.java || '';
            document.getElementById('code-custom').value = block.code?.custom || '';
            // Populate fields/template UI
            this.populateFieldsUI(block.fields || null);
        } else {
            title.textContent = 'New Block';
            document.getElementById('block-id').value = '';
            document.getElementById('block-name').value = '';
            document.getElementById('block-colour').value = this.data.boards[this.currentBoard]?.categories[this.currentCategory]?.colour || '#424242';
            document.getElementById('block-tooltip').value = '';
            document.querySelector('input[name="block-type"][value="simple"]').checked = true;
            document.getElementById('code-arduino').value = '';
            document.getElementById('code-python').value = '';
            document.getElementById('code-java').value = '';
            document.getElementById('code-custom').value = '';
            // Reset template
            document.getElementById('block-template').value = 'custom';
            document.getElementById('pin-config-section').style.display = 'none';
            document.getElementById('pin-options-list').innerHTML = '';
            document.getElementById('state-options-list').innerHTML = '';
            document.getElementById('mode-options-list').innerHTML = '';
            if (document.getElementById('block-setup-code')) {
                document.getElementById('block-setup-code').value = '';
            }
        }

        modal.classList.remove('hidden');
    }

    saveBlock() {
        const id = document.getElementById('block-id').value.trim();
        const name = document.getElementById('block-name').value.trim();
        const colour = document.getElementById('block-colour').value;
        const tooltip = document.getElementById('block-tooltip').value.trim();
        const type = document.querySelector('input[name="block-type"]:checked').value;

        if (!id || !name) {
            this.showToast('Please fill required fields', 'error');
            return;
        }

        // Collect fields from UI (template pins/states/modes)
        const fields = this.getFieldsFromUI();

        const block = {
            id,
            name,
            colour,
            tooltip,
            type,
            fields: fields,
            code: {
                arduino: document.getElementById('code-arduino').value,
                python: document.getElementById('code-python').value,
                java: document.getElementById('code-java').value,
                custom: document.getElementById('code-custom').value
            }
        };

        const blocks = this.data.boards[this.currentBoard].categories[this.currentCategory].blocks;

        if (this.editingBlock !== null) {
            blocks[this.editingBlock] = block;
        } else {
            blocks.push(block);
        }

        this.closeModal('modal-block');
        this.renderBlocks();
        this.saveToStorage();
        this.showToast('Block saved!', 'success');
    }

    editBlock(index) {
        this.openBlockModal(index);
    }

    deleteBlock(index) {
        const block = this.data.boards[this.currentBoard].categories[this.currentCategory].blocks[index];
        if (confirm(`Delete block "${block.name}"?`)) {
            this.data.boards[this.currentBoard].categories[this.currentCategory].blocks.splice(index, 1);
            this.renderBlocks();
            this.saveToStorage();
            this.showToast('Block deleted', 'info');
        }
    }

    // ===================================
    // FILE GENERATION
    // ===================================

    generateFiles() {
        if (Object.keys(this.data.boards).length === 0) {
            this.showToast('No boards to generate!', 'error');
            return;
        }

        const files = [];

        // Generate files for each board
        Object.keys(this.data.boards).forEach(boardId => {
            const board = this.data.boards[boardId];

            // 1. Generate block definitions
            files.push(this.generateBlockDefinitions(boardId, board));

            // 2. Generate Arduino generator
            files.push(this.generateArduinoGenerator(boardId, board));

            // 3. Generate Python generator
            files.push(this.generatePythonGenerator(boardId, board));

            // 4. Generate Java generator
            files.push(this.generateJavaGenerator(boardId, board));
        });

        // 5. Generate updated toolbox.js
        files.push(this.generateToolbox());

        // Download all files as zip or individual downloads
        this.downloadFiles(files);
    }

    generateBlockDefinitions(boardId, board) {
        let code = `'use strict';\n\n// ${board.name} Block Definitions\n// Auto-generated by Block Creator Tool\n\n`;

        // Collect pin definitions
        const pinDefs = {};
        board.categories.forEach(cat => {
            (cat.blocks || []).forEach(block => {
                if (block.fields && block.fields.pins) {
                    block.fields.pins.forEach(p => {
                        if (p.value && p.pin) pinDefs[p.value] = p.pin;
                    });
                }
            });
        });

        if (Object.keys(pinDefs).length > 0) {
            code += `// Pin Definitions\n`;
            Object.entries(pinDefs).forEach(([key, pin]) => {
                code += `const ${key}_DEF = ${pin};\n`;
            });
            code += `\n`;
        }

        board.categories.forEach(cat => {
            if (!cat.blocks || cat.blocks.length === 0) return;
            code += `// ===========================================\n`;
            code += `// ${cat.name}\n`;
            code += `// ===========================================\n\n`;
            cat.blocks.forEach(block => {
                code += this.generateSingleBlockDefinition(block, cat);
            });
        });

        return {
            filename: `${boardId}_blocks.js`,
            content: code,
            folder: 'blocks'
        };
    }

    generateArduinoGenerator(boardId, board) {
        let code = `// ${board.name} - Arduino Generator\n// Auto-generated by Block Creator Tool\n\n'use strict';\n\n`;

        const pinDefs = {};
        board.categories.forEach(cat => {
            (cat.blocks || []).forEach(block => {
                if (block.fields && block.fields.pins) {
                    block.fields.pins.forEach(p => {
                        if (p.value && p.pin) pinDefs[p.value] = p.pin;
                    });
                }
            });
        });

        if (Object.keys(pinDefs).length > 0) {
            code += `// Pin Definitions\n`;
            Object.entries(pinDefs).forEach(([key, pin]) => {
                code += `const ${key}_GEN = ${pin};\n`;
            });
            code += `\n`;
        }

        board.categories.forEach(cat => {
            if (!cat.blocks || cat.blocks.length === 0) return;
            code += `// ${cat.name}\n`;
            cat.blocks.forEach(block => {
                code += this.generateSingleArduinoGenerator(block, pinDefs);
            });
        });

        return {
            filename: `arduino_${boardId}.js`,
            content: code,
            folder: 'js/generators'
        };
    }

    generatePythonGenerator(boardId, board) {
        let code = `# ${board.name} - Python Generator\n# Auto-generated by Block Creator Tool\n\n`;

        board.categories.forEach(cat => {
            if (!cat.blocks || cat.blocks.length === 0) return;
            cat.blocks.forEach(block => {
                const f = block.fields;
                if (f && f.template && f.template !== 'custom') {
                    code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;
                    if (f.template === 'digital_write') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var state = block.getFieldValue('STATE');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    var stateVal = (state === 'HIGH') ? '1' : '0';\n`;
                        code += `    return 'Pin(' + pinNum + ', Pin.OUT).value(' + stateVal + ')\\n';\n`;
                    } else if (f.template === 'digital_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['Pin(' + pinNum + ', Pin.IN).value()', pythonGenerator.ORDER_ATOMIC];\n`;
                    } else if (f.template === 'analog_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['ADC(Pin(' + pinNum + ')).read()', pythonGenerator.ORDER_ATOMIC];\n`;
                    }
                    code += `};\n\n`;
                } else {
                    const pythonCode = block.code?.python || `# ${block.name}`;
                    if (block.type === 'value') {
                        code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;
                        code += `    return ['${pythonCode.replace(/'/g, "\\'")}', pythonGenerator.ORDER_ATOMIC];\n`;
                        code += `};\n\n`;
                    } else {
                        code += `pythonGenerator.forBlock['${block.id}'] = function(block) {\n`;
                        code += `    return '${pythonCode.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\\n';\n`;
                        code += `};\n\n`;
                    }
                }
            });
        });

        return {
            filename: `python_${boardId}.js`,
            content: code,
            folder: 'js/generators'
        };
    }

    generateJavaGenerator(boardId, board) {
        let code = `// ${board.name} - Java Generator\n// Auto-generated by Block Creator Tool\n\n`;

        board.categories.forEach(cat => {
            (cat.blocks || []).forEach(block => {
                const f = block.fields;
                if (f && f.template && f.template !== 'custom') {
                    // Template blocks - similar to Arduino for Java
                    code += `javaGenerator.forBlock['${block.id}'] = function(block) {\n`;
                    if (f.template === 'digital_write') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var state = block.getFieldValue('STATE');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return 'digitalWrite(' + pinNum + ', ' + state + ');\\n';\n`;
                    } else if (f.template === 'digital_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['digitalRead(' + pinNum + ')', javaGenerator.ORDER_ATOMIC];\n`;
                    } else if (f.template === 'analog_read') {
                        code += `    var pinKey = block.getFieldValue('PIN');\n`;
                        code += `    var pinNum;\n`;
                        (f.pins || []).forEach(p => {
                            code += `    if (pinKey === '${p.value}') pinNum = ${p.pin};\n`;
                        });
                        code += `    return ['analogRead(' + pinNum + ')', javaGenerator.ORDER_ATOMIC];\n`;
                    }
                    code += `};\n\n`;
                } else {
                    const javaCode = block.code?.java || `// ${block.name}`;
                    code += `javaGenerator.forBlock['${block.id}'] = function(block) {\n`;
                    code += `    return '${javaCode.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\\n';\n`;
                    code += `};\n\n`;
                }
            });
        });

        return {
            filename: `java_${boardId}.js`,
            content: code,
            folder: 'js/generators'
        };
    }

    generateToolbox() {
        let code = `// Toolbox - Auto-generated by Block Creator Tool\n\n`;

        // Generate category functions for each board
        Object.keys(this.data.boards).forEach(boardId => {
            const board = this.data.boards[boardId];
            const funcName = boardId.replace(/-/g, '_');

            code += `function get${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Categories() {\n`;
            code += `    return [\n`;

            board.categories.forEach(cat => {
                code += `        {\n`;
                code += `            kind: 'category',\n`;
                code += `            name: '${cat.name}',\n`;
                code += `            colour: '${cat.colour}',\n`;
                code += `            contents: [\n`;

                (cat.blocks || []).forEach(block => {
                    code += `                { kind: 'block', type: '${block.id}' },\n`;
                });

                code += `            ]\n`;
                code += `        },\n`;
            });

            code += `    ];\n`;
            code += `}\n\n`;
        });

        return {
            filename: 'toolbox_generated.js',
            content: code,
            folder: 'js'
        };
    }

    downloadFiles(files) {
        files.forEach(file => {
            const blob = new Blob([file.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename;
            a.click();
            URL.revokeObjectURL(url);
        });

        this.showToast(`Generated ${files.length} files!`, 'success');
    }

    // ===================================
    // UI HELPERS
    // ===================================

    openCloudModal() {
        this.ensureDataShape();
        this.renderCloudSettingsInputs();
        document.getElementById('modal-cloud')?.classList.remove('hidden');
    }

    saveCloudSettings() {
        this.ensureDataShape();

        const cloudConfig = {
            accessKeyId: (document.getElementById('cloud-access-key')?.value || '').trim(),
            secretAccessKey: (document.getElementById('cloud-secret-key')?.value || '').trim(),
            region: (document.getElementById('cloud-region')?.value || '').trim(),
            bucketName: (document.getElementById('cloud-bucket')?.value || '').trim()
        };

        this.data.cloudConfig = cloudConfig;
        localStorage.setItem('emmiCloudConfig', JSON.stringify(cloudConfig));
        localStorage.setItem('blockCreatorData', JSON.stringify(this.data));

        console.log('Cloud settings updated in localStorage:', {
            accessKeyId: cloudConfig.accessKeyId,
            secretAccessKey: cloudConfig.secretAccessKey ? '***' : '',
            region: cloudConfig.region,
            bucketName: cloudConfig.bucketName
        });

        this.closeModal('modal-cloud');
        this.showToast('Cloud settings saved!', 'success');
    }

    closeModal(modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    }

    switchCodeTab(lang) {
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });
        document.querySelectorAll('.code-editor').forEach(editor => {
            editor.classList.toggle('active', editor.id === `code-${lang}`);
        });
    }

    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BlockCreatorApp();
});
