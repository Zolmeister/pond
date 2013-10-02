function LevelBalls(width, height) {
  this.balls = []
  this.nextColors = Array.apply([], new Array(2)).map(function(){ return {col: randColor()}})
  this.ballRadius = 15
  this.maxWidth = width
  this.maxHeight = height
  this.width = this.maxWidth
  this.height = this.ballRadius * 2
  this.x = this.ballRadius * 2
  this.y = this.maxHeight - this.ballRadius*2
  this.updating = false
  this.canv = document.createElement('canvas')
  this.canv.width = this.maxWidth
  this.canv.height = this.ballRadius * 2
  this.ctx = this.canv.getContext('2d')
}
LevelBalls.prototype.resize = function(width, height) {
  this.maxWidth = width
  this.maxHeight = height
  this.width = this.maxWidth
  this.height = this.ballRadius * 2
  this.y = this.height - this.ballRadius * 2
  this.canv.width = this.maxWidth
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  for(var i=0;i<this.balls.length;i++){
    this.balls[i].y = this.height - this.ballRadius*2 - 20
  }
}
LevelBalls.prototype.draw = function(outputCtx) {
  this.ctx.clearRect(0, 0, this.canv.width, this.canv.height)
  for(var i=0;i<this.balls.length;i++) {
    this.balls[i].draw(this.ctx)
  }
  outputCtx.drawImage(this.canv, 0, this.y)
}
LevelBalls.prototype.physics = function() {
  var cnt = 0
  for(var i=0;i<this.balls.length;i++) {
    cnt += this.balls[i].physics() ? 1 : 0
  }
  return cnt === 10
}
LevelBalls.prototype.toParticles = function(target) {
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
    particles.push(new Particle(x, this.y + y, col, target, dir, 2, 4, 0.08))
  }
  return particles
}
LevelBalls.prototype.shift = function() {
  this.x += this.width/13 + this.ballRadius
}

LevelBalls.prototype.addBall = function() {
  var colors =  this.nextColors
  this.balls.push(new LevelBall(this.x, this.ballRadius, colors, this.ballRadius))
}

function LevelBall(x, y, colors, r) {
  this.x = x || 0
  this.y = y || 0
  this.colors = colors || []
  this.size = 1
  this.targetSize = r || 10
}
LevelBall.prototype.draw = function(ctx) {
  var width = 10

  /*ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = -5*/
  //ctx.fillRect(this.x, this.y, 100, 100)
  for(var i=this.colors.length-1;i>=0;i--) {
    var color = this.colors[i]
    ctx.fillStyle = color.col.rgb()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size/2*(i+1), 0, Math.PI*2)
    ctx.closePath()
    ctx.fill()
  }


  //ctx.restore()
}
LevelBall.prototype.physics = function() {
  if(this.size < this.targetSize) {
    this.size += 0.2
  }
  if(this.size >= this.targetSize) return true
  return false
}
