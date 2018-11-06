/* eslint no-undef: 0 */
/* eslint no-redeclare: 0 */
/* eslint no-unused-vars: 0 */
const physicsMult = 15
const botsPerGeneration = 10
const botsPerBatch = 5

var bots = []

var batchStart = 0
var batchEnd = botsPerBatch
var batchNumDead = 0
var batchNum = 0

var generation = 0
updateInfo()

for (var i = 0; i < botsPerGeneration; i++) {
  bots.push(new Bot())
  bots[i].net.randomize(-1, 1)
}

for (var i = batchStart; i < batchEnd; i++) {
  bots[i].createShip()
}

function step () {
  for (var i = batchStart; i < batchEnd; i++) {
    var justDied = bots[i].executeNet()
    bots[i].render(false)

    if (justDied) {
      batchNumDead += 1
      if (batchNumDead === botsPerBatch) {
        batchNumDead = 0
        batchStart = batchEnd
        batchNum += 1
        batchEnd += botsPerBatch
        if (batchEnd > bots.length) {
          batchEnd = bots.length
        }

        // Initialize new batch
        for (var i = batchStart; i < batchEnd; i++) {
          bots[i].createShip()
        }

        if (batchStart === batchEnd) {
          // Generation Finished
          generation += 1
          batchNum = 0
        }
        updateInfo()
      }
    }
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

function updateInfo () {
  info.clear()
  var generationText = info.makeText(`Generation: ${generation}`, 16, 20, { alignment: 'left' })
  var batchText = info.makeText(`Batch: ${batchNum}`, 16, 40, { alignment: 'left' })
  generationText.fill = 'white'
  batchText.fill = 'white'
}

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
