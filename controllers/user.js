var exports = module.exports = {};

//Parent players, etc
exports.USER_LIST = {};
exports.user = function(id) {
	var self = {
		id: id,
		username: "temp_user_" + ("" + id).slice(2,7),
		type: "", // Admin? Regular? Developer?
		ingame: false,
		game: "",
		
	}
	// TODO Handle input
	return self;
}