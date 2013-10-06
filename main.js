var $canv = $('#canv')[0]
$canv.width = window.innerWidth
$canv.height = window.innerHeight
var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug =  false //true
// color pallet // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()
var GAME = {}

if(debug){
  var stats = new Stats()
  document.body.appendChild(stats.domElement)
}

function init() {
  GAME.state = 'playing'
  GAME.player = new Fish(false)
  GAME.fishes = [GAME.player]
  GAME.spawner = new Spawner($canv.width, $canv.height, GAME.player, GAME.fishes)
  GAME.levelParticles = []
  GAME.levelBar = new LevelBar($canv.width)
  GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
  GAME.levelBallParticles = []
  GAME.endGameParticles = []
  requestAnimFrame(draw)
}

// game loop
var MS_PER_UPDATE = 16
var previousTime = 0.0
var lag = 0.0
function draw(time) {
  var i, l, j, dist, nextStage, fish, fish2
  lag += time - previousTime
  previousTime = time
  requestAnimFrame(draw)

  var player = GAME.player
  var fishes = GAME.fishes
  var spawner = GAME.spawner
  var levelParticles = GAME.levelParticles
  var levelBar = GAME.levelBar
  var levelBalls = GAME.levelBalls
  var levelBallParticles = GAME.levelBallParticles
  var endGameParticles = GAME.endGameParticles

  if(debug) stats.begin()
  while(lag >= MS_PER_UPDATE) {
    physics()
    lag -= MS_PER_UPDATE
  }

  paint()
  if(debug) stats.end()

  function physics() {
    levelBarPhysics()
    levelBallPhysics()
    endGameParticlePhysics()
    // enemy spawner
    spawner.update()
    // enemy spawner debug
    if(debug) spawner.debug()
    fishPhysics()
    playerScore()
  }

  function paint() {
    // clear and draw background
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, $canv.width, $canv.height)

    // static position objects
    levelBar.draw(ctx)
    paintLevelParticles()
    paintLevelBallParticles()
    levelBalls.draw(ctx)

    // dynamic position objects
    ctx.save()
    ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
    paintEndGameParticles()
    paintFish()
    ctx.restore()
  }

  function levelBarPhysics() {
    // levelBar level up
    nextStage = levelBar.physics()
    if(nextStage) {
      GAME.levelBallParticles = levelBallParticles.concat(levelBar.toParticles(levelBalls))
      levelBalls.nextColors = levelBar.colors.slice(0, 2)

      // reset levelBar
      GAME.levelBar = new LevelBar($canv.width)
    }

    // levelBar Particles physics
    i = levelParticles.length
    while(i-- > 0) {
      dist = levelParticles[i].physics()
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
  }

  function levelBallPhysics() {
    // levelBalls level up
    nextStage = levelBalls.physics()
    if(nextStage) {
      GAME.endGameParticles = levelBalls.toParticles(player)

      // un-static position
      for(i=0;i<GAME.endGameParticles.length;i++) {
        GAME.endGameParticles[i].x += player.x - $canv.width/2
        GAME.endGameParticles[i].y += player.y - $canv.height/2
      }

      GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
    }

    i = levelBallParticles.length
    while(i-- > 0) {
      dist = levelBallParticles[i].physics()
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
  }

  function endGameParticlePhysics() {
    for(i = -1, l = endGameParticles.length; ++i < l;) {
      endGameParticles[i].physics()
    }
  }

  function fishPhysics() {
    // physics and drawing
    i = fishes.length
    while(i-- > 0) {
      // cleanup dead fish - in here for performance
      if(fishes[i].dead) {
        fishes.splice(i, 1)
        continue
      }


      fish = fishes[i]
      if(Math.abs(fish.x - player.x) < $canv.width && Math.abs(fish.y - player.y) < $canv.height) {
        fish.physics()

        // collision - in here for performance
        j=i
        while (j-- > 0) {
          fish2 = fishes[j]
          if(Math.abs(fish2.x - player.x) < $canv.width && Math.abs(fish2.y - player.y) < $canv.height) {
            if(fish.collide(fish2)) {
              if(fish.size >= fish2.size){
                fish2.killedBy(fish)
              } else {
                fish.killedBy(fish2)
              }
            }
          }
        }
      }

      // if far enough away from player, remove

      if(distance(fish, player) > Math.max($canv.width, $canv.height) * 2) {
        fish.dead = true
      }

    }
  }

  function playerScore() {

    // player score
    if(player.colors.length > 4 /*&& player.colors.every(function(col){return col.loaded >= 1})*/) {

      // steal colors from player
      player.drawColors()
      var newParticles = player.toParticles(levelBar)

      // staticly position
      for(i=0;i<newParticles.length;i++) {
        newParticles[i].x += -player.x + $canv.width/2
        newParticles[i].y += -player.y + $canv.height/2
      }

      GAME.levelParticles = levelParticles.concat(newParticles)
      var colors = player.colors.splice(0, 4)

    }
  }

  function paintLevelParticles() {
    for(i = -1, l = levelParticles.length; ++i < l;) {
      levelParticles[i].draw(ctx) // iterate levelParticles
    }
  }

  function paintLevelBallParticles() {
    for(i = -1, l = levelBallParticles.length; ++i < l;) {
      levelBallParticles[i].draw(ctx)
    }
  }

  function paintEndGameParticles() {
    for(i = -1, l = endGameParticles.length; ++i < l;) {
        endGameParticles[i].draw(ctx)
    }
  }

  function paintFish() {
      // draw fish
    for(i = -1, l = fishes.length; ++i < l;) {
      fish = fishes[i]
      if(Math.abs(fish.x - player.x) < $canv.width/2 + 200 && Math.abs(fish.y - player.y) < $canv.height/2 + 200) {
        fish.draw(ctx)
      }
    }
  }

}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame
})();

