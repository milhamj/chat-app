const express = require('express');
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const CONSTANT = require('./const.js');
const PORT = 8080
const ROOT_PATH = '/chat'
const LIMIT = 10

const Message = mongoose.model("Message", {
	name : String, 
	message : String
})

mongoose.connect(CONSTANT.dbUrl, (err) => { 
	console.log("mongodb connected");
	if (err) {
		console.log("ERROR: ", err);
	}
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.get(/^(?!(\/chat))/i, function(req, res) {
	res.redirect(ROOT_PATH + req.originalUrl);
});

app.get(ROOT_PATH, function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get(ROOT_PATH + '/messages', (req, res) => {
	res.redirect(ROOT_PATH + '/messages/0')
})

app.get(ROOT_PATH + '/messages/:page', (req, res) => {
	Message.find()
	.limit(LIMIT)
	.skip(LIMIT * req.params.page)
	.exec(function(err, messages) {
		Message.find()
		.limit(LIMIT)
		.skip(LIMIT * req.params.page + 1)
		.exec(function(err, messages) {
			let response = { "has_next_page": false, "messages": messages }
			res.send(response);
		})
	})
})

app.post(ROOT_PATH + '/messages', (req, res) => {
	console.log("POST: ", req.body)
	var message = new Message(req.body);
	message.save((err) =>{
		if(err) {
			sendStatus(500);
		}
		io.emit('message', req.body);
		res.sendStatus(200);
	})
})

io.on("connection", () =>{
	console.log("a user is connected")
})

const server = http.listen(PORT, () => {
	console.log('server is running on port', server.address().port);
});
