var exports = module.exports = {};

exports.ROOMS_LIST = {};
//Handles room settings
exports.room = function(id, data) {
	var self = {
		id: id,
		roomName: data.gameName, 
		isPublic: data.publicBoolean, // Public or private
		password: data.password,
		numOfPlayers: data.numPlayers, // Default selection
		roomPlayers: [], // Players have different options
		
		gameMode: data.gameMode, // default game mode is stock
		gameModeVal: data.gameModeValue, // either stock or time
		items: data.items, // items disabled for now
	};
	return self;
}