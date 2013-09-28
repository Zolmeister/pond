function Fish(x, y, size, dir) {
  var randCol = randColor()

  this.canv = document.createElement('canvas')
  this.canv.width = $canv.width
  this.canv.height = $canv.height
  this.ctx = this.canv.getContext('2d')
  this.dir = dir || Math.PI/2 // radians
  this.targetDir = dir
  this.arcSpeed = 0.1
  this.size = size || 10

  // loaded percent is used for new colors that have been added and need to grow
  this.colors = [
    {col: randColor().rgb(), thick: 4, loaded: 1},
    {col: randColor().rgb(), thick: 5, loaded: 1},
    {col: randColor().rgb(), thick: 5, loaded: 1}
  ],
  this.x = x || 300
  this.y = y || 200
  this.dying = false // death animation
  this.dead = false // remove this entity
  this.deathParticles = []
  this.input = [] // keyboard input to dictate movement
  this.bodyColor = randCol.rgb()
  this.bodyOutline = shadeColor(randCol, -20).rgb()

  this.velocity = [0, 0]
  this.accel = [0, 0]
  this.maxSpeed = 2

  this.circles = [
    {
      x: this.size / 5,
      r: this.size * 11/14
    },
    {
      x: -this.size / 3,
      r: this.size * 12/15
    },
    {
      x: -this.size,
      r: this.size * 10/15
    },
    {
      x: -this.size * 1.6,
      r: this.size * 7/15
    },
    {
      x: -this.size * 2.2,
      r: this.size * 4/14
    },
    {
      x: -this.size * 2.6,
      r: this.size * 3/13
    },
    {
      x: -this.size * 2.8,
      r: this.size * 3/15
    }
  ]

  this.circleYOffsets = [
    this.size/40, this.size/30, this.size/20, this.size/15, this.size/12, this.size/30, this.size/30
  ]

}
Fish.prototype.draw = function(outputCtx, o) {
  if(this.dying) return this.drawDeath(outputCtx)
  var ctx = this.ctx
  ctx.clearRect(0, 0, this.canv.width, this.canv.height)
  o = o || 0
  var fish = this
  var x = fish.x
  var y = fish.y
  var size = fish.size

  // main body

  ctx.strokeStyle = fish.bodyOutline
  ctx.fillStyle = fish.bodyColor
  ctx.lineWidth = 5
  ctx.beginPath()
  for(var i = -1; i < 2; i+=2){
    var start = {
      x: x + size,
      y: y
    }
    var c1 = {
      x: x + size * (14/15),
      y: y + i*size + size/30*o
    }
    var c2 = {
      x: x - size/2,
      y: y + i*size + size/30*o
    }
    var end = {
      x: x - size*2,
      y: y + i*size/3 + size/15*o
    }
    ctx.moveTo(start.x, start.y)
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y)

    var c3 = {
      x: x - size * 2.5,
      y: y + i*size/6 + size/10*o
    }
    var c4 = {
      x: x - size*3,
      y: y + i*size/4 - size/15*o
    }
    var end2 = {
      x: x - size*3,
      y: y - size/15*o
    }
    ctx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, end2.x, end2.y)
  }
  ctx.stroke()
  ctx.fill()
  ctx.closePath()

  // inner colors
  ctx.strokeStyle='#000'
  ctx.lineWidth = 1

  var colorSize = size - size/4
  var colors = fish.colors
  var thicknessSum = colors.reduce(function(sum, color){
    return sum + color.thick * color.loaded
  }, 0)
  var width = colors.map(function normalize(color, i) {
    return color.thick / thicknessSum * colorSize
  })

  for(var c = 0; c < colors.length; c++){
    ctx.beginPath()
    var col = colors[c].col
    var thick = width[c]
    var percent = colors[c].loaded
    for (var i = -1; i < 2; i += 2) {
      var start = {
        x: x + colorSize,
        y: y
      }
      var c1 = {
        x: x + colorSize * (14/15),
        y: y + i*colorSize + size/30*o
      }
      var c2 = {
        x: x-colorSize/2,
        y: y + i*colorSize + size/30*o
      }
      var end = {
        x: x - colorSize * 2.75 ,
        y: y + size/15*o*percent
      }

      ctx.moveTo(start.x, start.y)
      ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y)
    }
    ctx.fillStyle = col
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // resize for next color drawn (outside -> in)
    colorSize -= thick //* (1+(1-(c+1<colors.length ? colors[c+1].loaded : 1)))
    if (colorSize < 0) break
  }


  // collision body
  ctx.strokeStyle = '#0f0'
  ctx.fillStyle = '#0f0'
  ctx.lineWidth  = 2
  ctx.beginPath()
  ctx.arc(x + size / 5  , y + size/40*o, size * (11/14), 0, 2 * Math.PI, false)
  ctx.arc(x - size / 3  , y + size/30*o, size * (12/15), 0, 2 * Math.PI, false)
  ctx.arc(x - size      , y + size/20*o, size * (10/15), 0, 2 * Math.PI, false)
  ctx.arc(x - size * 1.6, y + size/15*o, size * (7/15) , 0, 2 * Math.PI, false)
  ctx.arc(x - size * 2.2, y + size/12*o, size * (4/14) , 0, 2 * Math.PI, false)
  ctx.arc(x - size * 2.6, y + size/30*o, size * (3/13) , 0, 2 * Math.PI, false)
  ctx.arc(x - size * 2.8, y - size/30*o, size * (3/15) , 0, 2 * Math.PI, false)
  //ctx.fill()
  if (debug) {
    ctx.stroke()
  }
  ctx.closePath()

  outputCtx.save()
  outputCtx.translate(-this.x/2, -this.y/2)
  outputCtx.rotate(0.1)
  outputCtx.drawImage(this.canv, 0, 0)
  //outputCtx.translate(this.x, this.y)
  outputCtx.restore()

}
Fish.prototype.drawDeath = function(outputCtx) {
  var ctx = this.ctx
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 1
  ctx.clearRect(0, 0, this.canv.width, this.canv.height)
  for(var i=0;i<this.deathParticles.length;i++) {
    var p = this.deathParticles[i]
    ctx.beginPath()
    ctx.fillStyle = p.color
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.stroke()
  }
  outputCtx.drawImage(this.canv, 0, 0)
}
Fish.prototype.collide = function (fish, ossilation) {
  ossilation = ossilation || 0

  // the fish has been killed and is being removed
  if (this.dying || fish.dying) {
    return false
  }

  // there are 7 circles that make up the collision box of each fish
  // check if they collide
  for (var i=0;i<this.circles.length;i++) {
    var c1 = this.circles[i]
    var c1y = (this.circleYOffsets[i] + this.y) * ossilation
    for (var j=0;j<fish.circles.length;j++) {
      var c2 = fish.circles[j]
      var c2y = (fish.circleYOffsets[j] + fish.y) * ossilation

      // check if they touch
      if ( Math.pow((c2.x + fish.x) - (c1.x + this.x), 2) + Math.pow(c2y - c1y, 2) <= Math.pow(c2.r + c1.r, 2)) {
        return true
      }
    }
  }

  return false
}
Fish.prototype.kill = function(target) {
  this.dying = true
  var pixels = this.ctx.getImageData(0,0,this.canv.width, this.canv.height).data
  for(var i = 0; i < pixels.length; i += 36 ) {
    var r = pixels[i]
    var g = pixels[i + 1]
    var b = pixels[i + 2]

    // black pixel - no data
    if(!r && !g && !b){
      continue
    }

    var x = i/4 % this.canv.width
    var y = Math.floor(i/4 / this.canv.width)
    var col = 'rgb('+r+','+g+','+b+')'
    var dir = directionTowards({ x:x, y:y }, this)
    this.deathParticles.push(new Particle(x, y, col, target, Math.PI*Math.random()*2 - Math.PI, this.size/20))
  }
}
Fish.prototype.physics = function(){

  // grow inner colors
  for(var i=0;i<this.colors.length;i++) {
      if(this.colors[i].loaded < 1) {
          this.colors[i].loaded += 0.01
      }
  }

  // fish is now particles
  if(this.dying) {
    for(var i=this.deathParticles.length-1;i>=0;i--){
      var p = this.deathParticles[i]
      var targetDir = directionTowards(p.target, p)

      // this code makes the particles (mostly) end up at the target eventually
      var t1 = p.dir
      var t2 = targetDir
      var arcSpeed = 0.1
      if(t1-t2>0.2){
        if(t1>0 && t2<0){
          if(t1>t2+Math.PI){
            p.dir += arcSpeed
          } else {
            p.dir -= arcSpeed
          }
        } else {
          p.dir -= arcSpeed
        }
      } else if(t1-t2 <0.2) {
        if(t1<0&&t2>0){
          if(t1+Math.PI>t2){
            p.dir += arcSpeed
          } else {
            p.dir -= arcSpeed
          }
        } else{
          p.dir += arcSpeed
        }
      }

      var dir = p.dir
      var dist = distance(p.target, p)
      p.x+=Math.cos(dir) * 4 + (Math.random()*2 - 1) + Math.cos(dir) * (1/(dist+1))
      p.y+=Math.sin(dir) * 4 + (Math.random()*2 - 1) + Math.sin(dir) * (1/(dist+1))
      p.r = dist/50
      p.r = p.r<0?0:p.r
      if(dist < p.target.size/8+10) {
        this.deathParticles.splice(i,1)
        p.target.size+=0.01
      }
    }
    if (!this.deathParticles.length) {
        this.dead = true
    }
  } else {
    // update accel

    // movement

    // move dir to face towards target direction
    var t1 = this.dir
    var t2 = this.targetDir
    var arcSpeed = this.arcSpeed
    if(t1-t2>0.2){
      if(t1>0 && t2<0){
        if(t1>t2+Math.PI){
          this.dir += arcSpeed
        } else {
          this.dir -= arcSpeed
        }
      } else {
        this.dir -= arcSpeed
      }
    } else if(t1-t2 <0.2) {
      if(t1<0&&t2>0){
        if(t1+Math.PI>t2){
          this.dir += arcSpeed
        } else {
          this.dir -= arcSpeed
        }
      } else{
        this.dir += arcSpeed
      }
    }

    var root2 = Math.sqrt(2)
    //var velocity = this.velocity

    // update acceleration vector
    var pi = Math.PI
    var dirMap = {
      'up':         -pi/2,
      'right up':   pi/4,
      'right':      0,
      'down right': 7*pi/4,
      'down':       pi/2,
      'down left':  5*pi/4,
      'left':       pi,
      'left up':    3*pi/4
    }
    var inputDirection = this.input.slice(0,2).sort().join(' ')
    this.targetDir = dirMap[inputDirection]
    console.log(this.targetDir)

    var isInput = this.input.length > 0 ? 1 : 0
    this.accel = [Math.cos(this.dir) * isInput, Math.sin(this.dir) * isInput]

    // user is not applying input
    if(!this.accel) {
        this.accel = [0, 0]
    }

    // update velocity vector
    this.velocity[0] += this.accel[0]
    this.velocity[1] += this.accel[1]

    this.velocity[0] = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity[0]))
    this.velocity[1] = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity[1]))

    // apply friction
    if (this.velocity[0] > 0) {
      this.velocity[0] -= Math.min(0.2, this.velocity[0])
    }
    if (this.velocity[0] < 0) {
      this.velocity[0] -= Math.max(-0.2, this.velocity[0])
    }
    if (this.velocity[1] > 0) {
      this.velocity[1] -= Math.min(0.2, this.velocity[1])
    }
    if (this.velocity[1] < 0) {
      this.velocity[1] -= Math.max(-0.2, this.velocity[1])
    }

    // update position vector
    this.x += this.velocity[0]
    this.y += this.velocity[1]
  }
}
Fish.prototype.updateInput = function(input) {
  this.input = input
}
