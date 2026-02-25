'use strict';

/* =======================================================
   ESP32 Structure Block - Exact Screenshot Replica
   ======================================================= */

// Custom Icons removed for standard style

Blockly.Blocks['base_setup_loop'] = {
    init: function () {
        this.setColour('#2d2d64');
        this.appendDummyInput()
            .appendField("Setup");
        this.appendStatementInput("SETUP")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("Loop");
        this.appendStatementInput("LOOP")
            .setCheck(null);
        this.setInputsInline(false);
        this.setDeletable(true);
        this.setMovable(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip("The main program structure.");
    },

    // Helper for Arduino generator to find this block
    getArduinoLoopsInstance: function () {
        return true;
    }
};

/* =======================================================
   Timing Blocks
   ======================================================= */

// 1. Wait Block
Blockly.Blocks['custom_wait'] = {
    init: function () {
        this.appendValueInput("DELAY")
            .setCheck("Number")
            .appendField("wait");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["seconds", "SECONDS"], ["milliseconds", "MILLISECONDS"], ["microseconds", "MICROSECONDS"]]), "UNIT");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#00838F"); // Teal color from screenshot
        this.setTooltip("Waits for a specified amount of time.");
        this.setHelpUrl("");
    }
};

// 2. Timer Block (all ... do ...)
Blockly.Blocks['custom_timer'] = {
    init: function () {
        this.appendValueInput("interval")
            .setCheck("Number")
            .appendField("all");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["seconds", "SECONDS"], ["milliseconds", "MILLISECONDS"]]), "UNIT");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#00838F"); // Teal
        this.setTooltip("Executes code every N seconds/milliseconds.");
        this.setHelpUrl("");
    }
};

// 3. Start Timekeeping
Blockly.Blocks['start_timekeeping'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("start a timekeeping in")
            .appendField(new Blockly.FieldDropdown([["seconds", "SECONDS"], ["milliseconds", "MILLISECONDS"]]), "UNIT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#00838F");
        this.setTooltip("Resets the timer.");
        this.setHelpUrl("");
    }
};

// 4. Duration from beginning
Blockly.Blocks['get_duration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("duration in")
            .appendField(new Blockly.FieldDropdown([["seconds", "SECONDS"], ["milliseconds", "MILLISECONDS"]]), "UNIT")
            .appendField("from the beginning");
        this.setOutput(true, "Number");
        this.setColour("#00838F");
        this.setTooltip("Returns time since program started.");
        this.setHelpUrl("");
    }
};

// 5. State duration
Blockly.Blocks['state_duration'] = {
    init: function () {
        this.appendValueInput("PIN")
            .setCheck("Number")
            .appendField("state duration")
            .appendField(new Blockly.FieldDropdown([["UP", "HIGH"], ["DOWN", "LOW"]]), "STATE")
            .appendField("PIN");
        this.setOutput(true, "Number");
        this.setColour("#00838F");
        this.setTooltip("Measures duration of a pulse on a pin.");
        this.setHelpUrl("");
    }
};

/* =======================================================
   Control Blocks (Customized for Style)
   ======================================================= */
const CONTROL_COLOR = "#FFAB19"; // Yellow/Orange from screenshot

