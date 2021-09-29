$(function(){
	console.log("index init");
	var socket = io.connect("http://localhost:3000/");
	$("#waiting-msg").hide();
	var client=false;
	var server=false;
	
	var msg  = $("#message");
	var user = $("#username");
	var to   = "";
	
	
	// to.hide();
	// msg.hide();
	user.hide();
	$("#send_name").hide();
	$("#send_message").hide();
	$("#open-btn").hide();
		
	msg.keypress(function(e){
		if(e.keyCode==13){
			e.preventDefault();
			socket.emit("new_message",{client:client,server:server,username:user.val(),message:msg.val()});
				$("#clientmessages").append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+msg.val()+"</p></div></li><br/>");
			setTimeout(function(){
				msg.val("");
			},100);
		}
	});	
	
	$("#servermessage").keypress(function(e){
		if(e.keyCode==13){
			e.preventDefault();
			socket.emit("new_message",{client:client,server:server,to:to,username:user.val(),message:$("#servermessage").val()});
				$("#server-messages").append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+$("#servermessage").val()+"</p></div></li><br/>");
			setTimeout(function(){
				$("#servermessage").val("");
			},100);
		}
	});	
	
	$("#adminregisterButton").click(function(){
		server=true;
		user.show();
		$("#adminregisterButton").hide();
		$("#userregisterButton").hide();
		$("#send_name").show();
		$("#header").append("<h2 class='header'>Admin Page</h2>");
	});
	
	$("#userregisterButton").click(function(){
		client=true;
		user.show();
		$("#adminregisterButton").hide();
		$("#userregisterButton").hide();
		$("#send_name").show();
		$("#header").append("<h2 class='header'>User Page</h2>");
	});
	
	$("#send_name").click(function(){
		socket.emit("change_username",{client:client,server:server,username:user.val()});
		user.hide();
		// to.hide();
		// msg.show();
		// $("#send_message").show();
		// $("#open-btn").show();
		if(client){
			$("#clientForm").attr('style',"display:block");
		}else if(server){
			// $("#serverForm").attr('style',"display:block");
			$("#waiting-msg").show();
		}
		$("#send_name").hide();
	});
	
	$("#open-btn").click(function(){
		if(client){
			$("#clientForm").attr('style',"display:block");
		}else if(server){
			$("#serverForm").attr('style',"display:block");
		}
	})
	
	// $("#send_message").click(function(){
		// socket.emit("new_message",{client:client,server:server,to:to.val(),username:user.val(),message:msg.val()});
		// setTimeout(function(){
			// msg.val("");
		// },100);
	// });
	
	socket.on("new_message",function(data){
		if(client){
			$("#clientmessages").append("<li><div class='received-message'><h4>from:"+data.username+"</h4><p>message:"+data.message+"</p></div></li><br/>");
		}else{
			$("#serverForm").attr('style',"display:block");
			$("#waiting-msg").hide();
			to=data.username;
			$("#server-messages").append("<li><div class='received-message'><h4>from:"+data.username+"</h4><p>message:"+data.message+"</p></div></li><br/>");
		}
	});
	
	socket.on("sending_error",function(data){
		alert(data.message);
	});
	
	socket.on("client_disconnected",function(data){
		alert("Client Disconnected");
	});
	
	socket.on("user_busy",function(data){
		$("#serverForm").attr('style',"display:none");
		$("#server-messages").html("");
		$("#waiting-msg").show();
	});
	
	window.onbeforeunload=function(){
		var uname=$("#username").val();
		socket.emit("disconnected",{client:client,server:server,username:uname});
	};
	// window.onunload=closingFunction();
	
	
	
})