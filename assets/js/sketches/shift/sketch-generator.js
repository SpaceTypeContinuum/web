Shift = {
  targetBg: "#363636",
  createSketch: function(divId) {
    let sketch = function(p) {
      let lastWindowResize
      let scale = 1
      let initSize

      let txt1 = "SPACE"
      let txt2 = "TYPE"
      let fontSize = 0

      let font
      let points1, points2
      let bounds

      let leftPortal
      let rightPortal
      let charBoundaries

      p.preload = function() {
        font = p.loadFont("assets/fonts/SpaceTypeSans-wide.otf")
      }

      p.setup = function() {
        let div = document.getElementById(divId)
        p.createCanvas(div.offsetWidth, div.clientHeight)
        p.textFont(font)
        refreshPoints()
      }

      p.draw = function() {
        if (lastWindowResize && p.millis() - lastWindowResize > 200) {
          refreshPoints()
          lastWindowResize = null
        }

        p.clear()
        p.translate(p.width / 2, p.height / 2)
        p.scale(scale)
        p.noStroke()
        drawShape()
        p.stroke("red")
        p.line(leftPortal, -p.height / 2, leftPortal, p.height / 2)
        p.line(rightPortal, -p.height / 2, rightPortal, p.height / 2)

        for (let pt of points1) {
          if (pt.x < rightPortal && pt.x > leftPortal) {
            if (pt.vx > 0) {
              pt.x = rightPortal
            } else {
              pt.x = leftPortal
            }
          }
          pt.x += pt.vx
        }
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)

        scale = Math.min(p.width, p.height) / initSize
        lastWindowResize = p.millis()
      }

      function refreshPoints() {
        let oldFontSize = fontSize

        initSize = Math.min(p.width, p.height)
        fontSize = initSize / 6
        scale = 1

        leftPortal = (-1 * p.width) / 8
        rightPortal = (1 * p.width) / 8

        if (oldFontSize !== fontSize) {
          bounds = font.textBounds(txt1, 0, 0, fontSize)

          points1 = font
            .textToPoints(txt1, 0, 0, fontSize, {
              sampleFactor: 0.2
            })
            .map(centerAndNormalizePt)
            .map(pt => {
              return {
                ...pt,
                x: pt.x - (2 * p.width) / 8,
                vx: 2
              }
            })

          bounds = font.textBounds(txt2, 0, 0, fontSize)

          points2 = font
            .textToPoints(txt2, 0, 0, fontSize, {
              sampleFactor: 0.2
            })
            .map(centerAndNormalizePt)

          charBoundaries = getCharacterBoundaries({ text: txt1, font, fontSize })
        }
      }

      function drawShape(color, offsets) {
        p.beginShape()

        let prevPt = points1[0]
        let inContour = false
        for (let i = 0; i < points1.length; i++) {
          let pt = points1[i]

          if (charBoundaries.includes(i)) {
            if (inContour) {
              p.endContour()
            }
            p.beginContour()
            inContour = true
          }

          p.vertex(pt.x, pt.y)
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
    }
    return sketch
  }
}