// 1. Unless / If (Screenshot shows "if ... then")
// Note: Standard controls_if is complex. We'll implement a simplified version.
Blockly.Blocks['custom_controls_if'] = {
    init: function () {
        this.appendValueInput("IF0")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNMTkuMTQgMTIuOTRjLjA0LS4zLjA2LS42MS4wNi0uOTQgMC0uMzItLjAyLS42NC0uMDctLjk0bDIuMDMtMS41OGMuMTgtLjE0LjIzLS40MS4xMi0uNjFsLTEuOTItMy4zMmMtLjEyLS4yMi0uMzctLjI5LS41OS0uMjJsLTIuMzkuOTZjLS41LS4zOC0xLjAzLS43LTEuNjItLjk0bC0uMzYtMi41NGMtLjA0LS4yNC0uMjQtLjQxLS40OC0uNDFoLTMuODRjLS4yNCAwLS40My4xNy0uNDcuNDFsLS4zNiAyLjU0Yy0uNTkuMjQtMS4xMy41Ny0xLjYyLjk0bC0yLjM5LS45NmMtLjIyLS4wOC0uNDcgMC0uNTkuMjJMMi43NCA4Ljg3Yy0uMTIuMjEtLjA4LjQ3LjEyLjYxbDIuMDMgMS41OGMtLjA1LjMtLjA5LjYzLS4wOS45NHMuMDIuNjQuMDcuOTRsLTIuMDMgMS41OGMtLjE4LjE0LS4yMy40MS0uMTIuNjFsMS45MiAzLjMyYy4xMi4yMi4zNy4yOS41OS4yMmwyLjM5LS45NmMuNS4zOCAxLjAzLjcgMS42Mi45NGwuMzYgMi41NGMuMDUuMjQuMjQuNDEuNDguNDFoMy44NGMuMjQgMCAuNDQtLjE3LjQ3LS40MWwuMzYtMi41NGMuNTktLjI0IDEuMTMtLjU4IDEuNjItLjk0bDIuMzkuOTZjLjIyLjA4LjQ3IDAgLjU5LS4yMmwxLjkyLTMuMzJjLjEyLS4yMi4wNy0uNDctLjEyLS42MWwtMi4wMS0uNTh6TTEyIDE1LjZjLTEuOTggMC0zLjYtMS42Mi0zLjYtMy42czEuNjItMy42IDMuNi0zLjYgMy42IDEuNjIgMy42IDMuNi0xLjYyIDMuNi0zLjYgMy42eiIgZmlsbD0iIzU1NSIvPjwvc3ZnPg==", 16, 16, "*")) // Gear icon
            .appendField("if");
        this.appendStatementInput("DO0")
            .setCheck(null)
            .appendField("then");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("If condition is true, then do something.");
        this.setHelpUrl("");
        // Note: Full mutator support requires extensions. 
        // For now, this is a basic IF block matching valid look.
    }
};

