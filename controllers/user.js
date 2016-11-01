var exports = module.exports = {};

//Parent players, etc
exports.USER_LIST = {};
exports.user = function(id, username) {
	var self = {
		id: id,
		username: username,
		isHost: false,
		ingame: false,
		game: "",
		
	}
	return self;
}