/*************************************************************************
  Survivor
*************************************************************************/
function Survivor() {
  this.tower = undefined;
}

Survivor.prototype = {
  damage : 3,
  range : 125,
  rate : 200,
  velocity: 300,
  projectile_size : 2,
  projectile_lifespan : 5000,
  type : BASE,
  angle_variation : 0,
  size_increse : 0,
  /*damage : 1,
  range : 150,
  rate : 10,
  velocity: 50,
  projectile_size : 5,*/
  times_upgraded: 0,
  max_upgrades: 5
}

Survivor.prototype.upgrade_damage = function(damage) {
  if(this.times_upgraded < this.max_upgrades) {
    this.damage += damage;
    this.times_upgraded++;
    return true;
  }
  return false;
}

Survivor.prototype.upgrade_rate = function(rate) {
  if(this.times_upgraded < this.max_upgrades) {
    this.rate += rate;
    this.times_upgraded++;
    return true;
  }
  return false;
}

Survivor.prototype.upgrade_range = function(range) {
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
  this.damage = 3;
  this.range = 100;
  this.rate = 10;
  this.velocity = 50;
  this.projectile_size = 5;
  this.projectile_lifespan = 2000;
  this.angle_variation = 1;
  this.size_increse = 2;
  this.type = FLAMETHROWER;
}

Survivor.prototype.upgrade_machinegun = function() {
  this.range = 150;
  this.rate = 50;
  this.type = MACHINEGUN;
}

Survivor.prototype.upgrade_cannon = function() {
  this.range = 200;
  this.rate = 1000;
  this.damage = 30;
  this.velocity = 250;
  this.projectile_size = 8;
  this.type = CANNON;
}





