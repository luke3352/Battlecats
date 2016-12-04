var exports = module.exports = {};
var Player = require("./player.js");


var exports = module.exports = {};
var room = null;
exports.ROOMS_LIST = {};
//Handles room settings
exports.room = function(data) {
	var self = {
		id: 			data.id,
		roomPlayers: 	[], // Players have different options
		numOfPlayers: 	data.numOfPlayers, // Default selection
		//host: 			data.host,
		pressingStart: false, //added for database
		isPublic: 		data.isPublic, // Public or private
		roomName: 		data.roomName, 
		password: 		data.password,
		gameMode: 		data.gameMode, // default game mode is stock
		gameModeVal: 	data.gameModeVal, // either stock or time
		items: 			data.items, // items disabled for now
	};
	
	room = self;
	return self;
}