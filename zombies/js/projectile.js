/*************************************************************************
  Projectile
*************************************************************************/
function Projectile(x,y,velocity,direction,damage,size,lifespan,angle_var,size_increase,type) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  //this.direction = direction+Math.random()*0.5-0.25;
  //this.direction = direction
  this.damage = damage;
  this.size = size;
  this.lifespan = lifespan;
  this.timealive = 0;
  this.angle_variation = angle_var;
  this.direction = direction+Math.random()*this.angle_variation-(this.angle_variation/2);
  this.size_increase = size_increase;
  this.type = type
  
  if(this.type === FLAMETHROWER) {
    var randColor = Math.floor(Math.random()*5);
    switch(randColor) {
      case 1:
        this.color = "rgba(105,12,7,0.3)";
        break;
      case 2:
        this.color = "rgba(186,68,16,0.3)";
        break;
      case 3:
        this.color = "rgba(229,130,34,0.3)";
        break;
      case 4:
        this.color = "rgba(247,194,69,0.3)";
        break;
      case 5:
        this.color = "rgba(173,11,4,0.3)";
        break;
      default:
        this.color = "rgba(105,12,7,0.3)";
        break;
    }
  }
  else {
    this.color = "rgba(200,50,25,0.7)"; //255,0,0 too bright of a red for color scheme
  }
}

Projectile.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.color;
    context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

Projectile.prototype.update = function(delta_time) {
  this.timealive += delta_time;
  
  var step = (delta_time / MS_IN_SEC);
  var tmpX = step * this.velocity * Math.cos(this.direction);
  var tmpY = step * this.velocity * Math.sin(this.direction);
  
  this.x += tmpX;
  this.y += tmpY;
 // this.size += 0.02;
  
  this.size += step*this.size_increase*0.75;
 
}

Projectile.prototype.is_dead = function() {
  return (this.timealive >= this.lifespan);
}
