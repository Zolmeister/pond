var $canv = $('#canv')[0]
$canv.width = 600
$canv.height = 400
$canv.style.backgroundColor = '#111'
var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug = false //true

function choice(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}
               // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()
function randColor() {

  do {
    var color = choice(pallet)
    var col = new Color(color[0], color[1], color[2])
  } while (lastColor.equals(col))
  lastColor = col

  return col

  var r = 0
  var g = 86
  var b = 255
  var offset = 100
  var value = (r + g + b) / 3
  var newVal = value + 2*Math.random()*offset-offset
  var ratio = newVal / value

  return rgbToHex(r * ratio, g * ratio, b * ratio)
}

function Color(r, g, b) {
  this.r = r
  this.g = g
  this.b = b
}

Color.prototype.rgb = function() {
  return 'rgb(' + this.r + ',' +this.g + ',' +this.b+ ')'
}

Color.prototype.equals = function(col) {
  return col.r === this.r && col.g === this.g && col.b === this.b
}

function shadeColor(col, percent) {
  var shade = Math.round(2.55 * percent)
  return new Color(col.r + shade, col.g + shade, col.b + shade)
}

var randCol = randColor()
function Fish(x, y, size, dir) {
  this.canv = document.createElement('canvas')
  this.canv.width = $canv.width
  this.canv.height = $canv.height
  this.ctx = this.canv.getContext('2d')
  this.dir = dir || 0 // radians
  this.size = size || 40

  // loaded percent is used for new colors that have been added and need to grow
  this.colors = [
    {col: randColor().rgb(), thick: 4, loaded: 1},
    {col: randColor().rgb(), thick: 5, loaded: 1},
    {col: randColor().rgb(), thick: 5, loaded: 1}
  ],
  this.x = x || 300
  this.y = y || 200
  this.dying = false
  this.deathParticles = []
  this.bodyColor = randCol.rgb()
  this.bodyOutline = shadeColor(randCol, -20).rgb()
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
  outputCtx.drawImage(this.canv, 0, 0)
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
  for(var i = 0; i < pixels.length; i += 36) {
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
function directionTowards(a, b) {
  return Math.atan2( a.y-b.y, a.x-b.x)
}
function Particle(x, y, color, targetFish, dir, r) {
  this.x = x || 0
  this.y = y || 0
  this.color = color || '#fff'
  this.target = targetFish
  this.dir = dir || 0
  this.r = r || 2
}
var fish = new Fish()
var fish2 = new Fish(200, 200)
var fishes = [fish, fish2]
var last = Date.now()
var frame = 0
function distance(a, b) {
  return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2))
}
function draw(t) {
  requestAnimationFrame(draw)
  delta = t-last
  last = t

  ctx.clearRect(0, 0, 600, 400)

  // draw fish
  var ossilation = Math.sin(frame/5)
  fishes[1].x++
  if (fishes[1].x > 200){
    fishes[1].x = 0
  }

  for(var i=0;i<fishes[0].colors.length;i++) {
    var color = fishes[0].colors[i]
    if (color.loaded < 1) {
      color.loaded += 0.01
    }
  }
  if(fishes[1].dying) {
    for(var i=fishes[1].deathParticles.length-1;i>=0;i--){
      var p = fishes[1].deathParticles[i]
      var targetDir = directionTowards(p.target, p)
      if(Math.abs(p.dir - targetDir) > 0.3) {
        if(p.dir < targetDir){
          p.dir += 0.1
        } else {
          p.dir -= 0.1
        }
      }
      var dir = p.dir
      var dist = distance(p.target, p)//Math.pow(distance(p.target, p)/1000, 8)
      p.x+=Math.cos(dir) * 4 + (Math.random()*4 - 2) + Math.cos(dir) * (1/(dist+1))
      p.y+=Math.sin(dir) * 4 + (Math.random()*4 - 2) + Math.sin(dir) * (1/(dist+1))
      p.r = dist/50
      p.r = p.r<0?0:p.r
      if(dist < 4) {
        fishes[1].deathParticles.splice(i,1)
      }
    }
  }

  for(var i=0; i<fishes.length; i++) {
    var fish = fishes[i]
    for(var j=i+1; j<fishes.length; j++) {
      var fish2 = fishes[j]
      if(fish.collide(fish2, ossilation)) {
        //console.log('COLLISION')
        //console.log('ressetting')

        /*fish.colors = fish.colors.concat(fish2.colors.map(function(col){
          col.loaded = 0.0
          return col
        }))*/

        //fishes[j].size-=0.3 //= new Fish(0, 200)
        //fishes[j].size = fishes[j].size < 0 ? 0 : fishes[j].size
        //fishes[j].dying = true
        //fishes[j].x=0
        fish2.kill(fish)
      }
    }
  }

  for(var i=0; i<fishes.length; i++) {
    fishes[i].draw(ctx, ossilation)
  }

  frame++
}

requestAnimationFrame(draw)
