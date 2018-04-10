/**
 * Blockly Games: Sort
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
 * @fileoverview JavaScript for Blockly's Sort application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

BlocklyGames.NAME = 'sort';

goog.provide('Sort');

goog.require('Blockly.FieldDropdown');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Sort.Blocks');
goog.require('Sort.soy');

/**
 * Go to the next level.
 * @suppress {duplicate}
 */
BlocklyInterface.nextLevel = function() {
    window.location = 'https://blockly-games.appspot.com/';
};

Sort.ARRAY_SIZE = 5;

Sort.SKIN = {
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_pegman.mp3', 'maze/fail_pegman.ogg'],
};

/**
 * Milliseconds between each animation frame.
 */
Sort.stepSpeed;

Sort.position = 0;
Sort.array = [];

/**
 * Outcomes of running the user program.
 */
Sort.ResultType = {
    UNSET: 0,
    SUCCESS: 1,
    FAILURE: -1,
    TIMEOUT: 2,
    ERROR: -2
};

/**
 * Result of last execution.
 */
Sort.result = Sort.ResultType.UNSET;

/**
 * PIDs of animation tasks currently executing.
 */
Sort.pidList = [];

/**
 * Draw the current array
 */
Sort.drawArray = function() {
    var div = document.getElementById('sortArray');
    div.innerHTML = '';
    var s = '';
    for (var i = 0; i < Sort.ARRAY_SIZE; i++) {
        if (i > 0) s += ' ';
        var element = document.createElement('div');
        element.id = 'element_' + i;
        element.textContent = Sort.array[i];
        element.className = 'arrayElement';
        element.style.left = ((i + 1) * 100.0 / (Sort.ARRAY_SIZE + 1)) + '%';
        div.appendChild(element);
    }
    var position = document.createElement('div');
    position.id = 'positionMarker';
    position.style.left = ((Sort.position + 1) * 100.0 / (Sort.ARRAY_SIZE + 1)) + '%';
    div.appendChild(position);
};

/**
 * Initialize Blockly and the array.  Called on page load.
 */
Sort.init = function() {
    // Render the Soy template.
    document.body.innerHTML = Sort.soy.start({}, null,
        {lang: BlocklyGames.LANG,
            level: 1,
            maxLevel: 1,
            html: BlocklyGames.IS_HTML});

    BlocklyInterface.init();

    var rtl = BlocklyGames.isRtl();
    var blocklyDiv = document.getElementById('blockly');
    var visualization = document.getElementById('visualization');
    var onresize = function(e) {
        var top = visualization.offsetTop;
        blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
        blocklyDiv.style.left = rtl ? '10px' : '420px';
        blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
    };
    window.addEventListener('scroll', function() {
        onresize(null);
        Blockly.svgResize(BlocklyGames.workspace);
    });
    window.addEventListener('resize', onresize);
    onresize(null);

    var toolbox = document.getElementById('toolbox');
    BlocklyGames.workspace = Blockly.inject('blockly',
        {'media': 'generated/blockly/',
            'maxBlocks': Sort.MAX_BLOCKS,
            'rtl': rtl,
            'toolbox': toolbox,
            'trashcan': true,
            'zoom': {'startScale': 1}});
    BlocklyGames.workspace.getAudioManager().load(Sort.SKIN.winSound, 'win');
    BlocklyGames.workspace.getAudioManager().load(Sort.SKIN.crashSound, 'fail');
    // Not really needed, there are no user-defined functions or variables.
    Blockly.JavaScript.addReservedWords('isSorted,move,compare,swap');

    var defaultXml =
        '<xml></xml>';
    BlocklyInterface.loadBlocks(defaultXml, false);

    Sort.reset();

    BlocklyGames.bindClick('runButton', Sort.runButtonClick);
    BlocklyGames.bindClick('resetButton', Sort.resetButtonClick);

    if (!BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
            BlocklyGames.LEVEL)) {
        // Level 10 gets an introductory modal dialog.
        // Skip the dialog if the user has already won.
        var content = document.getElementById('dialogHelpSort');
        var style = {
            'width': '30%',
            'left': '35%',
            'top': '12em'
        };
        BlocklyDialogs.showDialog(content, null, false, true, style,
            BlocklyDialogs.stopDialogKeyDown);
        BlocklyDialogs.startDialogKeyDown();
        setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }

    // Lazy-load the JavaScript interpreter.
    setTimeout(BlocklyInterface.importInterpreter, 1);
    // Lazy-load the syntax-highlighting.
    setTimeout(BlocklyInterface.importPrettify, 1);
};

