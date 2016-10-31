var exports = module.exports = {};

//Parent players, etc
exports.USER_LIST = {};
exports.user = function(id, username) {
	var self = {
		id: id,
		username: username,
		type: "", // Admin? Regular? Developer?
		ingame: false,
		game: "",
		
	}
	// TODO Handle input
	return self;
}