/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

'use strict'

// Math.seedrandom(`${(new Date()).getTime()}`);
Math.seedrandom(0)

let two = new Two({ fullscreen: true, autostart: true }).appendTo(document.body)
let netInfo = new Two({ width: 1500, height: 1000, autostart: true }).appendTo(document.body)

// resize the two canvas to allow events to flow to html header
let svg = document.getElementsByTagName('svg')[0]
let header = document.querySelector('#header')
svg.style.top = header.getBoundingClientRect().bottom

const smallScale = 0.6; const tinyScale = 0.2; const largeScale = 2

var ground, camera, state

var ships = []

init()

function reset () {
  Math.seedrandom(0)
  two.clear()
  ground = new Terrain(two)
  Math.seedrandom(`${(new Date()).getTime()}`);    
}

function init () {
  camera = new Camera(two);
  camera.chase = {};
  Math.seedrandom(0)
  two.clear()
  ground = new Terrain(two)
  Math.seedrandom(`${(new Date()).getTime()}`);    
}

// used for debug
let fps = 0
function currentFPS (dt) {
  let currentFps = (dt) ? 1000 / dt : 0
  fps += (currentFps - fps) / 50
  return fps
}

// two.bind('update', (frame, dt) => {
let x = 0
var render = (dt) => {
  for (var i = 0; i < ships.length; i++) {
    let padInfo = ground.padInfoNearest(ships[i].translation)

    let groundDistance = ships[i].hitTest(ground)
    if (groundDistance === 0) {
      if (padInfo.pad.landTest(ships[i])) {
        // Landed
        padInfo.pad.fill = 'Green'
        ships[i].stopped = true
        ships[i].landed = true
      } else {
        // Crashed
        padInfo.pad.fill = 'Red'
        ships[i].stopped = true
        ships[i].crashed = true
      }
    }
    ships[i].tick(dt)
  }
  camera.tick(dt)
}

// });
