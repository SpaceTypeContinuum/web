let createSketch = function (divId) {
  let sketch = function (p) {
    let Engine = Matter.Engine
    let World = Matter.World
    let Bodies = Matter.Bodies
    let Constraint = Matter.Constraint

    let lastWindowResize

    let engine
    let world
    let scale = 1
    let initSize

    let txt = "SPACE" 
    let fontSize = 0

    let font
    let points
    let bounds

    p.preload = function () {
      font = p.loadFont("assets/fonts/Raleway-Black.ttf")
    }

    p.setup = function () {
      let div = document.getElementById(divId)
      p.createCanvas(div.offsetWidth, div.clientHeight)
      p.textFont(font)

      engine = Engine.create()
      world = engine.world
      world.gravity.y = 0

      refreshPoints()
    }

    p.draw = function () {
      if (lastWindowResize && (p.millis() - lastWindowResize > 200)) {
        refreshPoints()
        lastWindowResize = null
      }

      p.background("#363636")
      p.translate(p.width / 2, p.height / 2)
      p.scale(scale)
      Engine.update(engine)
      drawShape()
    }

    p.windowResized = function () {
      let div = document.getElementById(divId)
      p.resizeCanvas(
        div.offsetWidth,
        div.clientHeight)

      scale = Math.min(p.width, p.height) / initSize
      lastWindowResize = p.millis()
    }

    function refreshPoints() {
      let oldFontSize = fontSize

      initSize = Math.min(p.width, p.height)
      fontSize = initSize / 4
      scale = 1

      if (oldFontSize !== fontSize) {
        bounds = font.textBounds(txt, 0, 0, fontSize)
        let ptBodyOptions = {
          friction: 0.0,
          restitution: 0.95,
          density: 1
        }

        World.clear(world)
        Engine.clear(engine)

        points = font
          .textToPoints(txt, 0, 0, fontSize, {
            sampleFactor: 0.3
          })
          .map(centerAndNormalizePt)
          .map(pt => {
            let body = Bodies.circle(pt.x + p.width / 2, pt.y + p.height / 2, 1, ptBodyOptions)
            World.add(world, body)

            return new Point(p, pt.x, pt.y, body)
          })

        setupPointConstraints()
      }
    }

    function drawShape() {
      p.beginShape()

      let prevPt = points[0]
      let inContour = false
      for (let pt of points) {
        let dist = prevPt.distanceTo(pt)
        if (dist > 20) {
          if (inContour) {
            p.endContour()
          }
          p.beginContour()
          inContour = true
        }

        pt.draw()
        pt.update()
        prevPt = pt
      }

      if (inContour) {
        p.endContour()
      }
      p.endShape()
    }

    function centerAndNormalizePt(pt) {
      let point = {
        ...pt,
        x: pt.x - bounds.x - bounds.w / 2,
        y: pt.y - bounds.y - bounds.h / 2
      }

      return point
    }

    function setupPointConstraints() {
      let firstPtIdx = 0

      for (let i = 0; i < points.length - 2; i++) {
        let dist = points[i].distanceTo(points[i + 1])

        let nextPt
        if (dist < 20) {
          // Link this point to the next point in the path
          nextPt = points[i + 1]
        } else {
          // Probably reached a counter — link this point back to the first point
          // of the current shape/counter.
          nextPt = points[firstPtIdx]
          dist = points[i].distanceTo(nextPt)
          firstPtIdx = i + 1
        }

        addConstraint(points[i].body, nextPt.body, dist)
      }

      // Close off the last shape
      addConstraint(
        points[points.length - 1].body,
        points[firstPtIdx].body,
        points[points.length - 1].distanceTo(points[firstPtIdx])
      )
    }

    function addConstraint(bodyA, bodyB, len) {
      var options = {
        bodyA,
        bodyB,
        length: len,
        damping: 1.0,
        stiffness: 1.2
      }

      var constraint = Constraint.create(options)
      World.add(world, constraint)
    }
  }

  return sketch
}
