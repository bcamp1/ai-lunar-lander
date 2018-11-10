/* eslint no-undef: 0 */
/* eslint no-redeclare: 0 */
/* eslint no-unused-vars: 0 */
const physicsMult = 15
const botsPerGeneration = 20
const botsPerBatch = 10
const netsToKeep = 5
const mutationStrength = 10
const batchesNeeded = botsPerGeneration / botsPerBatch

// Check for variable 'Compile Time' errors
if (netsToKeep > botsPerBatch) {
  throw new Error('netsToKeep must be less than botsPerGeneration')
}

var bots = []

var batchStart = 0
var batchEnd = botsPerBatch
var batchNumDead = 0
var batchNum = 0

var totalFitness = 0
var averageFitness = 0

var generation = 0


for (var i = 0; i < botsPerGeneration; i++) {
  bots.push(new Bot())
  bots[i].net.randomize(-1, 1)
}

for (var i = batchStart; i < batchEnd; i++) {
  bots[i].createShip()
}

updateInfo(bots[0].net)

function step () {
  for (var i = batchStart; i < batchEnd; i++) {
    var justDied = bots[i].executeNet()
    bots[i].render(true)

    if (justDied) {
      // Calculate Fitness
      bots[i].fitness = 1 / ((bots[i].vx * bots[i].vx) + (bots[i].vy * bots[i].vy))
      batchNumDead += 1
      if (batchNumDead === botsPerBatch) {
        reset()
        batchNumDead = 0
        batchStart = batchEnd
        batchNum += 1
        batchEnd += botsPerBatch
        if (batchEnd > (bots.length)) {
          batchEnd = (bots.length)
        }

        ships = []
        // Initialize new batch
        for (var i = batchStart; i < batchEnd; i++) {
          bots[i].createShip()
        }

        if (batchStart === batchEnd) {
          // Generation Finished
          generation += 1
          batchNum = 0
          batchStart = 0
          batchEnd = botsPerBatch

          // Sort Bots by fitness
          totalFitness = 0
          for (var i = 0; i < botsPerGeneration; i++) {
            totalFitness += fitnessSquish(bots[i].fitness)
          }
          averageFitness = totalFitness / botsPerGeneration
          bots.sort(compareFitness)
          var bestNets = []
          var bestColors = []
          for (var i = 0; i < netsToKeep; i++) {
            bestNets.push(copyNetwork(bots[i].net))
            bestColors.push({
              r: bots[i].color.r,
              g: bots[i].color.g,
              b: bots[i].color.b
            })
          }

          console.log(bestNets)

          // Start a new generation
          bots = []
          ships = []

          console.log(`Batch Start: ${batchStart}, Batch End: ${batchEnd}`)

          for (var i = 0; i < botsPerGeneration; i++) {
            bots.push(new Bot())
            let whichNetIndex = i % netsToKeep
            bots[i].net = copyNetwork(bestNets[whichNetIndex])
            bots[i].color = {
              r: bestColors[whichNetIndex].r,
              g: bestColors[whichNetIndex].g,
              b: bestColors[whichNetIndex].b
            }
            if (i > (netsToKeep - 1)) {
              bots[i].net.mutate(mutationStrength)
            }
          }

          for (var i = batchStart; i < batchEnd; i++) {
            bots[i].createShip()
            console.log(bots[i].net)
          }
        }
        updateInfo(bots[batchStart].net)
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

function updateInfo (net) {
  info.clear()
  net.display(info, 5, 5, 0.5)
  var generationText = info.makeText(`Generation: ${generation}`, 16, 200, { alignment: 'left' })
  var batchText = info.makeText(`Batch: ${batchNum} / ${batchesNeeded}`, 16, 220, { alignment: 'left' })
  var avgFitnessText = info.makeText(`Average Fitness: ${averageFitness}`, 16, 240, { alignment: 'left' })
  generationText.fill = 'white'
  batchText.fill = 'white'
  avgFitnessText.fill = 'white'
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

function fitnessSquish (x) {
  return 1000 / (1 + Math.pow(Math.E, -1 * (x - 8)))
}
