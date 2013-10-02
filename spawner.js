function Spawner(width, height, player, fishes) {
  this.width = width
  this.height = height
  this.player = player
  this.fishes = fishes
  this.currentZone = [this.player.x, this.player.y]
  this.zones = this.getAdjacentZones().map(this.spawn.bind(this)).concat([this.currentZone])
}
Spawner.prototype.resize = function(width, height) {
  this.width = width
  this.height = height
  this.currentZone = [this.player.x, this.player.y]
  this.zones = this.getAdjacentZones().concat([this.currentZone])
}
Spawner.prototype.update = function() {
  var self = this

  for(var i=this.zones.length-1;i>=0;i--) {
    var zone = this.zones[i]
    if(zone === this.currentZone) continue
    if(Math.abs(this.player.x - zone[0]) < this.width/2 && Math.abs(this.player.y - zone[1]) < this.height/2) {
      this.currentZone = zone

      // spawn in new adjacent zones
      var newZones = this.getAdjacentZones().filter(function getNewZones(zone){
        return self.zones.every(function(zone2){
          return !(zone2[0]===zone[0] && zone2[1]===zone[1])
        })
      })

      newZones.forEach(this.spawn.bind(this))
      this.zones = this.zones.concat(newZones)
    }
    ctx.strokeRect(zone[0], zone[1], this.width, this.height)


    // if zone is really far from user, remove it
    if(distance({x: zone[0], y: zone[1]}, this.player) > Math.max(this.width, this.height)*2) {
      this.zones.splice(i, 1)
    }
  }

}
Spawner.prototype.spawn = function(zone) {

  // spawn 1-4  fish per 500sqpx, maybe larger maybe smaller than player
  // 0.5 chance that it will be bigger/smaller
  var mult = this.width*this.height/(500*500)
  for(var i=0, l=(Math.floor(Math.random()*3) + 1) * mult;i<l;i++) {
    var x = zone[0]+Math.floor(this.width*Math.random()) - this.width/2
    var y = zone[1]+Math.floor(this.height*Math.random()) - this.height/2
    var size = Math.random() > 0.5 ? this.player.size + Math.floor(Math.random() * 10) : this.player.size - Math.floor(Math.random() * 10)

    var fish = new Fish(true, x, y, size, Math.random()*Math.PI*2-Math.PI, Math.random()*Math.PI)

    var collided = false
    this.fishes.push(fish)
    /*for(var j=0;j<this.fishes.length;j++) {
      if(fish.collide(this.fishes[j])){
        //i--
        collided = true
        break
      }
    }
    if(collided) console.log('COLLIDED ON SPAWN')*/
    /*if(!collided) {
      this.fishes.push(fish)
    }*/
  }
  return zone
}
Spawner.prototype.debug = function() {
  for(var i=0;i<this.zones.length;i++) {
    var zone = this.zones[i]
    ctx.strokeRect(zone[0] - this.width/2, zone[1] - this.height/2, this.width, this.height)
  }
}
Spawner.prototype.getAdjacentZones = function() {
  var self = this
  var dirs = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]]
  var coords = dirs.map(function(dir) {
    return [dir[0]*self.width+self.currentZone[0], dir[1]*self.height+self.currentZone[1]]
  })

  return coords
}
