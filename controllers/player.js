var exports = module.exports = {};
//List of players
exports.PLAYER_LIST = {};
//Player constructor
exports.player = function(id) {
	var self = {
		position : {
			x : 250,
			y : 250,
		},
		width : 30,
		height : 30,
		weapon : {},
		character : {},
		id : id,
		number : "" + Math.floor(10 * Math.random()),
		pressingRight : false,
		pressingLeft : false,
		pressingUp : false,
		pressingDown : false,
		attack : false,
		maxSpd : 2,
	}
	// Check if players share the same position
	self.updatePosition = function() {
		for ( var i in exports.PLAYER_LIST) {
			if (self.pressingRight) {
				self.position.x += self.maxSpd;
			}
			if (self.pressingLeft) {
				self.position.x -= self.maxSpd;
			}
			if (self.pressingUp) {
				self.position.y -= self.maxSpd;
			}
			if (self.pressingDown) {
				self.position.y += self.maxSpd;
			}
		}
		
	}
	return self;
}