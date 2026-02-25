/**
 * MicroPython Code Generator for ESP32 Blocks
 */

const pythonGenerator = new Blockly.Generator('Python');

pythonGenerator.ORDER_ATOMIC = 0;
pythonGenerator.ORDER_UNARY = 1;
pythonGenerator.ORDER_MULTIPLICATIVE = 3;
pythonGenerator.ORDER_ADDITIVE = 4;
pythonGenerator.ORDER_RELATIONAL = 5;
pythonGenerator.ORDER_EQUALITY = 6;
pythonGenerator.ORDER_LOGICAL_AND = 7;
pythonGenerator.ORDER_LOGICAL_OR = 8;
pythonGenerator.ORDER_NONE = 99;

pythonGenerator.imports_ = {};
pythonGenerator.definitions_ = {};
pythonGenerator.variables_ = {};
pythonGenerator.INDENT = '    ';

pythonGenerator.init = function (workspace) {
    this.imports_ = {};
    this.definitions_ = {};
    this.variables_ = {};
};

pythonGenerator.finish = function (code) {
    let imports = Object.values(this.imports_).join('\n');
    let defs = Object.values(this.definitions_).join('\n');
    let vars = Object.values(this.variables_).join('\n');
    return (imports ? imports + '\n\n' : '') + (vars ? vars + '\n\n' : '') + (defs ? defs + '\n\n' : '') + code;
};

pythonGenerator.scrubNakedValue = function (line) { return line + '\n'; };
pythonGenerator.quote_ = function (text) { return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; };

