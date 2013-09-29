var $canv = $('#canv')[0]
$canv.width = 600
$canv.height = 400
$canv.style.backgroundColor = '#111'
var mouseDown = false


var popSoundBuffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

loadPopSound('drop1.ogg')
function loadPopSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      popSoundBuffer = buffer;
    }, function(err){
      console.log(err)
    });
  }
  request.send();
}
ps = document.createElement('audio')
ps.src='drop1.ogg'
ps.volume = 0.8
ps2 = document.createElement('audio')
ps2.src='bg1.ogg'

ps2.loop = true
ps2.play()
function playSound(buffer) {
  source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}
function playPop() {
  //playSound(popSoundBuffer)
  ps.play()
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
var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug =  false //true

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
  ctx.clearRect(player.x - $canv.width/2, player.y - $canv.height/2, $canv.width, $canv.height)

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

  frame++
  ctx.restore()
}

fishes.push(new Fish(100,100,30))
fishes.push(new Fish(300,100,30))
requestAnimationFrame(draw)