Blockly.Blocks['custom_controls_ifelse'] = {
    init: function () {
        this.appendValueInput("IF0")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNMTkuMTQgMTIuOTRjLjA0LS4zLjA2LS42MS4wNi0uOTQgMC0uMzItLjAyLS42NC0uMDctLjk0bDIuMDMtMS41OGMuMTgtLjE0LjIzLS40MS4xMi0uNjFsLTEuOTItMy4zMmMtLjEyLS4yMi0uMzctLjI5LS41OS0uMjJsLTIuMzkuOTZjLS41LS4zOC0xLjAzLS43LTEuNjItLjk0bC0uMzYtMi41NGMtLjA0LS4yNC0uMjQtLjQxLS40OC0uNDFoLTMuODRjLS4yNCAwLS40My4xNy0uNDcuNDFsLS4zNiAyLjU0Yy0uNTkuMjQtMS4xMy41Ny0xLjYyLjk0bC0yLjM5LS45NmMtLjIyLS4wOC0uNDcgMC0uNTkuMjJMMi43NCA4Ljg3Yy0uMTIuMjEtLjA4LjQ3LjEyLjYxbDIuMDMgMS41OGMtLjA1LjMtLjA5LjYzLS4wOS45NHMuMDIuNjQuMDcuOTRsLTIuMDMgMS41OGMtLjE4LjE0LS4yMy40MS0uMTIuNjFsMS45MiAzLjMyYy4xMi4yMi4zNy4yOS41OS4yMmwyLjM5LS45NmMuNS4zOCAxLjAzLjcgMS42Mi45NGwuMzYgMi41NGMuMDUuMjQuMjQuNDEuNDguNDFoMy44NGMuMjQgMCAuNDQtLjE3LjQ3LS40MWwuMzYtMi41NGMuNTktLjI0IDEuMTMtLjU4IDEuNjItLjk0bDIuMzkuOTZjLjIyLjA4LjQ3IDAgLjU5LS4yMmwxLjkyLTMuMzJjLjEyLS4yMi4wNy0uNDctLjEyLS42MWwtMi4wMS0uNTh6TTEyIDE1LjZjLTEuOTggMC0zLjYtMS42Mi0zLjYtMy42czEuNjItMy42IDMuNi0zLjYgMy42IDEuNjIgMy42IDMuNi0xLjYyIDMuNi0zLjYgMy42eiIgZmlsbD0iIzU1NSIvPjwvc3ZnPg==", 16, 16, "*")) // Gear icon
            .appendField("if");
        this.appendStatementInput("DO0")
            .setCheck(null)
            .appendField("then");
        this.appendStatementInput("ELSE")
            .setCheck(null)
            .appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("If condition is true, then do something. Else do something else.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['custom_controls_if_ifnot'] = {
    init: function () {
        this.appendValueInput("IF0")
            .setCheck("Boolean")
            .appendField(new Blockly.FieldImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNMTkuMTQgMTIuOTRjLjA0LS4zLjA2LS42MS4wNi0uOTQgMC0uMzItLjAyLS42NC0uMDctLjk0bDIuMDMtMS41OGMuMTgtLjE0LjIzLS40MS4xMi0uNjFsLTEuOTItMy4zMmMtLjEyLS4yMi0uMzctLjI5LS41OS0uMjJsLTIuMzkuOTZjLS41LS4zOC0xLjAzLS43LTEuNjItLjk0bC0uMzYtMi41NGMtLjA0LS4yNC0uMjQtLjQxLS40OC0uNDFoLTMuODRjLS4yNCAwLS40My4xNy0uNDcuNDFsLS4zNiAyLjU0Yy0uNTkuMjQtMS4xMy41Ny0xLjYyLjk0bC0yLjM5LS45NmMtLjIyLS4wOC0uNDcgMC0uNTkuMjJMMi43NCA4Ljg3Yy0uMTIuMjEtLjA4LjQ3LjEyLjYxbDIuMDMgMS41OGMtLjA1LjMtLjA5LjYzLS4wOS45NHMuMDIuNjQuMDcuOTRsLTIuMDMgMS41OGMtLjE4LjE0LS4yMy40MS0uMTIuNjFsMS45MiAzLjMyYy4xMi4yMi4zNy4yOS41OS4yMmwyLjM5LS45NmMuNS4zOCAxLjAzLjcgMS42Mi45NGwuMzYgMi41NGMuMDUuMjQuMjQuNDEuNDguNDFoMy44NGMuMjQgMCAuNDQtLjE3LjQ3LS40MWwuMzYtMi41NGMuNTktLjI0IDEuMTMtLjU4IDEuNjItLjk0bDIuMzkuOTZjLjIyLjA4LjQ3IDAgLjU5LS4yMmwxLjkyLTMuMzJjLjEyLS4yMi4wNy0uNDctLjEyLS42MWwtMi4wMS0uNTh6TTEyIDE1LjZjLTEuOTggMC0zLjYtMS42Mi0zLjYtMy42czEuNjItMy42IDMuNi0zLjYgMy42IDEuNjIgMy42IDMuNi0xLjYyIDMuNi0zLjYgMy42eiIgZmlsbD0iIzU1NSIvPjwvc3ZnPg==", 16, 16, "*")) // Gear icon
            .appendField("if");
        this.appendStatementInput("DO0")
            .setCheck(null)
            .appendField("then");
        this.appendValueInput("IF1")
            .setCheck("Boolean")
            .appendField("ifnot");
        this.appendStatementInput("DO1")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("If condition is true then do something, else if another condition is true do something else.");
        this.setHelpUrl("");
    }
};

// 2. Repeat N Times
Blockly.Blocks['custom_controls_repeat'] = {
    init: function () {
        this.appendValueInput("TIMES")
            .setCheck("Number")
            .appendField(new Blockly.FieldImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNMTIgNlYxTDQgNWw0IDRWNmMzLjMxIDAgNiAyLjY5IDYgNiAwIDEuMDEtLjI1IDEuOTctLjcgMi44bDEuNDYgMS40NkMxOS41NCAxNS4wMyAyMCAxMy41NyAyMCAxMmMwLTQuNDItMy41OC04LTgtOHptMCAxNGMtMy4zMSAwLTYtMi42OS02LTYgMC0xLjAxLjI1LTEuOTcuNy0yLjhMNS4yNCA3Ljc0QzQuNDYgOC45NyA0IDEwLjQzIDQgMTJjMCA0LjQyIDMuNTggOCA4IDh2M2w0LTQtNC00djN6IiBmaWxsPSIjZmZmIi8+PC9zdmc+", 16, 16, "*")) // Refresh Icon
            .appendField("repeat");
        this.appendDummyInput()
            .appendField("time");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Repeat N times.");
        this.setHelpUrl("");
    }
};

// 3. Repeat While/Until (as long as)
Blockly.Blocks['custom_controls_whileUntil'] = {
    init: function () {
        this.appendValueInput("BOOL")
            .setCheck("Boolean")
            .appendField("repeat")
            .appendField(new Blockly.FieldDropdown([["as long as", "WHILE"], ["until", "UNTIL"]]), "MODE");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Repeat while or until condition is met.");
        this.setHelpUrl("");
    }
};

// 4. For Loop
Blockly.Blocks['custom_controls_for'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("for")
            .appendField(new Blockly.FieldVariable("i"), "VAR")
            .appendField("ranging from");
        this.appendValueInput("FROM")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("to");
        this.appendValueInput("TO")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("in steps of");
        this.appendValueInput("BY")
            .setCheck("Number");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Loop with counter.");
        this.setHelpUrl("");
    }
};

// 5. Switch (Simplified as If-Equal)
Blockly.Blocks['custom_controls_switch'] = {
    init: function () {
        this.appendValueInput("SWITCH_VALUE")
            .setCheck("Number") // Or logic?
            .appendField(new Blockly.FieldImage("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNMTkuMTQgMTIuOTRjLjA0LS4zLjA2LS42MS4wNi0uOTQgMC0uMzItLjAyLS42NC0uMDctLjk0bDIuMDMtMS41OGMuMTgtLjE0LjIzLS40MS4xMi0uNjFsLTEuOTItMy4zMmMtLjEyLS4yMi0uMzctLjI5LS41OS0uMjJsLTIuMzkuOTZjLS41LS4zOC0xLjAzLS43LTEuNjItLjk0bC0uMzYtMi41NGMtLjA0LS4yNC0uMjQtLjQxLS40OC0uNDFoLTMuODRjLS4yNCAwLS40My4xNy0uNDcuNDFsLS4zNiAyLjU0Yy0uNTkuMjQtMS4xMy41Ny0xLjYyLjk0bC0yLjM5LS45NmMtLjIyLS4wOC0uNDcgMC0uNTkuMjJMMi43NCA4Ljg3Yy0uMTIuMjEtLjA4LjQ3LjEyLjYxbDIuMDMgMS41OGMtLjA1LjMtLjA5LjYzLS4wOS45NHMuMDIuNjQuMDcuOTRsLTIuMDMgMS41OGMtLjE4LjE0LS4yMy40MS0uMTIuNjFsMS45MiAzLjMyYy4xMi4yMi4zNy4yOS41OS4yMmwyLjM5LS45NmMuNS4zOCAxLjAzLjcgMS42Mi45NGwuMzYgMi41NGMuMDUuMjQuMjQuNDEuNDguNDFoMy44NGMuMjQgMCAuNDQtLjE3LjQ3LS40MWwuMzYtMi41NGMuNTktLjI0IDEuMTMtLjU4IDEuNjItLjk0bDIuMzkuOTZjLjIyLjA4LjQ3IDAgLjU5LS4yMmwxLjkyLTMuMzJjLjEyLS4yMi4wNy0uNDctLjEyLS42MWwtMi4wMS0uNTh6TTEyIDE1LjZjLTEuOTggMC0zLjYtMS42Mi0zLjYtMy42czEuNjItMy42IDMuNi0zLjYgMy42IDEuNjIgMy42IDMuNi0xLjYyIDMuNi0zLjYgMy42eiIgZmlsbD0iIzU1NSIvPjwvc3ZnPg==", 16, 16, "*")) // Gear
            .appendField("switch")
            .appendField(new Blockly.FieldVariable("i"), "VAR")
            .appendField("is");
        this.appendValueInput("CASE_VALUE")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("then");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Switch case logic.");
        this.setHelpUrl("");
    }
};

// 6. Flow Statements (Exit loop)
Blockly.Blocks['custom_flow_statements'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["exit the loop", "BREAK"], ["continue with next iteration", "CONTINUE"]]), "FLOW");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Exit or continue loop.");
        this.setHelpUrl("");
    }
};

