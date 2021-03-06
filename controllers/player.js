var Entity = require("./entity.js");
var Projectile = require("./projectile.js");
var Obstacle = require("./obstacles.js");
var Item = require("./items.js");
var exports = module.exports = {};
//List of players
exports.PLAYER_LIST = {};
exports.PROJECTILES_LIST = {};
exports.OBSTACLES_LIST =Obstacle.getArray();
exports.ITEMS_LIST =Item.getArray();
//Player constructor
var HEIGHT = 700;
var WIDTH = 1000;
var FIRERATE = 500;

exports.player = function(id, numPlayerInRoom, user, catImage, weaponImage) {
	var self = Entity.Entity();
		self.id = id;
		self.numPlayer = numPlayerInRoom;
		self.username = user;
		self.catImage = catImage;
		self.weaponImage = weaponImage;
		self.color = "#0000FF";
		
		self.width = 92;
		self.height = 92;
		self.weapon = {};
		self.character = {};
		self.id = id;
		self.username = user;
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
		
		
		if(numPlayerInRoom%4 == 1){
			self.x = 100;
			self.y = 100;
			self.healthBarX = 50;
			self.healthBarY = 10;
			self.color = "#CC0000";
		}
		else if(numPlayerInRoom%4 == 2){
			self.x = 900;
			self.y = 100;
			self.healthBarX = 875;
			self.healthBarY = 10;
			self.color = "#00CC00";
		}
		else if(numPlayerInRoom%4 == 3){
			self.x = 100;
			self.y = 600;
			self.healthBarX = 50;
			self.healthBarY = 670;
			self.color = "#0000FF";
		}
		else if(numPlayerInRoom%4 == 0){
			self.x = 900;
			self.y = 600;
			self.healthBarX = 875;
			self.healthBarY = 670;
			self.color = "#CC0066";
		}
	
		
	// Check if players share the same position
	self.updatePosition = function(clients) {
		//console.log("Player num "+ self.numPlayer);
		if(self.dead == false){
			if(self.hit == true) {
				self.HP--;
				self.hit = false;
				
				if(self.HP <= 0) {
					self.dead=true;
					self.x=-250;
					self.y=-250;
				}
			}
			var moveRight = null;
			var moveLeft = null;
			var moveUp = null;
			var moveDown = null;
			
			//check if player has contacted object
			for ( var i in exports.ITEMS_LIST) { 
				var p = exports.ITEMS_LIST[i];
				if((self.x >= p.x - 92) && (self.y >= p.y - 92) && (self.x <= p.x) && (self.y <= p.y)) {
					self.HP+=3;
					console.log("hp "+self.HP);
					exports.ITEMS_LIST[i].x = -100;
					exports.ITEMS_LIST[i].y= -100;
				} 
			}
			
			//checks for collisons with obstacles
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if (self.pressingRight){
					if(!((self.y+self.height >= p.y) && (self.y <= p.y + p.height) && (self.x + self.width <=p.x + p.width) && (self.x + self.width >= p.x))) {
						moveRight = true;
					} 
					else { 
							moveRight =false; 
							break;
					}
				}
			}
			
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if (self.pressingLeft){
					if(!((self.y+self.height >= p.y) && (self.y <= p.y + p.height) && (self.x<=p.x + p.width) && (self.x >= p.x))) {
						moveLeft = true;
					} else {
							moveLeft = false;
							break;
					}
				}
			}
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if (self.pressingUp){
					if(!((self.y <= p.y+p.height) && (self.y >= p.y) && (self.x+self.width>=p.x) && (self.x <= p.x+p.width))) {
						moveUp = true;
					} else {
						moveUp= false;
						break;
					}
				}
			}
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if (self.pressingDown){
					if(!((self.y +self.height >= p.y) && (self.y +self.height <= p.y + p.height) && (self.x+self.width>=p.x) && (self.x <= p.x+p.width))) {
						moveDown = true;
					} else {
						moveDown = false; 
						break;
					}
				}
			}
			//checks for collisons with other players
			if(moveRight!=false){
				var go = true;
				Object.keys(clients.sockets).forEach( function(socketId){
					if(go == true){
						var p = exports.PLAYER_LIST[socketId];
						if(p){
							if (self.pressingRight && self.id != p.id){
								if(!((self.y+self.height >= p.y) && (self.y <= p.y + p.height) && (self.x + self.width <=p.x + p.width) && (self.x + self.width >= p.x)) 
									&& !(self.x > WIDTH-92)) {
									moveRight = true;
								} 
								else { 
										moveRight =false; 
										go = false;	
								}
							}else if(self.pressingRight && (self.id == p.id)  && !(self.x > WIDTH-92)){moveRight=true;}
						}
					}
				});
			}
			if(moveLeft!=false){
				Object.keys(clients.sockets).forEach( function(socketId){
					if(go == true){
						var p = exports.PLAYER_LIST[socketId];
						if(p){
							if (self.pressingLeft && self.id != p.id){
								if(!((self.y+self.height >= p.y) && (self.y <= p.y + p.height) && (self.x<=p.x + p.width) && (self.x >= p.x)) && !(0 > self.x - 5)) {
									moveLeft = true;
								} else {
										moveLeft = false;
										go = false;
								}
							}else if(self.pressingLeft && (self.id == p.id) && !(0 > self.x - 5)){moveLeft=true;}
						}
					}
				});
			}
			if(moveUp!=false){
				Object.keys(clients.sockets).forEach( function(socketId){
					if(go == true){
						var p = exports.PLAYER_LIST[socketId];
						if(p){
							if (self.pressingUp && self.id != p.id){
								if(!((self.y <= p.y+p.height) && (self.y >= p.y) && (self.x+self.width>=p.x) && (self.x <= p.x+p.width)) && !(0 > self.y - 5)) {
									moveUp = true;
								} else {
									moveUp= false;
									go = false;
								}
							}else if(self.pressingUp && (self.id == p.id) && !(0 > self.y - 5)){moveUp=true;}
						}
					}
				});
			}
			if(moveDown!=false){
				Object.keys(clients.sockets).forEach( function(socketId){
					if(go==true){
						var p = exports.PLAYER_LIST[socketId];
						if(p){
							if (self.pressingDown && self.id != p.id){
								if(!((self.y +self.height >= p.y) && (self.y +self.height <= p.y + p.height) && (self.x+self.width>=p.x) && (self.x <= p.x+p.width)) && !(self.y + 40 > HEIGHT-55)) {
									moveDown = true;
								} else {
									moveDown = false; 
									go = false;
								}
							}else if(self.pressingDown && (self.id == p.id) && !(self.y + 40 > HEIGHT-55)){moveDown=true;}
						}
					}
				});
			}
			if(moveRight==true){self.x += self.maxSpd; moveRight=false;}
			if(moveLeft==true){self.x -= self.maxSpd; moveLeft=false;}
			if(moveUp==true){self.y -= self.maxSpd; moveUp=false;}
			if(moveDown==true){self.y += self.maxSpd; moveDown=false;}
			
			if(self.generateProjectile){
				if(self.fireTime - self.previousFireTime > FIRERATE){
					self.previousFireTime = self.fireTime;
					self.fireTime = new Date().getTime();
					var projectile = null;
					
					if(self.weaponImage == "yarn-blue"){
						projectile = exports.Projectile(self.id,self.mouseAngle,20,20,5,1,self.weaponImage);
						projectile.x = self.x;
						projectile.y = self.y;
						projectile.shoot(self.mouseAngle);
					}
					else if(self.weaponImage == "yarn-pink"){
						projectile = exports.Projectile(self.id,self.mouseAngle,20,20,3,2,self.weaponImage);
						projectile.x = self.x;
						projectile.y = self.y;
						projectile.shoot(self.mouseAngle);
						
						projectile2 = exports.Projectile(self.id,self.mouseAngle,20,20,3,2,self.weaponImage);
						projectile2.x = self.x+20;
						projectile2.y = self.y+20;
						projectile2.shoot(self.mouseAngle);
						
						projectile2 = exports.Projectile(self.id,self.mouseAngle,20,20,3,2,self.weaponImage);
						projectile2.x = self.x-20;
						projectile2.y = self.y-20;
						projectile2.shoot(self.mouseAngle);
					}
					else if(self.weaponImage == "yarn-purple"){
						projectile = exports.Projectile(self.id,self.mouseAngle,40,40,5,3,self.weaponImage);
						projectile.x = self.x;
						projectile.y = self.y;
						projectile.shoot(self.mouseAngle);
						
					}
					else if(self.weaponImage == "yarn-red"){
						projectile = exports.Projectile(self.id,self.mouseAngle,20,20,10,4,self.weaponImage);
						projectile.x = self.x;
						projectile.y = self.y;
						projectile.shoot(self.mouseAngle);
					}
				}
				else self.fireTime = new Date().getTime();
				
			}
		}
	}
	exports.PLAYER_LIST[id] = self;
	return self;
}

