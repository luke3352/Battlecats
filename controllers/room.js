var exports = module.exports = {};
var Player = require("./player.js");


var exports = module.exports = {};
var room = null;
exports.ROOMS_LIST = {};
//Handles room settings
exports.room = function(data) {
	var self = {
		id: 			data.id,
		host: 			data.host,
		roomName: 		data.roomName, 
		isPublic: 		data.isPublic, // Public or private
		password: 		data.password,
		numOfPlayers: 	data.numOfPlayers, // Default selection
		roomPlayers: 	[], // Players have different options
		gameMode: 		data.gameMode, // default game mode is stock
		gameModeVal: 	data.gameModeVal, // either stock or time
		items: 			data.items, // items disabled for now
	};
	
	self.checkLiving = function(){
		for(var i in Player.PLAYER_LIST){
			//console.log("List"+Player.PLAYER_LIST[i].id);
		}
	}
	room = self;
	return self;
}


exports.updateRoom = function(){
	
		room.checkLiving();
}