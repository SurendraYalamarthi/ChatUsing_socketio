const express = require('express');
const app 	  = express();
var clients = [];
var admins = [];

app.set('view engine','ejs');

app.use(express.static('public'));

app.get('/',(req,res)=>{
	res.render('index');
});

server = app.listen(3000);

const io = require('socket.io')(server);

io.on("connection",(socket)=>{
	console.log('new user connected');
	
	socket.username="Anonymous";
	
	socket.on("change_username",(data)=>{
		socket.username=data.username;
		console.log("username changed to:::"+socket.username);
		if(data.client){
			for(var i in clients){
				if(clients[i].user==socket.username){
					clients.splice(clients[i],1);
				}
			}
			clients.push({
				'user':socket.username,
				'id'  :socket.id
			})
		}else if(data.server){
			for(var i in admins){
				if(admins[i].user==socket.username){
					admins.splice(admins[i],1);
				}
			}
			admins.push({
				'user':socket.username,
				'id'  :socket.id
			})
		}
		console.log("clients:::"+JSON.stringify(clients));
		console.log("admins:::"+JSON.stringify(admins));
	})
	
	socket.on("new_message",(data)=>{
		console.log(data);
		var socketId="";
			if(data.server){
				for(var i in clients){
					console.log(clients[i].user+"   "+data.to)
					if(clients[i].user==data.to){
						if(clients[i]["conectedto"]!="" && clients[i]["conectedto"]!=undefined){
							if(clients[i]["conectedto"] == data.username){
								socketId=clients[i].id;
								//break;
							}else{
								for(var j in admins){
									if(admins[j].user==data.username){
										socketId=admins[j].id;
										io.sockets.sockets[socketId].emit('user_busy',{message:"User connected to another admin",username:data.username});
										socketId="";
										return;
									}
								}
							}
						}else{
							for(var j in admins){
								if(admins[j].user==data.username){
									admins[j]["conectedto"]=clients[i].user
								}else if(admins[j]["conectedto"]=="" || admins[j]["conectedto"]==undefined){
									socketId=admins[j].id;
									io.sockets.sockets[socketId].emit('user_busy',{message:"User connected to another admin",username:data.username});
									socketId="";
								}
							}
							clients[i]["conectedto"] = data.username
							socketId=clients[i].id;
							break;
						}
					}
				}
				// for(var i in admins){
					// if(admins[i].user==data.username){
						// admins[i].
					// }
				// }
				console.log(data);
				if(io.sockets.sockets[socketId]){
					io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
					socketId="";
				}else{
				   if(data.username){
					for(var i in clients){
						console.log(clients[i].user+"   "+data.username)
						if(clients[i].user==data.username){
							socketId=clients[i].id;
							console.log(socketId);
						}
					}
				   }
					console.log('is socket id connected'+Object.keys(io.sockets.sockets));
					if(io.sockets.sockets[socketId]){
						console.log(true);
						io.sockets.sockets[socketId].emit('sending_error',{username:data.username});
						socketId="";
					}
				}
			}else{
				var conectedto="";
				for(var i in clients){
					console.log(clients[i].user+"   "+data.to)
					if(clients[i].user==data.username){
						conectedto=clients[i]["conectedto"];
						console.log(socketId);
					}
				}
				console.log("conectedto:::"+conectedto)
				if(conectedto!="" && conectedto!=undefined){
					for(var i in admins){
						if(admins[i].user==conectedto){
								socketId=admins[i].id;
								conectedto="";
							}
					}
					io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
					socketId="";
				}else{
					for(var i in admins){
						socketId=admins[i].id;
						console.log(admins[i].user+":::"+socketId);
						// console.log(data.username);
						if(admins[i]["conectedto"]=="" || admins[i]["conectedto"]==undefined){
							console.log("sendingto::admin"+(i+1));
							io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
							socketId="";
						}
					}
				}
			}
	})
    
	socket.on("disconnected",(data)=>{
		console.log("disconnected event start");
		console.log(data);
		if(data.server){
			for(var i in admins){
				if(admins[i].user==data.username){
					admins.splice(admins[i],1);
					console.log("admin disconnected:::"+i);
				}
			}
		}else{
			for(var i in clients){
				if(clients[i].user==data.username){
					notifyAdmin(clients[i].conectedto);
					clients.splice(clients[i],1);
					console.log("client disconnected:::"+i);
				}
			}
		}
		console.log("disconnected event end");
	});
	
	function notifyAdmin(admin){
		for(var i in admins){
			if(admins[i].user==admin){
				socketId=admins[i].id;
				admins[i]["conectedto"]="";
			}
		}
		io.sockets.sockets[socketId].emit('client_disconnected');
		socketId="";
	}
	
});

