var Entity = require("./Entity.js");
var Projectile = require("./projectile.js");
var exports = module.exports = {};
//List of players
exports.PLAYER_LIST = {};
//Player constructor
exports.player = function(id) {
	var self = Entity.Entity();
		self.weapon = {};
		self.character = {};
		self.id = id;
		//self.number = "" + Math.floor(10 * Math.random());
		self.pressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.mouseAngle = 0;
		self.maxSpd = 5;
		self.generateProjectile = false;
		
		/*var super_update = self.update;
		self.update = function(){
			self.updatePosition();
			super_update();
       
			if(self.pressingAttack){
				self.shootBullet(self.mouseAngle);
			}
		}*/
	
		
	// Check if players share the same position
	self.updatePosition = function() {
		
		
		
		for ( var i in exports.PLAYER_LIST) {
			if (self.pressingRight) {
				self.x += self.maxSpd;
			}
			if (self.pressingLeft) {
				self.x -= self.maxSpd;
			}
			if (self.pressingUp) {
				self.y -= self.maxSpd;
			}
			if (self.pressingDown) {
				self.y += self.maxSpd;
			}
			if(self.generateProjectile){
				var projectile = Projectile.Projectile(self.id,self.mouseAngle);
				projectile.x = self.x;
				projectile.y = self.y;
				projectile.shoot(self.mouseAngle);
			}
		}
			
		function collision(self, enemy) {
			
		}
		
	
	}
	exports.PLAYER_LIST[id] = self;
	return self;
	
}

// Updates each player's position
exports.updatePlayer = function(){
	
	var pack = [];
	var count = 0;
	for(var i in exports.PLAYER_LIST){
		var player = exports.PLAYER_LIST[i];
			player.update();
			pack.push({
				x:player.x,
				y:player.y,
				width:player.width,
				height:player.height
			});	
		
		count++;
	}
	
	count = 0;
	return pack;
}