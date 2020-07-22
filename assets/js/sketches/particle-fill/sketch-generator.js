ParticleFill = {
  targetBg: "black",
  createSketch: function(divId) {
    let sketch = function(p) {
      let Engine = Matter.Engine;
      let World = Matter.World;
      let Body = Matter.Body;
      let Bodies = Matter.Bodies;

      let engine;
      let world;

      let drawShape = false

      let txt = "type"
      let fontSize = 0
      let font
      let points
      let scale = 1
      let pointRadius = 2
      let freeParticles = []

      let gridPts = []

      let bounds
      let textBounds

      let canvasMouseX
      let canvasMouseY
      
      p.preload = function() {
        font = p.loadFont('assets/fonts/Raleway-Black.ttf')
      }

      function ptDistance(p1, p2) {
        return dist(p1.body.position.x, p1.body.position.y, p2.body.position.x, p2.body.position.y)
      }

      let initSize
      let initX, initY
      let textLayer

      p.setup = function() {
        let div = document.getElementById(divId)
        let canvas = p.createCanvas(div.offsetWidth, div.clientHeight)

        textLayer = p.createGraphics(p.width, p.height)
        initSize = p.min(p.width, p.height)
        initX = p.width
        initY = p.height
        fontSize = initSize / 4
        textLayer.textFont(font)
        p.textFont(font)

        engine = Engine.create();
        world = engine.world;
        world.gravity.y = 0;

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
              break;
            }
          }

          let numPoints = (lastX - firstX / step)

          for (let i = 0; i < numPoints; i++) {
            let x = firstX + pointRadius + i*step
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
          let x = p.random(p.width) - initX/2
          let y = p.random(p.height) - initY/2
          let dest = getDest(x, y)
          freeParticles.push(new Point(p, x, y,
                                       p.random(pointRadius, pointRadius*2), false, "PT", dest))
        }
        gridPts = gridPtsCopy
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
        canvasMouseX = (p.mouseX - p.width/2)/scale
        canvasMouseY = (p.mouseY - p.height/2)/scale

        p.clear();
        Engine.update(engine)
        p.translate(p.width/2, p.height/2)
        p.scale(scale)

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

      p.windowResized = function () {
        let div = document.getElementById(divId)
        p.resizeCanvas(
          div.offsetWidth,
          div.clientHeight)
  
        scale = Math.min(p.width, p.height) / initSize
      }
  
      class Point {
        constructor(p, x, y, radius, isStatic = false, style = "LINE", dest) {
          this.p = p
          let density = 0.0001

          var options = {
            friction: 1.0,
            restitution: 0.95,
            isStatic,
            density,
            angle: p.random(2 * Math.PI)
          }

          this.body = Bodies.circle(x, y, radius / 2, options);
          this.color = p.color(0, 255, 255, p.random(100, 180))
          this.radius = radius
          this.style = style
          this.sx = x
          this.sy = y
          World.add(world, this.body);

          this.dest = dest
        }

        draw(layer) {
          this.p.fill(this.color)
          this.p.noStroke()
          var pos = this.body.position;
          this.p.ellipse(pos.x, pos.y, this.radius)
        }

        update() {
          let d = this.p.dist(this.dest.x, this.dest.y,
                              canvasMouseX, canvasMouseY)
          if (d <= initSize / 20) {
            let maxm = initSize / 5
            let v = this.p.createVector(
              this.body.position.x - canvasMouseX,
              this.body.position.y - canvasMouseY)
            let m = this.p.map(v.mag(), 0, maxm, 1, 0)
            v.setMag(m)
            Body.setVelocity(this.body, {
              x: v.x,
              y: v.y
            })
          } else if (d < initSize / 26) {
            Body.setVelocity(this.body, {
              x: this.body.velocity.x * 0.3,
              y: this.body.velocity.y * 0.3
            })
          } else {
            let dx = this.dest.x - this.body.position.x
            let dy = this.dest.y - this.body.position.y
            Body.setVelocity(this.body, {
              x: dx / 25,
              y: dy / 25
            });
          }
        }
      }

      // Really silly hacky way to select a grid location for every particle
      // that's somewhat close to them.
      function getDest(sx, sy) {
        let mx = p.map(sx, -initX/2, initX/2, textBounds.minX, textBounds.maxX)
        let my = p.map(sy, -initY/2, initY/2, textBounds.minY, textBounds.maxY)

        let possible = gridPts.filter(pt => {
          return (pt.x >= mx - 50 && pt.x <= mx + 50) &&
            (pt.y >= my - 50 && pt.y <= my + 50)
        })

        let idx
        if (possible.length === 0) {
          idx = p.int(p.random(gridPts.length - 1))
        } else {
          idx = gridPts.indexOf(p.random(possible))
        }

        let pt = gridPts.splice(idx, 1)[0]
        return {
          x: pt.x - initX/2,
          y: pt.y - initY/2
        }
      }
    }

    return sketch
  }
}
