'use strict';

// ===========================================
// EMMI BOT V2 Generators
// ===========================================

// Pins - NEED VERIFICATION
// Assuming:
// Eyes: RGB LED (likely PWM or Neopixel, but "digital write" implies simple GPIOs for R/G/B?)
// Wheels: Motor driver pins
// Buzzer: Passive/Active buzzer pin
// Touch: Capacitive touch pin or button? "digital state" implies button.
// Mic: Digital output sound sensor?
// Light: LDR (Analog)

// Placeholder Pin Definitions
const PIN_EYE_RED_DEF = 13;
const PIN_EYE_GREEN_DEF = 12;
const PIN_EYE_BLUE_DEF = 14;

const PIN_MOTOR_L_A_DEF = 16;
const PIN_MOTOR_L_B_DEF = 17;
const PIN_MOTOR_R_A_DEF = 18;
const PIN_MOTOR_R_B_DEF = 19;

const PIN_BUZZER_DEF = 25;
const PIN_TOUCH_DEF = 32;
const PIN_MIC_DEF = 33;
const PIN_LIGHT_DEF = 34;

// Variables to store user setup
arduinoGenerator.emmi_setup = {
    eyes: false,
    wheels: false,
    buzzer: false,
    touch: false,
    mic: false,
    light: false
};

// Helper: Add setup code only once
function ensureSetup(type) {
    if (arduinoGenerator.emmi_setup[type]) return;
    arduinoGenerator.emmi_setup[type] = true;

    switch (type) {
        case 'eyes':
            arduinoGenerator.setupCode_['setup_eyes'] = `
            pinMode(${PIN_EYE_RED_DEF}, OUTPUT);
            pinMode(${PIN_EYE_GREEN_DEF}, OUTPUT);
            pinMode(${PIN_EYE_BLUE_DEF}, OUTPUT);
            `;
            break;
        case 'wheels':
            arduinoGenerator.setupCode_['setup_wheels'] = `
            pinMode(${PIN_MOTOR_L_A_DEF}, OUTPUT);
            pinMode(${PIN_MOTOR_L_B_DEF}, OUTPUT);
            pinMode(${PIN_MOTOR_R_A_DEF}, OUTPUT);
            pinMode(${PIN_MOTOR_R_B_DEF}, OUTPUT);
            `;
            break;
        case 'buzzer':
            arduinoGenerator.setupCode_['setup_buzzer'] = `ledcSetup(4, 5000, 8);\n  ledcAttachPin(${PIN_BUZZER_DEF}, 4);`;
            break;
        case 'touch':
            // Handled in block because mode can change (pullup)
            break;
        case 'mic':
            // Handled in block
            break;
        case 'light':
            arduinoGenerator.setupCode_['setup_light'] = `pinMode(${PIN_LIGHT_DEF}, INPUT);`;
            break;
    }
}


// ===========================================
// Eyes
// ===========================================

arduinoGenerator.forBlock['emmi_eyes_digital'] = function (block) {
    ensureSetup('eyes');
    var pinKey = block.getFieldValue('PIN');
    var state = block.getFieldValue('STATE');
    var pinNum;

    if (pinKey === 'PIN_EYE_RED') pinNum = PIN_EYE_RED_DEF;
    else if (pinKey === 'PIN_EYE_GREEN') pinNum = PIN_EYE_GREEN_DEF;
    else if (pinKey === 'PIN_EYE_BLUE') pinNum = PIN_EYE_BLUE_DEF;

    return `digitalWrite(${pinNum}, ${state});\n`;
};

// ===========================================
// Wheels
// ===========================================

arduinoGenerator.forBlock['emmi_wheels_init'] = function (block) {
    ensureSetup('wheels');
    return '';
};

