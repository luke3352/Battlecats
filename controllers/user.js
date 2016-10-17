var exports = module.exports = {};

//Parent players, etc
exports.USER_LIST = {};
exports.user = function(id, name) {
	var self = {
		username: name,
		id: id,
		type: "", // Admin? Regular? Developer?
		ingame: false,
		game: {},
		
	}
	// TODO Handle input
	return self;
}