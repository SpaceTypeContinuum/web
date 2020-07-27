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

      let adjustment

      p.setup = function() {
        let div = document.getElementById(divId)
        p.createCanvas(div.offsetWidth, div.clientHeight)
        txtCanvas = p.createGraphics(magicWidth, magicHeight)
        adjustment = p.height / 6
        drawCanvas = p.createGraphics((2 * p.width) / 2, (2 * p.height) / 2 + adjustment)
        txtCanvas.textFont(font)
        scale = Math.min(p.width, p.height) / initSize
        refreshCanvas()
      }

      p.draw = function() {
        p.clear()
        drawCanvas.clear()
        drawCanvas.push()
        drawCanvas.translate(0, -adjustment)

        if (p.width > p.height) {
          drawCanvas.translate(-p.width / 8, 0)
        }
        drawCanvas.translate(drawCanvas.width / 2, drawCanvas.height / 2)
        drawCanvas.translate((2 * drawCanvas.width) / 10, drawCanvas.height / 6)
        drawCanvas.rotate(-Math.PI / 4)
        drawCanvas.scale(-1, 1)
        drawCanvas.scale(scale)

        let spinOffset = drawCanvas.width < 720 ? -200 : 0

        for (let y = adjustment; y < drawCanvas.height; y += rowSize) {
          let fakey = p.map(y, adjustment, drawCanvas.height, 0, 1348)

          let maxWave = p.map(p.mouseX, 0, p.width, -150, 60)
          let wave = 880 + maxWave + 10 * Math.sin(0.15 * fakey * 0.00001 * p.millis())

          let sx = 0 + Math.floor(wave)
          let sy = fakey
          let dx = -magicWidth / 2
          let dy = -magicHeight / 2 + fakey

          let rot = p.radians(0.001 * (spinOffset + p.frameCount) + fakey * 0.0012) / scale
          rot *= rowSize / 5
          drawCanvas.rotate(rot)
          drawCanvas.image(
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

        drawCanvas.pop()

        p.translate(0, 0)
        p.image(
          drawCanvas,
          0,
          0,
          p.width,
          drawCanvas.height,
          0,
          adjustment,
          drawCanvas.width,
          p.height
        )
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)
        adjustment = p.height / 6
        drawCanvas.resizeCanvas(p.width, p.height + adjustment)
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
    }
    return sketch
  }
}
