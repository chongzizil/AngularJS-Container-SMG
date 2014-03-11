var serverUrl = "http://3.smg-server.appspot.com/container/";

var gameid = 1;
var playerid = 42;
var hasTimeoutSupport = {"gameId" : gameid, "timeoutSupport" : true};
var noTimeoutSupport = {"gameId" : gameid, "timeoutSupport" : false};
var hasInviteFriendSupport = {"gameId" : gameid, "playerId" : playerId, "inviteFriend" : true};
var noInviteFriendSupport = {"gameId" : gameid, "playerId" : playerId, "inviteFriend" : false};
var hasAutoMatchSupport = {"gameId" : gameid, "playerId" : playerId, "autoMatch" : true};
var noAutoMatchSupport = {"gameId" : gameid, "playerId" : playerId, "autoMatch" : false};
var hasTieGameSupport = {"gameId" : gameid, "playerId" : playerId, "tieGame" : true};
var noTieGameSupport = {"gameId" : gameid, "playerId" : playerId, "tieGame" : false};
var hasSurrenderSupport = {"gameId" : gameid, "playerId" : playerId, "surrenderSupport" : true};
var noSurrenderSupport = {"gameId" : gameid, "playerId" : playerId, "surrenderSupport" : false};
var hasChatRoomSupport = {"gameId" : gameid, "playerId" : playerId, "chatRoomSupport" : true};
var noChatRoomSupport = {"gameId" : gameid, "playerId" : playerId, "chatRoomSupport" : false};
var hasBetSupport = {"gameId" : gameid, "playerId" : playerId, "betSupport" : true};
var noBetSupport = {"gameId" : gameid, "playerId" : playerId, "betSupport" : false};
var hasViewerSupport = {"gameId" : gameid, "playerId" : playerId, "viewerSupport" : true};
var noViewerSupport = {"gameId" : gameid, "playerId" : playerId, "viewerSupport" : false};

test("hasTimeOutSupport", function(){
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasTimeoutSupport,"We do have Timeout Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noTimeOutSupport", function(){
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noTimeoutSupport,"Sorry, we don't have Timeout Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasInviteFriendSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasInviteFriendSupport,"We do have Invite Friend Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noInviteFriendSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noInviteFriendSupport,"Sorry, we don't have Invite Friend Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasAutoMatchSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasAutoMatchSupport,"We do have Auto Match Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noAutoMatchSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noAutoMatchSupport,"Sorry, we don't have Auto Match Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasTieGameSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasTieGameSupport,"We do have Tie Game Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noTieGameSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noTieGameSupport,"Sorry, we don't have Tie Game Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasSurrenderSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasSurrenderSupport,"We do have Surrender Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noSurrenderSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noSurrenderSupport,"Sorry, we don't have Surrender Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasChatRoomSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasChatRoomSupport,"We do have Chat Room Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noChatRoomSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noChatRoomSupport,"Sorry, we don't have Chat Room Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasBetSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasBetSupport,"We do have Bet Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noBetSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noBetSupport,"Sorry, we don't have Bet Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("hasViewerSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,hasViewerSupport,"We do have Viewer Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});

test("noViewerSupport", function(){	
	var xmlhttp;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	}else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange =function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			var data = JSON.parse(xmlhttp.responseText);
			deepEqual(data,noViewerSupport,"Sorry, we don't have Viewer Support for you!");
		}
	};
	xmlhttp.open("POST",serverUrl,true);
	xmlhttp.responseType='json';
	xmlhttp.setRequestHeader('Content-Type','application/json');
	xmlhttp.send();	
});