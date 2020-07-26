class BlobFillPoint {
  constructor(p, body, color, radius) {
    this.p = p
    this.color = color
    this.radius = radius
    this.body = body
  }

  draw(color, offsets) {
    this.p.fill(this.color)
    this.p.noStroke()
    var pos = this.body.position
    this.p.ellipse(pos.x - this.p.width / 2, pos.y - this.p.height / 2, this.radius)
  }
}