/**
 * Save the blocks for a one-time reload.
 */
Sort.saveToStorage = function() {
    // MSIE 11 does not support sessionStorage on file:// URLs.
    if (typeof Blockly != undefined && window.sessionStorage) {
        var xml = Blockly.Xml.workspaceToDom(BlocklyGames.workspace);
        var text = Blockly.Xml.domToText(xml);
        window.sessionStorage.loadOnceBlocks = text;
    }
};

/**
 * Reset the array to the start position and kill any pending animation tasks.
 */
Sort.reset = function(arr) {
    // Kill all tasks.
    for (var i = 0; i < Sort.pidList.length; i++) {
        window.clearTimeout(Sort.pidList[i]);
    }
    Sort.pidList = [];

    Sort.position = 0;

    if (!arr) {
        var temp = [];
        for (var i = 1; i <= Sort.ARRAY_SIZE * 4; i++) {
            temp.push(i);
        }

        for (var i = temp.length-1; i >=0; i--) {
            var randomIndex = Math.floor(Math.random()*(i+1));
            var itemAtIndex = temp[randomIndex];
            temp[randomIndex] = temp[i];
            temp[i] = itemAtIndex;
        }

        Sort.array = [];
        for (var i = 0; i < Sort.ARRAY_SIZE; i++) {
            Sort.array.push(temp[i]);
        }
    } else {
        Sort.array = arr;
    }
    Sort.drawArray();
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Sort.runButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
        return;
    }
    BlocklyDialogs.hideDialog(false);
    var runButton = document.getElementById('runButton');
    var resetButton = document.getElementById('resetButton');
    // Ensure that Reset button is at least as wide as Run button.
    if (!resetButton.style.minWidth) {
        resetButton.style.minWidth = runButton.offsetWidth + 'px';
    }
    runButton.style.display = 'none';
    resetButton.style.display = 'inline';
    Sort.reset(Sort.array);
    Sort.execute();
};

/**
 * Click the reset button.  Reset the maze.
 * @param {!Event} e Mouse or touch event.
 */
Sort.resetButtonClick = function(e) {
    // Prevent double-clicks or double-taps.
    if (BlocklyInterface.eventSpam(e)) {
        return;
    }
    var runButton = document.getElementById('runButton');
    runButton.style.display = 'inline';
    document.getElementById('resetButton').style.display = 'none';
    BlocklyGames.workspace.highlightBlock(null);
    Sort.reset(false);
};

/**
 * Inject the Sort API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS Interpreter.
 * @param {!Interpreter.Object} scope Global scope.
 */
