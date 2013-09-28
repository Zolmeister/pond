function Particle(x, y, color, targetFish, dir, r) {
  this.x = x || 0
  this.y = y || 0
  this.color = color || '#fff'
  this.target = targetFish
  this.dir = dir || 0
  this.r = r || 2
}
