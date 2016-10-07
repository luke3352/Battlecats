
var express = require('express');
var mysql = require("mysql");
var connection = mysql.createConnection({
  host     : 'mysql.cs.iastate.edu',
  user     : 'dbu309la07',
  password : '5rqZthHkdvd',
  database : 'db309la07'
});
//var app = express();
connection.connect(function(error){
	if (!!error){
		console.log('Error');
	}
	else{
		console.log('Connected');
	}
});

//app.get("/",function(req,res){
//console.log('did the app.get');
connection.query('SELECT _password from User_Info;', function(err, rows, fields) {
connection.end();
  if (!err){
    console.log('The solution is: ', rows);
  }
  else{
    console.log('Error while performing Query.');
  }
  });
//});

//app.listen(3306);
connection.end();