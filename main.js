var $canv = $('#canv')[0]
$canv.width = 600
$canv.height = 400
$canv.style.backgroundColor = '#000'
var ctx = $canv.getContext('2d')
ctx.fillStyle='#fff'
ctx.strokeStyle='#0f0'
ctx.lineWidth = 3

var fish = {
  dir: 0, // radians
  size: 30,
  colors: ['#f00','#0f0', '#00f'],
  x: 300,
  y: 200
}

var last = Date.now()
var frame = 0
function draw(t) {
  requestAnimationFrame(draw)
  delta = t-last
  last = t

  ctx.clearRect(0, 0, 600, 400)
  // draw fish
  var x, y, size
  x = fish.x
  y = fish.y
  size = fish.size
  var o = Math.sin(frame/5)
  ctx.beginPath()
  ctx.moveTo(x + size, y)
  ctx.bezierCurveTo(x + size - 2, y + size+ 1*o, x-size/2, y + size + 1*o, x - size*2, y + 10 + 2*o)
  ctx.bezierCurveTo(x-size*2-20, y + 2 + 3*o,  x-size*2-33, y+8 - 2*o, x-size*2-38, y-1-3*o)

  ctx.moveTo(x + size, y)
  ctx.bezierCurveTo(x + size - 2, y - size+ 1*o, x-size/2, y - size + 1*o, x - size*2, y - 10 + 2*o)
  ctx.bezierCurveTo(x-size*2-20, y - 2 + 3*o,  x-size*2-33, y-8 - 2*o, x-size*2-38, y-3*o)


  //ctx.closePath()

  ctx.stroke()
  frame++
}

requestAnimationFrame(draw)

console.log("asd")
