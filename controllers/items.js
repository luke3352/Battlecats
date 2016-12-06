var exports = module.exports = {};

//List of obstacles
exports.ITEMS_LIST = {};
//Player constructor
var Entity = require("./entity.js");

exports.items = function(id, itemImage, x, y) {
	var self = Entity.Entity();
		self.x = x;
		self.y = y;
		self.width = 40;
		self.height = 40;
		self.id = id;
		self.itemImage = itemImage;
		self.healValue = 3;
	exports.ITEMS_LIST[id] = self;
	return self;
}
exports.getArray = function(){
	return exports.ITEMS_LIST;
}
exports.update = function(){
	
	var pack = [];
	for(var i in exports.ITEMS_LIST){
		var item = exports.ITEMS_LIST[i];
		pack.push({
			x:item.x,
			y:item.y,
			width:item.width,
			height:item.height,
			itemImage: item.itemImage 
		});
	}
	return pack;
}