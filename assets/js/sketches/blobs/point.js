class Point {
  constructor(p, x, y, body) {
    this.p = p
    this.color = "#37f79b"
    this.sx = x
    this.sy = y
    this.body = body
  }

  copy(x, y) {
    return new Point(this.p, x, y, this.body)
  }

  draw(color, offsets) {
    let ox = offsets ? offsets.x : 0
    let oy = offsets ? offsets.y : 0

    if (!color) {
      color = this.color
    }
    this.p.noStroke()
    this.p.fill(color)
    this.p.vertex(
      this.body.position.x - this.p.width / 2 + ox,
      this.body.position.y - this.p.height / 2 + oy
    )
  }

  update() {
    let d = this.p.dist(
      this.sx,
      this.sy,
      this.p.mouseX - this.p.width / 2,
      this.p.mouseY - this.p.height / 2
    )

    if (d <= Math.min(this.p.width, this.p.height) / 5) {
      this.updateMouseRepel()
    } else {
      this.updateGoToPosition()
    }
  }

  updateMouseRepel() {
    let v = this.p.createVector(
      this.body.position.x - this.p.mouseX,
      this.body.position.y - this.p.mouseY
    )

    v.setMag(3)

    Matter.Body.setVelocity(this.body, {
      x: v.x,
      y: v.y
    })
  }

  updateGoToPosition() {
    // Head to your letter spot
    let dx = this.sx + this.p.width / 2 - this.body.position.x
    let dy = this.sy + this.p.height / 2 - this.body.position.y

    Matter.Body.setVelocity(this.body, {
      x: dx / 5,
      y: dy / 5
    })
  }

  distanceTo(otherPt) {
    return this.p.dist(
      this.body.position.x,
      this.body.position.y,
      otherPt.body.position.x,
      otherPt.body.position.y
    )
  }
}
