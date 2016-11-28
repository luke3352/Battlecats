var Entity = require("./Entity.js");
var Projectile = require("./projectile.js");
var exports = module.exports = {};
//List of players
exports.PLAYER_LIST = {};
exports.PROJECTILES_LIST = {};
//Player constructor
var HEIGHT = 700;
var WIDTH = 1000;
var FIRERATE = 500;

exports.player = function(id,numPlayerInRoom) {
	var self = Entity.Entity();
		self.weapon = {};
		self.character = {};
		self.id = id;
		self.pressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.mouseAngle = 0;
		self.maxSpd = 5;
		self.generateProjectile = false;
		self.hit = false;
		self.HP = 3;
		self.healthBarX = 200;
		self.healthBarY = 30;
		self.dead = false;
		self.fireTime = new Date().getTime();
		self.previousFireTime = 0;
		self.color = "#0000FF";
		self.numPlayer = numPlayerInRoom;
		if(numPlayerInRoom == 1){
			self.x = 100;
			self.y = 100;
			self.healthBarX = 5;
			self.healthBarY = 10;
			self.color = "#CC0000";
		}
		else if(numPlayerInRoom == 2){
			self.x = 900;
			self.y = 100;
			self.healthBarX = 875;
			self.healthBarY = 10;
			self.color = "#00CC00";
		}
		else if(numPlayerInRoom == 3){
			self.x = 100;
			self.y = 600;
			self.healthBarX = 5;
			self.healthBarY = 670;
			self.color = "#0000FF";
		}
		else if(numPlayerInRoom == 4){
			self.x = 900;
			self.y = 600;
			self.healthBarX = 875;
			self.healthBarY = 670;
			self.color = "#CC0066";
		}
	
		
	// Check if players share the same position
	self.updatePosition = function() {
		if(self.dead == false){
			
			for ( var i in exports.PLAYER_LIST) {
				
				if(self.hit == true) {
					self.HP--;
					self.hit = false;
					
					if(self.HP <= 0){
						self.dead=true;
						self.x=-250;
						self.y=-250;
						
					}
				}
				//checks what button is pressed and if player can move their; IE: can't leave map
				
				if (self.pressingRight && !(self.x > WIDTH-35)) {
					self.x += self.maxSpd;
				}
				if (self.pressingLeft && !(0 > self.x - 5)) {
					self.x -= self.maxSpd;
				}
				if (self.pressingUp && !(0 > self.y - 5)) {
					self.y -= self.maxSpd;
				}
				if (self.pressingDown && !(self.y + 40 > HEIGHT+5)) {
					self.y += self.maxSpd;
				}
				
				/*for(var i in exports.PLAYER_LIST){
					var p = exports.PLAYER_LIST[i];
					
					if (self.pressingRight && !(self.x > p.x-35) && !(self.x > WIDTH-35)) {
						self.x += self.maxSpd;
					}
					if (self.pressingLeft && !(p.x - 35 > self.x - 5) && !(0 > self.x - 5)) {
						self.x -= self.maxSpd;
					}
					if (self.pressingUp && !(p.y > self.y - 5) &&  !(0 > self.y - 5)) {
						self.y -= self.maxSpd;
					}
					if (self.pressingDown && !(self.y + 40 > p.y+5) && !(self.y + 40 > HEIGHT+5)) {
						self.y += self.maxSpd;
					}
				}*/
				if(self.generateProjectile){
					if(self.fireTime - self.previousFireTime > FIRERATE){
						self.previousFireTime = self.fireTime;
						self.fireTime = new Date().getTime();
						var projectile = exports.Projectile(self.id,self.mouseAngle);
						projectile.x = self.x;
						projectile.y = self.y;
						projectile.shoot(self.mouseAngle);
					}
					else self.fireTime = new Date().getTime();
					
				}
			}
				
			
		
		}
	}
	
	exports.PLAYER_LIST[id] = self;
	return self;
	
}

exports.getPlayerList = function() {
    console.log("here");
     return exports.PLAYER_LIST;
}

// Updates each player's position
exports.updatePlayer = function(){
	
	var pack = [];
	var count = 0;
	for(var i in exports.PLAYER_LIST){
		var player = exports.PLAYER_LIST[i];
			player.updatePosition();
			pack.push({
				x:player.x,
				y:player.y,
				width:player.width,
				height:player.height,
				HP:player.HP,
				healthX:player.healthBarX,
				healthY:player.healthBarY,
				color:player.color
			});	
		
		count++;
	}
	
	count = 0;
	return pack;
}

exports.Projectile = function(id,angle){
var WIDTH  = 1000;
var HEIGHT = 700;

 var self = Entity.Entity();
	self.id = Math.random();
	self.width=10;
	self.height=10;
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;
	self.firedByID = id;
	self.timer = 0;
	self.toRemove = false;
	self.speed = 12;
	self.color = exports.PLAYER_LIST[self.firedByID].color;
	self.vel = {
		x: 0,
		y: 0
	};
 
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
            self.toRemove = true;
        super_update();
	

		//LOOKS TO SEE IF PLAYER AND BALL HAVE COLLIDED
		for(var i in exports.PLAYER_LIST){
			var player = exports.PLAYER_LIST[i];			
			if((self.x >=player.x-WIDTH && self.x<=player.x+WIDTH) && 
			(self.y >=player.y-HEIGHT && self.y<=player.y+HEIGHT) && (self.firedByID != player.id)){
				//HIT PLAYER
				player.hit = true;
				self.toRemove = true;
			}
			
		
		}
		//HIT TOP OF SCREEN
		if(0 > self.y || self.y + 20 > HEIGHT){
				self.toRemove = true;
		}
		//OUT ON LEFT
		if(0 > self.x + 20) {
			self.toRemove = true;
		}
		//OUT ON RIGHT
		else if(self.x > WIDTH) {
			self.toRemove = true;
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
			y:projectile.y,
			color:projectile.color
		});
	}	
	
	return pack;
	}