// 7. Logic And
Blockly.Blocks['custom_logic_and'] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["and", "AND"], ["or", "OR"]]), "OP");
        this.appendValueInput("B")
            .setCheck("Boolean");
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Logical AND/OR.");
        this.setHelpUrl("");
    }
};

// 8. Logic Not
Blockly.Blocks['custom_logic_not'] = {
    init: function () {
        this.appendValueInput("BOOL")
            .setCheck("Boolean")
            .appendField("not");
        this.setOutput(true, "Boolean");
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Logical NOT.");
        this.setHelpUrl("");
    }
};

// 9. Logic Null
Blockly.Blocks['custom_logic_null'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("null");
        this.setOutput(true, null);
        this.setColour(CONTROL_COLOR);
        this.setTooltip("Null value.");
        this.setHelpUrl("");
    }
};

/* =======================================================
   Arduino / ESP32 Blocks (Screenshot Implementation)
   ======================================================= */
const ARDUINO_COLOR = "#00838F"; // Teal

// 1. Digital Write
Blockly.Blocks['esp32_digital_write'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("digital write PIN")
            .appendField(new Blockly.FieldDropdown([
                ["Red", "RED"], ["Green", "GREEN"], ["Blue", "BLUE"],
                ["MIC", "PIN_MIC"], ["BUZZER", "PIN_BUZZER"], ["TOUCH", "PIN_TOUCH"],
                ["MOTOR1", "MOTOR_L1"], ["MOTOR2", "MOTOR_L2"],
                ["MOTOR3", "MOTOR_R1"], ["MOTOR4", "MOTOR_R2"]
            ]), "PIN")
            .appendField("to")
            .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Write to a digital pin.");
        this.setHelpUrl("");
    }
};

