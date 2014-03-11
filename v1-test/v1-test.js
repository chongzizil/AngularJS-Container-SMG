// url for tests.
var playersUrl = "http://1.smg-server.appspot.com/players";
var matchesUrl = "http://1.smg-server.appspot.com/matches";
var gamesUrl = "http://1.smg-server.appspot.com/container/gamesUrl";
var nonExistUrl = "http://this-is-a-fake-url.nyu.edu";

// assume that we only have two players with player id: 42 and 43.
var sendOperations = '{"accessSignature": "?", "operations": "?"}';
var Email = "chongzizil@gmail.com";
var validPassword = "1234";
var invalidPassword = "xxxxxxxxxx";
var validPlayerId = "100";
var invalidPlayerId = "101";
var registerInfo = '{"email": "chongzizil@gmail.com", "password": "123456", "firstName": "Youlong", "lastName": "Li"}';
var verifyMoveDone = '{"hackerPlayerId":"0", "message":"null"}';

test("ReadyState or State Errors", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("POST", nonExistUrl, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				deepEqual(data, {"operations": "?"});
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
	xhr.send(sendOperations);
});

/* 
 * Start a new match
 */
test("Start a new match", function(){
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
				equal(typeof data[0], "matchId");
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
	xhr.send('{"accessSignature": "?", "playerIds": "?", "gameId": "?"}');
});

/* 
 * Receive the initial game infomation from the server
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
				equal(typeof data[0], "url");
				equal(typeof data[1], "name");
				equal(typeof data[2], "pics");
				equal(typeof data[3], "height");
				equal(typeof data[4], "width");
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
 * Send the player's move to the server and receive the UpdataUI
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
				equal(typeof data[0], "UpdataUI");
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
 * Receive the verifyMove from the server
 */
test("Receive the verifyMove from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + "/matchId?verifyMove", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				equal(typeof data[0], "verifyMove");
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
 * Send the verifyMoveDone to the server
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
				equal(typeof data[0], "UpdateUI");
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
				equal(typeof data[0], "playerIdThatHasTurn");
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
 * Send a request to end game when tie to the server and receive the game over score and reason from the server
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
				equal(typeof data[0], "gameOverScores");
				equal(typeof data[1], "gameOverReason");
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
				equal(typeof data[0], "gameOverScores");
				equal(typeof data[1], "gameOverReason");
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
				equal(typeof data[0], "gameOverScores");
				equal(typeof data[1], "gameOverReason");
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
				equal(typeof data[0], "playerId");
				equal(typeof data[1], "nickName");
				equal(typeof data[2], "pic");
				equal(typeof data[3], "tokens");
				/*more player info*/
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
	xhr.send('{"gameOverScores": "?", "gameOverReason": "?"}');
});

/* 
 * Request to find a player to match from the server
 */
test("Request to find a player to match from the server", function(){
	var xhr;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET", matchesUrl + "gameId={gameId}&playerId={playerId}", true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function(){
		var status;
		var data;
		if(xhr.readyState == 4){
			status = xhr.status;
			if (status == 200){
				data = xhr.response;
				equal(typeof data[0], "playerIds");
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
	xhr.send('{"gameOverScores": "?", "gameOverReason": "?"}');
});

/* 
 * Register a new account
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
				equal(typeof data[0], "playerId");
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
				equal(typeof data[0], "playerId");
				equal(typeof data[1], "accessSignature");
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
				equal(1,1);
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