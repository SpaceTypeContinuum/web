Vortex = {
  targetBg: "#000000",
  createSketch: function(divId) {
    let sketch = function(p) {
      let txt = "space"
      let font

      let txtCanvas
      let rowSize = 5

      let scale
      let magicWidth = 2392
      let magicHeight = 1333
      let initSize = 1333
      let magicFontSize = 355

      p.preload = function() {
        font = p.loadFont("assets/fonts/Raleway-Black.ttf")
      }

      p.setup = function() {
        let div = document.getElementById(divId)
        p.createCanvas(div.offsetWidth, div.clientHeight)
        txtCanvas = p.createGraphics(magicWidth, magicHeight)
        txtCanvas.textFont(font)
        p.textFont(font)
        scale = Math.min(p.width, p.height) / initSize
        refreshCanvas()
      }

      p.draw = function() {
        p.clear()
        p.translate(p.width / 2, p.height / 2)
        p.rotate((-Math.PI / 8) * (scale / 2))
        p.scale(-1, 1)
        p.scale(scale)

        for (let y = 0; y < p.height; y += rowSize) {
          let fakey = p.map(y, 0, p.height, 0, 1348)
          let wave = 10 * Math.sin(0.15 * fakey * 0.001 * p.frameCount)

          let sx = 0 + Math.floor(wave)
          let sy = fakey
          let dx = -magicWidth / 2
          let dy = -magicHeight / 2 + fakey

          let rot = p.radians(fakey * 0.003) / scale
          rot *= rowSize / 5
          p.rotate(rot)
          p.image(txtCanvas, dx, dy, magicWidth, rowSize, sx, sy, txtCanvas.width, rowSize * 6)
        }
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)

        scale = Math.min(p.width, p.height) / initSize
        lastWindowResize = p.millis()
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
