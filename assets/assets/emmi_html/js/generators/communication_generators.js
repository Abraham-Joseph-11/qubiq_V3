'use strict';

// ===========================================
// USB Serial Generators
// ===========================================

arduinoGenerator.forBlock['usb_serial_init'] = function (block) {
    var baud = block.getFieldValue('BAUD');
    arduinoGenerator.setupCode_['usb_serial_init'] = 'Serial.begin(' + baud + ');';
    return '';
};

arduinoGenerator.forBlock['usb_serial_available'] = function (block) {
    var code = 'Serial.available()';
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['usb_serial_read_byte'] = function (block) {
    var code = 'Serial.read()';
    return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['usb_serial_read_string_until'] = function (block) {
    var untilNewline = block.getFieldValue('UNTIL_NEWLINE') === 'TRUE';
    if (untilNewline) {
        return ['Serial.readStringUntil(\'\\n\')', arduinoGenerator.ORDER_ATOMIC];
    } else {
        return ['Serial.readString()', arduinoGenerator.ORDER_ATOMIC];
    }
};

arduinoGenerator.forBlock['usb_serial_read_number_until'] = function (block) {
    var untilNewline = block.getFieldValue('UNTIL_NEWLINE') === 'TRUE';
    // Requires a helper function or complex logic to "read as number". 
    // Standard Arduino parseInt() or similar.
    // For simplicity assuming parseInt()
    return ['Serial.parseInt()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['usb_serial_print_format'] = function (block) {
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    var format = block.getFieldValue('FORMAT');
    return 'Serial.print(' + value + ', ' + format + ');\n';
};

arduinoGenerator.forBlock['usb_serial_print_same_line'] = function (block) {
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return 'Serial.print(' + value + ');\n';
};

arduinoGenerator.forBlock['usb_serial_print_new_line'] = function (block) {
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return 'Serial.println(' + value + ');\n';
};

arduinoGenerator.forBlock['usb_serial_write'] = function (block) {
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return 'Serial.write(' + value + ');\n';
};

// ===========================================
// Bluetooth Serial Generators
// ===========================================

function addBluetoothSetup() {
    arduinoGenerator.includes_['include_bluetooth'] = '#include "BluetoothSerial.h"';
    arduinoGenerator.variables_['define_bluetooth'] = 'BluetoothSerial SerialBT;';
}

arduinoGenerator.forBlock['bluetooth_serial_init'] = function (block) {
    addBluetoothSetup();
    var name = block.getFieldValue('NAME');
    arduinoGenerator.setupCode_['bluetooth_serial_init'] = 'SerialBT.begin("' + name + '");';
    return '';
};

arduinoGenerator.forBlock['bluetooth_serial_available'] = function (block) {
    addBluetoothSetup();
    return ['SerialBT.available()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['bluetooth_serial_read_byte'] = function (block) {
    addBluetoothSetup();
    return ['SerialBT.read()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['bluetooth_serial_read_string_until'] = function (block) {
    addBluetoothSetup();
    var untilNewline = block.getFieldValue('UNTIL_NEWLINE') === 'TRUE';
    if (untilNewline) {
        return ['SerialBT.readStringUntil(\'\\n\')', arduinoGenerator.ORDER_ATOMIC];
    } else {
        return ['SerialBT.readString()', arduinoGenerator.ORDER_ATOMIC];
    }
};

arduinoGenerator.forBlock['bluetooth_serial_read_number_until'] = function (block) {
    addBluetoothSetup();
    return ['SerialBT.parseInt()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['bluetooth_serial_print_format'] = function (block) {
    addBluetoothSetup();
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    var format = block.getFieldValue('FORMAT');
    return 'SerialBT.print(' + value + ', ' + format + ');\n';
};

arduinoGenerator.forBlock['bluetooth_serial_print_same_line'] = function (block) {
    addBluetoothSetup();
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return 'SerialBT.print(' + value + ');\n';
};

arduinoGenerator.forBlock['bluetooth_serial_print_new_line'] = function (block) {
    addBluetoothSetup();
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return 'SerialBT.println(' + value + ');\n';
};

arduinoGenerator.forBlock['bluetooth_serial_write'] = function (block) {
    addBluetoothSetup();
    var value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return 'SerialBT.write(' + value + ');\n';
};
