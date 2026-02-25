/**
 * Java Code Generator for ESP32 Blocks
 */

const javaGenerator = new Blockly.Generator('Java');

javaGenerator.ORDER_ATOMIC = 0;
javaGenerator.ORDER_UNARY = 1;
javaGenerator.ORDER_MULTIPLICATIVE = 3;
javaGenerator.ORDER_ADDITIVE = 4;
javaGenerator.ORDER_RELATIONAL = 5;
javaGenerator.ORDER_EQUALITY = 6;
javaGenerator.ORDER_LOGICAL_AND = 7;
javaGenerator.ORDER_LOGICAL_OR = 8;
javaGenerator.ORDER_NONE = 99;

javaGenerator.imports_ = {};
javaGenerator.setupCode_ = [];
javaGenerator.variables_ = {};
javaGenerator.definitions_ = {};
javaGenerator.INDENT = '        ';

javaGenerator.init = function (workspace) {
    this.imports_ = {};
    this.setupCode_ = [];
    this.variables_ = {};
    this.definitions_ = {};
};

javaGenerator.finish = function (code) {
    let imports = Object.values(this.imports_).join('\n');
    let header = '// ESP32 Java-style Code\n// Note: This is pseudocode for educational purposes\n\n';
    if (imports) header += imports + '\n\n';
    header += 'public class ESP32Program {\n\n';

    // Add variable declarations
    for (let key in this.variables_) {
        header += '    ' + this.variables_[key] + '\n';
    }
    if (Object.keys(this.variables_).length > 0) header += '\n';

    // Add definitions (helper methods)
    for (let key in this.definitions_) {
        header += '    ' + this.definitions_[key] + '\n';
    }
    if (Object.keys(this.definitions_).length > 0) header += '\n';

    return header + code + '}\n';
};

javaGenerator.scrubNakedValue = function (line) { return line + ';\n'; };
javaGenerator.quote_ = function (text) { return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; };