arduinoGenerator.forBlock['emmi_wheels_simple'] = function (block) {
    ensureSetup('wheels');
    var direction = block.getFieldValue('DIRECTION');
    var speed = block.getFieldValue('SPEED');
    var step = block.getFieldValue('STEP');

    // Generating raw logic for now. 
    // Ideally this should use a helper function: move(dir, speed, step)

    var code = `// Wheels: ${direction} at ${speed} for ${step}\n`;

    // Simple discrete logic check
    var l_a = 'LOW', l_b = 'LOW', r_a = 'LOW', r_b = 'LOW';

    if (direction === 'FORWARD') {
        l_a = 'HIGH'; r_a = 'HIGH';
    } else if (direction === 'BACKWARD') {
        l_b = 'HIGH'; r_b = 'HIGH';
    } else if (direction === 'LEFT') {
        l_b = 'HIGH'; r_a = 'HIGH'; // Spin
    } else if (direction === 'RIGHT') {
        l_a = 'HIGH'; r_b = 'HIGH'; // Spin
    } else if (direction === 'STOP') {
        l_a = 'LOW'; l_b = 'LOW'; r_a = 'LOW'; r_b = 'LOW';
    }

    // PWM speed not fully implemented in this simple logic without analogWrite on all pins
    // Assuming Speed affects delay or PWM duty cycle if supported.

    code += `digitalWrite(${PIN_MOTOR_L_A_DEF}, ${l_a});\n`;
    code += `digitalWrite(${PIN_MOTOR_L_B_DEF}, ${l_b});\n`;
    code += `digitalWrite(${PIN_MOTOR_R_A_DEF}, ${r_a});\n`;
    code += `digitalWrite(${PIN_MOTOR_R_B_DEF}, ${r_b});\n`;

    // "Step" usually implies duration here if not stepper
    code += `delay(${step} * 1000);\n`;
    code += `// Stop after step\n`;
    code += `digitalWrite(${PIN_MOTOR_L_A_DEF}, LOW); digitalWrite(${PIN_MOTOR_L_B_DEF}, LOW);\n`;
    code += `digitalWrite(${PIN_MOTOR_R_A_DEF}, LOW); digitalWrite(${PIN_MOTOR_R_B_DEF}, LOW);\n`;

    return code;
};

// ===========================================
// Buzzer
// ===========================================

arduinoGenerator.forBlock['emmi_buzzer_music'] = function (block) {
    ensureSetup('buzzer');

    var ringtone = block.getFieldValue('MELODY');

    return `buzzerPlayRtttl("${ringtone}");\n`;
};

arduinoGenerator.forBlock['emmi_buzzer_music_custom'] = function (block) {
    ensureSetup('buzzer');
    arduinoGenerator.includes_['include_rtttl_melodies'] = '#include "headers/PlayRtttl.hpp"';

    var rtttl_melody = arduinoGenerator.valueToCode(block, 'MELODY', arduinoGenerator.ORDER_ATOMIC) || '""';
    // User logic: slice(1,4) implies skipping quote and taking 3 chars
    // We should ensure rtttl_melody is a string. If it comes from valueToCode it likely has quotes '"foo"'.
    var name_melody = rtttl_melody.slice(1, 4);
    // Fallback if slice is weird or conflict
    if (!name_melody || name_melody.length < 1) name_melody = "tune" + block.id.replace(/[^a-zA-Z0-9]/g, '');

    // Ensure unique name if multiple blocks use same prefix? User snippet doesn't handle uniquification beyond name_melody
    // relying on slice(1,4) suggests they rely on the tune content/name.
    // Let's add block ID to be safe while respecting their core logic structure.
    var unique_name = "melody_" + name_melody + "_" + block.id.replace(/[^a-zA-Z0-9]/g, '');

    arduinoGenerator.definitions_['Melody_' + unique_name] = `static const char ${unique_name}[] PROGMEM = ${rtttl_melody};`;

    return `playRtttlBlockingPGM(${PIN_BUZZER_DEF}, (char*) ${unique_name});\n`;
};

arduinoGenerator.forBlock['emmi_buzzer_note'] = function (block) {
    ensureSetup('buzzer');
    var note = block.getFieldValue('NOTE');
    // Use LEDC for ESP32 (Setup is in ensureSetup)
    var code = `ledcWriteTone(4, ${note}); delay(500); ledcWriteTone(4, 0);\n`;
    return code;
};

arduinoGenerator.forBlock['emmi_buzzer_frequency'] = function (block) {
    ensureSetup('buzzer');
    var freq = arduinoGenerator.valueToCode(block, 'FREQUENCY', arduinoGenerator.ORDER_ATOMIC) || '1000';
    var duration = arduinoGenerator.valueToCode(block, 'DURATION', arduinoGenerator.ORDER_ATOMIC) || '500';
    var code = `ledcWriteTone(4, ${freq}); delay(${duration}); ledcWriteTone(4, 0);\n`;
    return code;
};

arduinoGenerator.forBlock['emmi_buzzer_stop'] = function (block) {
    ensureSetup('buzzer');
    return `ledcWriteTone(4, 0);\n`;
};

// ===========================================
// Touch
// ===========================================

arduinoGenerator.forBlock['emmi_touch_read'] = function (block) {
    var mode = block.getFieldValue('MODE');
    // Setup mode dynamically or in setup? 
    // Usually setup should be in setup(), but if block allows selecting mode...
    // Let's add to setup based on the block usage.

    arduinoGenerator.setupCode_['setup_touch'] = `pinMode(${PIN_TOUCH_DEF}, ${mode});`;

    return [`digitalRead(${PIN_TOUCH_DEF})`, arduinoGenerator.ORDER_ATOMIC];
};

