let sketches = [
    Blobs,
    ParticleFill
]

let lastSketchType = -1
let nextSketchType = 0
let currentp5
let nextp5

function createSketch() {
    let currentSketch = sketches[nextSketchType].createSketch("canvas")
    document.getElementById("container").style.background = sketches[nextSketchType].targetBg
    nextp5 = new p5(currentSketch, "canvas")
    lastSketchType = nextSketchType
    nextSketchType = (nextSketchType + 1) % sketches.length
}

function startCycle() {
    let el
    if (currentp5._elements[0].length > 0) {
        el = currentp5._elements[0].canvas
    } else {
        el = document.querySelector("canvas:not([display=none])")
    }
    
    el.style.background = sketches[lastSketchType].targetBg
    el.classList.add("fade-out")
    createSketch()
    setTimeout(completeCycle, 3500)
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