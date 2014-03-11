// varied urls used for tests.
var url = "http://3.smg-server.appspot.com/container/";
var gamePlayUrl = "http://3.smg-server.appspot.com/container/game_play";
var saveGameUrl = "http://3.smg-server.appspot.com/container/save_game";
var loadGameUrl = "http://3.smg-server.appspot.com/container/load_game";
// at current stage, we just consider these three kinds of devices: PC, android, iphone.
var pcUrl = "http://3.smg-server.appspot.com/container/pc";
var androidUrl = "http://3.smg-server.appspot.com/container/android";
var iphoneUrl = "http://3.smg-server.appspot.com/container/iphone";
var nonExistUrl = "http://this-is-a-fake-url.nyu.edu";
// assume that we only have two players with player id: 42 and 43.
var rightEmail = "jasonyl0806@gmail.com";
var wrongEmail = "jason@hotmail.com";
var rightPassword = "smg-test";
var wrongPassword = "xxxxxxxxxx";
var rightSaveGameParam = {"sid" : 42, "email" : rightEmail, "password" : rightPassword};
var wrongSaveGameParam = {"sid" : 44, "email" : rightEmail, "password" : rightPassword};
var rightLoadGameParam = {"lid" : 42, "email" : rightEmail, "password" : rightPassword};
var wrongLoadGameParam = {"lid" : 44, "email" : rightEmail, "password" : rightPassword};
var saveWithWrongAccountInfo = {"sid" : 43, "email" : wrongEmail, "password" : rightPassword};
var loadWithWrongAccountInfo = {"lid" : 42, "email" : rightEmail, "password" : wrongPassword};
var pcParam = {"sid" : 42, "device" : "pc", "email" : rightEmail, "password" : rightPassword};
var androidParam = {"sid" : 42, "device" : "android", "email" : rightEmail, "password" : rightPassword};
var iphoneParam = {"sid" : 42, "device" : "iphone", "email" : rightEmail, "password" : rightPassword};
var nonSupportedDeviceParam = {"sid" : 42, "device" : "wp", "email" : rightEmail, "password" : rightPassword};
var passAndPlayGameParam = {"pid" : 42, "game_mode" : "pass_play", "email" : rightEmail, "password" : rightPassword};
var wrongGameMode = {"pid" : 42, "game_mode" : "xxxxxx", "email" : rightEmail, "password" : rightPassword};

test("ReadyState or State Errors", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", nonExistUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				notStrictEqual(data.length, 0);
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.send();
});

/* 1. Players will be able to save a game during any time in the game.
 * 
 * Assume that the player want to save the game with the user id.
 * If the request is right, if will give us:
 * {	"Game": game object, "PlayerInfo": [{}, {}], 
 *  	"PlayIds": [], 		 "LastGameState": GameState object,
 *  	"lastMove": [], 	 "GameState": GameState object, 
 *  	"LastMovePlayerId": 42
 *  }
 */
test("Save the game with wrong account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", saveGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"MessageType": "Save_Error", "Description":"Wrong Account Info!"},
						"Account error message got when saving.");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", saveWithWrongAccountInfo.length);
	xhr.send(saveWithWrongAccountInfo);
});

test("Save the game with wrong parameter and right account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", saveGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"MessageType": "Save_Error", "Description":"Wrong User Id!"},
						"Error message got when saving");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", wrongSaveGameParam.length);
	xhr.send(wrongSaveGameParam);
});

test("Save the game with right parameter and right account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", saveGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data.length, 7, "We get a JSON object with have 7 fileds");
				deepEqual(data["PlayerInfo"].length = 2, "2 PlayerInfo");
				deepEqual(data["PlayerIds"].length = 2, "2 PlayerIds");
				ok(data["LastMovePlayerId"] == 42 || data["LastMovePlayerId"] == 43, 
						"last move player's id is 42 or 43.");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", rightSaveGameParam.length);
	xhr.send(rightSaveGameParam);
});

/* 2. Players will be able to load a game using their user ids.
 * 
 */
test("Load the game with wrong account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", loadGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"MessageType": "Load_Error", "Description":"Wrong Account Info!"},
						"Account error message got when loading.");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", loadWithWrongAccountInfo.length);
	xhr.send(loadWithWrongAccountInfo);
});

test("Load the game with wrong parameter and right account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", loadGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"MessageType": "Load_Error", "Description":"Wrong User Id!"},
						"Error message got when loading");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", wrongLoadGameParam.length);
	xhr.send(wrongLoadGameParam);
});

test("Load the game with right parameter and right account info", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", loadGameUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data.length, 7, "We get a JSON object with have 7 fileds");
				deepEqual(data["PlayerInfo"].length = 2, "2 PlayerInfo");
				deepEqual(data["PlayerIds"].length = 2, "2 PlayerIds");
				ok(data["LastMovePlayerId"] == 42 || data["LastMovePlayerId"] == 43, 
						"last move player's id is 42 or 43.");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", rightLoadGameParam.length);
	xhr.send(rightLoadGameParam);
});


/* 3. Players using different devices will fetch different views of game.
 * 
 */
test("Display on PC", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", pcUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data["device"], "pc", "display the game on pc");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", pcParam.length);
	xhr.send(pcParam);
});

test("Display on android", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", androidUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data["device"], "android", "display the game on android phone");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", androidParam.length);
	xhr.send(androidParam);
});

test("Display on iphone", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", iphoneUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data["device"], "iphone", "display the game on iphone");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", iphoneParam.length);
	xhr.send(iphoneParam);
});

test("Error Display on wp", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", iphoneUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"MessageType": "Device_Error", "Description":"Do not support wp!"},
				"Error message got when displaying on non supported devices");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", nonSupportedDeviceParam.length);
	xhr.send(nonSupportedDeviceParam);
});

/* 4. It can support pass-and-play mode.
 * 
 */
test("Pass and Play mode", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", gamePlayUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"GameMode": "pass_play", "message" : "no further communication with server needed!"}, 
						"no need to communication with server");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", passAndPlayGameParam.length);
	xhr.send(passAndPlayGameParam);
});

test("Wrong Game Mode", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", gamePlayUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data,  {"MessageType": "GameMode_Error", "Description":"No such game mode supported!"},
						"Error message got when chosing wrong game mode.");
			} else {}
		}
	};
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", wrongGameMode.length);
	xhr.send(wrongGameMode);
});