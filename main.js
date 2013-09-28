var $canv = $('#canv')[0]
$canv.width = 600
$canv.height = 400
$canv.style.backgroundColor = '#111'
var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug = false //true

               // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()


var player = new Fish()
var fishes = [player]
var last = Date.now()
var frame = 0

var input = []
var keymap = {
  38: 'up',
  39: 'right',
  40: 'down',
  37: 'left',
  87: 'up',
  68: 'right',
  83: 'down',
  65: 'left'
}

window.onkeydown = function(e){
  var k = keymap[e.which]
  if (!k) return

  // remove from input list if it was there already
  if(input.indexOf(k)!=-1) {
    input.splice(input.indexOf(k), 1)
  }

  // add to front of input list
  input.unshift(k)
  console.log(input)

  player.updateInput(input)
}

window.onkeyup = function(e) {
  var k = keymap[e.which]
  if (!k) return

  // remove from input list if it was there already
  if(input.indexOf(k)!=-1) {
    input.splice(input.indexOf(k), 1)
  }

  player.updateInput(input)
}


function draw(t) {
  requestAnimationFrame(draw)
  delta = t-last
  last = t
  ctx.clearRect(0, 0, 600, 400)

  var ossilation = Math.sin(frame/5)

  // physics
  for(var i=0; i<fishes.length; i++) {
    fishes[i].physics()
  }

  // collision
  for(var i=0; i<fishes.length; i++) {
    var fish = fishes[i]
    for(var j=i+1; j<fishes.length; j++) {
      var fish2 = fishes[j]
      if(fish.collide(fish2, ossilation)) {
        fish2.kill(fish)
      }
    }
  }

  // cleanup dead fish
  for(var i=fishes.length-1;i>=0;i--) {
    if(fishes[i].dead) {
      fishes.splice(i, 1)
    }
  }

  // draw
  for(var i=0; i<fishes.length; i++) {
    fishes[i].draw(ctx, ossilation)
  }

  /*if(debug){
    ctx.beginPath()
    ctx.fillStyle = '#000'
    ctx.arc(fishes[0].x,fishes[0].y, fishes[0].size/8+10, 0, Math.PI*2, false)
    ctx.fill()
  }*/

  frame++
}

//fishes.push(new Fish(100,100,40))
requestAnimationFrame(draw)
