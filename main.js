/* eslint no-undef: 0 */
/* eslint no-redeclare: 0 */
/* eslint no-unused-vars: 0 */

class Generation {
  constructor (numBots, batchNum) {
    this.target = ground.padInfoNearest({ x: 5000, y: 0 }).center
    this.bots = []
    this.numBots = numBots
    this.longestSurviving = []
    this.numDead = 0
    this.dead = false
    this.mostFit = 0
    this.mostFitIndex = -1

    // Batches
    this.currentBatch = 0
    this.batchNum = batchNum
    this.batchStartingBot = 0 // For batches
    this.batchEndingBot = this.batchNum
    console.log(`INIT: ${this.batchEndingBot}`)
    this.batchDead = false
    this.numDeadInBatch = 0
    for (var i = 0; i < this.batchNum; i++) {
      this.bots.push(new Bot())
    }
    var circle = two.makeCircle(this.target.x, this.target.y, 5)
    circle.fill = 'red'
  }

  randomizeNets () {
    for (var i = 0; i < this.bots.length; i++) {
      this.bots[i].net.randomize(-1, 1)
    }
  }

  copyAndMutateNets (mostFit, numTop, mutateNum) {
    for (var i = 0; i < this.numBots; i++) {
      var whichNet = mostFit[i % numTop].net
      this.bots[i].net = copyNetwork(whichNet)
      this.bots[i].net.mutate(mutateNum)
    }
  }

  executeNets (isRendered) {
    if (!this.dead) {
      for (var i = this.batchStartingBot; i < this.batchEndingBot; i++) {
        console.log(this.batchEndingBot)
        let justDied = this.bots[i].executeNet()
        if (justDied) {
          this.longestSurviving.push(i)
          this.numDead += 1
          this.numDeadInBatch += 1
          // Calculate Fitness
          // var fitness = 1 / Math.sqrt(Math.pow(this.bots[i].x - this.target.x, 2) + Math.pow(this.bots[i].y - this.target.y, 2))
          this.bots[i].fitness = 1 / (Math.pow(this.bots[i].vx, 2) + Math.pow(this.bots[i].vy, 2))
          // console.log(`Fitness for ${i}: ${this.bots[i].fitness}`)
          if (this.bots[i].fitness > this.mostFit) {
            this.mostFit = this.bots[i].fitness
            this.mostFitIndex = i
          }
          console.log(`dead: ${this.numDeadInBatch} numBatch: ${this.batchNum}, batchEndingBot: ${this.batchEndingBot}`)
          if (this.numDeadInBatch === this.batchNum) {
            this.currentBatch += 1
            this.numDeadInBatch = 0
            console.log('New Batch')
            this.batchStartingBot = this.batchEndingBot
            if (this.batchEndingBot === this.bots.length) {
              console.log(`${this.batchStartingBot} = ${this.bots.length}`)
              this.dead = true
              this.longestSurviving.reverse()
              this.mostFitBots = []
              for (var i = 0; i < this.numBots; i++) {
                this.mostFitBots.push(this.bots[i])
              }
              this.mostFitBots.sort(compareFitness)
              console.log(this.mostFitBots)
            } else if (this.batchEndingBot + this.batchNum > this.bots.length) {
              this.batchEndingBot = this.bots.length
            } else {
              this.batchEndingBot += this.batchNum
            }
            console.log(`Start: ${this.batchStartingBot}, End: ${this.batchEndingBot}`)
          }
        }
        if (isRendered) {
          this.bots[i].render()
        }
      }
    }
  }

  destroy () {
    ships = []
    this.bots = []
  }

  displayNet (index) {
    netInfo.clear()
    this.bots[index].net.display(netInfo, 5, 5, 0.5)
  }
}

const numBots = 20
const batchSize = 5
// Default mult: 15
const mult = 15
var fastforward = 1

var currentGeneration = new Generation(numBots, batchSize)
currentGeneration.randomizeNets()
currentGeneration.displayNet(0)
var generation = 0

setInterval(function () {
  for (var i = 0; i < fastforward; i++) {
    iteration()
    render(mult)
  }
}, 1)

function iteration () {
  currentGeneration.executeNets(false)
  if (currentGeneration.dead) {
    reset()
    var bestIndex = currentGeneration.mostFitIndex
    var bestNet = currentGeneration.bots[bestIndex].net
    ships[currentGeneration.bots[bestIndex].id].group.fill = 'green'
    var mostFitBots = currentGeneration.mostFitBots
    var averageFitness = 0
    for (var i = 0; i < mostFitBots.length; i++) {
      averageFitness += mostFitBots[i].fitness
    }
    averageFitness = averageFitness / mostFitBots.length
    currentGeneration.destroy()
    currentGeneration = new Generation(numBots, batchSize)
    currentGeneration.copyAndMutateNets(mostFitBots, 20, 10)
    currentGeneration.displayNet(0)
    var generationText = netInfo.makeText(`Generation: ${generation}`, 10, 160, { alignment: left })
    var totalFitnessText = netInfo.makeText(`Average Fitness: ${averageFitness}`, 10, 180, { alignment: left })
    generationText.fill = 'white'
    totalFitnessText.fill = 'white'
    generation += 1
    console.log(`Generation ${generation}`)
  }
  panCamera()
}

var scale = 0.6

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
  two.scene.translation.y = two.height - ground.maxY * scale
  two.scene.translation.x = two.width * scale
})

function panCamera () {
  if (d) {
    two.scene.translation.x -= 20 * two.scene.scale
  }

  if (a) {
    two.scene.translation.x += 20 * two.scene.scale
  }

  if (w) {
    two.scene.translation.y += 20 * two.scene.scale
  }

  if (s) {
    two.scene.translation.y -= 20 * two.scene.scale
  }
}
