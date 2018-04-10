/**
 * Blockly Games: Maze Blocks
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Maze application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Maze.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('BlocklyGames');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.JavaScript.logic');


/**
 * Common HSV hue for all movement blocks.
 */
Maze.Blocks.MOVEMENT_HUE = 290;

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Maze.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['maze_moveForward'] = {
    /**
     * Block for moving forward.
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "message0": BlocklyGames.getMsg('Maze_moveForward'),
            "previousStatement": null,
            "nextStatement": null,
            "colour": Maze.Blocks.MOVEMENT_HUE,
            "tooltip": BlocklyGames.getMsg('Maze_moveForwardTooltip')
        });
    }
};

Blockly.JavaScript['maze_moveForward'] = function(block) {
    // Generate JavaScript for moving forward.
    return 'moveForward(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['maze_turn'] = {
    /**
     * Block for turning left or right.
     * @this Blockly.Block
     */
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Maze_turnLeft'), 'turnLeft'],
                [BlocklyGames.getMsg('Maze_turnRight'), 'turnRight']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Maze.Blocks.LEFT_TURN;
        DIRECTIONS[1][0] += Maze.Blocks.RIGHT_TURN;
        this.setColour(Maze.Blocks.MOVEMENT_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(BlocklyGames.getMsg('Maze_turnTooltip'));
    }
};

Blockly.JavaScript['maze_turn'] = function(block) {
    // Generate JavaScript for turning left or right.
    var dir = block.getFieldValue('DIR');
    return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['maze_isPath'] = {
    /**
     * Block for 'if' conditional if there is a path.
     * @this Blockly.Block
     */
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Maze_pathAhead'), 'isPathForward'],
                [BlocklyGames.getMsg('Maze_pathLeft'), 'isPathLeft'],
                [BlocklyGames.getMsg('Maze_pathRight'), 'isPathRight']];
        // Append arrows to direction messages.
        DIRECTIONS[1][0] += Maze.Blocks.LEFT_TURN;
        DIRECTIONS[2][0] += Maze.Blocks.RIGHT_TURN;
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setTooltip(BlocklyGames.getMsg('Maze_ifTooltip'));
    }
};

Blockly.JavaScript['maze_isPath'] = function(block) {
    // Generate JavaScript for 'if' conditional if there is a path.
    return [block.getFieldValue('DIR') + '(\'block_id_' + block.id + '\')', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['maze_isFinished'] = {
    /**
     * Block for repeat loop.
     * @this Blockly.Block
     */
    init: function() {
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage(Maze.SKIN.marker, 12, 16));
        this.setTooltip(BlocklyGames.getMsg('Maze_whileTooltip'));
    }
};

Blockly.JavaScript['maze_isFinished'] = function(block) {
    return ['isFinished()', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    // If/else block that does not use a mutator.
    {
        "type": "maze_if",
        "message0": "%{BKY_CONTROLS_IF_MSG_IF} %1",
        "args0": [
            {
                "type": "input_value",
                "name": "IF0",
                "check": "Boolean"
            }
        ],
        "message1": "%{BKY_CONTROLS_IF_MSG_THEN} %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO0"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "%{BKY_LOGIC_HUE}",
        "tooltip": "%{BKY_CONTROLS_IF_TOOLTIP_1}",
        "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}"
    },
    // If/else block that does not use a mutator.
    {
        "type": "controls_ifelse",
        "message0": "%{BKY_CONTROLS_IF_MSG_IF} %1",
        "args0": [
            {
                "type": "input_value",
                "name": "IF0",
                "check": "Boolean"
            }
        ],
        "message1": "%{BKY_CONTROLS_IF_MSG_THEN} %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO0"
            }
        ],
        "message2": "%{BKY_CONTROLS_IF_MSG_ELSE} %1",
        "args2": [
            {
                "type": "input_statement",
                "name": "ELSE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "%{BKY_LOGIC_HUE}",
        "tooltip": "%{BKY_CONTROLS_IF_TOOLTIP_2}",
        "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}"
    }
]);

Blockly.JavaScript['maze_if'] = Blockly.JavaScript['controls_if'];
