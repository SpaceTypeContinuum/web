let sketches = [Blobs, Vortex, ParticleFill, PathTweaker]

let lastSketchType = -1
let nextSketchType = 0
let currentp5
let nextp5

let paused = false
let lastAction

let nextAction
let lastHook

let hookDuration
let hookStartTimeMS
let remainingTimeToAction

function shuffle(array) {
  array.sort(() => Math.random() - 0.5)
}

shuffle(sketches)

function createSketch() {
  let currentSketch = sketches[nextSketchType].createSketch("canvas")
  nextp5 = new p5(currentSketch, "canvas")
  lastSketchType = nextSketchType
  nextSketchType = (lastSketchType + 1) % sketches.length
}

function startCycle() {
  let el
  if (currentp5._elements.length > 0) {
    el = currentp5._elements[0].canvas
  } else {
    el = document.querySelector("canvas:not([display=none])")
  }

  el.style.background = sketches[lastSketchType].targetBg
  document.getElementById("container").style.background = sketches[nextSketchType].targetBg
  el.classList.add("fade-out")

  hookStartTimeMS = new Date().getTime()
  remainingTimeToAction = 500
  nextAction = startSketch
  lastHook = setTimeout(startSketch, 500)
}

function startSketch() {
  createSketch()
  hookStartTimeMS = new Date().getTime()
  remainingTimeToAction = 500
  nextAction = completeCycle
  lastHook = setTimeout(completeCycle, 500)
}

function completeCycle(timer = 10000) {
  let elem = document.getElementById("progress")
  elem.style.width = "0%"
  elem.style.opacity = 1
  elem.classList.remove("fade-out")
  if (currentp5) {
    currentp5.remove()
  }

  currentp5 = nextp5
  hookDuration = timer
  hookStartTimeMS = new Date().getTime()
  remainingTimeToAction = timer
  nextAction = setProgress
  lastHook = setTimeout(setProgress, 10)
}

function setProgress() {
  let time = new Date().getTime()
  remainingTimeToAction -= time - hookStartTimeMS
  hookStartTimeMS = time

  let width = Math.min(100, (100 * (hookDuration - remainingTimeToAction)) / hookDuration)
  let elem = document.getElementById("progress")

  if (remainingTimeToAction <= 0) {
    elem.style.width = "100%"
    elem.classList.add("fade-out")
    startCycle()
  } else {
    elem.style.width = width + "%"
    lastHook = setTimeout(setProgress, 10)
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  createSketch()
  document.getElementById("container").style.background = sketches[lastSketchType].targetBg
  document.getElementById("play").onclick = function() {
    if (nextAction !== setProgress) {
      return
    }

    paused = !paused
    if (paused) {
      this.textContent = "►"
      clearTimeout(lastHook)
      remainingTimeToAction -= new Date().getTime() - hookStartTimeMS
    } else {
      this.textContent = "❚❚"
      hookStartTimeMS = new Date().getTime()
      setTimeout(nextAction, 10)
    }

    return false
  }
  completeCycle(5000)
})
