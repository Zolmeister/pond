function LevelBalls(width) {
  this.balls = []
  this.nextColors = Array.apply([], new Array(10)).map(function(){ return {col: randColor()}})
  this.width = width
  this.x = this.width/12
  this.y = 20
  this.height = 20
  this.updating = false
  this.canv = document.createElement('canvas')
  this.canv.width = width
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
}
LevelBalls.prototype.draw = function(outputCtx) {
  for(var i=0;i<this.balls.length;i++) {
    this.balls[i].draw(this.ctx, this.canv, outputCtx)
  }
}
LevelBalls.prototype.physics = function() {
  for(var i=0;i<this.balls.length;i++) {
    this.balls[i].physics()
  }
}


LevelBalls.prototype.addBall = function(){
  var colors =  this.nextColors
  this.balls.push(new LevelBall(this.x, this.y, colors))
  this.x += this.width/12
}

function LevelBall(x, y, colors) {
  this.x = x || 0
  this.y = y || 0
  this.colors = colors || []
  this.size = 0
  this.targetSize = 10
}
LevelBall.prototype.draw = function(ctx, canv, outputCtx) {
  var width = 10

  /*ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = -5*/
  for(var i=0;i<this.colors.length;i++) {
    var color = this.colors[i]
    ctx.fillStyle = color.col.rgb()
    ctx.arc(this.x, this.y, 10, 0, Math.PI*2)
  }
  //ctx.restore()
  outputCtx.drawImage(canv, 0, 0)

}
LevelBall.prototype.physics = function() {
    if(this.size < this.targetSize) {
      this.size += 0.1
    }
}
