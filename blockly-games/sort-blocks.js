/**
 * Blockly Games: Sort Blocks
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
 * @fileoverview Blocks for Blockly's Sort application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Sort.Blocks');

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
Sort.Blocks.MOVEMENT_HUE = 290;

/**
 * Left arrow to be appended to messages.
 */
Sort.Blocks.LEFT_ARROW = ' \u2190';

/**
 * Right arrow to be appended to messages.
 */
Sort.Blocks.RIGHT_ARROW = ' \u2192';

Sort.Blocks.START_ARROW = ' \u21E4';
Sort.Blocks.END_ARROW = ' \u21E5';


// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['sort_move'] = {
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Sort_moveStart'), '-2'],
                [BlocklyGames.getMsg('Sort_moveLeft'), '-1'],
                [BlocklyGames.getMsg('Sort_moveRight'), '1'],
                [BlocklyGames.getMsg('Sort_moveEnd'), '2']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Sort.Blocks.START_ARROW;
        DIRECTIONS[1][0] += Sort.Blocks.LEFT_ARROW;
        DIRECTIONS[2][0] += Sort.Blocks.RIGHT_ARROW;
        DIRECTIONS[3][0] += Sort.Blocks.END_ARROW;
        this.setColour(Sort.Blocks.MOVEMENT_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(BlocklyGames.getMsg('Sort_moveTooltip'));
    }
};

Blockly.JavaScript['sort_move'] = function(block) {
    return 'move(' + block.getFieldValue('DIR') + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['sort_compareLess'] = {
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Sort_compareLessLeft'), '-1'],
                [BlocklyGames.getMsg('Sort_compareLessRight'), '1']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Sort.Blocks.LEFT_ARROW;
        DIRECTIONS[1][0] += Sort.Blocks.RIGHT_ARROW;
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setTooltip(BlocklyGames.getMsg('Sort_compareTooltip'));
    }
};

Blockly.JavaScript['sort_compareLess'] = function(block) {
    return ['compare(' + block.getFieldValue('DIR') + ', -1, \'block_id_' + block.id + '\')', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['sort_compareGreater'] = {
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Sort_compareGreaterLeft'), '-1'],
                [BlocklyGames.getMsg('Sort_compareGreaterRight'), '1']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Sort.Blocks.LEFT_ARROW;
        DIRECTIONS[1][0] += Sort.Blocks.RIGHT_ARROW;
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setTooltip(BlocklyGames.getMsg('Sort_compareTooltip'));
    }
};

Blockly.JavaScript['sort_compareGreater'] = function(block) {
    return ['compare(' + block.getFieldValue('DIR') + ', 1, \'block_id_' + block.id + '\')', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['sort_swap'] = {
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Sort_swapLeft'), '-1'],
                [BlocklyGames.getMsg('Sort_swapRight'), '1']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Sort.Blocks.LEFT_ARROW;
        DIRECTIONS[1][0] += Sort.Blocks.RIGHT_ARROW;
        this.setColour(Sort.Blocks.MOVEMENT_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(BlocklyGames.getMsg('Sort_swapTooltip'));
    }
};

Blockly.JavaScript['sort_swap'] = function(block) {
    return 'swap(' + block.getFieldValue('DIR') + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['sort_atEdge'] = {
    init: function() {
        var DIRECTIONS =
            [[BlocklyGames.getMsg('Sort_atLeftEdge'), '0'],
                [BlocklyGames.getMsg('Sort_atRightEdge'), '1']];
        // Append arrows to direction messages.
        DIRECTIONS[0][0] += Sort.Blocks.START_ARROW;
        DIRECTIONS[1][0] += Sort.Blocks.END_ARROW;
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
        this.setTooltip(BlocklyGames.getMsg('Sort_atEdgeTooltip'));
    }
}

Blockly.JavaScript['sort_atEdge'] = function(block) {
    return ['atEdge(' + block.getFieldValue('DIR') + ', \'block_id_' + block.id + '\')', Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.Blocks['sort_isSorted'] = {
    /**
     * Block for repeat loop.
     * @this Blockly.Block
     */
    init: function() {
        this.setColour(Blockly.Constants.Logic.HUE);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(BlocklyGames.getMsg("Sort_isSorted"));
        this.setTooltip(BlocklyGames.getMsg('Sort_isSortedTooltip'));
    }
};

Blockly.JavaScript['sort_isSorted'] = function(block) {
    return ['isSorted()', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    // If/else block that does not use a mutator.
    {
        "type": "sort_if",
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
        "tooltip": "%{BKYCONTROLS_IF_TOOLTIP_2}",
        "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}",
        "extensions": ["controls_if_tooltip"]
    }
]);

Blockly.JavaScript['sort_if'] = Blockly.JavaScript['controls_if'];
