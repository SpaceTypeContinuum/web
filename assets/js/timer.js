let sketches = [
    Blobs,
    ParticleFill
]

let lastSketchType = -1
let nextSketchType = 0
let currentp5
let nextp5

function createSketch(startingBgColor) {
    let currentSketch = sketches[nextSketchType].createSketch("canvas", startingBgColor)
    nextp5 = new p5(currentSketch, "canvas")
    lastSketchType = nextSketchType
    nextSketchType = (nextSketchType + 1) % sketches.length
}

function startCycle() {
    createSketch(sketches[lastSketchType].targetBg)
    setTimeout(completeCycle, 500)
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
    completeCycle()
})