'use strict';

// ===========================================
// EMMI BOT V2 Blocks
// ===========================================

// Colors matching screenshots/standard
const EYES_COLOR = "#00838F"; // Teal/Cyan kind of color in screenshot
const WHEELS_COLOR = "#3F51B5"; // Blue/Indigo
const BUZZER_COLOR = "#E91E63"; // Pink
const TOUCH_COLOR = "#3F51B5"; // Blue (same as structure/control in some themes, but screenshot shows blue header)
const MIC_COLOR = "#000000"; // Black header in screenshot? Actually looks like standard block color
const LIGHT_COLOR = "#FFA726"; // Orange

// ===========================================
// Eyes
// ===========================================

Blockly.Blocks['emmi_eyes_digital'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("digital write PIN")
            .appendField(new Blockly.FieldDropdown([
                ["Red", "PIN_EYE_RED"],
                ["Green", "PIN_EYE_GREEN"],
                ["Blue", "PIN_EYE_BLUE"]
            ]), "PIN")
            .appendField("to")
            .appendField(new Blockly.FieldDropdown([
                ["ON", "HIGH"],
                ["OFF", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(EYES_COLOR);
        this.setTooltip("Control the digital state of the eye LEDs.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Wheels
// ===========================================

Blockly.Blocks['emmi_wheels_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🛞")
            .appendField("wheels");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WHEELS_COLOR);
        this.setTooltip("Initialize wheels.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['emmi_wheels_simple'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🛞")
            .appendField("wheels")
            .appendField(new Blockly.FieldDropdown([
                ["forward", "FORWARD"],
                ["backward", "BACKWARD"],
                ["left", "LEFT"],
                ["right", "RIGHT"],
                ["stop", "STOP"]
            ]), "DIRECTION")
            .appendField("speed")
            .appendField(new Blockly.FieldDropdown([
                ["slow", "100"],
                ["normal", "180"],
                ["fast", "255"]
            ]), "SPEED")
            .appendField("step")
            .appendField(new Blockly.FieldNumber(1), "STEP");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WHEELS_COLOR);
        this.setTooltip("Move the robot.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Buzzer
// ===========================================

Blockly.Blocks['emmi_buzzer_music'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("buzzer")
            .appendField(new Blockly.FieldDropdown([["BUZZER", "PIN_BUZZER"]]), "PIN")
            .appendField("play ring tone")
            .appendField(new Blockly.FieldDropdown([
                ['StarWars', 'StarWars'], ['MahnaMahna', 'MahnaMahna'], ['LeisureSuit', 'LeisureSuit'], ['MissionImp', 'MissionImp'], ['Entertainer', 'Entertainer'], ['Muppets', 'Muppets'], ['Flinstones', 'Flinstones'], ['YMCA', 'YMCA'], ['Simpsons', 'Simpsons'], ['Indiana', 'Indiana'], ['TakeOnMe', 'TakeOnMe'], ['Looney', 'Looney'], ['20thCenFox', '_20thCenFox'], ['Bond', 'Bond'], ['GoodBad', 'GoodBad'], ['PinkPanther', 'PinkPanther'], ['A_Team', 'A_Team'], ['Jeopardy', 'Jeopardy'], ['Gadget', 'Gadget'], ['Smurfs', 'Smurfs'], ['Toccata', 'Toccata'], ['Short', 'Short'], ['JingleBell', 'JingleBell'], ['Rudolph', 'Rudolph'], ['WeWishYou', 'WeWishYou'], ['WinterWonderland', 'WinterWonderland'], ['OhDennenboom', 'OhDennenboom'], ['LetItSnow', 'LetItSnow'], ['Frosty', 'Frosty'], ['SilentNight', 'SilentNight'], ['LastChristmas', 'LastChristmas'], ['AllIWant', 'AllIWant'], ['AmazingGrace', 'AmazingGrace']
            ]), "MELODY");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("play ring tone");
        this.setHelpUrl('');
    }
};

Blockly.Blocks['emmi_buzzer_music_custom'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("buzzer")
            .appendField(new Blockly.FieldDropdown([["BUZZER", "PIN_BUZZER"]]), "PIN")
            .appendField("play ring tone");
        this.appendValueInput("MELODY")
            .setCheck("String");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Play a custom ring tone string.");
        this.setHelpUrl('');
    }
};

Blockly.Blocks['emmi_buzzer_note'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("buzzer")
            .appendField(new Blockly.FieldDropdown([["BUZZER", "PIN_BUZZER"]]), "PIN")
            .appendField("play")
            .appendField(new Blockly.FieldDropdown([
                ["C₄ | Do₄", "261"], ["D₄ | Re₄", "293"], ["E₄ | Mi₄", "329"], ["F₄ | Fa₄", "349"], ["G₄ | Sol₄", "392"], ["A₄ | La₄", "440"], ["B₄ | Si₄", "493"], ["C₅ | Do₅", "523"], ["D₅ | Re₅", "587"], ["E₅ | Mi₅", "659"], ["F₅ | Fa₅", "698"], ["G₅ | Sol₅", "784"], ["A₅ | La₅", "880"]
            ]), "NOTE")
            .appendField("|")
            .appendField(new Blockly.FieldDropdown([
                ["\u266B beamed notes", "125"], ["\u266A eight note", "250"], ["\u2669 quarter note", "500"], ["\uD834\uDD5E half note", "1000"], ["\uD834\uDD5D whole otte", "2000"]
            ]), "TEMPO");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Play a musical note.");
        this.setHelpUrl("");
    }
};


Blockly.Blocks['emmi_buzzer_frequency'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("buzzer")
            .appendField(new Blockly.FieldDropdown([["BUZZER", "PIN_BUZZER"]]), "PIN");
        this.appendValueInput("FREQUENCY")
            .setCheck("Number")
            .appendField("frequency (Hz)");
        this.appendValueInput("DURATION")
            .setCheck("Number")
            .appendField("duration (ms)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Play a frequency.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['emmi_buzzer_stop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("stop sound on")
            .appendField(new Blockly.FieldDropdown([["BUZZER", "PIN_BUZZER"]]), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Stop the buzzer.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Touch
// ===========================================

Blockly.Blocks['emmi_touch_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("digital state PIN")
            .appendField(new Blockly.FieldDropdown([["TOUCH", "PIN_TOUCH"]]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["pull-up", "INPUT_PULLUP"],
                ["pull-down", "INPUT_PULLDOWN"], // ESP32 supports pulldown on some pins
                ["input", "INPUT"]
            ]), "MODE");
        this.setOutput(true, "Number"); // Digital Read returns 0 or 1
        this.setColour(TOUCH_COLOR);
        this.setTooltip("Read digital state of touch sensor.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Mic
// ===========================================

Blockly.Blocks['emmi_mic_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("digital state PIN")
            .appendField(new Blockly.FieldDropdown([["MIC", "PIN_MIC"]]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["pull-up", "INPUT_PULLUP"],
                ["pull-down", "INPUT_PULLDOWN"],
                ["input", "INPUT"]
            ]), "MODE");
        this.setOutput(true, "Number");
        this.setColour(MIC_COLOR);
        this.setTooltip("Read digital state of microphone.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Light
// ===========================================

Blockly.Blocks['emmi_light_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("analog read PIN")
            .appendField(new Blockly.FieldDropdown([["LIGHT", "PIN_LIGHT"]]), "PIN");
        this.setOutput(true, "Number");
        this.setColour(LIGHT_COLOR);
        this.setTooltip("Read analog value from light sensor.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Cute Sounds
// ===========================================

Blockly.Blocks['emmi_buzzer_cute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🎼")
            .appendField("Play Cute Sound")
            .appendField(new Blockly.FieldDropdown([
                ['CONNECTION', 'S_CONNECTION'],
                ['DISCONNECTION', 'S_DISCONNECTION'],
                ['BUTTON_PUSHED', 'S_BUTTON_PUSHED'],
                ['MODE1', 'S_MODE1'],
                ['MODE2', 'S_MODE2'],
                ['MODE3', 'S_MODE3'],
                ['SURPRISE', 'S_SURPRISE'],
                ['OHOOH', 'S_OHOOH'],
                ['OHOOH2', 'S_OHOOH2'],
                ['CUDDLY', 'S_CUDDLY'],
                ['SLEEPING', 'S_SLEEPING'],
                ['HAPPY', 'S_HAPPY'],
                ['SUPER_HAPPY', 'S_SUPER_HAPPY'],
                ['HAPPY_SHORT', 'S_HAPPY_SHORT'],
                ['SAD', 'S_SAD'],
                ['CONFUSED', 'S_CONFUSED'],
                ['FART1', 'S_FART1'],
                ['FART2', 'S_FART2'],
                ['FART3', 'S_FART3']
            ]), "SOUND");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Play a cute sound.");
        this.setHelpUrl("");
    }
};

// ===========================================
// Improved Tone / Play
// ===========================================

Blockly.Blocks['emmi_buzzer_play_tempo'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("buzzer")
            .appendField("play note")
            .appendField(new Blockly.FieldDropdown([
                ["C₄ | Do₄", "261"], ["D₄ | Re₄", "293"], ["E₄ | Mi₄", "329"], ["F₄ | Fa₄", "349"], ["G₄ | Sol₄", "392"], ["A₄ | La₄", "440"], ["B₄ | Si₄", "493"], ["C₅ | Do₅", "523"], ["D₅ | Re₅", "587"], ["E₅ | Mi₅", "659"], ["F₅ | Fa₅", "698"], ["G₅ | Sol₅", "784"], ["A₅ | La₅", "880"]
            ]), "NOTE")
            .appendField("tempo")
            .appendField(new Blockly.FieldDropdown([
                ["\u266B beamed notes", "125"], ["\u266A eight note", "250"], ["\u2669 quarter note", "500"], ["\uD834\uDD5E half note", "1000"], ["\uD834\uDD5D whole otte", "2000"]
            ]), "TEMPO");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BUZZER_COLOR);
        this.setTooltip("Play a note with specific duration.");
        this.setHelpUrl("");
    }
};

// ===========================================
// MP3 / DFPlayer Mini
// ===========================================
const MP3_COLOR = "#FF63BB"; // Matching user's color or similar

Blockly.Blocks["emmi_mp3_init"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("init MP3 (DFPlayer)")
            .appendField("RX Pin")
            .appendField(new Blockly.FieldDropdown([
                ["16", "16"], ["17", "17"], ["0", "0"], ["4", "4"]
            ]), "PIN_RX")
            .appendField("TX Pin")
            .appendField(new Blockly.FieldDropdown([
                ["17", "17"], ["16", "16"], ["2", "2"], ["4", "4"]
            ]), "PIN_TX");
        this.appendValueInput("Volume")
            .setCheck("Number")
            .appendField("Volume (0-30)");
        this.appendDummyInput()
            .appendField("Autoplay")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "PLAY");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MP3_COLOR);
        this.setTooltip("Initialize DFPlayer Mini.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks["emmi_mp3_play_track"] = {
    init: function () {
        this.appendValueInput("NUM")
            .setCheck("Number")
            .appendField("MP3 Play Track #");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MP3_COLOR);
        this.setTooltip("Play specific track number.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks["emmi_mp3_commands"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("MP3 Command")
            .appendField(new Blockly.FieldDropdown([
                ["Play", "PLAY"],
                ["Pause", "PAUSE"],
                ["Next", "NEXT"],
                ["Previous", "PREVIOUS"]
            ]), "CMD");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MP3_COLOR);
        this.setTooltip("Control MP3 playback.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks["emmi_mp3_volume"] = {
    init: function () {
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("MP3 Set Volume (0-30)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(MP3_COLOR);
        this.setTooltip("Set MP3 volume.");
        this.setHelpUrl("");
    }
};
