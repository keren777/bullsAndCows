var express = require('express'),
    connect = require('connect'),
    http = require('http');

var app = connect().use(express.static(__dirname +  '/bulls-and-cows'));


var port = process.env.PORT || 3000;


http.createServer(app).listen(port, function(){
    console.log('Gulp is running my app on port: ' + port);
});