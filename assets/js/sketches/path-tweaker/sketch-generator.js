PathTweaker = {
  targetBg: "#161616",
  createSketch: function(divId) {
    let sketch = function(p) {
      let txt = "SPACETYPE"
      let font
      let fontData
      let path

      let historyLayer
      let drawLayer
      let uiLayer

      let scale
      let initSize
      let fontSize
      let bounds

      // Thanks to Allison Parrish for this outline function that
      // we have mangled for our own nefarious purposes  = )
      function drawPathOutline(cmds, layer, curvesOnly = false) {
        // current pen position
        let cx = 0
        let cy = 0

        // start position of current contour
        let startX = 0
        let startY = 0
        let i = 0
        for (let cmd of cmds) {
          i += 1
          if (p.frameCount < i * 2) {
            break
          }
          switch (cmd.type) {
            case "M":
              startX = cmd.x
              startY = cmd.y
              cx = cmd.x
              cy = cmd.y
              break
            case "L":
              if (!curvesOnly) {
                layer.line(cx, cy, cmd.x, cmd.y)
              }
              cx = cmd.x
              cy = cmd.y
              break
            case "C":
              layer.bezier(
                cx,
                cy,
                cmd.x1 + cmd.animx1,
                cmd.y1,
                cmd.x2 - cmd.animx1,
                cmd.y2,
                cmd.x,
                cmd.y
              )
              cx = cmd.x
              cy = cmd.y
              break
            case "Q":
              layer.beginShape()
              layer.vertex(cx, cy)
              layer.quadraticVertex(cmd.x1 + cmd.animx1, cmd.y1, cmd.x, cmd.y)
              layer.endShape()
              cx = cmd.x
              cy = cmd.y
              break
            case "Z":
              // to complete path
              if (!curvesOnly) {
                layer.line(cx, cy, startX, startY)
              }
              break
          }
        }
      }

      p.preload = function() {
        fontData = p.loadBytes("assets/fonts/SpaceTypeSans-wide.otf")
      }

      p.setup = function() {
        let div = document.getElementById(divId)
        let canvas = p.createCanvas(div.offsetWidth, div.clientHeight)
        drawLayer = p.createGraphics(p.width, p.height)
        historyLayer = p.createGraphics(p.width, p.height)
        uiLayer = p.createGraphics(p.width, p.height)
        refreshCanvas()

        for (let seg of path.commands) {
          seg.offset = p.random(2 * Math.PI)
          seg.speed = p.random(0.005, 0.05)
        }
      }

      function closestSegment() {
        let closestSegment = null
        let closestDistance = Infinity
        let mousePt = {
          x: p.mouseX - p.width / 4,
          y: p.mouseY - (3 * p.height) / 4
        }

        for (let seg of path.commands) {
          if (!seg.x1) {
            continue
          }
          let handlePt = {
            x: seg.x1,
            y: seg.y1
          }

          let d = p.dist(mousePt.x, mousePt.y, handlePt.x, handlePt.y)
          if (d < closestDistance) {
            closestSegment = seg
            closestDistance = d
          }
        }

        return closestSegment
      }

      function moveHandle(segment) {
        if (p.mouseIsPressed) {
          segment.x1 = p.mouseX - p.width / 4
          segment.y1 = p.mouseY - (3 * p.height) / 4
        }
      }

      function drawSegment(seg, isMousedOver = true) {
        let handleX = seg.x1 + seg.animx1
        let handleY = seg.y1
        if (!handleX) {
          return
        }

        if (isMousedOver) {
          uiLayer.fill("#37f79b")
          uiLayer.stroke("#37f79b")
          uiLayer.strokeWeight(2)
        } else {
          uiLayer.fill("black")
          let color = p.color("#fce435")
          color.setAlpha(0.75)
          uiLayer.stroke(color)
          uiLayer.strokeWeight(2)
        }

        uiLayer.line(seg.x, seg.y, handleX, handleY)
        uiLayer.ellipse(handleX, handleY, 5)

        handleX = seg.x2 - seg.animx1
        handleY = seg.y2
        if (!handleX) {
          return
        }

        uiLayer.line(seg.x, seg.y, handleX, handleY)
        uiLayer.ellipse(handleX, handleY, 5)
      }

      function moveSegment(segment) {
        if (!segment.x1) {
          return
        }
        segment.animx1 = 100 * Math.sin(segment.offset + segment.speed * p.frameCount)
      }

      p.draw = function() {
        let mouseOverSegment = closestSegment()
        moveHandle(mouseOverSegment)

        for (let seg of path.commands) {
          moveSegment(seg)
        }

        p.clear()
        drawLayer.clear()
        drawLayer.noFill()
        drawLayer.stroke(255)
        drawLayer.strokeWeight(1)
        drawLayer.push()
        drawLayer.translate(p.width / 4, (3 * p.height) / 4)
        drawPathOutline(path.commands, drawLayer)
        drawLayer.pop()

        uiLayer.clear()
        uiLayer.push()
        uiLayer.translate(p.width / 4, (3 * p.height) / 4)
        drawSegment(mouseOverSegment)
        uiLayer.pop()

        p.image(historyLayer, 0, 0)
        p.image(drawLayer, 0, 0)
        p.image(uiLayer, 0, 0)
        historyLayer.noFill()
        historyLayer.stroke("white")
        historyLayer.push()
        historyLayer.translate(p.width / 4, (3 * p.height) / 4)
        drawPathOutline(path.commands, historyLayer, true)
        historyLayer.pop()
        historyLayer.blendMode(p.REMOVE)
        historyLayer.background("#4545FF11")
        historyLayer.blendMode(p.BLEND)
      }

      p.windowResized = function() {
        let div = document.getElementById(divId)
        p.resizeCanvas(div.offsetWidth, div.clientHeight)
        scale = Math.min(p.width, p.height) / initSize
      }

      function refreshCanvas() {
        initSize = Math.min(p.width, p.height)
        console.log(initSize)
        fontSize = (2 * initSize) / 3
        font = opentype.parse(fontData.bytes.buffer)
        path = font.getPath(txt, 0, 0, fontSize)
      }
    }
    return sketch
  }
}