// Common traverse for all blocks
javaGenerator.scrub_ = function (block, code) {
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = javaGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

// ============================================
// BASE SETUP/LOOP BLOCK (from Qubiq AI)
// ============================================

javaGenerator.forBlock['base_setup_loop'] = function (block) {
    var setupCode = javaGenerator.statementToCode(block, "SETUP");
    var loopCode = javaGenerator.statementToCode(block, "LOOP");

    var code = '';

    // Add file header
    code += '// ESP32 Java-style Code\n';
    code += '// Note: This is pseudocode for educational purposes\n\n';

    // Add imports
    if (javaGenerator.imports_) {
        for (var key in javaGenerator.imports_) {
            code += javaGenerator.imports_[key] + '\n';
        }
        if (Object.keys(javaGenerator.imports_).length > 0) {
            code += '\n';
        }
    }

    // Start class
    code += 'public class ESP32Program {\n\n';

    // Add variables
    if (javaGenerator.variables_) {
        for (var key in javaGenerator.variables_) {
            code += '    ' + javaGenerator.variables_[key] + '\n';
        }
        if (Object.keys(javaGenerator.variables_).length > 0) {
            code += '\n';
        }
    }

    // Add setup method
    code += '    public void setup() {\n';
    if (setupCode) {
        code += setupCode;
    }
    code += '    }\n\n';

    // Add loop method
    code += '    public void loop() {\n';
    code += '        while (true) {\n';
    if (loopCode) {
        code += loopCode;
    }
    code += '        }\n';
    code += '    }\n';

    // Close class
    code += '}\n';

    return code;
};

// ============================================
// GPIO
// ============================================

// Setup & Loop
javaGenerator.forBlock['esp32_setup'] = function (block) {
    let code = javaGenerator.statementToCode(block, 'SETUP_CODE');
    return '    public void setup() {\n' + code + '    }\n\n';
};

javaGenerator.forBlock['esp32_loop'] = function (block) {
    let code = javaGenerator.statementToCode(block, 'LOOP_CODE');
    return '    public void loop() {\n        while (true) {\n' + code + '        }\n    }\n\n';
};

// GPIO
javaGenerator.forBlock['esp32_pin_mode'] = function (block) {
    return '        gpio.pinMode(' + block.getFieldValue('PIN') + ', GPIO.' + block.getFieldValue('MODE') + ');\n';
};

javaGenerator.forBlock['esp32_digital_write'] = function (block) {
    return '        gpio.digitalWrite(' + block.getFieldValue('PIN') + ', GPIO.' + block.getFieldValue('STATE') + ');\n';
};

// Digital state (Read with optional pull-up)
javaGenerator.forBlock['esp32_digital_state'] = function (block) {
    let pin = block.getFieldValue('PIN');
    let pullup = block.getFieldValue('PULLUP') === 'TRUE';
    if (pullup) {
        javaGenerator.setupCode_.push('gpio.pinMode(' + pin + ', GPIO.INPUT_PULLUP);');
    } else {
        javaGenerator.setupCode_.push('gpio.pinMode(' + pin + ', GPIO.INPUT);');
    }
    return ['gpio.digitalRead(' + pin + ')', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_digital_read'] = function (block) {
    return ['gpio.digitalRead(' + block.getFieldValue('PIN') + ')', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_analog_read'] = function (block) {
    return ['adc.read(' + block.getFieldValue('PIN') + ')', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_analog_write'] = function (block) {
    let val = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    return '        pwm.write(' + block.getFieldValue('PIN') + ', ' + val + ');\n';
};

// ============================================
// TIME
// ============================================

javaGenerator.forBlock['esp32_delay'] = function (block) {
    let time = javaGenerator.valueToCode(block, 'TIME', javaGenerator.ORDER_ATOMIC) || '1000';
    return '        Thread.sleep(' + time + ');\n';
};

javaGenerator.forBlock['esp32_delay_seconds'] = function (block) {
    let time = javaGenerator.valueToCode(block, 'TIME', javaGenerator.ORDER_ATOMIC) || '1';
    return '        Thread.sleep(' + time + ' * 1000);\n';
};

javaGenerator.forBlock['esp32_millis'] = function (block) {
    return ['System.currentTimeMillis()', javaGenerator.ORDER_ATOMIC];
};

// ============================================
// SERIAL
// ============================================

javaGenerator.forBlock['esp32_serial_begin'] = function (block) {
    return '        serial = new Serial(' + block.getFieldValue('BAUD') + ');\n';
};

javaGenerator.forBlock['esp32_serial_print'] = function (block) {
    let text = javaGenerator.valueToCode(block, 'TEXT', javaGenerator.ORDER_ATOMIC) || '""';
    return block.getFieldValue('NEWLINE') === 'PRINTLN' ?
        '        System.out.println(' + text + ');\n' :
        '        System.out.print(' + text + ');\n';
};

javaGenerator.forBlock['esp32_serial_available'] = function (block) {
    return ['serial.available() > 0', javaGenerator.ORDER_RELATIONAL];
};

javaGenerator.forBlock['esp32_serial_read'] = function (block) {
    return ['serial.readString()', javaGenerator.ORDER_ATOMIC];
};

// ============================================
// WiFi
// ============================================

javaGenerator.forBlock['esp32_wifi_connect'] = function (block) {
    javaGenerator.imports_['wifi'] = 'import esp32.WiFi;';
    return '        WiFi wifi = new WiFi();\n        wifi.connect("' +
        block.getFieldValue('SSID') + '", "' + block.getFieldValue('PASSWORD') + '");\n' +
        '        while (!wifi.isConnected()) { Thread.sleep(500); }\n';
};

javaGenerator.forBlock['esp32_wifi_status'] = function (block) {
    return ['wifi.isConnected()', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_wifi_ip'] = function (block) {
    return ['wifi.getLocalIP()', javaGenerator.ORDER_ATOMIC];
};

// ============================================
// LED
// ============================================

javaGenerator.forBlock['esp32_builtin_led'] = function (block) {
    return '        gpio.digitalWrite(2, GPIO.' + block.getFieldValue('STATE') + ');\n';
};

javaGenerator.forBlock['esp32_led_blink'] = function (block) {
    let pin = block.getFieldValue('PIN');
    let delay = javaGenerator.valueToCode(block, 'DELAY', javaGenerator.ORDER_ATOMIC) || '500';
    return '        gpio.digitalWrite(' + pin + ', GPIO.HIGH);\n        Thread.sleep(' + delay + ');\n' +
        '        gpio.digitalWrite(' + pin + ', GPIO.LOW);\n        Thread.sleep(' + delay + ');\n';
};

// ============================================
// SENSORS
// ============================================

javaGenerator.forBlock['esp32_touch_read'] = function (block) {
    return ['touchSensor.read(' + block.getFieldValue('TOUCH_PIN') + ')', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_hall_sensor'] = function (block) {
    return ['hallSensor.read()', javaGenerator.ORDER_ATOMIC];
};

javaGenerator.forBlock['esp32_temperature'] = function (block) {
    return ['temperatureSensor.read()', javaGenerator.ORDER_ATOMIC];
};

// ============================================
// OLED
// ============================================

javaGenerator.forBlock['esp32_oled_init'] = function (block) {
    javaGenerator.imports_['oled'] = 'import esp32.display.OLED;';
    let size = block.getFieldValue('SIZE');
    return '        OLED display = new OLED(128, ' + (size === '128x64' ? '64' : '32') + ');\n        display.clear();\n';
};

javaGenerator.forBlock['esp32_oled_clear'] = function (block) { return '        display.clear();\n'; };

javaGenerator.forBlock['esp32_oled_print'] = function (block) {
    let text = javaGenerator.valueToCode(block, 'TEXT', javaGenerator.ORDER_ATOMIC) || '""';
    return '        display.setCursor(' + block.getFieldValue('X') + ', ' + block.getFieldValue('Y') + ');\n' +
        '        display.print(' + text + ');\n';
};

javaGenerator.forBlock['esp32_oled_display'] = function (block) { return '        display.update();\n'; };

// ============================================
// TOGGLE, INTERRUPT, POWER MANAGEMENT
// ============================================

// Toggle Pin
javaGenerator.forBlock['esp32_toggle_pin'] = function (block) {
    let pin = block.getFieldValue('PIN');
    return '        gpio.digitalWrite(' + pin + ', !gpio.digitalRead(' + pin + '));\n';
};

// Interrupt
javaGenerator.forBlock['esp32_interrupt'] = function (block) {
    let pin = block.getFieldValue('PIN');
    let mode = block.getFieldValue('MODE');
    let branch = javaGenerator.statementToCode(block, 'DO');
    let handlerName = 'onInterruptPin' + pin;

    javaGenerator.definitions_[handlerName] =
        'private void ' + handlerName + '() {\n' + branch + '        }\n';

    return '        gpio.attachInterrupt(' + pin + ', this::' + handlerName + ', GPIO.' + mode + ');\n';
};

// Detach Interrupt
javaGenerator.forBlock['esp32_detach_interrupt'] = function (block) {
    let pin = block.getFieldValue('PIN');
    return '        gpio.detachInterrupt(' + pin + ');\n';
};

// Restart
javaGenerator.forBlock['esp32_restart'] = function (block) {
    return '        ESP32.restart();\n';
};

// Deep Sleep
javaGenerator.forBlock['esp32_deep_sleep'] = function (block) {
    let time = javaGenerator.valueToCode(block, 'TIME', javaGenerator.ORDER_ATOMIC) || '1';
    return '        ESP32.enableTimerWakeup(' + time + ' * 1000000);\n' +
        '        ESP32.deepSleep();\n';
};

// ============================================
// STANDARD BLOCKLY BLOCKS
// ============================================

// Text
javaGenerator.forBlock['text'] = function (block) { return [javaGenerator.quote_(block.getFieldValue('TEXT')), javaGenerator.ORDER_ATOMIC]; };
javaGenerator.forBlock['custom_text_value'] = function (block) { return [javaGenerator.quote_(block.getFieldValue('TEXT')), javaGenerator.ORDER_ATOMIC]; };

// Number
javaGenerator.forBlock['math_number'] = function (block) { return [block.getFieldValue('NUM'), javaGenerator.ORDER_ATOMIC]; };

// Arithmetic
javaGenerator.forBlock['math_arithmetic'] = function (block) {
    let ops = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': '^' };
    let left = javaGenerator.valueToCode(block, 'A', javaGenerator.ORDER_ADDITIVE) || '0';
    let right = javaGenerator.valueToCode(block, 'B', javaGenerator.ORDER_ADDITIVE) || '0';
    let op = block.getFieldValue('OP');
    if (op === 'POWER') return ['Math.pow(' + left + ', ' + right + ')', javaGenerator.ORDER_ATOMIC];
    return [left + ' ' + ops[op] + ' ' + right, javaGenerator.ORDER_ADDITIVE];
};

// Logic boolean
javaGenerator.forBlock['logic_boolean'] = function (block) {
    return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', javaGenerator.ORDER_ATOMIC];
};

// Logic compare
javaGenerator.forBlock['logic_compare'] = function (block) {
    let ops = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    let left = javaGenerator.valueToCode(block, 'A', javaGenerator.ORDER_RELATIONAL) || '0';
    let right = javaGenerator.valueToCode(block, 'B', javaGenerator.ORDER_RELATIONAL) || '0';
    return [left + ' ' + ops[block.getFieldValue('OP')] + ' ' + right, javaGenerator.ORDER_RELATIONAL];
};

// If/else
javaGenerator.forBlock['controls_if'] = function (block) {
    let code = '', n = 0;
    do {
        let cond = javaGenerator.valueToCode(block, 'IF' + n, javaGenerator.ORDER_NONE) || 'false';
        let branch = javaGenerator.statementToCode(block, 'DO' + n);
        code += (n === 0 ? '        if' : ' else if') + ' (' + cond + ') {\n' + branch + '        }';
        n++;
    } while (block.getInput('IF' + n));
    if (block.getInput('ELSE')) code += ' else {\n' + javaGenerator.statementToCode(block, 'ELSE') + '        }';
    return code + '\n';
};

// Repeat times
javaGenerator.forBlock['controls_repeat_ext'] = function (block) {
    let times = javaGenerator.valueToCode(block, 'TIMES', javaGenerator.ORDER_ATOMIC) || '0';
    return '        for (int i = 0; i < ' + times + '; i++) {\n' + javaGenerator.statementToCode(block, 'DO') + '        }\n';
};

// While loop
javaGenerator.forBlock['controls_whileUntil'] = function (block) {
    let cond = javaGenerator.valueToCode(block, 'BOOL', javaGenerator.ORDER_NONE) || 'false';
    if (block.getFieldValue('MODE') === 'UNTIL') cond = '!(' + cond + ')';
    return '        while (' + cond + ') {\n' + javaGenerator.statementToCode(block, 'DO') + '        }\n';
};

// ============================================
// TIMING BLOCKS
// ============================================

// 1. Wait
javaGenerator.forBlock['custom_wait'] = function (block) {
    var delay = javaGenerator.valueToCode(block, 'DELAY', javaGenerator.ORDER_ATOMIC) || '0';
    var unit = block.getFieldValue('UNIT');

    if (unit === 'SECONDS') {
        return '        Thread.sleep(' + delay + ' * 1000);\n';
    } else if (unit === 'MICROSECONDS') {
        return '        Thread.sleep(0, ' + delay + ' * 1000); // microseconds\n';
    } else {
        return '        Thread.sleep(' + delay + ');\n';
    }
};

// 2. Timer
javaGenerator.forBlock['custom_timer'] = function (block) {
    var interval = javaGenerator.valueToCode(block, 'interval', javaGenerator.ORDER_ATOMIC) || '1000';
    var unit = block.getFieldValue('UNIT');
    var branch = javaGenerator.statementToCode(block, 'DO');

    var scale = (unit === 'SECONDS') ? 1000 : 1;
    var varName = 'timer_' + Math.floor(Math.random() * 1000);

    javaGenerator.variables_[varName] = 'long ' + varName + ' = 0;';

    var code = '        if (System.currentTimeMillis() - ' + varName + ' > ' + interval + ' * ' + scale + ') {\n';
    code += '            ' + varName + ' = System.currentTimeMillis();\n';
    code += branch;
    code += '        }\n';
    return code;
};

// 3. Start Timekeeping
javaGenerator.forBlock['start_timekeeping'] = function (block) {
    javaGenerator.variables_['startTime'] = 'long startTime = 0;';
    return '        startTime = System.currentTimeMillis();\n';
};

// 4. Duration from beginning
javaGenerator.forBlock['get_duration'] = function (block) {
    var unit = block.getFieldValue('UNIT');
    var scale = (unit === 'SECONDS') ? 1000 : 1;
    var code = '(System.currentTimeMillis() / ' + scale + ')';
    return [code, javaGenerator.ORDER_ATOMIC];
};

// 5. State duration
javaGenerator.forBlock['state_duration'] = function (block) {
    var state = block.getFieldValue('STATE');
    var pin = javaGenerator.valueToCode(block, 'PIN', javaGenerator.ORDER_ATOMIC) || '0';
    var code = 'gpio.pulseIn(' + pin + ', GPIO.' + state + ')';
    return [code, javaGenerator.ORDER_ATOMIC];
};

// ============================================
// CONTROL BLOCKS
// ============================================

// 1. If
javaGenerator.forBlock['custom_controls_if'] = function (block) {
    var n = 0;
    var code = '';
    do {
        var conditionCode = javaGenerator.valueToCode(block, 'IF' + n,
            javaGenerator.ORDER_NONE) || 'false';
        var branchCode = javaGenerator.statementToCode(block, 'DO' + n);
        code += (n > 0 ? ' else ' : '        ') +
            'if (' + conditionCode + ') {\n' + branchCode + '        }';
        ++n;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        var branchCode = javaGenerator.statementToCode(block, 'ELSE');
        code += ' else {\n' + branchCode + '        }';
    }
    return code + '\n';
};

// 1.5 If/Else
javaGenerator.forBlock['custom_controls_ifelse'] = function (block) {
    var conditionCode = javaGenerator.valueToCode(block, 'IF0', javaGenerator.ORDER_NONE) || 'false';
    var branchIfCode = javaGenerator.statementToCode(block, 'DO0');
    var branchElseCode = javaGenerator.statementToCode(block, 'ELSE');
    return '        if (' + conditionCode + ') {\n' + branchIfCode + '        } else {\n' + branchElseCode + '        }\n';
};

// 1.6 If/Else-If
javaGenerator.forBlock['custom_controls_if_ifnot'] = function (block) {
    var conditionIfCode = javaGenerator.valueToCode(block, 'IF0', javaGenerator.ORDER_NONE) || 'false';
    var branchIfCode = javaGenerator.statementToCode(block, 'DO0');
    var conditionElseIfCode = javaGenerator.valueToCode(block, 'IF1', javaGenerator.ORDER_NONE) || 'false';
    var branchElseIfCode = javaGenerator.statementToCode(block, 'DO1');
    return '        if (' + conditionIfCode + ') {\n' + branchIfCode + '        } else if (' + conditionElseIfCode + ') {\n' + branchElseIfCode + '        }\n';
};

// 2. Repeat Times
javaGenerator.forBlock['custom_controls_repeat'] = function (block) {
    var repeats = javaGenerator.valueToCode(block, 'TIMES',
        javaGenerator.ORDER_ATOMIC) || '0';
    var branch = javaGenerator.statementToCode(block, 'DO');
    return '        for (int i = 0; i < ' + repeats + '; i++) {\n' + branch + '        }\n';
};

// 3. Repeat While/Until
javaGenerator.forBlock['custom_controls_whileUntil'] = function (block) {
    var until = block.getFieldValue('MODE') === 'UNTIL';
    var argument0 = javaGenerator.valueToCode(block, 'BOOL',
        until ? javaGenerator.ORDER_UNARY :
            javaGenerator.ORDER_NONE) || 'false';
    var branch = javaGenerator.statementToCode(block, 'DO');
    if (until) {
        argument0 = '!' + argument0;
    }
    return '        while (' + argument0 + ') {\n' + branch + '        }\n';
};

// 4. For Loop
javaGenerator.forBlock['custom_controls_for'] = function (block) {
    var variable0 = block.getFieldValue('VAR') || 'i';
    var argument0 = javaGenerator.valueToCode(block, 'FROM',
        javaGenerator.ORDER_ATOMIC) || '0';
    var argument1 = javaGenerator.valueToCode(block, 'TO',
        javaGenerator.ORDER_ATOMIC) || '0';
    var increment = javaGenerator.valueToCode(block, 'BY',
        javaGenerator.ORDER_ATOMIC) || '1';
    var branch = javaGenerator.statementToCode(block, 'DO');

    var code = '        for (int ' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + ' <= ' + argument1 + '; ' +
        variable0 + ' += ' + increment + ') {\n' +
        branch + '        }\n';
    return code;
};

// 5. Switch
javaGenerator.forBlock['custom_controls_switch'] = function (block) {
    var switchValue = javaGenerator.valueToCode(block, 'SWITCH_VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    var targetValue = javaGenerator.valueToCode(block, 'CASE_VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    var branch = javaGenerator.statementToCode(block, 'DO');

    return '        if (' + switchValue + ' == ' + targetValue + ') {\n' + branch + '        }\n';
};

// 6. Flow Statements (Break/Continue)
javaGenerator.forBlock['custom_flow_statements'] = function (block) {
    switch (block.getFieldValue('FLOW')) {
        case 'BREAK':
            return '        break;\n';
        case 'CONTINUE':
            return '        continue;\n';
    }
    return '        break;\n';
};

// 7. Logic And
javaGenerator.forBlock['custom_logic_and'] = function (block) {
    var operator = (block.getFieldValue('OP') == 'OR') ? '||' : '&&';
    var order = (operator == '||') ? javaGenerator.ORDER_LOGICAL_OR :
        javaGenerator.ORDER_LOGICAL_AND;
    var argument0 = javaGenerator.valueToCode(block, 'A', order) || 'false';
    var argument1 = javaGenerator.valueToCode(block, 'B', order) || 'false';
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};

// 8. Logic Not
javaGenerator.forBlock['custom_logic_not'] = function (block) {
    var argument0 = javaGenerator.valueToCode(block, 'BOOL',
        javaGenerator.ORDER_UNARY) || 'true';
    var code = '!' + argument0;
    return [code, javaGenerator.ORDER_UNARY];
};

// 9. Logic Null
javaGenerator.forBlock['custom_logic_null'] = function (block) {
    return ['null', javaGenerator.ORDER_ATOMIC];
};

// ============================================
// OPERATOR BLOCKS (Custom)
// ============================================

// 1. Map
javaGenerator.forBlock['custom_math_map'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    let fromLow = javaGenerator.valueToCode(block, 'FROM_LOW', javaGenerator.ORDER_ATOMIC) || '0';
    let fromHigh = javaGenerator.valueToCode(block, 'FROM_HIGH', javaGenerator.ORDER_ATOMIC) || '1023';
    let toLow = javaGenerator.valueToCode(block, 'TO_LOW', javaGenerator.ORDER_ATOMIC) || '0';
    let toHigh = javaGenerator.valueToCode(block, 'TO_HIGH', javaGenerator.ORDER_ATOMIC) || '255';
    return ['(int)((' + value + ' - ' + fromLow + ') * (' + toHigh + ' - ' + toLow + ') / (' + fromHigh + ' - ' + fromLow + ') + ' + toLow + ')', javaGenerator.ORDER_ATOMIC];
};

// 2. Random Integer
javaGenerator.forBlock['custom_math_random_int'] = function (block) {
    javaGenerator.imports_['random'] = 'import java.util.Random;';
    let from = javaGenerator.valueToCode(block, 'FROM', javaGenerator.ORDER_ATOMIC) || '0';
    let to = javaGenerator.valueToCode(block, 'TO', javaGenerator.ORDER_ATOMIC) || '100';
    return ['new Random().nextInt(' + to + ' - ' + from + ' + 1) + ' + from, javaGenerator.ORDER_ATOMIC];
};

// 3. Constrain
javaGenerator.forBlock['custom_math_constrain'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    let low = javaGenerator.valueToCode(block, 'LOW', javaGenerator.ORDER_ATOMIC) || '0';
    let high = javaGenerator.valueToCode(block, 'HIGH', javaGenerator.ORDER_ATOMIC) || '100';
    return ['Math.min(Math.max(' + value + ', ' + low + '), ' + high + ')', javaGenerator.ORDER_ATOMIC];
};

// 4. Cast to Byte
javaGenerator.forBlock['cast_to_byte'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    return ['(byte)(' + value + ')', javaGenerator.ORDER_ATOMIC];
};

// 5. Cast to Unsigned Int (Java uses int)
javaGenerator.forBlock['cast_to_unsigned_int'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    return ['Integer.toUnsignedLong((int)(' + value + '))', javaGenerator.ORDER_ATOMIC];
};

// 6. Cast to Int
javaGenerator.forBlock['cast_to_int'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    return ['(int)(' + value + ')', javaGenerator.ORDER_ATOMIC];
};

// 7. Cast to Float
javaGenerator.forBlock['cast_to_float'] = function (block) {
    let value = javaGenerator.valueToCode(block, 'VALUE', javaGenerator.ORDER_ATOMIC) || '0';
    return ['(float)(' + value + ')', javaGenerator.ORDER_ATOMIC];
};

console.log('Java generator loaded successfully including CONTROL and OPERATOR blocks');
