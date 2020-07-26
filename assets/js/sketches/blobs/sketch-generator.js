Blobs = {
  targetBg: "#161616",
  createSketch: function(divId) {
    let sketch = function(p) {
      let Engine = Matter.Engine
      let World = Matter.World
      let Bodies = Matter.Bodies
      let Constraint = Matter.Constraint

      let lastWindowResize

      let engine
      let world
      let scale = 1
      let initSize

      let txt = "SPACETYPE"
      let fontSize = 0

      let fonts = {}
      let font
      let points
      let bounds
      let charBoundaries

      let blobs = []

      p.preload = function() {
        fonts = {
          wide: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-wide.otf`),
            scale: initSize => (2 * initSize) / 3
          },
          regular: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-Regular.otf`),
            scale: initSize => (11 * initSize) / 12
          },
          narrow: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-narrow.otf`),
            scale: initSize => 1.5 * initSize
          }
        }
      }

      p.setup = function() {
        let div = document.getElementById(divId)
        p.createCanvas(div.offsetWidth, div.clientHeight)

        engine = Engine.create()
        world = engine.world
        world.gravity.y = 0

        refreshPoints()
        addBlobs()
      }

      function addBlobs() {
        for (let i = 0; i < 100; i++) {
          blobs.push(new Blob(p, p.random(p.width), p.random(p.height), p.random(3, initSize / 50)))
        }
      }

      class Blob {
        constructor(p, x, y, radius) {
          this.p = p
          this.pts = []

          let rand = p.random(1)
          if (rand < 0.1) {
            this.color = p.color("#fe2179")
          } else if (rand < 0.2) {
            this.color = p.color("white")
          } else if (rand < 0.3) {
            this.color = p.color("#fce345")
          } else {
            this.color = p.color("#4ecdc4")
          }

          let npoints = 20
          let angle = (2 * Math.PI) / npoints
          for (let a = 0; a < 2 * Math.PI; a += angle) {
            let sx = x + Math.cos(a) * radius
            let sy = y + Math.sin(a) * radius
            let pt = {
              sx,
              sy,
              body: Bodies.circle(sx, sy, 1, {
                collisionFilter: {
                  category: p.random(10000)
                },
                friction: 0.0,
                restitution: 0.95,
                density: 1
              })
            }

            Matter.Body.setVelocity(pt.body, {
              x: p.random(-1, 1),
              y: p.random(-1, 1)
            })

            World.add(world, pt.body)
            this.pts.push(pt)
          }

          for (let i = 0; i < this.pts.length - 2; i++) {
            let nextPt = this.pts[i + 1]
            let d = p.dist(
              this.pts[i].body.position.x,
              this.pts[i].body.position.y,
              nextPt.body.position.x,
              nextPt.body.position.y
            )
            addConstraint(this.pts[i].body, nextPt.body, d)
          }

          let d = p.dist(
            this.pts[this.pts.length - 1].body.position.x,
            this.pts[this.pts.length - 1].body.position.y,
            this.pts[0].body.position.x,
            this.pts[0].body.position.y
          )
          // Close off the last shape
          addConstraint(this.pts[this.pts.length - 1].body, this.pts[0].body, d)
        }

        draw() {
          this.p.noStroke()

          let dist = this.p
            .createVector(
              this.pts[0].body.position.x - this.p.width / 2,
              this.pts[0].body.position.y - this.p.height / 2
            )
            .mag()

          let transp = this.p.map(
            dist,
            0,
            this.p.createVector(this.p.width / 2, this.p.height / 2).mag(),
            50,
            255,
            true
          )

          this.color.setAlpha(transp)
          this.p.fill(this.color)

          this.p.beginShape()
          for (let pt of this.pts) {
            let dx = pt.sx - pt.body.position.x
            let dy = pt.sy - pt.body.position.y

            let vx = pt.body.velocity.x + dx / 50
            let vy = pt.body.velocity.y + dy / 50

            let canvasMouseX = this.p.mouseX / scale
            let canvasMouseY = this.p.mouseY / scale
            let d = this.p.dist(pt.body.position.x, pt.body.position.y, canvasMouseX, canvasMouseY)
            if (d <= initSize / 5) {
              let maxm = initSize
              let v = this.p.createVector(
                pt.body.position.x - canvasMouseX,
                pt.body.position.y - canvasMouseY
              )
              let m = this.p.map(v.mag(), 0, maxm, 1, 0)
              v.setMag(m)
              vx = v.x
              vy = v.y
              this.sx += v.x
              this.sy += v.y
            }

            Matter.Body.setVelocity(pt.body, {
              x: vx,
              y: vy
            })

            this.p.curveVertex(
              pt.body.position.x - this.p.width / 2,
              pt.body.position.y - this.p.height / 2
            )
          }
          this.p.curveVertex(
            this.pts[0].body.position.x - this.p.width / 2,
            this.pts[0].body.position.y - this.p.height / 2
          )
          this.p.endShape()
        }
      }

      p.draw = function() {
        if (lastWindowResize && p.millis() - lastWindowResize > 200) {
          refreshPoints()
          lastWindowResize = null
        }

        p.clear()
        p.translate(p.width / 2, p.height / 2)
        p.scale(scale)
        Engine.update(engine)
        for (let blob of blobs) {
          blob.draw()
        }
        drawShape()
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)

        scale = Math.min(p.width, p.height) / initSize
        lastWindowResize = p.millis()
      }

      function setFont() {
        let aspect = p.width / p.height
        if (aspect < 0.8) {
          font = fonts["narrow"].font
          fontSize = fonts["narrow"].scale(initSize)
        } else if (aspect < 1.2) {
          font = fonts.regular.font
          fontSize = fonts.regular.scale(initSize)
        } else {
          font = fonts["wide"].font
          fontSize = fonts["wide"].scale(initSize)
        }
      }

      function refreshPoints() {
        let oldFontSize = fontSize

        initSize = Math.min(p.width, p.height)
        setFont()
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
              sampleFactor: 0.2
            })
            .map(centerAndNormalizePt)
            .map(pt => {
              let body = Bodies.circle(pt.x + p.width / 2, pt.y + p.height / 2, 1, ptBodyOptions)
              World.add(world, body)

              return new Point(p, pt.x, pt.y, body)
            })

          console.log(points.length)
          setupPointConstraints()
          charBoundaries = getCharacterBoundaries({
            text: txt,
            font,
            fontSize,
            options: {
              sampleFactor: 0.2
            }
          })
        }
      }

      function drawShape() {
        p.beginShape()

        let char = 0
        let prevPt = points[0]
        let inContour = false

        let color = p.color("#37f79b")
        for (let i = 0; i < points.length; i++) {
          let pt = points[i]
          if (charBoundaries.includes(i)) {
            if (inContour) {
              p.endContour()
            }
            p.endShape()
            inContour = false
            char += 1
            if (char >= 5) {
              color = p.color("white")
            }
            p.beginShape(p.CLOSE)
          } else {
            let dist = prevPt.distanceTo(pt)
            if (dist > 20) {
              if (inContour) {
                p.endContour()
              }
              p.beginContour()
              inContour = true
            }
          }

          pt.draw(color)
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
}
