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
  init()
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


var player = new Fish(false)
var fishes = [player]
var spawner = new Spawner($canv.width, $canv.height, player, fishes)
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
function debugSpawn(){
  fishes.push(new Fish(100,100,10 ))
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

var levelParticles = []
var levelBar = new LevelBar($canv.width)
var levelBalls = new LevelBalls($canv.width, $canv.height)
var levelBallParticles = []
var endGameParticles = []

// level debug
//levelBalls.addBall()
function levelUp(){
  for(var i=0;i<9;i++)
    levelBar.addColor()

  levelBar.colors.forEach(function(col){
  col.loaded = 1
  })
  levelBar.x = levelBar.targetX
  levelBar.addColor()
}
function levelUp2(){
  for(var i=0;i<9;i++){
    levelBalls.addBall()
    levelBalls.shift()
  }
  levelBalls.balls.forEach(function(b){b.size = b.targetSize})
  levelBalls.addBall()
}
//setTimeout(levelUp, 100)
//setTimeout(levelUp2, 100)
function draw(t) {
  requestAnimationFrame(draw)
  delta = t-last
  last = t

  // physics
  for(var i=0; i<fishes.length; i++) {
    fishes[i].physics()

    // if far enough away from player, remove

    if(distance(fishes[i], player) > Math.max($canv.width, $canv.height) * 2) {
      fishes[i].dead = true
    }
  }

  // enemy spawner
  spawner.update()

  // player score
  if(player.colors.length > 5 && player.colors.every(function(col){return col.loaded >= 1})) {

    // steal colors from player, create new particle blob, and add to top score
    //
    player.drawColors()
    var newParticles = player.toParticles(levelBar)

    // staticly position
    for(var i=0;i<newParticles.length;i++) {
      newParticles[i].x += -player.x + $canv.width/2
      newParticles[i].y += -player.y + $canv.height/2
    }

    levelParticles = levelParticles.concat(newParticles)
    var colors = player.colors.splice(1, player.colors.length)


    //var img = player.ctx.getImageData(0, 0, player.canv.width, player.canv.height)
    //ctx.putImageData(img, 0, 0)
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

  ctx.save()
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  ctx.fillStyle = '#111'
  ctx.fillRect(player.x - $canv.width/2, player.y - $canv.height/2, $canv.width, $canv.height)

  // draw
  for(var i=0; i<fishes.length; i++) {
    fishes[i].draw(ctx)
  }

  // enemy spawner debug
  spawner.debug()

  // draw level particles (static position)
  ctx.translate(player.x - $canv.width/2, player.y - $canv.height/2)
  var nextStage = levelBar.physics()
  if(nextStage) {
    levelBallParticles = levelBallParticles.concat(levelBar.toParticles(levelBalls))
    levelBalls.nextColors = levelBar.colors.slice(0, 2)

    // reset levelBar
    levelBar = new LevelBar($canv.width)
  }

  levelBar.draw(ctx)
  for(var i=levelParticles.length-1; i>=0; i--) {
    var dist = levelParticles[i].physics()
    levelParticles[i].draw(ctx)
    if (dist < 10) {
      levelParticles.splice(i, 1)
      if(!levelBar.updating) {
        levelBar.updating = true
        levelBar.addColor()
      }
      if(levelParticles.length === 0) {
        levelBar.updating = false
      }
    }
  }

  var nextStage = levelBalls.physics()
  if(nextStage) {
    endGameParticles = levelBalls.toParticles(player)

    // un-static position
    for(var i=0;i<endGameParticles.length;i++) {
      endGameParticles[i].x += player.x - $canv.width/2
      endGameParticles[i].y += player.y - $canv.height/2
    }

    levelBalls = new LevelBalls($canv.width, $canv.height)
  }
  levelBalls.draw(ctx)
  for(var i=levelBallParticles.length-1;i>=0;i--){
    var dist = levelBallParticles[i].physics()
    levelBallParticles[i].draw(ctx)
    if (dist < 10) {
      levelBallParticles.splice(i, 1)
      if(!levelBalls.updating) {
        levelBalls.updating = true
        levelBalls.addBall()
      }
      if(levelBallParticles.length === 0) {
        levelBalls.updating = false
        levelBalls.shift()
      }
    }
  }
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  for(var i=0;i<endGameParticles.length;i++) {
    endGameParticles[i].physics()
    endGameParticles[i].draw(ctx)
  }

  ctx.restore()
}

//fishes.push(new Fish(400,200,19))
//fishes.push(new Fish(300,300,10))
requestAnimationFrame(draw)
