/*************************************************************************
  Survivor
*************************************************************************/
function Survivor() {
  this.tower = undefined;
}

Survivor.prototype = {
  damage : 3,
  range : 125,
  rate : 600,
  velocity: 600, /* Keep velocity @ 300 - 600 is a little hard to see */
  projectile_size : 2, /* Want the projectile size to be greater 1...again 1 pixel is a little too hard to see */
  projectile_lifespan : 5000,
  type : BASE,
	angle_variation : 0.1,
  size_increse : 0,
	gun_color: "rgb(50,50,100)",
	color: "rgb(50,50,100)",
  /*damage : 1,
  range : 150,
  rate : 10,
  velocity: 50,
  projectile_size : 5,*/
  times_upgraded: 0,
  max_upgrades: 5
}

Survivor.prototype.draw = function(context) {
	context.save();
		context.lineWidth = 4;
		context.strokeStyle = this.gun_color;
		context.translate(this.tower.midX,this.tower.midY);
		context.rotate(this.tower.direction);
		
		this.draw_gun(context);
	context.restore();
	context.fillStyle = this.color;
	context.beginPath();
		context.arc(this.tower.midX, this.tower.midY, 6, 0, Math.PI*2, true); //*2
	context.fill();
};


Survivor.prototype.upgrade_damage = function() {
  var damageIncrease = 3;
  if(this.type === FLAMETHROWER) {
    damageIncrease = 1;
  }
  else if(this.type === MACHINEGUN) {
    damageIncrease = 2;
  }
  else if(this.type === CANNON) {
    damageIncrease = 3;
  }
  this._upgrade_damage(damageIncrease);
}

Survivor.prototype.upgrade_range = function() {
  var rangeIncrease = 3;
  if(this.type === CANNON) {
    rangeIncrease = 5;
  }
  this._upgrade_range(rangeIncrease);
}

Survivor.prototype._upgrade_damage = function(damage) {
  if(this.times_upgraded < this.max_upgrades) {
    this.damage += damage;
    this.times_upgraded++;
    return true;
  }
  return false;
}

Survivor.prototype._upgrade_rate = function(rate) {
  if(this.times_upgraded < this.max_upgrades) {
    this.rate += rate;
    this.times_upgraded++;
    return true;
  }
  return false;
}

Survivor.prototype._upgrade_range = function(range) {
  if(this.times_upgraded < this.max_upgrades) {
    this.range += range;  
    this.times_upgraded++;
    return true;
  }
  return false;
}

Survivor.prototype.get_damage = function() {
  return this.damage;
}

Survivor.prototype.get_rate = function() {
  return this.rate;
}

Survivor.prototype.get_range = function() {
  return this.range;
}

Survivor.prototype.get_velocity = function() {
  return this.velocity;
}

Survivor.prototype.get_tower = function() {
  return this.tower;
}

Survivor.prototype.get_projectile_size = function() {
  return this.projectile_size;
}

Survivor.prototype.get_projectile_lifespan = function() {
  return this.projectile_lifespan;
}

Survivor.prototype.get_projectile_angle_variation = function() {
  return this.angle_variation;
}

Survivor.prototype.get_projectile_size_increse = function() {
  return this.size_increse;
}

Survivor.prototype.get_type = function() {
  return this.type;
}

Survivor.prototype.set_tower = function(tower) {
  this.tower = tower;
}

Survivor.prototype.get_max_upgrades = function() {
  return this.max_upgrades;
}


Survivor.prototype.get_current_upgrades = function() {
  return this.times_upgraded;
}

Survivor.prototype.upgrade_flamethrower = function() {
  this.damage = 1;
  this.range = 100;
  this.rate = 20; /* Reduce dmg instead of rate, want more of a constant flow and less dmg */
  this.velocity = 50;
  this.projectile_size = 5;
  this.projectile_lifespan = 2000;
  this.angle_variation = 1;
  this.size_increse = 2;
  this.type = FLAMETHROWER;
	this.color = "rgb(100,50,50)";
  this.draw_gun = this.draw_flamethrower;
}

Survivor.prototype.upgrade_machinegun = function() {
  this.range = 150;
  this.rate = 200;
  this.type = MACHINEGUN;
	this.color = "rgb(50,100,50)";
  this.draw_gun = this.draw_machinegun;
	this.angle_variation = 0.2;
}

Survivor.prototype.upgrade_cannon = function() {
  this.range = 200;
  this.rate = 2000;
  this.damage = 30;
  this.velocity = 250;
  this.projectile_size = 8; // 10 seems too large
  this.type = CANNON;
	this.color = "rgb(100,100,50)";
  this.draw_gun = this.draw_cannon;
}

Survivor.prototype.draw_gun = function(context) {
  context.lineWidth = 4;
  context.save();
    context.beginPath();
      context.moveTo(0,0);
      context.lineTo((this.tower.width+this.tower.height) / 2.5 ,0); //Size of turret is avg of width and length
    context.stroke();
  context.restore();
}

Survivor.prototype.draw_flamethrower = function(context) {
  context.lineWidth = 6;
  context.save();
    context.fillStyle = this.gun_color;
    context.beginPath();
      context.moveTo(0,-2);
      context.lineTo((this.tower.width+this.tower.height) / 2.5 ,-5); //Size of turret is avg of width and length
      context.lineTo((this.tower.width+this.tower.height) / 2.5 ,5); //Size of turret is avg of width and length
      context.lineTo(0,2); //Size of turret is avg of width and length
    context.fill();
  context.restore();
}

Survivor.prototype.draw_machinegun = function(context) {
  context.lineWidth = 4;
  context.save();
    context.beginPath();
      context.moveTo(0,0);
      context.lineTo((this.tower.width+this.tower.height) / 2.25 ,0); //Size of turret is avg of width and length
    context.stroke();
  context.restore();
}

Survivor.prototype.draw_cannon = function(context) {
  context.lineWidth = 5;
  context.save();
    context.beginPath();
      context.moveTo(0,0);
      context.lineTo((this.tower.width+this.tower.height) / 2.0 ,0); //Size of turret is avg of width and length
    context.stroke();
  context.restore();
}



