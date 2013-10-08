var muted = false
popSound = document.createElement('audio')
popSound.src='drop1.ogg'
popSound.volume = 0.6
bgRainSound = document.createElement('audio')
bgRainSound.src='bg1.ogg'
bgRainSound.loop = true
bgRainSound.play()
if(localStorage.muted === 'true') toggleMute()
//$('.sound').bind('click', toggleMute)
function toggleMute(){
  if(!muted) {
    popSound.volume = 0
    bgRainSound.volume = 0
    muted = true
    localStorage.muted = 'true'
    drawSoundControl()
  } else {
    popSound.volume = 0.6
    bgRainSound.volume = 1
    muted = false
    localStorage.muted = 'false'
    drawSoundControl()
  }
}

function playPop() {
  popSound.play()
}

function drawSoundControl() {
  if(typeof ctx === 'undefined') return
  ctx.clearRect($canv.width - 25, 10, 16, 22)
  if(muted)
    ctx.drawImage(ASSETS.soundOff, $canv.width - 25, 10)
  else
    ctx.drawImage(ASSETS.soundOn, $canv.width - 25, 10)
}
