var $canv = $('#canv')[0]
$canv.width = 600
$canv.height = 400
$canv.style.backgroundColor = '#111'
var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'

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
var fish = {
  dir: 0, // radians
  size: 30,
  colors: [{col: randColor().rgb(), thick: 5},{col: randColor().rgb(), thick: 5}, {col: randColor().rgb(), thick: 5}],
  x: 300,
  y: 200,
  bodyColor: randCol.rgb(),
  bodyOutline: shadeColor(randCol, -20).rgb()
}

var last = Date.now()
var frame = 0

function draw(t) {
  requestAnimationFrame(draw)
  delta = t-last
  last = t

  ctx.clearRect(0, 0, 600, 400)

  // draw fish
  var o = Math.sin(frame/5)
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
  var sizeMax = size
  size -= size/4
  var colors = fish.colors
  var thicknessSum = colors.reduce(function(sum, color){
    return sum + color.thick
  }, 0)
  var width = colors.map(function normalize(color) {
    return color.thick / thicknessSum * size
  })

  for(var c = 0; c < colors.length; c++){
    ctx.beginPath()
    var col = colors[c].col
    var thick = width[c]
    for (var i = -1; i < 2; i += 2) {
      var start = {
        x: x + size,
        y: y
      }
      var c1 = {
        x: x + size * (14/15),
        y: y + i*size + sizeMax/30*o
      }
      var c2 = {
        x: x-size/2,
        y: y + i*size + sizeMax/30*o
      }
      var end = {
        x: x - size * 2.75 ,
        y: y + sizeMax/15*o
      }

      ctx.moveTo(start.x, start.y)
      ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y)
    }
    ctx.fillStyle = col
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
    size -= thick
  }

  //ctx.moveTo(x + size, y)
  //ctx.bezierCurveTo(x + size - 2, y - size + 1*o, x-size/2, y - size + 1*o, x - size*2, y - 10 + 2*o)
  //ctx.bezierCurveTo(x-size*2-20, y - 2 + 3*o,  x-size*2-33, y-8 - 2*o, x-size*2-38, y-3*o)

  // fill color
  /*ctx.moveTo(x + size/2, y)
  ctx.bezierCurveTo(x + size/2 - 2, y + size/2+ 1*o, x-size/2, y + size/2 + 1*o, x - size*1.5, y-1)
  ctx.moveTo(x + size/2, y)
  ctx.bezierCurveTo(x + size/2 - 2, y - size/2+ 1*o, x-size/2, y - size/2 + 1*o, x - size*1.5, y)

  // fill color 2
  ctx.moveTo(x + size/4, y)
  ctx.bezierCurveTo(x + size/4 - 2, y + size/4+ 1*o, x-size/2, y + size/4 + 1*o, x - size*0.75, y-1)
  ctx.moveTo(x + size/4, y)
  ctx.bezierCurveTo(x + size/4 - 2, y - size/4+ 1*o, x-size/2, y - size/4 + 1*o, x - size*0.75, y)*/

  //ctx.closePath()
  frame++
}

requestAnimationFrame(draw)
