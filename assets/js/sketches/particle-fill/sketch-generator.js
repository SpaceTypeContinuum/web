ParticleFill = {
  targetBg: "#161616",
  createSketch: function(divId) {
    let sketch = function(p) {
      let drawShape = false

      let txt = "SPACETYPE"
      let fontSize = 0
      let font
      let points
      let scale = 1
      let pointRadius = 2

      let numBgParticles = 200
      let bgParticles = []
      let freeParticles = []

      let gridPts = []

      let bounds
      let textBounds

      let canvasMouseX
      let canvasMouseY

      p.preload = function() {
        fonts = {
          wide: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-wide.otf`),
            scale: initSize => (2 * initSize) / 3
          },
          regular: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-Regular.otf`),
            scale: initSize => initSize
          },
          narrow: {
            font: p.loadFont(`assets/fonts/SpaceTypeSans-narrow.otf`),
            scale: initSize => 1.5 * initSize
          }
        }
      }

      function ptDistance(p1, p2) {
        return dist(p1.body.position.x, p1.body.position.y, p2.body.position.x, p2.body.position.y)
      }

      let initSize
      let initX, initY
      let textLayer

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

      p.setup = function() {
        let div = document.getElementById(divId)
        let canvas = p.createCanvas(div.offsetWidth, div.clientHeight)

        textLayer = p.createGraphics(p.width, p.height)
        initSize = p.min(p.width, p.height)
        initX = p.width
        initY = p.height

        setFont()
        textLayer.textFont(font)
        textLayer.textSize(fontSize)
        p.textFont(font)

        bounds = font.textBounds(txt, 0, 0, fontSize)

        textBounds = {
          minX: p.width / 2 - bounds.w / 2,
          minY: p.height / 2 - bounds.h / 2,
          maxX: p.width / 2 + bounds.w / 2,
          maxY: p.height / 2 + bounds.h / 2
        }

        points = font.textToPoints(txt, 0, 0, fontSize, {
          sampleFactor: 0.15
        })

        points = points.map(centerPt)
        doDrawShapeOnTextLayer(textLayer)

        let step = initSize / 100
        pointRadius = initSize / 300

        let offset = 2

        for (let y = textBounds.minY + step; y <= textBounds.maxY - step; y += step) {
          offset = offset === 2 ? 0 : 2

          let firstX, lastX

          for (let x = textBounds.minX + pointRadius; x <= textBounds.maxX - pointRadius; x += 1) {
            if (!firstX && textLayer.get(x, y)[0] !== 0) {
              firstX = x
            } else if (firstX && textLayer.get(x, y)[0] === 0) {
              lastX = x
              break
            }
          }

          let numPoints = lastX - firstX / step

          for (let i = 0; i < numPoints; i++) {
            let x = firstX + pointRadius + i * step
            let col = textLayer.get(x, y)[0]
            let lastColor = textLayer.get(x - step, y)[0]
            let nextcol = textLayer.get(x + step, y)[0]

            let lastRowCol = textLayer.get(x, y - step)[0]
            let nextRowCol = textLayer.get(x, y + step)[0]

            if (col > 10) {
              let nextX = x
              let nextY = y
              if (lastColor === col && nextcol === col) {
                nextX += p.random(-pointRadius, pointRadius)
              }

              if (lastRowCol === col && nextRowCol === col) {
                nextY += p.random(-pointRadius, pointRadius)
              }
              gridPts.push({
                x: nextX,
                y: nextY
              })
            }
          }
        }

        let gridPtsCopy = JSON.parse(JSON.stringify(gridPts))
        while (gridPts.length > 0) {
          let x = p.random(p.width) - initX / 2
          let y = p.random(p.height) - initY / 2
          let dest = getDest(x, y)
          freeParticles.push(
            new Point(p, x, y, p.random(pointRadius, pointRadius * 2), false, dest)
          )
        }

        gridPts = gridPtsCopy

        for (let i = 0; i < numBgParticles; i++) {
          let x = p.random(p.width) - initX / 2
          let y = p.random(p.height) - initY / 2
          let vx = p.random(-1, 1)
          let vy = p.random(-1, 1)
          bgParticles.push(new FreePoint(p, x, y, p.random(pointRadius, pointRadius * 2), vx, vy))
        }
      }

      p.mousePressed = function() {
        let gridPtsCopy = JSON.parse(JSON.stringify(gridPts))
        for (let pt of freeParticles) {
          let x = pt.body.position.x
          let y = pt.body.position.y
          let dest = getDest(x, y)
          pt.dest = dest
        }
        gridPts = gridPtsCopy
      }

      p.draw = function() {
        canvasMouseX = (p.mouseX - p.width / 2) / scale
        canvasMouseY = (p.mouseY - p.height / 2) / scale

        p.clear()
        p.translate(p.width / 2, p.height / 2)
        p.scale(scale)

        for (let i = 0; i < bgParticles.length; i++) {
          let pt = bgParticles[i]
          pt.draw()
          pt.update()
        }

        for (let pt of freeParticles) {
          pt.draw()
          pt.update()
        }
      }

      function doDrawShapeOnTextLayer(layer) {
        layer.beginShape()
        layer.translate(p.width / 2, p.height / 2)

        let prevPt = points[0]
        let inContour = false
        for (let pt of points) {
          let d = p.dist(prevPt.x, prevPt.y, pt.x, pt.y)
          if (d > 20) {
            if (inContour) {
              layer.endContour()
            }
            layer.beginContour()
            inContour = true
          }
          layer.vertex(pt.x, pt.y)
          prevPt = pt
        }

        if (inContour) {
          layer.endContour()
        }
        layer.endShape()
      }

      function centerPt(pt) {
        let point = {
          ...pt,
          x: pt.x - bounds.x - bounds.w / 2,
          y: pt.y - bounds.y - bounds.h / 2
        }

        return point
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)

        scale = Math.min(p.width, p.height) / initSize
      }

      class FreePoint {
        constructor(p, x, y, radius, vx, vy) {
          this.p = p
          this.color = p.color(255, 255, 255, p.random(100, 180))
          this.radius = radius
          this.x = x
          this.y = y
          this.vx = vx
          this.vy = vy
          this.offset = p.random(0, 2 * Math.PI)
        }

        draw() {
          let dist = this.p.createVector(this.x, this.y).mag()
          let transp = this.p.map(
            dist,
            0,
            this.p.createVector(this.p.width, this.p.height).mag(),
            0,
            255
          )

          this.color.setAlpha(transp)
          this.p.fill(this.color)
          this.p.noStroke()
          this.p.ellipse(this.x, this.y, this.radius)
        }

        update() {
          let d = this.p.dist(this.x, this.y, canvasMouseX, canvasMouseY)
          if (d <= initSize / 20) {
            let maxm = initSize / 5
            let v = this.p.createVector(this.x - canvasMouseX, this.y - canvasMouseY)
            let m = this.p.map(v.mag(), 0, maxm, 1, 0)
            v.setMag(m)
            this.vx += v.x * 0.1
            this.vy += v.y * 0.1
          }

          this.x += this.vx
          this.y += this.vy
        }
      }

      class Point {
        constructor(p, x, y, radius, isStatic = false, dest) {
          this.p = p

          this.body = {
            position: {
              x: x,
              y: y
            }
          }

          this.vx = 0
          this.vy = 0

          let rand = p.random(1)
          if (rand < 0.1) {
            this.color = p.color("#fe2179")
          } else if (rand < 0.2) {
            this.color = p.color("white")
          } else if (rand < 0.3) {
            this.color = p.color("#fce345")
          } else {
            this.color = p.color("#37f79b")
          }
          this.color.setAlpha(255)
          this.radius = radius
          this.sx = x
          this.sy = y
          this.dest = dest
        }

        draw(layer) {
          this.p.fill(this.color)
          this.p.noStroke()
          var pos = this.body.position
          this.p.ellipse(pos.x, pos.y, this.radius)
        }

        update() {
          let d = this.p.dist(this.dest.x, this.dest.y, canvasMouseX, canvasMouseY)
          if (d <= initSize / 10) {
            let maxm = initSize / 5
            let v = this.p.createVector(
              this.body.position.x - canvasMouseX,
              this.body.position.y - canvasMouseY
            )
            let m = this.p.map(v.mag(), 0, maxm, 5, 0)
            v.setMag(m)
            this.vx = v.x
            this.vy = v.y
          } else if (d < initSize / 26) {
            this.vx = this.body.velocity.x * 0.6
            this.vy = this.body.velocity.y * 0.6
          } else {
            let dx = this.dest.x - this.body.position.x
            let dy = this.dest.y - this.body.position.y
            this.vx = 2 * dx / this.p.frameRate()
            this.vy = 2 * dy / this.p.frameRate()
          }

          this.body.position.x += this.vx
          this.body.position.y += this.vy
        }
      }

      function getDest() {
        let idx = p.int(p.random(gridPts.length - 1))

        let pt = gridPts.splice(idx, 1)[0]
        return {
          x: pt.x - initX / 2,
          y: pt.y - initY / 2
        }
      }
    }

    return sketch
  }
}
