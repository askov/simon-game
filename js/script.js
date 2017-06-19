//---------------------------------- Globals ---------------------------------//
var lap = false;
// History of generated numbers: 0 - green, 1 - red, 2 - blue, 3 - yellow
var genSequence = [];
var userSequence = [];
var historyIndex = 0;
var pushDelay = 100;
var lapDelay = 1000;
var buttonMapping = {
  0: 'green',
  1: 'red',
  2: 'blue',
  3: 'yellow'
};
var winStreak = 20;
//---------------------------------- Events ----------------------------------//
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('game-onoff').checked = false;
});

var buttons = document.querySelectorAll('.sector');
Array.prototype.forEach.call(buttons, function(node) {
  node.addEventListener('mousedown', buttonClick);
});

var audios = document.querySelectorAll('audio');
Array.prototype.forEach.call(audios, function(node) {
  node.addEventListener('ended', processAudioEnded);
});

var startButton = document.querySelector('.start-button');
startButton.addEventListener('click', startGame);

var onOff = document.getElementById('game-onoff');
onOff.addEventListener('click', gameOnOff);
//----------------------------------- Logic ----------------------------------//
// Starts the new game
function startGame() {
  if (gameIsOn() && !lap) {
    genSequence = [];
    historyIndex = 0;
    displayStreak();
    startLap();
  }
}
// Checks if game power is on
function gameIsOn() {
  return onOff.checked;
}
// Checks if strict mode is on
function strictModeIsOn() {
  return document.getElementById('strict-mode').checked;
}
// Processes events on power switch click
function gameOnOff() {
  genSequence = [];
  historyIndex = 0;
  displayMessage('...');
  displayOnOff();
  strictModeOnOff();
}
// Toggles off class to emulate poweroff of the strict button
function strictModeOnOff() {
  var strictMode = document.getElementById('strict-mode');
  strictMode.checked = false;
  gameIsOn() ? strictMode.classList.remove('off') : strictMode.classList.add('off');
}
// Toggles off class to emulate poweroff of the display
function displayOnOff() {
  var ledDisplay = document.querySelector('.display');
  gameIsOn() ? ledDisplay.classList.remove('off') : ledDisplay.classList.add('off');
}
// Processes user click on sector buttons
function buttonClick(event) {
  if (gameIsOn() && !lap && !audioIsPlaying() && genSequence.length) {
    var sectorColor = event.target.classList[1];
    userPush(sectorColor);
    userSequence.push(sectorColor);
    console.log(userSequence);
    if (checkInputError()) {
      displayMessage('No');
      if(strictModeIsOn()) {
        setTimeout(startGame, 1000);
      } else {
        setTimeout(function() {
          startLap(true);
        }, lapDelay);
      }
    } else if (userSequence.length === genSequence.length) {
      finishLap();
    }
  }
}

function startLap(repetition) {
  lap = true;
  repetition = typeof repetition !== 'undefined' ? repetition : false;
  userSequence = [];
  historyIndex = 0;
  if (!repetition) {
    generateStep();
  }
  displayStreak();
  activateCurrentSector();
}

function finishLap() {
  displayMessage('Yes');
  if (genSequence.length === winStreak) {
    displayMessage('Win');
    setTimeout(startGame, 2000);
  } else {
    setTimeout(startLap, lapDelay);
  }
}

function processAudioEnded() {
  removeLighten();
  if (lap) {
    historyIndex += 1;
    if (historyIndex === genSequence.length) {
      lap = false;
    } else {
      setTimeout(activateCurrentSector, pushDelay);
    }
  }
}

function audioIsPlaying() {
  for (var i = 0; i < audios.length; i++) {
    if (!audios[i].paused) {
      return true;
    }
  }
  return false;
}

function checkInputError() {
  var iteration = userSequence.length - 1;
  if (userSequence[iteration] !== genSequence[iteration]) {
    return true;
  }
}

function generateStep() {
  genSequence.push(buttonMapping[Math.floor(Math.random() * 4)]);
}

function zfill(str, len) {
  return str.length >= len ? str : '0'.repeat(len - str.length) + str;
}

function displayStreak() {
  document.querySelector('.display > span').innerHTML = zfill(String(genSequence.length), 2);
}

function displayMessage(msg) {
  document.querySelector('.display > span').innerHTML = msg;
}

function activateCurrentSector() {
  document.querySelector('div.' + genSequence[historyIndex]).classList += ' lighten';
  document.getElementById(genSequence[historyIndex] + '-sound').play();
}

function userPush(sectorColor) {
  document.getElementById(sectorColor + '-sound').play();
  document.querySelector('div.' + sectorColor).classList += ' lighten';
}

function removeLighten() {
  Array.prototype.forEach.call(buttons, function(node) {
    node.classList.remove('lighten');
  });
}
