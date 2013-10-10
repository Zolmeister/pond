function setGlobals() {
  $canv = document.createElement('canvas')
  $canv.width = window.innerWidth
  $canv.height = window.innerHeight
  document.body.appendChild($canv)
  ctx = $canv.getContext('2d')
  ctx.lineJoin = 'round'
  debug =  false //true
  isMobile = false
  // color pallet // blue        l blue        l green         orange         d orange
  pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
  lastColor = new Color()
  GAME = {
    MENU: {
      opacity: 1
    },
    state: 'menu'
  }
  ASSETS = {}

  if(debug){
    stats = new Stats()
    document.body.appendChild(stats.domElement)
  }
  // game loop
  MS_PER_UPDATE = 16
  previousTime = 0.0
  lag = 0.0
}

setGlobals()
loadAssets(fadeInMenu)

function init() {
  log('state')
  GAME.state = 'playing'
  log('player')
  GAME.player = new Fish(false)
  log('fishes')
  GAME.fishes = [GAME.player]
  log('spawner')
  GAME.spawner = new Spawner($canv.width, $canv.height, GAME.player, GAME.fishes)
  log('bar')
  GAME.levelParticles = []
  GAME.levelBar = new LevelBar($canv.width)
  log('balls')
  GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
  GAME.levelBallParticles = []
  GAME.endGameParticles = []
  log('draw')
  requestAnimFrame(draw)
}

function draw(time) {
  var i, l, j, dist, nextStage, fish, fish2
  lag += time - previousTime
  previousTime = time
  if(GAME.state === 'playing'){
    requestAnimFrame(draw)
  } else {
    return fadeInMenu()
  }

  var player = GAME.player
  var fishes = GAME.fishes
  var spawner = GAME.spawner
  var levelParticles = GAME.levelParticles
  var levelBar = GAME.levelBar
  var levelBalls = GAME.levelBalls
  var levelBallParticles = GAME.levelBallParticles
  var endGameParticles = GAME.endGameParticles

  if(debug) stats.begin()
  var MAX_CYCLES = 15
  while(lag >= MS_PER_UPDATE && MAX_CYCLES) {
    physics()
    lag -= MS_PER_UPDATE
    MAX_CYCLES--
  }

  // if 5 frames behind, jump
  if(lag/MS_PER_UPDATE > 75) {
    lag = 0.0
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

    drawSoundControl()
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
        if(fishes[i] === player) {
          setTimeout(function(){
            GAME.state = 'menu'
          }, 5000)
        }
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


function loadAssets(cb) {
  var imgs = [
    { name: 'logo', src: 'logo.png' },
    { name: 'soundOn', src: 'sound-on.png' },
    { name: 'soundOff', src: 'sound-off.png' },
    {name: 'enter', src: 'enter.png'}
  ]

  function process() {
    var next = imgs.pop()
    if(next) {
      var img = new Image()
      img.onload = function() {
        ASSETS[next.name] = this
        process()
      }
      img.src = next.src
    } else {
      cb()
    }
  }

  process()
}

function sizeMenu() {
  var title = {
    width : ASSETS.logo.width,
    height : ASSETS.logo.height,
    minPaddingX : 100,
    minPaddingY : 30,
    x: null,
    y: null
  }

  var button = {
    x : null,
    y : $canv.height / 1.8,
    width : $canv.width * .5,
    height : $canv.height / 6
  }
  button.x = $canv.width / 2 - button.width/2

  // title
  var scale = scaleSize(title.width, title.height, $canv.width - title.minPaddingX, $canv.height - button.y - title.minPaddingY*2)
  title.width *= scale
  title.height *= scale
  title.x = $canv.width/2 - title.width/2
  title.y = button.y - title.height - title.minPaddingY

  GAME.MENU.title = title
  GAME.MENU.button = button
}

function drawMenuButton(hitting) {
  var button = GAME.MENU.button
  // button
  ctx.lineWidth = 4
  ctx.strokeStyle = '#444'
  roundRect(ctx, button.x, button.y, button.width, button.height, 20)
  ctx.fillStyle= hitting ? '#222' : '#1a1a1a'
  ctx.fill()
  ctx.stroke()
  var width = ASSETS.enter.width
  var height = ASSETS.enter.height
  var scale = scaleSize(width, height, button.width - 5, button.height - 5)
  width *= scale
  height *= scale
  var x = button.x + button.width/2 - width/2
  var y = button.y + button.height/2 - height/2
  ctx.drawImage(ASSETS.enter, x, y, width, height)
}

// scale down w1 and h1 to fit inside w2 and h2 retaining aspect ratio
function scaleSize(w1, h1, w2, h2) {
  function scale(v1, v2) {
    if(v1 > v2) {
      return v2/v1
    }
    return 1
  }
  return Math.min(scale(w1, w2), scale(h1, h2))
}

function drawMenuLogo() {
  var title = GAME.MENU.title
  ctx.drawImage(ASSETS.logo, title.x, title.y, title.width, title.height)
}

function fadeInMenu() {

  GAME.state = 'menu'
  GAME.MENU.opacity = 0
  requestAnimFrame(menuFade)
  //drawMenu()
}

function menuFade() {
  GAME.MENU.opacity+=0.02
  drawMenu()
  var alpha = 1-GAME.MENU.opacity
  ctx.fillStyle = 'rgba(17,17,17,'+(alpha > 0 ? alpha : 0)+')'
  ctx.fillRect(0, 0, $canv.width, $canv.height)
  if(GAME.MENU.opacity < 1 && GAME.state === 'menu'){
    requestAnimFrame(menuFade)
  }
}

function drawMenu() {

  sizeMenu()

  // background
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, $canv.width, $canv.height)

  // set opacity
  //ctx.globalAlpha = GAME.MENU.opacity

  drawMenuLogo()

  drawMenuButton()


  drawSoundControl()
}

function roundRect (ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}

// level debug
//levelBalls.addBall()
function levelUp(){
  var levelBar = GAME.levelBar
  for(var i=0;i<9;i++)
    levelBar.addColor()

  levelBar.colors.forEach(function(col){
  col.loaded = 1
  })
  levelBar.x = levelBar.targetX
  levelBar.addColor()
}
function levelUp2(){
  var levelBalls = GAME.levelBalls
  for(var i=0;i<8;i++){
    levelBalls.addBall()
    levelBalls.shift()
  }
  levelBalls.balls.forEach(function(b){b.size = b.targetSize})
  levelBalls.addBall()
}
//setTimeout(levelUp, 3000)
//setTimeout(function(){GAME.levelBar.addColor()}, 10000)
//setTimeout(levelUp2, 3000)
