var Entity = require("./Entity.js");
var Player = require("./player.js");
var exports = module.exports = {};
//List of players
exports.PROJECTILES_LIST = {};
//Entity constructor
exports.Projectile = function(parent,angle){
var WIDTH  = 500;
var HEIGHT = 500;

 var self = Entity.Entity();
	self.id = Math.random();
	self.width=10;
	self.height=10;
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	self.speed = 12;
	self.vel = {
		x: 0,
		y: 0
	};
 
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
            self.toRemove = true;
        super_update();
	
		self.x += self.vel.x;
		self.y += self.vel.y;
		
		//LOOKS TO SEE IF PLAYER AND BALL HAVE COLLIDED
		for(var i in exports.PLAYER_LIST){
			var p = exports.PLAYER_LIST[i];
			//HIT PLAYER
			self.toRemove = true;
		
		}
		//HIT TOP OF SCREEN, BOUNCES OFF
		if(0 > self.y || self.y + 20 > HEIGHT){
				delete exports.PROJECTILES_LIST[self];
		}
		//OUT ON LEFT
		if(0 > self.x + 20) {
			delete exports.PROJECTILES_LIST[self];
		}
		//OUT ON RIGHT
		else if(self.x > WIDTH) {
			delete exports.PROJECTILES_LIST[self];
		}
	}
	
	//fires the projectile
	self.shoot = function(side) {
		// set velocity direction and magnitude
		self.vel.x = 12;
		self.vel.y = 12;
	};
	
	exports.PROJECTILES_LIST[self.id] = self;
	self.shoot(1);
	
	return self;
}

exports.update = function(){
	var pack = [];
	for(var i in exports.PROJECTILES_LIST){
		var projectile = exports.PROJECTILES_LIST[i];
		projectile.update();
	    if(projectile.toRemove)
            delete exports.PROJECTILES_LIST[i];
        else
		pack.push({ 
			x:projectile.x, 
			y:projectile.y
		});
	}	
	return pack;
	}