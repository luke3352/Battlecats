var exports = module.exports = {};
//List of players
exports.WEAPONS_LIST = {};
//Entity constructor
exports.Weapon = function() {
	var self = {
		attack : 0,
		length : 0,
		width : 0,
		crit : 0,
		speed : 0,
		attackSpeed : 0,
	}
	// TODO Weapon interactions
	return self;
}