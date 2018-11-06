/* eslint no-undef: 0 */
/* eslint no-redeclare: 0 */
/* eslint no-unused-vars: 0 */
const physicsMult = 15
const botsPerGeneration = 200
const botsPerBatch = 10

var bots = []

for (var i = 0; i < botsPerGeneration; i++) {
  bots.push(new Bot())
  bots[i].createShip()
  bots[i].net.randomize(-1, 1)
}

function step () {
  for (var i = 0; i < botsPerGeneration; i++) {
    bots[i].executeNet()
    bots[i].render(false)
  }
  panCamera()
}

setInterval(function () {
  step()
  render(physicsMult)
}, 1)

var scale = 0.6
var offsetX = 0
var offsetY = 0
window.addEventListener('wheel', event => {
  var delta = event.wheelDelta
  if (delta > 0) {
    delta = 1
    scale += 0.03
  } else if (delta < 0) {
    delta = -1
    scale -= 0.03
  }

  if (scale < 0.1) {
    scale = 0.1
  }

  two.scene.scale = scale
  two.scene.translation.y = (two.height + offsetY) * scale
  two.scene.translation.x = (two.width + offsetX) * scale
})

function panCamera () {
  if (d) {
    two.scene.translation.x -= 20 * two.scene.scale
    offsetX -= 20 * two.scene.scale
  }

  if (a) {
    two.scene.translation.x += 20 * two.scene.scale
    offsetX += 20 * two.scene.scale
  }

  if (w) {
    two.scene.translation.y += 20 * two.scene.scale
    offsetY += 20 * two.scene.scale
  }

  if (s) {
    two.scene.translation.y -= 20 * two.scene.scale
    offsetY -= 20 * two.scene.scale
  }
}
