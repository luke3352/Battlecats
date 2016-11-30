var exports = module.exports = {};

//List of obstacles
exports.OBSTACLES_LIST = {};
//Player constructor
var Entity = require("./Entity.js");

exports.obstacles = function(id) {
	var self = Entity.Entity();
		self.id = id;
	
	exports.OBSTACLES_LIST[id] = self;
	return self;
}

exports.update = function(){
	
	var pack = [];
	for(var i in exports.OBSTACLES_LIST){
		var obstacle = exports.OBSTACLES_LIST[i];
		pack.push({
			x:obstacle.x,
			y:obstacle.y,
			width:obstacle.width,
			height:obstacle.height
		});
	}
	return pack;
}