var $canv = $('#canv')[0]
$canv.width = window.innerWidth
$canv.height = window.innerHeight

var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug =  false //true

window.onresize = function() {
  ctx = $canv.getContext('2d')
  $canv.width = $('#canv').width()
  $canv.height = $('#canv').height()
}

var mouseDown = false

var muted = false
popSound = document.createElement('audio')
popSound.src='drop1.ogg'
popSound.volume = 0.8
bgRainSound = document.createElement('audio')
bgRainSound.src='bg1.ogg'
bgRainSound.loop = true
bgRainSound.play()
if(localStorage.muted === 'true') toggleMute()
$('.sound').bind('click', toggleMute)
function toggleMute(){
  if(!muted) {
    popSound.volume = 0
    bgRainSound.volume = 0
    muted = true
    $('.sound').html('&#9834;')
    localStorage.muted = 'true'
  } else {
    popSound.volume = 0.8
    bgRainSound.volume = 1
    muted = false
    $('.sound').html('&#9835;')
    localStorage.muted = 'false'
  }
}

function playPop() {
  popSound.play()
}

$canv.onmousedown = function(e){
  player.updateInput([e.clientX - $canv.width/2, e.clientY - $canv.height/2], true)
  mouseDown = true
}

$canv.onmouseup = function(e) {
  player.updateInput([], true)
  mouseDown = false
}

$canv.onmousemove = function(e) {
  if(mouseDown) {
    player.updateInput([e.clientX - $canv.width/2, e.clientY - $canv.height/2], true)
  }
}


               // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()


var player = new Fish()
var fishes = [player]
var last = Date.now()
var frame = 0

var userInput = []
var pi = Math.PI

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
  if(userInput.indexOf(k)!=-1) {
    userInput.splice(userInput.indexOf(k), 1)
  }

  // add to front of input list
  userInput.unshift(k)

  player.updateInput(userInput, false)
}

window.onkeyup = function(e) {
  var k = keymap[e.which]
  if (!k) return

  // remove from input list if it was there already
  if(userInput.indexOf(k)!=-1) {
    userInput.splice(userInput.indexOf(k), 1)
  }

  player.updateInput(userInput, false)
}


function draw(t) {
  ctx.save()
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  requestAnimationFrame(draw)
  delta = t-last
  last = t
  ctx.fillStyle = '#111'
  ctx.fillRect(player.x - $canv.width/2, player.y - $canv.height/2, $canv.width, $canv.height)

  var ossilation = Math.sin(frame/5)

  // physics
  for(var i=0; i<fishes.length; i++) {
    fishes[i].physics(ossilation)
  }

  // collision
  for(var i=0; i<fishes.length; i++) {
    var fish = fishes[i]
    for(var j=i+1; j<fishes.length; j++) {
      var fish2 = fishes[j]
      if(fish.collide(fish2)) {
        if(fish.size >= fish2.size){
          fish2.killedBy(fish)
        } else {
          fish.killedBy(fish2)
        }
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

  frame++
  ctx.restore()
}

fishes.push(new Fish(100,100,19))
fishes.push(new Fish(300,100,10))
requestAnimationFrame(draw)
