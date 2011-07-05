/*************************************************************************
  Enemy
*************************************************************************/
function Enemy(x,y,velocity,direction,health,damage,size,delay,goalX,goalY) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.health = health;
  this.fullHealth = health;
  this.damage = damage;
  this.size = size;
  this.goalX = goalX;
  this.goalY = goalY;
  this.time_till_release = delay;
  this.timer = 0;
  this.cooldown = 500;
}

Enemy.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(255,100,0,0.8)";
    context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

Enemy.prototype.update = function(delta_time,occupiedList) {
  this.timer += delta_time;
  this.direction = Math.atan2(this.goalY-this.y,this.goalX-this.x);
  
  if(this.time_till_release > 0) {
    this.time_till_release -= delta_time;
    return;
  }
  var step = (delta_time / MS_IN_SEC);
  var tmpX = step * this.velocity * Math.cos(this.direction);
  var tmpY = step * this.velocity * Math.sin(this.direction);
  
  this.x += tmpX;
  this.y += tmpY;
  
  for(var i = 0; i < occupiedList.length; i++) {
    if(this.x+tmpX >= occupiedList[i].x && this.x+tmpX <= occupiedList[i].x+occupiedList[i].width && 
        this.y+tmpY >= occupiedList[i].y && this.y+tmpY <= occupiedList[i].y+occupiedList[i].height) {
      this.x -= tmpX;
      this.y -= tmpY;
      //this.y += Math.abs(step * this.velocity);
      if(this.timer >= this.cooldown) {
        occupiedList[i].take_damage(this.damage);
        this.timer = 0;
      }
      return;
    }
  }
}

Enemy.prototype.take_damage = function(damage) {
  this.health -= damage
}

Enemy.prototype.is_dead = function() {
  return (this.health <= 0);
}

Enemy.prototype.is_collision = function(x,y) {
  return (x >= this.x-this.size && x <= this.x+this.size && y >= this.y-this.size && y <= this.y+this.size);
}
