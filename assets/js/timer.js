let sketches = [Blobs, BlobFills, Vortex, ParticleFill]

let lastSketchType = -1
let nextSketchType = 0
let currentp5
let nextp5

function createSketch() {
  let currentSketch = sketches[nextSketchType].createSketch("canvas")
  nextp5 = new p5(currentSketch, "canvas")
  lastSketchType = nextSketchType
  nextSketchType = (nextSketchType + 1) % sketches.length
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
  setTimeout(startSketch, 3000)
}

function startSketch() {
  createSketch()
  setTimeout(completeCycle, 1000)
}

function completeCycle() {
  if (currentp5) {
    currentp5.remove()
  }

  currentp5 = nextp5
  setTimeout(startCycle, 10000)
}

document.addEventListener("DOMContentLoaded", function(event) {
  createSketch()
  document.getElementById("container").style.background = sketches[lastSketchType].targetBg
  completeCycle()
})
