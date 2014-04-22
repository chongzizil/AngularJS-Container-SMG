/**
 * Pass-And-Play Mode Container
 */

smgContainer.controller('StandaloneController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $timeout, $sce, $window, $location, $modal, NewMatchStateService, GetGameInfoService, GetPlayerInfoService, SendMakeMoveService, PostMessageToFBService, NewMatchService, GetPicFromFBService) {
			$scope.imageUrl = $cookies.imageUrl;
			/*
			 * Variables for interacting with Server side.
			 */
			console.log("Log: standaloneController: StandAloneController starts here...");
			$scope.opponentInfos = [];
			$scope.gameInfo = {};
			$scope.FBLogin = false;
			$scope.playerImageUrl;
			$scope.matchInfo = {
				playerThatHasTurn: Number.MIN_VALUE,
				lastMovePlayerId: Number.MIN_VALUE,
				/*
				 All players' information:
				 (1). If this is the current player: email, firstname, lastname, nickname
				 (2). If other players (opponents): firstname, nickname
				 e.g.:
				 {
				 "playerId1" : {"email": "a@b.com", "firstname": "Long", "lastname": "Yang", "nickname": "Jason"},
				 "playerId2" : {"firstname" : "Xiao", "nickname" : "Shawn"}
				 }
				 */
				playersInfo: [],
				/*
				 All new match state will be saved here:
				 (1). Asynchronous: get new game state.
				 */
				state: {},
				/*
				 All last moves will be saved here, array of operations:
				 (1). Asynchronous: get new game state.
				 */
				lastMove: [],
				/*
				 Array of match states, will be used for save and load match.
				 */
				history: [],
				/*
				 The winner of the game. Each time loading a new game, it should be set to the default value
				 */
				winner: Number.MIN_VALUE
			};

			/*
			 * Variable for "Pass And Play" mode
			 */
			var currentPlayerIdThatHasTurn = $rootScope.playerIds[0];
			var lastPlayerIdThatHasTurn = $rootScope.playerIds[0];
			var mode;
			var timeOfEachTurn;

			var gameState = {
				'state' : {},
				'visibleTo' : {},
				'playerIdToNumberOfTokensInPot' : {},
				'playerThatHasTurn' : Number.MIN_VALUE,
				'gameOverReason' : ""
			}
			/*
			 * Variables for interacting with Game side. Temporarily store the game state locally.
			 * Initiated empty each time container loads the game
			 */
			var state = {};
			var lastState = state;
			/**
			 * endGameFlag is initiated undefined when loading the game. And it will be set to 'true' when there is an
			 * endGame operation in the last move. And will be set to undefined again before container updates the game
			 * result.
			 * @type {undefined}
			 */
			var endGameFlag = undefined;

			/**
			 * This model is used to communicate with controllers which is responsible for FaceBook communication
			 * @type {{message: string, messagePostToFB: string, FBLogin: (boolean|*)}}
			 */
			$scope.matchResultInfo = {
				message: '',
				messagePostToFB: '',
				FBLogin: $scope.FBLogin
			};
			/**
			 * Method used to retrieve Game Information, mainly the
			 * {@code $scope.gameInfo.url}
			 * {@code $scope.gameInfo.height}
			 * {@code $scope.gameInfo.width}
			 */
			var getGameInfo = function () {
				GetGameInfoService.get({gameId: $routeParams.gameId}).
						$promise.then(function (data) {
							if (data['error'] == 'WRONG_GAME_ID') {
								alert('Sorry, Wrong Game ID provided!');
							} else {
								//console.log("Log: get game info from server: " + angular.toJson(data));
								// 1. Get game information, all the .
								$scope.gameInfo.url = $sce.trustAsResourceUrl(data['url']);
								$scope.gameInfo.height = data['height'];
								$scope.gameInfo.width = data['width'];
								$scope.gameInfo.gameName = data['gameName'];
								if (data['width'] >= $(window).width()) {
									$scope.gameInfo.width = "90%";
								}
							}
						}
				);
			};

			/*
			 Auxiliary functions: isStateSame, isUndefinedOrNull,
			 */

			/**
			 * Method used to check whether the state is updated. Takes two object as parameters.
			 * Convert this two object into JSON string and then check whether they are same or not.
			 */
			var isStateSame = function (oldState, newState) {
				return angular.toJson(oldState) === angular.toJson(newState);
			};

			/**
			 * Check whether the variable is undefined, null or empty string.
			 * @param val
			 * @returns {*|boolean}
			 */
			var isUndefinedOrNull = function (val) {
				return angular.isUndefined(val) || val == null || val == '';
			};

			/*
			 Method interacts with the game side:
			 sendMessageToGame, showGameOverResult, replyGameReady, sendVerifyMoveToGame, sendUpdateUIToGame,
			 processLastMoveAndState, processLastPlayer
			 */

			/**
			 * Method send UpdateUI/VerifyMove to game. If the two parameters are the same, which means that
			 * it's the same player who mode the last move. No need to verify, so it sends the updateUI,
			 * otherwise send the VerifyMove. Id is a string.
			 */
			var sendMessageToGame = function (IdOne, IdTwo) {
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if (IdOne === IdTwo) {
					sendUpdateUIToGame();
				} else {
					//sendVerifyMoveToGame();
					sendUpdateUIToGame();
				}
				if (!isUndefinedOrNull(endGameFlag) && endGameFlag == 'true') {
					endGameFlag = undefined;
					showGameOverResult();
				}
			};

			/**
			 * This function should be called when the game is over, which is determined by the fact that there is a
			 * EndGame operation in the lastMove sent by server
			 * This method updates the matchResultInfo model based on the player
			 */
			var showGameOverResult = function () {
				if ($cookies.playerId == $scope.matchInfo.winner) {
					$scope.matchResultInfo.message = 'Cong! You have won the game!';
					$scope.matchResultInfo.messagePostToFB = 'I just won a match! :)';
				} else {
					$scope.matchResultInfo.message = 'Keep calm and carry on!';
					$scope.matchResultInfo.messagePostToFB = 'I just lost = =!!';
				}

				/*
				 Two fundamental methods which will be used in further implementation:
				 postToFB($scope.matchResultInfo['messagePostToFB']);
				 $location.url('/lobby/' + $routeParams.gameId);
				 */
			};

			/**
			 * Container will send the initial signal. Currently it supports two players
			 */
			var replyGameReady = function () {
				var initialUpdateUI = {
					'type': 'UpdateUI',
					'yourPlayerId': $cookies.playerId,
					'playersInfo': [
						{'playerId': $rootScope.playerIds[0]},
						{'playerId': $rootScope.playerIds[1]}
					],
					'state': {},
					'lastState': null,
					'lastMove': [],
					'lastMovePlayerId': null,
					'playerIdToNumberOfTokensInPot': {}
				};
				//console.log("in the container, it sends the initial UpdateUI is " + angular.toJson(initialUpdateUI));
				console.log("in the container, it sends the initial UpdateUI");
				$scope.sendMessageToIframe(initialUpdateUI);
			};

			var sendVerifyMoveToGame = function () {
				var verifyMove = {
					"type": "VerifyMove",
					'playersInfo': [
						{'playerId': $rootScope.playerIds[0]},
						{'playerId': $rootScope.playerIds[1]}
					],
					'state': state,
					'lastState': lastState,
					'lastMove': $scope.matchInfo.lastMove,
					"lastMovePlayerId": $scope.matchInfo.lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
				//console.log("In the container, it sends the following VerifyMove to the game: " + angular.toJson(verifyMove));
				console.log("In the container, it sends the following VerifyMove to the game: ");
				$scope.sendMessageToIframe(verifyMove);
			};


			var sendUpdateUIToGame = function () {
//				console.log("Log: standaloneController: matchInfo: " + angular.toJson($scope.matchInfo));
				var updateUI = {
					"type": "UpdateUI",
					'yourPlayerId': $scope.matchInfo.playerThatHasTurn,
					'playersInfo': [
						{'playerId': $rootScope.playerIds[0]},
						{'playerId': $rootScope.playerIds[1]}
					],
					'state': state,
					'lastState': lastState,
					'lastMove': $scope.matchInfo.lastMove,
					"lastMovePlayerId": $scope.matchInfo.lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
//				console.log("In the container, it sends the following UpdateUI to the game: " + angular.toJson(updateUI));
				//console.log("In the container, it sends the following UpdateUI");
				$scope.sendMessageToIframe(updateUI);
			};

			/**
			 * This method updates the state in the container. If there is an EndGame in the last move, change the
			 * endGameFlag to string true.
			 */
			var processLastMoveAndState = function () {
				if (!isUndefinedOrNull($scope.matchInfo.lastMove)) {
					lastState = state;
					state = $scope.matchInfo.state;
					for (var operationMessage in $scope.matchInfo.lastMove) {
						var endGameOperation = $scope.matchInfo.lastMove[operationMessage];
						if (endGameOperation['type'] === 'EndGame') {
							var score = endGameOperation['playerIdToScore'];
							for (var playerId in score) {
								if (score[playerId] == '1') {
									$scope.matchInfo.winner = playerId;
								}
							}
							endGameFlag = 'true';
						}
					}
				} else {
					console.log("Exception: From the server the last move is undefined!");
				}
			};


			/**
			 * Update the lastPlayer and current Player based on message from the server
			 * @param data the data received from server. It should contain lastMove and playerThatHasLastTurn key
			 */
			var processLastPlayer = function (data) {
				if (!isUndefinedOrNull(data)) {
					$scope.matchInfo.lastMovePlayerId = data['playerThatHasLastTurn'];
					var localLastMove = data['lastMove'];
					for (var operationMessage in localLastMove) {
						var setTurnOperation = localLastMove[operationMessage];
						if (setTurnOperation['type'] === "SetTurn") {
							$scope.matchInfo.playerThatHasTurn = setTurnOperation['playerId'];
						}
					}
				} else {
					console.log("Exception: From the server the response data is undefined!");
				}
			}

			/**
			 * Methods interact with the server side:
			 * sendMakeMoveServicePost(auxiliary method), be called inside the sendMoveToServer method.
			 * sendMoveToServer(fundamental method used to send operations to server)
			 * getNewMatchState
			 * $scope.endGame(reason, winner) 'oppo' stands for opponent and 'me' stands for the current player
			 */

			/**
			 * Method used to call POST method inside {@code SendMakeMoveService}.
			 */
			var sendMakeMoveServicePost = function (jsonMove) {
//				console.log("Log: input data for send make move to server: " + jsonMove);
				//console.log("Post Request: Make a move in the game.")
				SendMakeMoveService.save({matchId: $routeParams.matchId}, jsonMove).
						$promise.then(function (data) {
							if (data['error'] == "WRONG_ACCESS_SIGNATURE") {
								alert('Sorry, Wrong Access Signature received!');
							} else if (data['error'] == 'WRONG_PLAYER_ID') {
								alert('Sorry, Wrong Player ID received!');
							} else if (data['error'] == "JSON_PARSE_ERROR") {
								alert('Sorry, Wrong JSON Format received!');
							} else if (data['error'] == "MISSING_INFO") {
								alert('Sorry, Incomplete JSON data received!');
							} else {
//								console.log("Log: response for making move to server: " + angular.toJson(data));
								//console.log("Server responds a move with new state and lastMove.")
								$scope.matchInfo.state = data['state'];
								$scope.matchInfo.lastMove = data['lastMove'];
								processLastMoveAndState();
								processLastPlayer(data);
								sendMessageToGame($cookies.playerId, $scope.matchInfo.lastMovePlayerId);
							}
						}
				);
			};

			/**
			 * Method to shuffle the keys and returns the shuffled set
			 */
			var shuffle =  function(keys){
				var keysCopy = keys.slice(0);
				var result = [];
				while(!(keysCopy.length<1)){
					var index = Math.floor(Math.random()*keysCopy.length);
					var removed = keysCopy.splice(index,1);
					result.push(removed);
				}
				return result;
			};

			/**
			 * Function to copy a state object
			 * @param obj original object
			 * @returns copied object
			 */
			var clone = function(obj) {
				var str = JSON.stringify(obj)
				var copy = JSON.parse(str);
				return copy;
			};

			/**
			 * Method used to get keys of the state
			 * @param state
			 * @returns {Array}
			 */
			var getKeys = function(state){
				var keys = [];
				for(var key in state){
					keys.push(key);
				}
				return keys;
			};

			/**
			 * Method used to set {@code $scope.matchInfo.state} and {@code $scope.matchInfo.lastMove}
			 * @param playerId
			 * @param move
			 */
			var passAndPlayServer = function(playerId, move){
//				console.log("Log: getStateForPlayerId: playerId: " + angular.toJson(playerId));
//				console.log("Log: getStateForPlayerId: Input Move: " + angular.toJson(move));
				var gameState = makeMoveInPassAndPlayMode(move);
//				console.log("Log: standaloneController: gameState: " + angular.toJson(gameState));
				var state = gameState['state'];
				var visibleTo = gameState['visibleTo'];
				lastPlayerIdThatHasTurn = currentPlayerIdThatHasTurn;
				currentPlayerIdThatHasTurn = gameState.playerThatHasTurn;
				// 1. get new state according to visibility.
				var newState = clone(state);
				var keys = getKeys(state);
//				console.log("Log: standaloneController: keys: " + angular.toJson(keys));
//				console.log("Log: standaloneController: visibleTo: " + angular.toJson(visibleTo));
				for (var k in keys) {
					var visibleToPlayers = visibleTo[keys[k]];
					var value = null;
					if(visibleToPlayers=="ALL"){
						value = state[keys[k]];
					}
					if(visibleToPlayers.indexOf(currentPlayerIdThatHasTurn)>-1){
						value = state[keys[k]];
					}
					newState[keys[k]] = value;
				}
				// 2. Construct the data which is similar to the 'data' returned by makeMoveToRealServer
				var data = {
					'state' : newState,
					'lastMove' : move['operations'],
					'playerThatHasLastTurn' : lastPlayerIdThatHasTurn
				};
				// 3. Assign the 'data' data to {@code matchInfo}
//				console.log("Log: standaloneController: passAndPlayServer: " + angular.toJson(data));
				$scope.matchInfo.state = data['state'];
				$scope.matchInfo.lastMove = data['lastMove'];
				processLastMoveAndState();
				processLastPlayer(data);
				sendMessageToGame($cookies.playerId, $scope.matchInfo.lastMovePlayerId);
			};

			/**
			 * Method used to apply moves on state in "Pass-and-Play" mode.
			 * @param move The format is as following(attention please, not in json format):
			 * {
	     *  'accessSignature':
	     *  'playerIds':
	     *  'operations':
	     *  'gameOverReason': (Optional)
	     * }
			 * @return {*} The format is as following:
			 * {
			 *  'state' :
			 *  'visibleTo' :
			 *  'playerIdToNumberOfTokensInPot' :
			 *  'playerThatHasTurn' :
			 *  'gameOverReason' :
		   * }
			 */
			var makeMoveInPassAndPlayMode = function (move) {
//				console.log("Log: standaloneController: json typed Move data from Game: " + angular.toJson(move));
				var operations = move['operations'];

				for (var i in operations) {
					var operation = operations[i];

					if (operation['type'] === 'SetTurn' ) {
//						console.log("Log: standaloneController: PnP Mode: SetTurn: " + angular.toJson(operation) );
						gameState['playerThatHasTurn'] = operation['playerId'];
					} else if (operation['type'] === 'Set') {
//						console.log("Log: standaloneController: PnP Mode: Set: " + angular.toJson(operation) );
						gameState['state'][operation['key']] = operation['value'];
						gameState['visibleTo'][operation['key']] = operation['visibleToPlayerIds'];
					} else if (operation['type'] === 'SetRandomInteger') {
//						console.log("Log: standaloneController: PnP Mode: SetRandomInteger: " + angular.toJson(operation) );
						var key = operation['key'];
						var from = operation['from'];
						var to = operation['to'];
						var value = Math.floor((Math.random()*(to-from))+from);
						gameState['state'][key] = value;
						gameState['visibleTo'] = "ALL";
					} else if (operation['type'] === 'SetVisibility') {
//						console.log("Log: standaloneController: PnP Mode: SetVisibility: " + angular.toJson(operation) );
						gameState['visibleTo'][operation['key']] = operation['visibleToPlayerIds'];
					} else if (operation['type'] === 'Delete') {
//						console.log("Log: standaloneController: PnP Mode: Delete: " + angular.toJson(operation) );
						delete gameState['state'][operation['key']];
						delete gameState['visibleTo'][operation['key']];
					} else if (operation['type'] === 'Shuffle') {
//						console.log("Log: standaloneController: PnP Mode: Shuffle: " + angular.toJson(operation) );
						var keys = operation.keys;
						var shuffledKeys = shuffle(keys);
						var oldGameState = clone(gameState['state']);
						var oldVisibleTo = clone(gameState['visibleTo']);
						for (var j = 0; j < shuffledKeys.length; j++) {
							var fromKey = keys[j];
							var toKey = shuffledKeys[j];
							gameState['state'][toKey] = oldGameState[fromKey];
							gameState['visibleTo'][toKey] = oldVisibleTo[fromKey];
						}
					} else if (operation['type'] === 'AttemptChangeTokens') {
//						console.log("Log: standaloneController: PnP Mode: AttemptChangeTokens: " + angular.toJson(operation) );
						var p = operation['playerIdToNumberOfTokensInPot'];
						for (var index in $cookies.playerIds) {
							var id = $cookies.playerIds[index];
							gameState['playerIdToNumberOfTokensInPot'][id] = p[id];
						}
					} else if (operation['type'] === 'EndGame') {
//						console.log("Log: standaloneController: PnP Mode: EndGame: " + angular.toJson(operation) );
						if (operation['gameOverReason']) {
							gameState['gameOverReason'] = operation['gameOverReason'];
						}
					}
				}
				return gameState;
			};

			/**
			 * Method used to send operation from Game to Server. Wrap the message with gameOverReason.
			 * @param operations operations got from Game.
			 */
			var sendMoveToServer = function (operations) {
				// 1. Wrap up the operations as a move.
				var move;
				for (var operationMessage in operations) {
					var endGameOperation = operations[operationMessage];
					if (endGameOperation['type'] === 'EndGame') {
						endGameFlag = 'true'
					}
				}
				if (endGameFlag === 'true') {
					move = {
						"accessSignature": $cookies.accessSignature,
						"playerIds": $rootScope.playerIds,
						"operations": operations,
						"gameOverReason": "Over"
					};
				} else {
					move = {
						"accessSignature": $cookies.accessSignature,
						"playerIds": $rootScope.playerIds,
						"operations": operations
					};
				}
//				var jsonMove = angular.toJson(move);
//				sendMakeMoveServicePost(jsonMove);
//				console.log("Log: StandaloneController: Mode: " + angular.toJson(mode));
//				console.log("Log: StandaloneController: currentPlayerIdThatHasTurn: " + currentPlayerIdThatHasTurn);
//				console.log("Log: StandaloneController: move: " + angular.toJson(move));
				passAndPlayServer(currentPlayerIdThatHasTurn, move);
			};

			/**
			 * Method used to end current game in two situation:
			 * 1. Game has a winner.
			 * 2. One of the players surrenders.
			 *
			 * Add GameOver reason. 'p' stands for quit and 'Time Out' stands for time out
			 */
			$scope.endGame = function (reason, passinWinner) {
				// 1. Make up the EndGame typed move.
				var move = {
					"accessSignature": $cookies.accessSignature,
					"playerIds": $rootScope.playerIds,
					"operations": [
						{
							"type": "EndGame",
							"playerIdToScore": {}
						}
					],
					"gameOverReason": reason
				};
				/*
				 1.1 If one player is pressing the "End Game" button, he is considered to surrender,
				 and current implementation supports multiple players (>= 2).
				 */
				var forkPlayerIds = $rootScope.playerIds.slice(0);
				var index = forkPlayerIds.indexOf($cookies.playerId);
				forkPlayerIds.splice(index, 1);
				if (passinWinner == 'oppo') {
					for (var index in forkPlayerIds) {
						move["operations"][0]['playerIdToScore'][forkPlayerIds[index]] = 1;
					}
					move["operations"][0]['playerIdToScore'][$cookies.playerId] = 0;
				} else if (passinWinner == 'me') {
					for (var index in forkPlayerIds) {
						move["operations"][0]['playerIdToScore'][forkPlayerIds[index]] = 0;
					}
					move["operations"][0]['playerIdToScore'][$cookies.playerId] = 1;
				}
				var jsonMove = angular.toJson(move);
				sendMakeMoveServicePost(jsonMove);
			};

			/**
			 * Method used to get new game state in asynchronous game mode.
			 */
			$scope.getNewMatchState = function () {
//				console.log("Log: standaloneController: routeParams.matchId: " + angular.toJson($routeParams.matchId));
				NewMatchStateService.get({matchId: $routeParams.matchId, playerId: $cookies.playerId,
					accessSignature: $cookies.accessSignature})
						.$promise.then(function (data) {
							if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
								alert('Sorry, wrong access signature provided!');
							} else if (data['error'] === 'WRONG_PLAYER_ID') {
								alert('Sorry, wrong player ID provided!');
							} else if (data['error'] === 'WRONG_MATCH_ID') {
								alert('Sorry, wrong match ID provided!');
							} else {
//								console.log("Log: get new match state (async mode): " + angular.toJson(data));
								// 1. Get state and last move
								$scope.matchInfo.state = data['state'];
								$scope.matchInfo.lastMove = data['lastMove'];
								// 2. UpdateUI for Game with the received state.
								// If the state is empty
								if (isStateSame($scope.matchInfo.state, {})) {
									replyGameReady();
								}
								//console.log("!isStateSame(state,$scope.matchInfo.state) " + !isStateSame(state,$scope.matchInfo.state));
								if (!isStateSame(state, $scope.matchInfo.state)) {
//									console.log("Log: Get new match state from server(changing local state)!")
//									console.log("Log: New State is " + angular.toJson($scope.matchInfo.state));
									processLastMoveAndState();
									processLastPlayer(data);
									sendMessageToGame($cookies.playerId, $scope.matchInfo.lastMovePlayerId);
								}
							}
						}
				);
			};

			/**
			 * Method used to get current user's information
			 */
			var getCurrentPlayerInfo = function () {
				$scope.matchInfo.playersInfo = [];
				GetPlayerInfoService.get({playerId: $cookies.playerId,
					targetId: $cookies.playerId, accessSignature: $cookies.accessSignature}).
						$promise.then(function (data) {
							if (data['error'] == "WRONG_PLAYER_ID") {
								alert("Sorry, Wrong Player ID provided!");
							} else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
								alert('Sorry, Wrong Access Signature provided!');
							} else if (data['error'] == 'WRONG_TARGET_ID') {
								alert('Sorry, Wrong Target ID provided!');
							} else {
								getImageUrlFromFB();
								$scope.matchInfo.playersInfo.push({playerId: $cookies.playerId, info: data});
								if ($routeParams.mode === "pass_and_play") {
//									console.log("*******************************")
									// Insert a opponent for pass and play
									$scope.matchInfo.playersInfo.push({playerId: $cookies.playerId + "11111",
										info: {nickname: "Player 2", email:"Pass&Play", lastname: "Player 2", firstname: "Player 2",
										imageURL: "http://smg-server.appspot.com/images/giraffe.gif"}});
//									console.log($scope.matchInfo.playersInfo);
								}
							}
						});
			};

			/**
			 * Method used to get User Image Url from Facebook
			 * @return User's Image Url
			 */
			var getImageUrlFromFB = function () {
				if ($scope.FBLogin) {
					GetPicFromFBService.get({access_token: $cookies.FBAccessToken}).
							$promise.then(function (data) {
//								console.log("Log: standaloneController: getImageUrlFromFB: " + angular.toJson(data));
								$scope.playerImageUrl = data['data']['url'];
							}
					)
				} else {
					$scope.playerImageUrl = "img/giraffe.gif";
				}
			};

			/**
			 * Method used to get all the players' info except for current player's.
			 * @param playerIds
			 */
			var getAllOtherPlayersInfo = function (playerIds) {
//				console.log("Log: get players info: playerIds: " + angular.toJson(playerIds));
				var playerNum = 0;
				var forkPlayerIds = playerIds.slice(0);
				var index = forkPlayerIds.indexOf($cookies.playerId);
				forkPlayerIds.splice(index, 1);
				for (var index in forkPlayerIds) {
					GetPlayerInfoService.get({playerId: $cookies.playerId,
						targetId: forkPlayerIds[index], accessSignature: $cookies.accessSignature}).
							$promise.then(function (data) {
								if (data['error'] == "WRONG_PLAYER_ID") {
									alert("Sorry, Wrong Player ID provided!");
								} else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, Wrong Access Signature provided!');
								} else if (data['error'] == 'WRONG_TARGET_ID') {
									alert('Sorry, Wrong Target ID provided!');
								} else {
//									console.log("Log: get players info: current playerId: " + $cookies.playerId);
//									console.log("Log: get players info: id: " + forkPlayerIds[playerNum] + " data: " + angular.toJson(data));
									$scope.matchInfo.playersInfo.push(
											{
												playerId: forkPlayerIds[playerNum],
												info: data
											}
									);
									playerNum = playerNum + 1;
//									console.log("Log: inside getAllOtherPlayersInfo method, matchInfo: " + angular.toJson($scope.matchInfo));
								}
							}
					);
				}
			};

			/**
			 * Method used to post message on Facebook
			 */
			var postToFB = function (messageToFB) {
				PostMessageToFBService.save({message: messageToFB, access_token: $cookies.FBAccessToken}, "")
						.$promise.then(function (response) {
//							console.log("Log: standaloneController: response from posting to FB: " + angular.toJson(response));
						}
				);
			};

			/**
			 * Method used to get playerIds from server
			 */
			var getPlayerIds = function () {
				NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature})
						.$promise.then(function (data) {
//							console.log("Log: standaloneController: response from NewMatchService: " + angular.toJson(data));
							if (!data['matchId']) {
								if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'WRONG_PLAYER_ID') {
									alert("Sorry, please provide correct Player ID!");
								} else if (data['error'] === 'NO_MATCH_FOUND') {
									alert("Sorry, no match found!")
								}
							} else {
								$rootScope.playerIds = data['playerIds'];
								$cookies.matchId = data['matchId'];
								getCurrentPlayerInfo();
								initiatePlayerTurn();
								if (!$scope.$$phase) {
									$scope.$apply();
								}
							}
						});
			};

			/**
			 * Filter function used to filter out the current player's information from the opponent part.
			 */
			$scope.filterFnOpponents = function (playerInfo) {
				return playerInfo.playerId !== $cookies.playerId;
			};

			$scope.filterFnCurrentPlayer = function (playerInfo) {
				return playerInfo.playerId === $cookies.playerId;
			};


			$scope.filterFnCurrentTurnPlayer = function (playerInfo) {
				return playerInfo.playerId === $scope.matchInfo.playerThatHasTurn;
			};


			/**
			 *Bootstrapped method
			 *initiatePlayerTurn, $scope.sendMessageToIframe, listener
			 */


			var initiatePlayerTurn = function () {
				if (!isUndefinedOrNull($rootScope.playerIds)) {
					$scope.matchInfo.playerThatHasTurn = $rootScope.playerIds[0];
					$scope.matchInfo.lastMovePlayerId = $scope.matchInfo.playerThatHasTurn;
					$scope.matchInfo.winner = Number.MIN_VALUE;
					state = {};
					lastState = state;
					endGameFlag = undefined;
				} else {
					console.log("Exception: playerIds are null");
				}
			};

			$scope.sendMessageToIframe = function (message) {
				var win = $window.document.getElementById('gameIFrame').contentWindow;
				win.postMessage(message, "*");
			};

			function listener(event) {
				var data = event.data;
//				console.log("In the container, it receives the data from the game Iframe " + data['type']);
				if (data['type'] === "GameReady") {
					console.log()
//					$scope.getNewMatchState();
					// did nothing when receiving "GameReady"
					replyGameReady();
				} else if (data['type'] === "MakeMove") {
					var operations = data['operations'];
					//console.log("In the container, it sends to the server, operations are " + angular.toJson(operations));
					sendMoveToServer(operations);
				} else if (data['type'] === "VerifyMoveDone") {
					//deal with verifyMoveDone
					//no hacker detected
					if (isUndefinedOrNull(data['hackerPlayerId'])) {
						sendUpdateUIToGame();
					} else {
//						console.log("Hacker Detected!!! " + data['hackerPlayerId']);
					}
				} else {
//					console.log("In the container listener, can't deal with the message from the game!!" + " Type " + data['type']);
				}
			};


			/**
			 * Formal code starts here.
			 */

			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else {
				if ($window.addEventListener) {
					addEventListener("message", listener, false);
				} else {
					attachEvent("onmessage", listener);
				}
				$scope.displayGetNewStateButton = true;

				// Check whether the player login with Facebook
				if ($cookies.FBAccessToken == "undefined" || isUndefinedOrNull($cookies.FBAccessToken)) {
					$scope.FBLogin = false;
				} else {
					$scope.FBLogin = true;
				}
				$scope.matchResultInfo.FBLogin = $scope.FBLogin;
				// 0. Get the input parameters
				mode = $routeParams.mode;
				timeOfEachTurn = $routeParams.timeOfEachTurn;
				// 1. Get game information.
				getGameInfo();
				// 2. Get playerIds from server: this is used for case when user refresh the web browser.
//				getPlayerIds();
				getCurrentPlayerInfo();
				initiatePlayerTurn();
			}
		}
);