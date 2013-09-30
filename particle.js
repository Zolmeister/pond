function Particle(x, y, color, targetFish, dir, r) {
  this.x = x || 0
  this.y = y || 0
  this.color = color || '#fff'
  this.target = targetFish
  this.dir = dir || 0
  this.r = r || 2
}
Particle.prototype.draw = function(ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color.rgb()
    ctx.arc(this.x, this.y, this.r*3, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.stroke()
}
