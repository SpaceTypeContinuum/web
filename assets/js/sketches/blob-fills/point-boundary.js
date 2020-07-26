class PointBoundary {
  constructor(p, x, y, body) {
    this.p = p
    this.dx = x + p.width / 2
    this.dy = y + p.height / 2
    this.body = body
  }

  update() {
    let cx = this.dx - this.body.position.x
    let cy = this.dy - this.body.position.y

    if (this.p.millis() % 10000 >= 5000) {
      Matter.Body.setVelocity(this.body, {
        x: cx / 100,
        y: cy / 100
      })
    }
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