Sort.initInterpreter = function(interpreter, scope) {
    // API
    var wrapper;
    wrapper = function(direction, id) {
        return Sort.move(direction, id);
    };
    interpreter.setProperty(scope, 'move',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(direction, operator, id) {
        return Sort.compare(direction, operator, id);
    };
    interpreter.setProperty(scope, 'compare',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(direction, id) {
        return Sort.swap(direction, id);
    };
    interpreter.setProperty(scope, 'swap',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(direction, id) {
        return Sort.atEdge(direction, id);
    };
    interpreter.setProperty(scope, 'atEdge',
        interpreter.createNativeFunction(wrapper));
    wrapper = function() {
        return Sort.isSorted();
    };
    interpreter.setProperty(scope, 'isSorted',
        interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Sort.execute = function() {
    if (!('Interpreter' in window)) {
        // Interpreter lazy loads and hasn't arrived yet.  Try again later.
        setTimeout(Sort.execute, 250);
        return;
    }

    Sort.log = [];
    Blockly.selected && Blockly.selected.unselect();
    var code = Blockly.JavaScript.workspaceToCode(BlocklyGames.workspace);
    console.log(code);
    Sort.result = Sort.ResultType.UNSET;
    var interpreter = new Interpreter(code, Sort.initInterpreter);

    var arr = [];
    for (var i = 0; i < Sort.ARRAY_SIZE; i++) {
        arr.push(Sort.array[i]);
    }

    // Try running the user's code.  There are four possible outcomes:
    // 1. If pegman reaches the finish [SUCCESS], true is thrown.
    // 2. If the program is terminated due to running too long [TIMEOUT],
    //    false is thrown.
    // 3. If another error occurs [ERROR], that error is thrown.
    // 4. If the program ended normally but without solving the maze [FAILURE],
    //    no error or exception is thrown.
    try {
        var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
        while (interpreter.step()) {
            if (ticks-- == 0) {
                throw Infinity;
            }
        }
        Sort.result = Sort.isSorted() ?
            Sort.ResultType.SUCCESS : Sort.ResultType.FAILURE;
    } catch (e) {
        // A boolean is thrown for normal termination.
        // Abnormal termination is a user error.
        if (e === Infinity) {
            Sort.result = Sort.ResultType.TIMEOUT;
        } else if (e === false) {
            Sort.result = Sort.ResultType.ERROR;
        } else {
            // Syntax error, can't happen.
            Sort.result = Sort.ResultType.ERROR;
            alert(e);
        }
    }

    // Fast animation if execution is successful.  Slow otherwise.
    if (Sort.result == Sort.ResultType.SUCCESS) {
        Sort.stepSpeed = 100;
        Sort.log.push(['finish', null]);
    } else {
        Sort.stepSpeed = 150;
    }

    console.log(Sort.log);

    // Sort.log now contains a transcript of all the user's actions.
    // Reset the array and animate the transcript.
    Sort.reset(arr);
    Sort.pidList.push(setTimeout(Sort.animate, 100));
};

/**
 * Iterate through the recorded path and animate sort actions.
 */
Sort.animate = function() {
    var action = Sort.log.shift();
    if (!action) {
        BlocklyInterface.highlight(null);
        return;
    }
    BlocklyInterface.highlight(action[1]);

    console.log(action);
    switch (action[0]) {
        case 'move_start':
            Sort.schedule(0);
            break;
        case 'move_end':
            Sort.schedule(Sort.ARRAY_SIZE - 1);
            break;
        case 'move_left':
            Sort.schedule(Sort.position - 1);
            break;
        case 'move_right':
            Sort.schedule(Sort.position + 1);
            break;
        case 'compare_left':
            Sort.scheduleCompare(-1);
            break;
        case 'compare_right':
            Sort.scheduleCompare(1);
            break;
        case 'edge_left':
            Sort.scheduleEdge('left');
            break;
        case 'edge_right':
            Sort.scheduleEdge('right');
            break;
        case 'swap_left':
            Sort.scheduleSwap(-1);
            break;
        case 'swap_right':
            Sort.scheduleSwap(1);
            break;
        case 'fail_left':
            Sort.scheduleFail(0);
            break;
        case 'fail_right':
            Sort.scheduleFail(1);
            break;
        case 'finish':
            Sort.scheduleFinish(true);
            BlocklyInterface.saveToLocalStorage();
            setTimeout(function() { BlocklyDialogs.congratulations(true); }, 1000);
    }

    Sort.pidList.push(setTimeout(Sort.animate, Sort.stepSpeed * 5));
};

Sort.schedule = function(position) {
    Sort.position = position;
    var positionIcon = document.getElementById('positionMarker');
    positionIcon.style.left = ((position + 1) * 100.0 / (Sort.ARRAY_SIZE + 1)) + '%';
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Sort.scheduleFail = function(direction) {
    var positionIcon = document.getElementById('positionMarker');
    positionIcon.style.left = (direction * 100) + '%';
    Sort.pidList.push(setTimeout(function() {
         Sort.schedule(direction * (Sort.ARRAY_SIZE - 1));
         BlocklyGames.workspace.getAudioManager().play('fail', 0.5);
    }, Sort.stepSpeed * 2));
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Sort.scheduleFinish = function(sound) {
    if (sound) {
        BlocklyGames.workspace.getAudioManager().play('win', 0.5);
    }
};

Sort.scheduleCompare = function(direction) {
    var pos = Sort.position + direction;
    var element1 = document.getElementById('element_' + Sort.position);
    var element2 = document.getElementById('element_' + pos);
    element1.className = 'arrayElement large';
    element2.className = 'arrayElement large';
    Sort.pidList.push(setTimeout(function() {
        element1.className = 'arrayElement';
        element2.className = 'arrayElement';
    }, Sort.stepSpeed * 3));
};

Sort.scheduleEdge = function(direction) {
    var positionIcon = document.getElementById('positionMarker');
    positionIcon.className = direction;
    Sort.pidList.push(setTimeout(function() {
        positionIcon.className = '';
    }, Sort.stepSpeed * 2));
}

Sort.scheduleSwap = function(direction) {
    var pos = Sort.position + direction;
    var temp = Sort.array[pos];
    Sort.array[pos] = Sort.array[Sort.position];
    Sort.array[Sort.position] = temp;
    var element1 = document.getElementById('element_' + Sort.position);
    var element2 = document.getElementById('element_' + pos);
    temp = element1.style.left;
    element1.style.left = element2.style.left;
    element2.style.left = temp;
    temp = element1.id;
    element1.id = element2.id;
    element2.id = temp;
}

// Core functions.

Sort.move = function(direction, id) {
    console.log('move', Sort.position, direction);
    if (direction == -2) {
        Sort.position = 0;
        Sort.log.push(['move_start', id]);
    } else if (direction == 2) {
        Sort.position = Sort.ARRAY_SIZE - 1;
        Sort.log.push(['move_end', id]);
    } else {
        var pos = Sort.position + direction;
        if (pos < 0 || pos >= Sort.ARRAY_SIZE) {
            Sort.log.push(['fail_' + (direction < 0 ? 'left' : 'right'), id]);
            throw false;
        }
        Sort.position = pos;
        Sort.log.push(['move_' + (direction < 0 ? 'left' : 'right'), id]);
    }
};

Sort.compare = function(direction, operator, id) {
    console.log('compare', Sort.position, direction);
    var pos = Sort.position + direction;
    if (pos < 0 || pos >= Sort.ARRAY_SIZE) {
        Sort.log.push(['fail_' + (direction < 0 ? 'left' : 'right'), id]);
        throw false;
    }
    Sort.log.push(['compare_' + (direction < 0 ? 'left' : 'right'), id]);
    return operator * Sort.array[Sort.position] > operator * Sort.array[pos];
};

Sort.swap = function(direction, id) {
    console.log('swap', Sort.position, direction);
    var pos = Sort.position + direction;
    if (pos < 0 || pos >= Sort.ARRAY_SIZE) {
        Sort.log.push(['fail_' + (direction < 0 ? 'left' : 'right'), id]);
        throw false;
    }
    var temp = Sort.array[pos];
    Sort.array[pos] = Sort.array[Sort.position];
    Sort.array[Sort.position] = temp;
    var command = 'swap_' + (direction > 0 ? 'right' : 'left');
    Sort.log.push([command, id]);
};

Sort.atEdge = function(direction, id) {
    Sort.log.push(['edge_' + (direction == 0 ? 'left' : 'right'), id]);
    return Sort.position == direction * (Sort.ARRAY_SIZE - 1);
}

Sort.isSorted = function() {
    for (var i = 1; i < Sort.ARRAY_SIZE; i++) {
        if (Sort.array[i - 1] > Sort.array[i]) {
            return false;
        }
    }
    return true;
};

window.addEventListener('load', Sort.init);