// Common traverse for all blocks
pythonGenerator.scrub_ = function (block, code) {
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = pythonGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

// ============================================
// BASE SETUP/LOOP BLOCK (from Qubiq AI)
// ============================================

pythonGenerator.forBlock['base_setup_loop'] = function (block) {
    var setupCode = pythonGenerator.statementToCode(block, "SETUP");
    var loopCode = pythonGenerator.statementToCode(block, "LOOP");

    var code = '';

    // Add imports
    if (pythonGenerator.imports_) {
        for (var key in pythonGenerator.imports_) {
            code += pythonGenerator.imports_[key] + '\n';
        }
        if (Object.keys(pythonGenerator.imports_).length > 0) {
            code += '\n';
        }
    }

    // Add variables
    if (pythonGenerator.variables_) {
        for (var key in pythonGenerator.variables_) {
            code += pythonGenerator.variables_[key] + '\n';
        }
        if (Object.keys(pythonGenerator.variables_).length > 0) {
            code += '\n';
        }
    }

    // Add definitions
    if (pythonGenerator.definitions_) {
        for (var key in pythonGenerator.definitions_) {
            code += pythonGenerator.definitions_[key] + '\n';
        }
        if (Object.keys(pythonGenerator.definitions_).length > 0) {
            code += '\n';
        }
    }

    // Add setup code
    if (setupCode) {
        code += '# Setup\n' + setupCode + '\n';
    }

    // Add loop code
    code += '# Main loop\n';
    code += 'while True:\n';
    if (loopCode) {
        code += loopCode;
    } else {
        code += '    pass\n';
    }

    return code;
};

// ============================================
// GPIO
// ============================================

// Setup & Loop
pythonGenerator.forBlock['esp32_setup'] = function (block) {
    return '# Setup\n' + pythonGenerator.statementToCode(block, 'SETUP_CODE') + '\n';
};

pythonGenerator.forBlock['esp32_loop'] = function (block) {
    return 'while True:\n' + pythonGenerator.statementToCode(block, 'LOOP_CODE') + '\n';
};

// GPIO
pythonGenerator.forBlock['esp32_pin_mode'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    return '';
};

pythonGenerator.forBlock['esp32_digital_write'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    return 'Pin(' + block.getFieldValue('PIN') + ', Pin.OUT).value(' + (block.getFieldValue('STATE') === 'HIGH' ? '1' : '0') + ')\n';
};

// Digital state (Read with optional pull-up)
pythonGenerator.forBlock['esp32_digital_state'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    let pin = block.getFieldValue('PIN');
    let pullup = block.getFieldValue('PULLUP') === 'TRUE';
    if (pullup) {
        return ['Pin(' + pin + ', Pin.IN, Pin.PULL_UP).value()', pythonGenerator.ORDER_ATOMIC];
    } else {
        return ['Pin(' + pin + ', Pin.IN).value()', pythonGenerator.ORDER_ATOMIC];
    }
};

pythonGenerator.forBlock['esp32_digital_read'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    return ['Pin(' + block.getFieldValue('PIN') + ', Pin.IN).value()', pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['esp32_analog_read'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    return ['ADC(Pin(' + block.getFieldValue('PIN') + ')).read()', pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['esp32_analog_write'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    let val = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return 'PWM(Pin(' + block.getFieldValue('PIN') + '), freq=1000).duty(' + val + ')\n';
};

// ============================================
// TIME
// ============================================

pythonGenerator.forBlock['esp32_delay'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    return 'time.sleep_ms(' + (pythonGenerator.valueToCode(block, 'TIME', pythonGenerator.ORDER_ATOMIC) || '1000') + ')\n';
};

pythonGenerator.forBlock['esp32_delay_seconds'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    return 'time.sleep(' + (pythonGenerator.valueToCode(block, 'TIME', pythonGenerator.ORDER_ATOMIC) || '1') + ')\n';
};

pythonGenerator.forBlock['esp32_millis'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    return ['time.ticks_ms()', pythonGenerator.ORDER_ATOMIC];
};

// ============================================
// SERIAL
// ============================================

pythonGenerator.forBlock['esp32_serial_begin'] = function (block) { return ''; };

pythonGenerator.forBlock['esp32_serial_print'] = function (block) {
    let text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_ATOMIC) || '""';
    return block.getFieldValue('NEWLINE') === 'PRINTLN' ? 'print(' + text + ')\n' : 'print(' + text + ', end="")\n';
};

pythonGenerator.forBlock['esp32_serial_available'] = function (block) { return ['True', pythonGenerator.ORDER_ATOMIC]; };
pythonGenerator.forBlock['esp32_serial_read'] = function (block) { return ['input()', pythonGenerator.ORDER_ATOMIC]; };

// ============================================
// WiFi
// ============================================

pythonGenerator.forBlock['esp32_wifi_connect'] = function (block) {
    pythonGenerator.imports_['network'] = 'import network';
    pythonGenerator.imports_['time'] = 'import time';
    return 'wlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect("' +
        block.getFieldValue('SSID') + '", "' + block.getFieldValue('PASSWORD') + '")\nwhile not wlan.isconnected(): time.sleep(0.5)\n';
};

pythonGenerator.forBlock['esp32_wifi_status'] = function (block) {
    pythonGenerator.imports_['network'] = 'import network';
    return ['network.WLAN(network.STA_IF).isconnected()', pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['esp32_wifi_ip'] = function (block) {
    pythonGenerator.imports_['network'] = 'import network';
    return ['network.WLAN(network.STA_IF).ifconfig()[0]', pythonGenerator.ORDER_ATOMIC];
};

// ============================================
// LED
// ============================================

pythonGenerator.forBlock['esp32_builtin_led'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    return 'Pin(2, Pin.OUT).value(' + (block.getFieldValue('STATE') === 'HIGH' ? '1' : '0') + ')\n';
};

pythonGenerator.forBlock['esp32_led_blink'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    pythonGenerator.imports_['time'] = 'import time';
    let pin = block.getFieldValue('PIN');
    let delay = pythonGenerator.valueToCode(block, 'DELAY', pythonGenerator.ORDER_ATOMIC) || '500';
    return 'Pin(' + pin + ', Pin.OUT).value(1)\ntime.sleep_ms(' + delay + ')\nPin(' + pin + ', Pin.OUT).value(0)\ntime.sleep_ms(' + delay + ')\n';
};

// ============================================
// SENSORS
// ============================================

pythonGenerator.forBlock['esp32_touch_read'] = function (block) {
    pythonGenerator.imports_['touch'] = 'from machine import TouchPad, Pin';
    let gpioMap = { '0': '4', '1': '0', '2': '2', '3': '15', '4': '13', '5': '12', '6': '14', '7': '27', '8': '33', '9': '32' };
    return ['TouchPad(Pin(' + gpioMap[block.getFieldValue('TOUCH_PIN')] + ')).read()', pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['esp32_hall_sensor'] = function (block) {
    pythonGenerator.imports_['esp32'] = 'import esp32';
    return ['esp32.hall_sensor()', pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator.forBlock['esp32_temperature'] = function (block) {
    pythonGenerator.imports_['esp32'] = 'import esp32';
    return ['esp32.raw_temperature()', pythonGenerator.ORDER_ATOMIC];
};

// ============================================
// OLED
// ============================================

pythonGenerator.forBlock['esp32_oled_init'] = function (block) {
    pythonGenerator.imports_['ssd1306'] = 'import ssd1306\nfrom machine import I2C, Pin';
    pythonGenerator.definitions_['oled'] = 'oled = ssd1306.SSD1306_I2C(128, ' + (block.getFieldValue('SIZE') === '128x64' ? '64' : '32') + ', I2C(0, scl=Pin(22), sda=Pin(21)))';
    return 'oled.fill(0)\n';
};

pythonGenerator.forBlock['esp32_oled_clear'] = function (block) { return 'oled.fill(0)\n'; };

pythonGenerator.forBlock['esp32_oled_print'] = function (block) {
    let text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_ATOMIC) || '""';
    return 'oled.text(str(' + text + '), ' + block.getFieldValue('X') + ', ' + block.getFieldValue('Y') + ')\n';
};

pythonGenerator.forBlock['esp32_oled_display'] = function (block) { return 'oled.show()\n'; };

// ============================================
// TOGGLE, INTERRUPT, POWER MANAGEMENT
// ============================================

// Toggle Pin
pythonGenerator.forBlock['esp32_toggle_pin'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    let pin = block.getFieldValue('PIN');
    return 'pin_' + pin + ' = Pin(' + pin + ', Pin.OUT)\npin_' + pin + '.value(not pin_' + pin + '.value())\n';
};

// Interrupt
pythonGenerator.forBlock['esp32_interrupt'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    let pin = block.getFieldValue('PIN');
    let mode = block.getFieldValue('MODE');
    let branch = pythonGenerator.statementToCode(block, 'DO');
    let handlerName = 'isr_pin_' + pin;

    var modeMap = { 'RISING': 'Pin.IRQ_RISING', 'FALLING': 'Pin.IRQ_FALLING', 'CHANGE': 'Pin.IRQ_RISING | Pin.IRQ_FALLING' };
    var pyMode = modeMap[mode] || 'Pin.IRQ_RISING';

    pythonGenerator.definitions_[handlerName] =
        'def ' + handlerName + '(pin):\n' + (branch || '    pass\n');

    return 'Pin(' + pin + ', Pin.IN, Pin.PULL_UP).irq(trigger=' + pyMode + ', handler=' + handlerName + ')\n';
};

// Detach Interrupt
pythonGenerator.forBlock['esp32_detach_interrupt'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    let pin = block.getFieldValue('PIN');
    return 'Pin(' + pin + ', Pin.IN).irq(handler=None)\n';
};

// Restart
pythonGenerator.forBlock['esp32_restart'] = function (block) {
    pythonGenerator.imports_['machine_reset'] = 'import machine';
    return 'machine.reset()\n';
};

// Deep Sleep
pythonGenerator.forBlock['esp32_deep_sleep'] = function (block) {
    pythonGenerator.imports_['machine_reset'] = 'import machine';
    let time = pythonGenerator.valueToCode(block, 'TIME', pythonGenerator.ORDER_ATOMIC) || '1';
    return 'machine.deepsleep(' + time + ' * 1000)\n';
};

// ============================================
// STANDARD BLOCKLY BLOCKS
// ============================================

// Text
pythonGenerator.forBlock['text'] = function (block) { return [pythonGenerator.quote_(block.getFieldValue('TEXT')), pythonGenerator.ORDER_ATOMIC]; };
pythonGenerator.forBlock['custom_text_value'] = function (block) { return [pythonGenerator.quote_(block.getFieldValue('TEXT')), pythonGenerator.ORDER_ATOMIC]; };

// Number
pythonGenerator.forBlock['math_number'] = function (block) { return [block.getFieldValue('NUM'), pythonGenerator.ORDER_ATOMIC]; };

// Arithmetic
pythonGenerator.forBlock['math_arithmetic'] = function (block) {
    let ops = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': '**' };
    let left = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ADDITIVE) || '0';
    let right = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ADDITIVE) || '0';
    return [left + ' ' + ops[block.getFieldValue('OP')] + ' ' + right, pythonGenerator.ORDER_ADDITIVE];
};

// Logic boolean
pythonGenerator.forBlock['logic_boolean'] = function (block) {
    return [block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False', pythonGenerator.ORDER_ATOMIC];
};

// Logic compare
pythonGenerator.forBlock['logic_compare'] = function (block) {
    let ops = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    let left = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_RELATIONAL) || '0';
    let right = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_RELATIONAL) || '0';
    return [left + ' ' + ops[block.getFieldValue('OP')] + ' ' + right, pythonGenerator.ORDER_RELATIONAL];
};

// If/else
pythonGenerator.forBlock['controls_if'] = function (block) {
    let code = '', n = 0;
    do {
        let cond = pythonGenerator.valueToCode(block, 'IF' + n, pythonGenerator.ORDER_NONE) || 'False';
        let branch = pythonGenerator.statementToCode(block, 'DO' + n) || '    pass\n';
        code += (n === 0 ? 'if' : 'elif') + ' ' + cond + ':\n' + branch;
        n++;
    } while (block.getInput('IF' + n));
    if (block.getInput('ELSE')) code += 'else:\n' + (pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n');
    return code;
};

// Repeat times
pythonGenerator.forBlock['controls_repeat_ext'] = function (block) {
    let times = pythonGenerator.valueToCode(block, 'TIMES', pythonGenerator.ORDER_ATOMIC) || '0';
    return 'for _ in range(' + times + '):\n' + (pythonGenerator.statementToCode(block, 'DO') || '    pass\n');
};

// While loop
pythonGenerator.forBlock['controls_whileUntil'] = function (block) {
    let cond = pythonGenerator.valueToCode(block, 'BOOL', pythonGenerator.ORDER_NONE) || 'False';
    if (block.getFieldValue('MODE') === 'UNTIL') cond = 'not (' + cond + ')';
    return 'while ' + cond + ':\n' + (pythonGenerator.statementToCode(block, 'DO') || '    pass\n');
};

// ============================================
// TIMING BLOCKS
// ============================================

// 1. Wait
pythonGenerator.forBlock['custom_wait'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    var delay = pythonGenerator.valueToCode(block, 'DELAY', pythonGenerator.ORDER_ATOMIC) || '0';
    var unit = block.getFieldValue('UNIT');

    if (unit === 'SECONDS') {
        return 'time.sleep(' + delay + ')\n';
    } else if (unit === 'MICROSECONDS') {
        return 'time.sleep_us(' + delay + ')\n';
    } else {
        return 'time.sleep_ms(' + delay + ')\n';
    }
};

// 2. Timer
pythonGenerator.forBlock['custom_timer'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    var interval = pythonGenerator.valueToCode(block, 'interval', pythonGenerator.ORDER_ATOMIC) || '1000';
    var unit = block.getFieldValue('UNIT');
    var branch = pythonGenerator.statementToCode(block, 'DO');

    var scale = (unit === 'SECONDS') ? 1000 : 1;
    var varName = 'timer_' + Math.floor(Math.random() * 1000);

    pythonGenerator.variables_[varName] = varName + ' = 0';

    var code = 'if time.ticks_ms() - ' + varName + ' > ' + interval + ' * ' + scale + ':\n';
    code += '    ' + varName + ' = time.ticks_ms()\n';
    code += branch || '    pass\n';
    return code;
};

// 3. Start Timekeeping
pythonGenerator.forBlock['start_timekeeping'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    pythonGenerator.variables_['start_time'] = 'start_time = 0';
    return 'start_time = time.ticks_ms()\n';
};

// 4. Duration from beginning
pythonGenerator.forBlock['get_duration'] = function (block) {
    pythonGenerator.imports_['time'] = 'import time';
    var unit = block.getFieldValue('UNIT');
    var scale = (unit === 'SECONDS') ? 1000 : 1;
    var code = '(time.ticks_ms() // ' + scale + ')';
    return [code, pythonGenerator.ORDER_ATOMIC];
};

// 5. State duration
pythonGenerator.forBlock['state_duration'] = function (block) {
    pythonGenerator.imports_['machine'] = 'from machine import Pin, ADC, PWM';
    pythonGenerator.imports_['time'] = 'import time';
    var state = block.getFieldValue('STATE');
    var pin = pythonGenerator.valueToCode(block, 'PIN', pythonGenerator.ORDER_ATOMIC) || '0';
    var code = 'time_pulse_us(Pin(' + pin + ', Pin.IN), ' + (state === 'HIGH' ? '1' : '0') + ')';
    return [code, pythonGenerator.ORDER_ATOMIC];
};

// ============================================
// CONTROL BLOCKS
// ============================================

// 1. If
pythonGenerator.forBlock['custom_controls_if'] = function (block) {
    var n = 0;
    var code = '';
    do {
        var conditionCode = pythonGenerator.valueToCode(block, 'IF' + n,
            pythonGenerator.ORDER_NONE) || 'False';
        var branchCode = pythonGenerator.statementToCode(block, 'DO' + n) || '    pass\n';
        code += (n > 0 ? 'elif' : 'if') + ' ' + conditionCode + ':\n' + branchCode;
        ++n;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        var branchCode = pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n';
        code += 'else:\n' + branchCode;
    }
    return code;
};

// 1.5 If/Else
pythonGenerator.forBlock['custom_controls_ifelse'] = function (block) {
    var conditionCode = pythonGenerator.valueToCode(block, 'IF0', pythonGenerator.ORDER_NONE) || 'False';
    var branchIfCode = pythonGenerator.statementToCode(block, 'DO0') || '    pass\n';
    var branchElseCode = pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n';
    return 'if ' + conditionCode + ':\n' + branchIfCode + 'else:\n' + branchElseCode;
};

// 1.6 If/Else-If
pythonGenerator.forBlock['custom_controls_if_ifnot'] = function (block) {
    var conditionIfCode = pythonGenerator.valueToCode(block, 'IF0', pythonGenerator.ORDER_NONE) || 'False';
    var branchIfCode = pythonGenerator.statementToCode(block, 'DO0') || '    pass\n';
    var conditionElseIfCode = pythonGenerator.valueToCode(block, 'IF1', pythonGenerator.ORDER_NONE) || 'False';
    var branchElseIfCode = pythonGenerator.statementToCode(block, 'DO1') || '    pass\n';
    return 'if ' + conditionIfCode + ':\n' + branchIfCode + 'elif ' + conditionElseIfCode + ':\n' + branchElseIfCode;
};

// 2. Repeat Times
pythonGenerator.forBlock['custom_controls_repeat'] = function (block) {
    var repeats = pythonGenerator.valueToCode(block, 'TIMES',
        pythonGenerator.ORDER_ATOMIC) || '0';
    var branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    return 'for _ in range(' + repeats + '):\n' + branch;
};

// 3. Repeat While/Until
pythonGenerator.forBlock['custom_controls_whileUntil'] = function (block) {
    var until = block.getFieldValue('MODE') === 'UNTIL';
    var argument0 = pythonGenerator.valueToCode(block, 'BOOL',
        pythonGenerator.ORDER_NONE) || 'False';
    var branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    if (until) {
        argument0 = 'not (' + argument0 + ')';
    }
    return 'while ' + argument0 + ':\n' + branch;
};

// 4. For Loop
pythonGenerator.forBlock['custom_controls_for'] = function (block) {
    var variable0 = block.getFieldValue('VAR') || 'i';
    var argument0 = pythonGenerator.valueToCode(block, 'FROM',
        pythonGenerator.ORDER_ATOMIC) || '0';
    var argument1 = pythonGenerator.valueToCode(block, 'TO',
        pythonGenerator.ORDER_ATOMIC) || '0';
    var increment = pythonGenerator.valueToCode(block, 'BY',
        pythonGenerator.ORDER_ATOMIC) || '1';
    var branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';

    return 'for ' + variable0 + ' in range(' + argument0 + ', ' + argument1 + ' + 1, ' + increment + '):\n' + branch;
};

// 5. Switch (implemented as if/elif in Python)
pythonGenerator.forBlock['custom_controls_switch'] = function (block) {
    var switchValue = pythonGenerator.valueToCode(block, 'SWITCH_VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    var targetValue = pythonGenerator.valueToCode(block, 'CASE_VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    var branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';

    return 'if ' + switchValue + ' == ' + targetValue + ':\n' + branch;
};

// 6. Flow Statements (Break/Continue)
pythonGenerator.forBlock['custom_flow_statements'] = function (block) {
    switch (block.getFieldValue('FLOW')) {
        case 'BREAK':
            return 'break\n';
        case 'CONTINUE':
            return 'continue\n';
    }
    return 'break\n';
};

// 7. Logic And
pythonGenerator.forBlock['custom_logic_and'] = function (block) {
    var operator = (block.getFieldValue('OP') == 'OR') ? 'or' : 'and';
    var order = (operator == 'or') ? pythonGenerator.ORDER_LOGICAL_OR :
        pythonGenerator.ORDER_LOGICAL_AND;
    var argument0 = pythonGenerator.valueToCode(block, 'A', order) || 'False';
    var argument1 = pythonGenerator.valueToCode(block, 'B', order) || 'False';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

// 8. Logic Not
pythonGenerator.forBlock['custom_logic_not'] = function (block) {
    var argument0 = pythonGenerator.valueToCode(block, 'BOOL',
        pythonGenerator.ORDER_UNARY) || 'True';
    var code = 'not ' + argument0;
    return [code, pythonGenerator.ORDER_UNARY];
};

// 9. Logic Null
pythonGenerator.forBlock['custom_logic_null'] = function (block) {
    return ['None', pythonGenerator.ORDER_ATOMIC];
};

// ============================================
// OPERATOR BLOCKS (Custom)
// ============================================

// 1. Map (Python implementation of Arduino map function)
pythonGenerator.forBlock['custom_math_map'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    let fromLow = pythonGenerator.valueToCode(block, 'FROM_LOW', pythonGenerator.ORDER_ATOMIC) || '0';
    let fromHigh = pythonGenerator.valueToCode(block, 'FROM_HIGH', pythonGenerator.ORDER_ATOMIC) || '1023';
    let toLow = pythonGenerator.valueToCode(block, 'TO_LOW', pythonGenerator.ORDER_ATOMIC) || '0';
    let toHigh = pythonGenerator.valueToCode(block, 'TO_HIGH', pythonGenerator.ORDER_ATOMIC) || '255';
    return ['int((' + value + ' - ' + fromLow + ') * (' + toHigh + ' - ' + toLow + ') / (' + fromHigh + ' - ' + fromLow + ') + ' + toLow + ')', pythonGenerator.ORDER_ATOMIC];
};

// 2. Random Integer
pythonGenerator.forBlock['custom_math_random_int'] = function (block) {
    pythonGenerator.imports_['random'] = 'import random';
    let from = pythonGenerator.valueToCode(block, 'FROM', pythonGenerator.ORDER_ATOMIC) || '0';
    let to = pythonGenerator.valueToCode(block, 'TO', pythonGenerator.ORDER_ATOMIC) || '100';
    return ['random.randint(' + from + ', ' + to + ')', pythonGenerator.ORDER_ATOMIC];
};

// 3. Constrain
pythonGenerator.forBlock['custom_math_constrain'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    let low = pythonGenerator.valueToCode(block, 'LOW', pythonGenerator.ORDER_ATOMIC) || '0';
    let high = pythonGenerator.valueToCode(block, 'HIGH', pythonGenerator.ORDER_ATOMIC) || '100';
    return ['min(max(' + value + ', ' + low + '), ' + high + ')', pythonGenerator.ORDER_ATOMIC];
};

// 4. Cast to Byte
pythonGenerator.forBlock['cast_to_byte'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return ['int(' + value + ') & 0xFF', pythonGenerator.ORDER_ATOMIC];
};

// 5. Cast to Unsigned Int
pythonGenerator.forBlock['cast_to_unsigned_int'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return ['abs(int(' + value + '))', pythonGenerator.ORDER_ATOMIC];
};

// 6. Cast to Int
pythonGenerator.forBlock['cast_to_int'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return ['int(' + value + ')', pythonGenerator.ORDER_ATOMIC];
};

// 7. Cast to Float
pythonGenerator.forBlock['cast_to_float'] = function (block) {
    let value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return ['float(' + value + ')', pythonGenerator.ORDER_ATOMIC];
};

console.log('Python generator loaded successfully including CONTROL and OPERATOR blocks');
