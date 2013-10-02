var $canv = $('#canv')[0]
$canv.width = window.innerWidth
$canv.height = window.innerHeight

var stats = new Stats()
document.body.appendChild(stats.domElement)


var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug =  false //true
// color pallet // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()
var GAME = {}

function init() {
  GAME.player = new Fish(false)
  GAME.fishes = [GAME.player]
  GAME.spawner = new Spawner($canv.width, $canv.height, GAME.player, GAME.fishes)
  GAME.levelParticles = []
  GAME.levelBar = new LevelBar($canv.width)
  GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
  GAME.levelBallParticles = []
  GAME.endGameParticles = []
}

function draw() {
  var i, l, j, dist, nextStage, fish, fish2
  stats.begin()

  requestAnimFrame(draw)

  var player = GAME.player
  var fishes = GAME.fishes
  var spawner = GAME.spawner
  var levelParticles = GAME.levelParticles
  var levelBar = GAME.levelBar
  var levelBalls = GAME.levelBalls
  var levelBallParticles = GAME.levelBallParticles
  var endGameParticles = GAME.endGameParticles

  // enemy spawner
  spawner.update()

  // enemy spawner debug
  if(debug) spawner.debug()

  // physics and drawing
  ctx.save()
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  ctx.fillStyle = '#111'
  ctx.fillRect(player.x - $canv.width/2, player.y - $canv.height/2, $canv.width, $canv.height)
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
    }

    // if far enough away from player, remove

    if(distance(fish, player) > Math.max($canv.width, $canv.height) * 2) {
      fish.dead = true
    }

    // collision - in here for performance
    j=i
    while (j-- > 0) {
      fish2 = fishes[j]
      if(fish.collide(fish2)) {
        if(fish.size >= fish2.size){
          fish2.killedBy(fish)
        } else {
          fish.killedBy(fish2)
        }
      }
    }


    // draw - in here for performance
    if(Math.abs(fish.x - player.x) < $canv.width/2 + 200 && Math.abs(fish.y - player.y) < $canv.height/2 + 200) {
      fish.draw(ctx)
    }

  }



  // player score
  if(player.colors.length > 5 && player.colors.every(function(col){return col.loaded >= 1})) {

    // steal colors from player
    player.drawColors()
    var newParticles = player.toParticles(levelBar)

    // staticly position
    for(i=0;i<newParticles.length;i++) {
      newParticles[i].x += -player.x + $canv.width/2
      newParticles[i].y += -player.y + $canv.height/2
    }

    GAME.levelParticles = levelParticles.concat(newParticles)
    var colors = player.colors.splice(0, 5)

  }

  // draw level particles (static position)
  ctx.translate(player.x - $canv.width/2, player.y - $canv.height/2)
  nextStage = levelBar.physics()
  if(nextStage) {
    GAME.levelBallParticles = levelBallParticles.concat(levelBar.toParticles(levelBalls))
    levelBalls.nextColors = levelBar.colors.slice(0, 2)

    // reset levelBar
    GAME.levelBar = new LevelBar($canv.width)
  }

  levelBar.draw(ctx)
  i = levelParticles.length
  while(i-- > 0) {
    dist = levelParticles[i].physics()
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
  levelBalls.draw(ctx)
  i = levelBallParticles.length
  while(i-- > 0){
    dist = levelBallParticles[i].physics()
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

  for(i = -1, l = endGameParticles.length; ++i < l;) {
    endGameParticles[i].physics()
    endGameParticles[i].draw(ctx)
  }

  ctx.restore()

  stats.end()
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

init()
requestAnimFrame(draw)


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
  for(var i=0;i<9;i++){
    levelBalls.addBall()
    levelBalls.shift()
  }
  levelBalls.balls.forEach(function(b){b.size = b.targetSize})
  levelBalls.addBall()
}
//setTimeout(levelUp, 100)
//setTimeout(function(){GAME.levelBar.addColor()}, 10000)
//setTimeout(levelUp2, 100)
