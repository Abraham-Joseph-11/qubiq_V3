'use strict';

/* =======================================================
   Variable Generators - Custom Implementation
   ======================================================= */

// Helper: Sanitize variable name locally to avoid Blockly Internal issues
function sanitizeVarName(name) {
    if (!name) return 'myVar';
    // Remove non-alphanumeric, ensure starts with letter/underscore
    var clean = name.replace(/[^a-zA-Z0-9_]/g, '_');
    if (!clean.match(/^[a-zA-Z_]/)) {
        clean = 'var_' + clean;
    }
    return clean;
}

// 1. Declare Variable
arduinoGenerator.forBlock['custom_variable_declare'] = function (block) {
    // Custom sanitize - USE getText() to get name, not ID
    var variable_name = sanitizeVarName(block.getField('VAR').getText());

    var dropdown_type = block.getFieldValue('TYPE');
    var value_value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';

    // Register global variable
    arduinoGenerator.variables_[variable_name] = dropdown_type + ' ' + variable_name + ';';

    return variable_name + ' = ' + value_value + ';\n';
};

// 2. Set Variable
arduinoGenerator.forBlock['custom_variable_set'] = function (block) {
    var variable_name = sanitizeVarName(block.getField('VAR').getText());
    // Use ORDER_ATOMIC to be safe, matching other blocks
    var value_value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return variable_name + ' = ' + value_value + ';\n';
};

// 3. Change Variable
arduinoGenerator.forBlock['custom_variable_change'] = function (block) {
    var variable_name = sanitizeVarName(block.getField('VAR').getText());
    var value_value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '1';
    return variable_name + ' += ' + value_value + ';\n';
};

// 4. Declare Constant
arduinoGenerator.forBlock['custom_constant_declare'] = function (block) {
    // Custom sanitize - USE getText() because it's now a FieldVariable (dropdown)
    var text_var = block.getField('VAR').getText();
    var dropdown_type = block.getFieldValue('TYPE');
    var value_value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';

    var cleanName = sanitizeVarName(text_var);
    // User requested NO prefix
    // if (!cleanName.startsWith('const_')) cleanName = "const_" + cleanName;

    arduinoGenerator.variables_[cleanName] = 'const ' + dropdown_type + ' ' + cleanName + ' = ' + value_value + ';';

    return '';
};

// 5. Set Constant (Define)
arduinoGenerator.forBlock['custom_constant_set'] = function (block) {
    // Custom sanitize - USE getText() because it's now a FieldVariable (dropdown)
    var text_var = block.getField('VAR').getText();
    var value_value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';

    var cleanName = sanitizeVarName(text_var);
    // User requested NO prefix
    // if (!cleanName.startsWith('DEF_')) cleanName = "DEF_" + cleanName;

    arduinoGenerator.includes_['define_' + cleanName] = '#define ' + cleanName + ' ' + value_value;

    return '';
};

// 6. Variable Getter
arduinoGenerator.forBlock['custom_variable_get'] = function (block) {
    var variable_name = sanitizeVarName(block.getField('VAR').getText());
    return [variable_name, arduinoGenerator.ORDER_ATOMIC];
};
