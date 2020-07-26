Vortex = {
  targetBg: "#161616",
  createSketch: function(divId) {
    let sketch = function(p) {
      let txt = "SPACE  TYPE"
      let font

      let txtCanvas
      let drawCanvas
      let rowSize = 5

      let scale
      let magicWidth = 2392
      let magicHeight = 1333
      let initSize = 1600
      let magicFontSize = 355

      p.preload = function() {
        font = p.loadFont("assets/fonts/SpaceTypeSans-wide.otf")
      }

      p.setup = function() {
        let div = document.getElementById(divId)
        p.createCanvas(div.offsetWidth, div.clientHeight)
        txtCanvas = p.createGraphics(magicWidth, magicHeight)
        drawCanvas = p.createGraphics(p.width, p.height)
        txtCanvas.textFont(font)
        p.textFont(font)
        scale = Math.min(p.width, p.height) / initSize
        refreshCanvas()
      }

      p.draw = function() {
        p.clear()
        p.translate(p.width / 2, p.height / 2)
        p.translate((2 * p.width) / 10, p.height / 6)
        p.rotate(-Math.PI / 2)
        p.scale(-1, 1)
        p.scale(scale)

        let spinOffset = p.width < 720 ? -200 : 0

        for (let y = 0; y < p.height; y += rowSize) {
          let fakey = p.map(y, 0, p.height, 0, 1348)

          let maxWave = p.map(p.mouseX, 0, p.width, -150, 60)
          let wave = 880 + maxWave + 10 * Math.sin(0.15 * fakey * 0.001 * p.frameCount)

          let sx = 0 + Math.floor(wave)
          let sy = fakey
          let dx = -magicWidth / 2
          let dy = -magicHeight / 2 + fakey

          let rot = p.radians(0.001 * (spinOffset + p.frameCount) + fakey * 0.0012) / scale
          rot *= rowSize / 5
          p.rotate(rot)
          p.image(
            txtCanvas,
            dx,
            dy,
            magicWidth * 2.5,
            rowSize,
            sx,
            sy,
            txtCanvas.width,
            rowSize * 6
          )
        }
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)
        drawCanvas.resizeCanvas(p.width, p.height)

        scale = Math.min(p.width, p.height) / initSize
      }

      function refreshCanvas() {
        let bounds = font.textBounds(txt, 0, 0, magicFontSize)

        txtCanvas.clear()
        txtCanvas.fill("white")
        txtCanvas.textSize(magicFontSize)
        txtCanvas.text(
          txt,
          magicWidth / 2 - bounds.x - bounds.w / 2,
          magicHeight / 2 - bounds.y - bounds.h / 2
        )
      }

      function drawShape(color, offsets) {
        p.beginShape()

        let prevPt = points1[0]
        let inContour = false
        for (let pt of points1) {
          let d = p.dist(prevPt.x, prevPt.y, pt.x, pt.y)
          if (d > 20) {
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
    }
    return sketch
  }
}
