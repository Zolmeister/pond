function LevelBar(width) {
  // [{col: new Color(100, 20, 100), loaded: 1}, {col: new Color(10,20, 100), loaded: 0.5}]
  this.colors = []
  this.height = 5
  this.canv = document.createElement('canvas')
  this.canv.width = width
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  this.percent = 0
  this.x = this.canv.width * this.percent
  this.targetX = this.x
  this.y = 0

  this.updating = false
}
LevelBar.prototype.toParticles = function(target) {
  var particles = []

  var pixels = this.ctx.getImageData(0,0,this.canv.width, this.canv.height).data
  for(var i = 0; i < pixels.length; i += 36*10) {
    var r = pixels[i]
    var g = pixels[i + 1]
    var b = pixels[i + 2]

    // black pixel - no data
    if(!r && !g && !b){
      continue
    }

    var x = i/4 % this.canv.width
    var y = Math.floor(i/4 / this.canv.width) + Math.random() * 2 + 2
    var col = new Color(r, g, b)
    var dir = directionTowards(target, {x: x, y: y})
    particles.push(new Particle(x, y, col, target, dir, 2, 10, 0.6))
  }
  return particles
}
LevelBar.prototype.addColor = function() {
  var color = randColor(this.colors[this.colors.length-1])
  this.colors.push({col: color, loaded: 0})
  this.percent += 0.1
  this.targetX = this.canv.width * this.percent
}
LevelBar.prototype.physics = function() {
  if(this.x < this.targetX) {
    this.x += 1
  }
  for(var i=0;i<this.colors.length;i++) {
    if(this.colors[i].loaded < 1) {
      this.colors[i].loaded += 0.012
    }
  }
  var loadedSum = this.colors.reduce(function sumLoaded(sum, col){
    return sum + col.loaded
  }, 0)

  if(loadedSum >= 10) {
    // create orb
    return true
  }
  return false
}
LevelBar.prototype.draw = function(outputCtx) {
  var ctx = this.ctx
  if(!this.colors.length) return
  var widthSum = this.colors.reduce(function(sum, color){
    return sum + color.loaded
  }, 0)
  var totalWidth = this.x
  var widths = this.colors.map(function normalize(color, i) {
    return color.loaded / widthSum * totalWidth
  })

  var x = 0
  //ctx.strokeStyle = 'rgba(0, 0, 0, 0)'
  //ctx.lineWidth = 1
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = -5
  ctx.shadowOffsetX = -5
  for(var i=0;i<this.colors.length;i++) {
    var color = this.colors[i]
    ctx.fillStyle = color.col.rgb()
    ctx.fillRect(x, this.y, widths[i], this.height)
    //ctx.strokeRect(x, this.y, widths[i], this.height)
    x += widths[i]
  }
  ctx.restore()
  outputCtx.drawImage(this.canv, 0, 0)
}
