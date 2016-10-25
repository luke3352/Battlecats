var exports = module.exports = {};
//List of players
exports.ENTITY_LIST = {};
//Entity constructor
exports.Entity = function(){
	var self = {
		x:250,
		y:250,
		width:30,
		height:30,
		spdY:0,
		spdX:0,
		speed : 12,
		vel : {
		x: 0,
		y: 0
		},
		id:""
	};
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		if(self.spdX)
		self.x += self.spdX;
		if(self.spdY)
		self.y += self.spdY;
	}
	return self;
}