// 2. Digital Read (State) with Pull-up
Blockly.Blocks['esp32_digital_state'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("digital state PIN")
            .appendField(new Blockly.FieldDropdown([
                ["Red", "RED"], ["Green", "GREEN"], ["Blue", "BLUE"],
                ["MIC", "PIN_MIC"], ["BUZZER", "PIN_BUZZER"], ["TOUCH", "PIN_TOUCH"],
                ["MOTOR1", "MOTOR_L1"], ["MOTOR2", "MOTOR_L2"],
                ["MOTOR3", "MOTOR_R1"], ["MOTOR4", "MOTOR_R2"]
            ]), "PIN")
            .appendField("pull-up")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "PULLUP");
        this.setOutput(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Read digital pin state.");
        this.setHelpUrl("");
    }
};

// 3. Analog Write
Blockly.Blocks['esp32_analog_write'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("analog write PIN")
            .appendField(new Blockly.FieldDropdown([
                ["OUT1", "OUT1"], ["25", "25"], ["26", "26"]
            ]), "PIN")
            .appendField("to");
        this.appendValueInput("VALUE")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Write analog value (PWM).");
        this.setHelpUrl("");
    }
};

// 4. Analog Read
Blockly.Blocks['esp32_analog_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("analog read PIN")
            .appendField(new Blockly.FieldDropdown([
                ["13", "13"], ["OUT2", "OUT2"], ["OUT3", "OUT3"], ["OUT4", "OUT4"], ["OUT5", "OUT5"],
                ["IN1", "IN1"], ["IN2 only read", "IN2"], ["LDR", "LDR"], ["IN4 only read", "IN4"], ["IN5 only read", "IN5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Read analog value.");
        this.setHelpUrl("");
    }
};

// 5. Toggle State
Blockly.Blocks['esp32_toggle_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("toggle state of PIN")
            .appendField(new Blockly.FieldDropdown([
                ["23", "23"], ["2", "2"]
            ]), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Toggle the state of a digital pin.");
        this.setHelpUrl("");
    }
};

// 6. Interrupt
Blockly.Blocks['esp32_interrupt'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("interrupt: when a")
            .appendField(new Blockly.FieldDropdown([
                ["rising edge", "RISING"], ["falling edge", "FALLING"], ["change", "CHANGE"]
            ]), "MODE")
            .appendField("detected on PIN")
            .appendField(new Blockly.FieldDropdown([
                ["IN1", "IN1"], ["2", "2"], ["23", "23"]
            ]), "PIN");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("then");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Attach an interrupt.");
        this.setHelpUrl("");
    }
};

// 7. Disable (Detach) Interrupt
Blockly.Blocks['esp32_detach_interrupt'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("disable interrupt on PIN")
            .appendField(new Blockly.FieldDropdown([
                ["IN1", "IN1"], ["2", "2"], ["23", "23"]
            ]), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Detach an interrupt.");
        this.setHelpUrl("");
    }
};

// 8. Restart ESP
Blockly.Blocks['esp32_restart'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Restart ESP8266/ESP32");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Restart the microcontroller.");
        this.setHelpUrl("");
    }
};

