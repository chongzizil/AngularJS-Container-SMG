// url for tests.
var playersUrl = "http://1.smg-server.appspot.com/players";
var matchesUrl = "http://1.smg-server.appspot.com/matches";
var gamesUrl = "http://1.smg-server.appspot.com/container/gamesUrl";
var nonExistUrl = "http://this-is-a-fake-url.nyu.edu";

// assume that we only have two players with player id: 42 and 43.
var startMatchWithGameId = '{"accessSignature": "...", "playerIds": "...", "gameId": "..."}';
var joinMatchWithMatchId = '{"accessSignature": "...", "playerIds": "...", "matchId": "..."}';
var makeMove = '{"accessSignature": "...", "SetTurn":"...", "operation":"..."}';
var verifyMoveDone = '{"accessSignature": "...", "hackerPlayerId":"0", "message":"null"}';
var endGame = '{"SetTurn":"...", "EndGame": "xxx"}';
var Email = "chongzizil@gmail.com";
var validPassword = "1234";
var invalidPassword = "xxxxxxxxxx";
var validPlayerId = "100";
var invalidPlayerId = "101";
var registerInfo = '{"email": "chongzizil@gmail.com", "password": "123456", "firstName": "Youlong", "lastName": "Li"}';

/* 
 * Start(Insert) a new match
 * Send the accessSignature, playerIds and gameId
 * Should return matchId
 */
test("Start(Insert) a new match", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", matchesUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(matchId));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(startMatchWithGameId);
});

/* 
 * Join a match through a matchId
 * Should return gameId and playerIds
 */
test("Join a match through a matchId", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", matchesUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(gameId));
				ok(data.has(playerIds));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(joinMatchWithMatchId);
});

/* 
 * Receive the initial game infomation from the server
 * Should return the game's url, name, pics, height and weight
 */
test("Receive the initial game infomation from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", gamesUrl + '?gameId={gameId}', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(url));
				ok(data.has(name));
				ok(data.has(pics));
				ok(data.has(height));
				ok(data.has(width));
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

/* 
 * Send the player's move to the server
 * Should return UpdateUI
 */
test("Send the player's move to the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", matchesUrl + "/matchId/", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(yourPlayerId));
				ok(data.has(playersInfo));
				ok(data.has(state));
				ok(data.has(UpdataUI));
				ok(data.has(lastState));
				ok(data.has(lastMove));
				ok(data.has(lastMovePlayerId));
				ok(data.has(playerIdToNumberOfTokensInPot));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(makeMove);
});

/* 
 * Send the verifyMoveDone to the server
 * Should return UpdateUI
 */
test("Send the verifyMoveDone to the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", matchesUrl + '/matchId/', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(yourPlayerId));
				ok(data.has(playersInfo));
				ok(data.has(state));
				ok(data.has(UpdataUI));
				ok(data.has(lastState));
				ok(data.has(lastMove));
				ok(data.has(lastMovePlayerId));
				ok(data.has(playerIdToNumberOfTokensInPot));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(verifyMoveDone);
});

/* 
 * Recieve the player of the current turn from the server
 * Should return playerIdThatHasTurn
 */
test("Recieve the player of the current turn from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + '/matchId?playerIdThatHasTurn', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(playerIdThatHasTurn));
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

/* 
 * Send a end game operation to the server
 * Should return gameOverScores and gameOverReason
 */
test("Send a end game operation to the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", matchesUrl + '/matchId/', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(gameOverScores));
				ok(data.has(gameOverReason));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(endGame);
});

/* 
 * Send a request to end game when tie to the server and receive the game over score and reason from the server
 * Should return gameOverScores and gameOverReason
 */
test("Send a request to end game when tie to the server and receive the game over score and reason from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + '/matchId?requestToEndTie=true', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(gameOverScores));
				ok(data.has(gameOverReason));
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

/* 
 * Send a request to end game when tie to the server and receive the rejection from the server
 * Should return {"requestToEndTie" : "false"}
 */
test("Send a request to end game when tie to the server and receive the game over score and reason from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + '/matchId?requestToEndTie=true', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"requestToEndTie" : "false"});
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


/* 
 * Send a cancel to end game and receive the game over score and reason from the server
 * Should return gameOverScores and gameOverReason
 */
test("Send a request to end game when tie to the server and receive the game over score and reason from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + '/matchId?cancelGame=true', true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(gameOverScores));
				ok(data.has(gameOverReason));
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

/* 
 * Receive the game over score and reason from the server
 * Should return gameOverScores and gameOverReason
 */
test("Receive the game over score and reason from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + "matchId?gameOverScores&gameOverReason", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(gameOverScores));
				ok(data.has(gameOverReason));
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

/* 
 * Get a player's infomation from the server
 * Should return playerId, name, nickName, pic, tokens
 */
test("Get a player's infomation from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", playersUrl + "playerId={playerId}", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(playerId));
				ok(data.has(name));
				ok(data.has(nickName));
				ok(data.has(pic));
				ok(data.has(tokens));
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

/* 
 * Register a new account
 * Should return playerId
 */
test("Register a new account", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", playersUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(playerId));
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(registerInfo);
});

/* 
 * Register a new account with exists email
 * Should return {"error": "EMAIL_EXISTS"}
 */
test("Register a new account with exists email", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", playersUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"error": "EMAIL_EXISTS"});
			} else {
				throws(
						function(){
							throw "error";
						}, "xmlhttprequest do not have a right status!"
				);
			}
		}
	};
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(registerInfo);
});

/* 
 * Login an account
 * Should return playerId and accessSignature
 */
test("Login an account", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", playersUrl + validPlayerId + "?password=" + validPassword, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				ok(data.has(playerId));
				ok(data.has(accessSignature));
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

/* 
 * Login an account with a invalid playerId
 * Should return {"error": "WRONG_PLAYER_ID"}
 */
test("Login an account with a invalid playerId", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", playersUrl + invalidPlayerId + "?password=" + validPassword, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"error": "WRONG_PLAYER_ID"});
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

/* 
 * Login an account with a invalid password
 * Should return {"error": "WRONG_PASSWORD"}
 */
test("Login an account with a invalid password", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", playersUrl + validPlayerId + "?password=" + invalidPassword, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"error": "WRONG_PASSWORD"});
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