setTimeout(drawMenu, 100)


function drawMenu() {

  // background
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, $canv.width, $canv.height)

  // title
  drawFancyText(ctx, 'Pond', 150, 200, 200)

  // button
  ctx.fillStyle = '#444'
  ctx.fillRect($canv.width * 2/10, $canv.height  / 2 - $canv.height / 4 / 2, $canv.width * 6/10,  $canv.height / 4)
  //init()
}

function drawFancyText(ctx, text, size, x, y) {
  //ctx.globalCompositeOperation = ''
  var col1 = new Color(pallet[4])
  ctx.strokeStyle = col1.rgb()
  ctx.lineWidth = 6
  ctx.font = size + 'px Leckerli One, cursive'

  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)



  ctx.font = size/2 + 'px Leckerli One, cursive'
  ctx.strokeText('the', x-100, y - 60)
  ctx.fillText('the', x-100, y - 60)
  for( var i=0;i<text.length;i++) {
    //drawFancyLetter(ctx, text[i], size, x + size * i/1.8, y)
  }

  var img = ctx.getImageData(0, 0, $canv.width, $canv.height)
  var pixs = img.data
  for(var px = 0; px < $canv.width*4; px+=4) {
    var hitColor = false
    var hitEmptyAfterColor = false
    var filled = false
    var startY = null
    for(var py = 0; py < $canv.height*4; py+=4) {
      var r = pixs[py*$canv.width + px]
      if (r > 20) {
        // color hit
        if(!hitColor){
          // first line, now we wait for the next one to interpolate
          hitColor = true
          startY = py
        } else if(hitEmptyAfterColor){
          // fill interpolated pixel
          filled = true
          var tx = px
          var ty = startY + Math.floor((py - startY)/2)
          // scan left and scan right to check for shorter distance
          pixs[ty * $canv.width + tx + 1] = 255
        }
      } else if(hitColor) {
        // empty hit after original hit
        hitEmptyAfterColor = true
        if(filled) {
          filled = false
          hitEmptyAfterColor = false
          hitColor = false
          startY = null
        }
      }
    }
  }
  for(var py = 0; py < $canv.height*4; py+=4) {
    var hitColor = false
    var hitEmptyAfterColor = false
    var filled = false
    var startY = null
    for(var px = 0; px < $canv.width*4; px+=4) {
      var r = pixs[py*$canv.height + px]
      if (r > 20) {
        // color hit
        if(!hitColor){
          // first line, now we wait for the next one to interpolate
          hitColor = true
          startY = px
        } else if(hitEmptyAfterColor){
          // fill interpolated pixel
          filled = true
          var tx = startY + Math.floor((px - startY)/2)
          var ty = py
          // scan left and scan right to check for shorter distance
          pixs[ty * $canv.height + tx + 1] = 255
        }
      } else if(hitColor) {
        // empty hit after original hit
        hitEmptyAfterColor = true
        if(filled) {
          filled = false
          hitEmptyAfterColor = false
          hitColor = false
          startY = null
        }
      }
    }
  }
  //ctx.clearRect(x-100, y-100, 400, 100)
  ctx.putImageData(img, 0, 0)
}
function drawFancyLetter(ctx, letter, size, x, y) {
  var col1 = new Color(255, 0, 100)
  ctx.strokeStyle = col1.rgb()
  ctx.lineWidth = 2
  ctx.font = size + 'px Leckerli One'
  ctx.fillText(letter, x, y)
  ctx.strokeText(letter, x, y)
  ctx.font = size+20 + 'px Leckerli One'
  ctx.strokeText(letter, x-5, y+5)
}

// level debug
//levelBalls.addBall()
var levelBar = GAME.levelBar
var levelBalls = GAME.levelBalls
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
  for(var i=0;i<8;i++){
    levelBalls.addBall()
    levelBalls.shift()
  }
  levelBalls.balls.forEach(function(b){b.size = b.targetSize})
  levelBalls.addBall()
}
//setTimeout(levelUp, 100)
//setTimeout(function(){GAME.levelBar.addColor()}, 10000)
//setTimeout(levelUp2, 100)