// 9. Deep Sleep
Blockly.Blocks['esp32_deep_sleep'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("DeepSleep");
        this.appendValueInput("TIME")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("Seconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ARDUINO_COLOR);
        this.setTooltip("Enter deep sleep for N seconds.");
        this.setHelpUrl("");
    }
};

/* =======================================================
   Operator Blocks (Custom Implementations)
   ======================================================= */
const OPERATORS_COLOR = "#388E3C"; // Green

// 1. Map
Blockly.Blocks['custom_math_map'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("map");
        this.appendValueInput("FROM_LOW")
            .setCheck("Number")
            .appendField("from");
        this.appendValueInput("FROM_HIGH")
            .setCheck("Number")
            .appendField("-");
        this.appendValueInput("TO_LOW")
            .setCheck("Number")
            .appendField("to");
        this.appendValueInput("TO_HIGH")
            .setCheck("Number")
            .appendField("-");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Map a value from one range to another.");
        this.setHelpUrl("");
    }
};

// 2. Random Integer (custom text)
Blockly.Blocks['custom_math_random_int'] = {
    init: function () {
        this.appendValueInput("FROM")
            .setCheck("Number")
            .appendField("random");
        this.appendValueInput("TO")
            .setCheck("Number")
            .appendField("&");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Return a random integer between the two values.");
        this.setHelpUrl("");
    }
};

// 3. Constrain (custom text)
Blockly.Blocks['custom_math_constrain'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("constrain #");
        this.appendValueInput("LOW")
            .setCheck("Number")
            .appendField("between");
        this.appendValueInput("HIGH")
            .setCheck("Number")
            .appendField("&");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Constrain a number to be between the specified limits (inclusive).");
        this.setHelpUrl("");
    }
};

// 4. Casting to Byte
Blockly.Blocks['cast_to_byte'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Casting to Byte");
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Cast value to Byte (unsigned char).");
        this.setHelpUrl("");
    }
};

// 5. Casting to Unsigned Int
Blockly.Blocks['cast_to_unsigned_int'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Casting to unsigned Int");
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Cast value to unsigned int.");
        this.setHelpUrl("");
    }
};

// 6. Casting to Int
Blockly.Blocks['cast_to_int'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Casting to Int");
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Cast value to integer.");
        this.setHelpUrl("");
    }
};

// 7. Casting to Float
Blockly.Blocks['cast_to_float'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Casting to Float");
        this.setOutput(true, "Number");
        this.setColour(OPERATORS_COLOR);
        this.setTooltip("Cast value to float.");
        this.setHelpUrl("");
    }
};