// ===========================================
// Mic
// ===========================================

arduinoGenerator.forBlock['emmi_mic_read'] = function (block) {
    var mode = block.getFieldValue('MODE');
    arduinoGenerator.setupCode_['setup_mic'] = `pinMode(${PIN_MIC_DEF}, ${mode});`;
    return [`digitalRead(${PIN_MIC_DEF})`, arduinoGenerator.ORDER_ATOMIC];
};

// ===========================================
// Light
// ===========================================

arduinoGenerator.forBlock['emmi_light_read'] = function (block) {
    ensureSetup('light');
    return [`analogRead(${PIN_LIGHT_DEF})`, arduinoGenerator.ORDER_ATOMIC];
};

// ===========================================
// Cute Sounds
// ===========================================

arduinoGenerator.forBlock['emmi_buzzer_cute'] = function (block) {
    ensureSetup('buzzer');
    var sound = block.getFieldValue('SOUND');

    // Include library
    arduinoGenerator.includes_['include_cutesounds'] = '#include <CuteBuzzerSounds.h>';
    arduinoGenerator.setups_['setup_cutesounds'] = `cute.init(${PIN_BUZZER_DEF});`;

    return `cute.play(${sound});\n`;
};

// ===========================================
// Improved Tone
// ===========================================

arduinoGenerator.forBlock['emmi_buzzer_play_tempo'] = function (block) {
    // Uses ESP32 LEDC similar to existing blocks
    ensureSetup('buzzer');
    var note = block.getFieldValue('NOTE');
    var tempo = block.getFieldValue('TEMPO');

    // We use channel 4 as standard for buzzer here
    return `ledcWriteTone(4, ${note});\n`;
};


// ===========================================
// MP3 / DFPlayer Mini
// ===========================================

arduinoGenerator.forBlock['emmi_mp3_init'] = function (block) {
    var rx = block.getFieldValue('PIN_RX');
    var tx = block.getFieldValue('PIN_TX');
    var vol = arduinoGenerator.valueToCode(block, 'Volume', arduinoGenerator.ORDER_ATOMIC) || '20';
    var play = block.getFieldValue('PLAY') === 'TRUE';

    arduinoGenerator.includes_['include_softwareserial'] = '#include <SoftwareSerial.h>';
    // We need a way to send hex commands, creating helper function
    arduinoGenerator.definitions_['define_mp3_serial'] = `SoftwareSerial DFMiniSerial(${rx}, ${tx});`;

    arduinoGenerator.definitions_['define_mp3_helper'] = `
void exe_cmd(byte CMD, byte Par1, byte Par2) {
  word check = -(0xFF + 0x06 + CMD + 0x00 + Par1 + Par2);
  byte Command[10] = {0x7E, 0xFF, 0x06, CMD, 0x00, Par1, Par2, highByte(check), lowByte(check), 0xEF};
  for (int i=0; i<10; i++) {
    DFMiniSerial.write(Command[i]);
  }
}`;

    var setupCode = `DFMiniSerial.begin(9600);\n  delay(1000);\n  exe_cmd(0x3F, 0, 0);\n  exe_cmd(0x06, 0, ${vol});\n`;
    if (play) {
        setupCode += `  exe_cmd(0x11, 0, 1);\n`;
    }

    arduinoGenerator.setupCode_['setup_mp3'] = setupCode;

    return '';
};

arduinoGenerator.forBlock['emmi_mp3_play_track'] = function (block) {
    var track = arduinoGenerator.valueToCode(block, 'NUM', arduinoGenerator.ORDER_ATOMIC) || '1';
    return `exe_cmd(0x03, 0, ${track});\n`;
};

arduinoGenerator.forBlock['emmi_mp3_commands'] = function (block) {
    var cmd = block.getFieldValue('CMD');
    var code = '';
    // Codes: 0x0D (Play), 0x0E (Pause), 0x01 (Next), 0x02 (Prev)
    if (cmd === 'PLAY') code = 'exe_cmd(0x0D, 0, 1);\n';
    else if (cmd === 'PAUSE') code = 'exe_cmd(0x0E, 0, 0);\n';
    else if (cmd === 'NEXT') code = 'exe_cmd(0x01, 0, 1);\n';
    else if (cmd === 'PREVIOUS') code = 'exe_cmd(0x02, 0, 1);\n';
    return code;
};

arduinoGenerator.forBlock['emmi_mp3_volume'] = function (block) {
    var vol = arduinoGenerator.valueToCode(block, 'VOLUME', arduinoGenerator.ORDER_ATOMIC) || '20';
    return `exe_cmd(0x06, 0, ${vol});\n`;
};