// Updates each player's position
exports.updatePlayer = function(clients){
	var pack = [];
	Object.keys(clients.sockets).forEach( function(socketId){
		var player = exports.PLAYER_LIST[socketId];
		if(player){
			player.updatePosition(clients);
			pack.push({
				x:player.x,
				y:player.y,
				width:player.width,
				height:player.height,
				HP:player.HP,
				healthX:player.healthBarX,
				healthY:player.healthBarY,
				color:player.color,
				catImage:player.catImage,
				weaponImage:player.weaponImage
			});	
		} else console.log("Player at ", socketId, " is undefined");
	});
	return pack;
}

exports.Projectile = function(id,angle,width,height,speed,weaponNum,weaponImage){
var WIDTH  = 1000;
var HEIGHT = 700;

 var self = Entity.Entity();
	self.id = Math.random();
	self.width = width;
	self.height = height;
	self.spdX = Math.cos(angle/180*Math.PI) * speed;
    self.spdY = Math.sin(angle/180*Math.PI) * speed;
	self.firedByID = id;
	self.timer = 0;
	self.weaponNum = weaponNum
	self.weaponImage = weaponImage;
	self.toRemove = false;
	self.color = exports.PLAYER_LIST[self.firedByID].color;
	self.weaponImage = weaponImage;
	self.vel = {
		x: 0,
		y: 0
	};
 
	var super_update = self.update;
	self.update = function(clients){
		if(self.timer++ > 300) self.toRemove = true;
        super_update();
        
		var count =0;
		//LOOKS TO SEE IF PLAYER AND BALL HAVE COLLIDED
		//for(var i in exports.PLAYER_LIST){
        Object.keys(clients.sockets).forEach( function(socketId){
			var player = exports.PLAYER_LIST[socketId];		
			
			if((self.x >=player.x-20 && self.x<=player.x+92) && 
			(self.y >=player.y-20 && self.y<=player.y+92) && (self.firedByID != player.id)){
				//HIT PLAYER
				player.hit = true;
				self.toRemove = true;
			}
			//right
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if(weaponNum!=1){
					if(((self.y+self.height > p.y) && (self.y < p.y + p.height) && (self.x + self.width <p.x + p.width) && (self.x + self.width > p.x))) {
					self.toRemove = true;
					break;
					}
				} 	
					
			}
			//left
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if(weaponNum!=1){
					if(((self.y+self.height > p.y) && (self.y < p.y + p.height) && (self.x<p.x + p.width) && (self.x > p.x))) {
						self.toRemove = true;
						break;
					} 
				}
			}
			//up
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
			    if(weaponNum!=1){
					if(((self.y < p.y+p.height) && (self.y > p.y) && (self.x+self.width>p.x) && (self.x < p.x+p.width))) {
						self.toRemove = true;
						break;
					} 
				}
			}
			//down
			for ( var i in exports.OBSTACLES_LIST) {
				var p = exports.OBSTACLES_LIST[i];
				if(weaponNum!=1){
					if(((self.y +self.height > p.y) && (self.y +self.height < p.y + p.height) && (self.x+self.width>p.x) && (self.x < p.x+p.width))) {
						self.toRemove = true;
						break;
					} 
				}
			}
		});
		//HIT TOP OF SCREEN
		if(0 > self.y || self.y + 20 > HEIGHT) self.toRemove = true;
		//OUT ON LEFT
		if(0 > self.x + 20) self.toRemove = true;
		//OUT ON RIGHT
	    if(self.x > WIDTH) self.toRemove = true;
		//OUT ON BOTTOM
		if(self.y > HEIGHT) self.toRemove = true;
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

exports.update = function(clients){
	var pack = [];
	for(var i in exports.PROJECTILES_LIST){
		var projectile = exports.PROJECTILES_LIST[i];
		Object.keys(clients.sockets).forEach( function(socketId){
			if(projectile.firedByID === socketId){
				projectile.update(clients);
			    if(projectile.toRemove)
		            delete exports.PROJECTILES_LIST[i];
		        else
				pack.push({ 
					x:projectile.x, 
					y:projectile.y,
					width:projectile.width,
					height:projectile.height,
					color:projectile.color,
					weaponImage:projectile.weaponImage
				});
			}
		});
	}	
	return pack;

}