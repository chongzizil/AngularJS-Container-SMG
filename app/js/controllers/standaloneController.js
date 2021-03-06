/**
 * Pass-And-Play Mode Container
 */

smgContainer.controller('StandaloneController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $timeout, $q, $sce, $window, $document, $location,
		          $modal, NewMatchStateService, GetGameInfoService, GetPlayerInfoService) {

			/******************************* Initial game container *******************************/

			/** Adjust the game container to the full size of the broswer. */
			var adjustGameContainer = function () {
				var gameContainer = $("#gameContainer");
				var gameIFrame = $("#gameIFrame");
//				console.log("----" + gameIFrame.width() + "," + gameIFrame.height());
//				gameIFrame.css("width", gameContainer.width() + "px");
//				if (windows.height() < 960) {
				gameIFrame.css("height", $(window).height() + "px");
//				console.log("The iFrame's height is: "+$(window).height());
//				} else {
//					gameIFrame.css("height", windows.height() + "px");
//				}
			};

			/** Every time the broswer is resized, adjust the size of the game container too. */
			$(window).resize(function() {
				adjustGameContainer();
			});

			/*************************** End of initial game container ****************************/

			/******************************* Variables: Server side *******************************/


//		var isFBLogin = false;
			$scope.playerImageUrl = '';
//      $scope.displayQuitButton = false;
			$scope.opponentInfos = [];
			$scope.gameInfo = {};
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



			/*************************** End of Variables: Server side ****************************/

			/******************************* Variables: Stand alone *******************************/

			var playerIds = [];
			var currentPlayerIdThatHasTurn = $cookies.playerId;
			var lastPlayerIdThatHasTurn = $cookies.playerId;
			var serverGameState = {
				state : {},
				visibleTo : {},
				playerIdToNumberOfTokensInPot : {},
				playerThatHasTurn : Number.MIN_VALUE,
				gameOverReason : ""
			};

			$scope.backToLobbyUrl = "#/lobby/" + $routeParams.gameId;

			/*************************** End of Variables: Stand alone ****************************/

			/******************************** Variables: Game Side ********************************/

			/*
			 * Temporarily store the game state locally.
			 * Initiated empty each time container loads the game
			 */
			var state = {};
			var lastState = state;

			/**
			 * hasGameEnded is initiated false when loading the game. And it will be set to true when there is an
			 * endGame operation in the last move. And will be set to false again before container updates the game
			 * result.
			 * @type {boolean}
			 */
			var hasGameEnded = false;

			/**
			 * After the game is ended, matchResultInfo stores all necessary info.
			 * @type {{winner: string, opponentId: string, hasWon: boolean, isStandAlone: boolean, isFBLogin: boolean}}
			 */
			$scope.matchResultInfo = {
				winner: '',
				opponentId: '',
				gameId: $routeParams.gameId,
				hasWon: false,
				isStandAlone: true,
				isFBLogin: false
			};

			/**************************** End of variables: Game Side *****************************/

			/**
			 * Method used to retrieve Game Information, mainly the
			 * {@code $scope.gameInfo.url}
			 * {@code $scope.gameInfo.height}
			 * {@code $scope.gameInfo.width}
			 * {@code $scope.gameInfo.gameName}
			 */
			var getGameInfo = function () {
				GetGameInfoService.getGameInfo($routeParams.gameId)
						.then(function (data) {
							if (angular.isDefined(data)) {
								$scope.gameInfo.url = $sce.trustAsResourceUrl(data['url']);
								$scope.gameInfo.width = "100%";
							}
						});
			};

			/*
			 Auxiliary functions: isStateSame, isUndefinedOrNullOrEmpty,
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
			var isUndefinedOrNullOrEmpty = function (val) {
				return angular.isUndefined(val) || val == null || val == '';
			};

			/******************************** Functions: Game Side ********************************/

			/**
			 * sendMessageToGame, showGameOverResult, replyGameReady, sendVerifyMoveToGame,
			 * sendUpdateUIToGame, processLastMoveAndState, processLastPlayer
			 */

			/**
			 * Send UpdateUI/VerifyMove to game. If the two parameters are the same, it means that
			 * the same player made the last move. So no need to verify and directly send the updateUI,
			 * otherwise send the VerifyMove.
			 * Id is a string.
			 */
			var sendMessageToGame = function (IdOne, IdTwo) {
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				if (IdOne === IdTwo) {
					sendUpdateUIToGame();
				} else {
					// VerifyMove is currently deleted...
					//sendVerifyMoveToGame();
					sendUpdateUIToGame();
				}
				if (hasGameEnded) {
					hasGameEnded = false;
					showGameOverResult();
				}
			};

			/**
			 * This function should be called when the game is over, which is
			 * determined by the fact that there is a EndGame operation in the
			 * lastMove sent by server.
			 * This function updates the matchResultInfo.
			 * Only support 2 player game for now...
			 */
			var showGameOverResult = function () {
				if ($cookies.playerId == $scope.matchInfo.winner) {
					$scope.matchResultInfo.winner = $cookies.playerId;
					$scope.matchResultInfo.hasWon = true;
				} else {
					$scope.matchResultInfo.winner = $scope.matchInfo.winner;
					$scope.matchResultInfo.hasWon = false;
				}

				if ($cookies.playerId === playerIds[0]) {
					$scope.matchResultInfo.opponentId = playerIds[1];
				} else {
					$scope.matchResultInfo.opponentId = playerIds[0];
				}

				$scope.matchResultInfo.isStandAlone = true;
				$rootScope.matchResultInfo = $scope.matchResultInfo;

				$location.url('/gameResult/' + $routeParams.gameId);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

			/**
			 * Send the initial UpdateUI.
			 * Currently it supports two players.
			 */
			var replyGameReady = function () {
//				console.log("relying gameReady.......................................");
				var initialUpdateUI = {
					'type': 'UpdateUI',
					'yourPlayerId': $cookies.playerId,
					'playersInfo': [
						{'playerId': playerIds[0]},
						{'playerId': playerIds[1]}
					],
					'state': {},
					'lastState': null,
					'lastMove': [],
					'lastMovePlayerId': null,
					'playerIdToNumberOfTokensInPot': {}
				};
//	      console.log("********** The container sent the initial UpdateUI...");
//	      console.log(angular.toJson(initialUpdateUI));
				sendMessageToIFrame(initialUpdateUI);
			};

			/**
			 * Send the VerifyMove to the game.
			 * Currently deleted.
			 */
			/*var sendVerifyMoveToGame = function () {
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
			 console.log("********** The container sent the VerifyMove UpdateUI...");
			 console.log(angular.toJson(verifyMove));
			 sendMessageToIFrame(verifyMove);
			 };*/

			/**
			 * Send the UpdateUI to the game.
			 * Currently deleted.
			 */
			var sendUpdateUIToGame = function () {
				var updateUI = {
					"type": "UpdateUI",
					'yourPlayerId': $scope.matchInfo.playerThatHasTurn,
					'playersInfo': [
						{'playerId': playerIds[0]},
						{'playerId': playerIds[1]}
					],
					'state': state,
					'lastState': lastState,
					'lastMove': $scope.matchInfo.lastMove,
					"lastMovePlayerId": $scope.matchInfo.lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
//	      console.log("********** The container sent the UpdateUI...");
//	      console.log(angular.toJson(initialUpdateUI));
				sendMessageToIFrame(updateUI);
			};

			/**
			 * This method updates the state in the container. If there is an EndGame
			 * in the last move, change the hasGameEnded to true.
			 */
			var processLastMoveAndState = function () {
				if (!isUndefinedOrNullOrEmpty($scope.matchInfo.lastMove)) {
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
							hasGameEnded = true;
						}
					}
				} else {
//					console.log("Exception from processLastMoveAndState(): The last move from the server is undefined!");
				}
			};


			/**
			 * Update the lastPlayer and current Player based on message from the server
			 * @param data the data received from server. It should contain lastMove and
			 * playerThatHasLastTurn key.
			 */
			var processLastPlayer = function (data) {
				if (!isUndefinedOrNullOrEmpty(data)) {
					$scope.matchInfo.lastMovePlayerId = data['playerThatHasLastTurn'];
					var localLastMove = data['lastMove'];
					for (var operationMessage in localLastMove) {
						var setTurnOperation = localLastMove[operationMessage];
						if (setTurnOperation['type'] === "SetTurn") {
							$scope.matchInfo.playerThatHasTurn = setTurnOperation['playerId'];
						}
					}
				} else {
//					console.log("Exception: The response data from the server is undefined!");
				}
			};

			/**************************** End of functions: Game Side *****************************/

			/****************************** Functions: "Server" Side ******************************/

			/**
			 * Method used to shuffle the keys and returns the shuffled set
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
			 * Method used to copy a state object
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
			 * @param localState
			 * @returns {Array}
			 */
			var getKeys = function(localState){
				var keys = [];
				for(var key in localState){
					keys.push(key);
				}
				return keys;
			};

			/**
			 * Method used to set {@code $scope.matchInfo.state} and {@code $scope.matchInfo.lastMove}
			 * @param playerId
			 * @param move
			 */
			var standAloneServer = function(playerId, move){

//				console.log("********** Get state for playerId: " + angular.toJson(playerId));
//				console.log("********** Get input Move...");
//				console.log(angular.toJson(move));
				var gameState = makeMoveInPassAndPlayMode(move);
//				console.log("********** Game state in standAloneServer()...");
//				console.log(angular.toJson(serverGameState));
				var state = gameState['state'];
				var visibleTo = gameState['visibleTo'];
				lastPlayerIdThatHasTurn = currentPlayerIdThatHasTurn;
				currentPlayerIdThatHasTurn = gameState.playerThatHasTurn;

				// 1. get new state according to visibility.
				var newState = clone(state);
				var keys = getKeys(state);
//				console.log("********** Keys in standAloneServer()...");
//				console.log(angular.toJson(keys));
//				console.log("********** VisibleTo in standAloneServer()...");
//				console.log(angular.toJson(visibleTo));
				for (var k in keys) {
					var visibleToPlayers = visibleTo[keys[k]];
					var value = null;
//					console.log("visibleToPlayers-----------------------------------------------------" + visibleToPlayers);
					if(visibleToPlayers=="ALL"){
						value = state[keys[k]];
					} else if(visibleToPlayers.indexOf(currentPlayerIdThatHasTurn)>-1){
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
//				console.log("********** Data in standAloneServer()...");
//				console.log(angular.toJson(data));
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
//				console.log("********** makeMoveInPassAndPlayMode(): JSON typed Move data from Game...");
//				console.log(angular.toJson(move));
				var operations = move['operations'];

				for (var i in operations) {
					var operation = operations[i];

					if (operation['type'] === 'SetTurn' ) {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - SetTurn...");
//						console.log(angular.toJson(operation));
						serverGameState['playerThatHasTurn'] = operation['playerId'];
					} else if (operation['type'] === 'Set') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - Set...");
//						console.log(angular.toJson(operation));
						serverGameState['state'][operation['key']] = operation['value'];
						serverGameState['visibleTo'][operation['key']] = operation['visibleToPlayerIds'];
//						console.log(operation['visibleToPlayerIds']);
//						console.log(operation['key']);
					} else if (operation['type'] === 'SetRandomInteger') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - SetRandomInteger...");
//						console.log(angular.toJson(operation));
						var key = operation['key'];
						var from = operation['from'];
						var to = operation['to'];
						var value = Math.floor((Math.random()*(to-from))+from);
						serverGameState['state'][key] = value;
						serverGameState['visibleTo'][key] = "ALL";
					} else if (operation['type'] === 'SetVisibility') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - SetVisibility...");
//						console.log(angular.toJson(operation));
						serverGameState['visibleTo'][operation['key']] = operation['visibleToPlayerIds'];
//						console.log(operation['visibleToPlayerIds']);
//						console.log(operation['key']);
					} else if (operation['type'] === 'Delete') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - Delete...");
//						console.log(angular.toJson(operation));
						delete serverGameState['state'][operation['key']];
						delete serverGameState['visibleTo'][operation['key']];
					} else if (operation['type'] === 'Shuffle') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode - Shuffle...");
//						console.log(angular.toJson(operation));
						var keys = operation.keys;
						var shuffledKeys = shuffle(keys);
						var oldGameState = clone(serverGameState['state']);
						var oldVisibleTo = clone(serverGameState['visibleTo']);
						for (var j = 0; j < shuffledKeys.length; j++) {
							var fromKey = keys[j];
							var toKey = shuffledKeys[j];
							serverGameState['state'][toKey] = oldGameState[fromKey];
							serverGameState['visibleTo'][toKey] = oldVisibleTo[fromKey];
						}
					} else if (operation['type'] === 'AttemptChangeTokens') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode: - AttemptChangeTokens...");
//						console.log(angular.toJson(operation));
						var p = operation['playerIdToNumberOfTokensInPot'];
						for (var index in $cookies.playerIds) {
							var id = $cookies.playerIds[index];
							serverGameState['playerIdToNumberOfTokensInPot'][id] = p[id];
						}
					} else if (operation['type'] === 'EndGame') {
//						console.log("********** makeMoveInPassAndPlayMode(): PnP Mode: - EndGame...");
//						console.log(angular.toJson(operation));
						if (operation['gameOverReason']) {
							serverGameState['gameOverReason'] = operation['gameOverReason'];
						}
					}
				}
				return serverGameState;
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
						hasGameEnded = true;
					}
				}
				if (hasGameEnded == true) {
					move = {
						"accessSignature": $cookies.accessSignature,
						"playerIds": playerIds,
						"operations": operations,
						"gameOverReason": "Over"
					};
				} else {
					move = {
						"accessSignature": $cookies.accessSignature,
						"playerIds": playerIds,
						"operations": operations
					};
				}

//				console.log("********** Current play mode is: " + angular.toJson($routeParams.mode));
//				console.log("********** currentPlayerIdThatHasTurn: " + currentPlayerIdThatHasTurn);
//				console.log("********** The move from sendMoveToServer()...");
//				console.log(angular.toJson(move));
				standAloneServer(currentPlayerIdThatHasTurn, move);
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
					"playerIds": playerIds,
					"operations": [
						{
							"type": "EndGame",
							"playerIdToScore": {}
						}
					],
					"gameOverReason": reason
				};

				/*
				 * If one player pressed the "quit" button, he is considered to surrender,
				 * and current implementation supports multiple players (>= 2).
				 */
				var forkPlayerIds = playerIds.slice(0);
				var indexOfPlayerId = forkPlayerIds.indexOf($cookies.playerId);
				forkPlayerIds.splice(indexOfPlayerId, 1);
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
			};

			/**
			 * Method used to get current user's information
			 */
			var getCurrentPlayerInfo = function () {
				$scope.matchInfo.playersInfo = [];

				GetPlayerInfoService.getPlayerInfo($cookies.playerId, $cookies.playerId,
						$cookies.accessSignature)
						.then(function (data) {
							if (angular.isDefined(data)) {
								$scope.matchInfo.playersInfo.push({playerId: $cookies.playerId, info: data});

								getPlayerSelfImageUrl();

								if ($routeParams.mode === "pass_and_play") {
									// Insert a opponent for pass and play
									$scope.matchInfo.playersInfo.push({playerId: $cookies.playerId + "11111",
										info: {nickname: "Player 2", email:"Pass&Play", lastname: "Player 2", firstname: "Player 2",
											imageURL: "http://smg-server.appspot.com/images/giraffe.gif"}});
								} else if ($routeParams.mode === "play_with_ai") {
									// Insert a opponent for play with ai
									$scope.matchInfo.playersInfo.push({playerId: "0",
										info: {nickname: "AI", email:"-----", lastname: "D2", firstname: "R2",
											imageURL: "http://smg-server.appspot.com/images/giraffe.gif"}});
								}
							}
						});
			};

			/**
			 * Method used to get User Image Url
			 * @return User's Image Url
			 */
			var getPlayerSelfImageUrl = function () {
				//TODO: Check later
				$scope.playerImageUrl = $scope.matchInfo.playersInfo[0].imageURL;
			};

			/************************** End of Functions: "Server" Side ***************************/

			/********************************** Functions: Filter *********************************/

			//Filter out all opponent players information.
			$scope.filterFnOpponents = function (playerInfo) {
				return playerInfo.playerId !== $cookies.playerId;
			};

			//Filter out the player self information.
			$scope.filterFnCurrentPlayer = function (playerInfo) {
				return playerInfo.playerId === $cookies.playerId;
			};

			//Filter out all players information except the current turn one.
			$scope.filterFnCurrentTurnPlayer = function (playerInfo) {
				return playerInfo.playerId === $scope.matchInfo.playerThatHasTurn;
			};

			/****************************** End of Functions: Filter ******************************/

			/********************************** Functions: iFrame *********************************/

			/**
			 * initiatePlayerTurn, $scope.sendMessageToIFrame, listener
			 */

			var initiatePlayerTurn = function () {
				if (!isUndefinedOrNullOrEmpty(playerIds)) {
					$scope.matchInfo.playerThatHasTurn = playerIds[0];
					$scope.matchInfo.lastMovePlayerId = $scope.matchInfo.playerThatHasTurn;
					$scope.matchInfo.winner = Number.MIN_VALUE;
					state = {};
					lastState = state;
					hasGameEnded = false;
				} else {
//					console.log("Exception from initiatePlayerTurn(): playerIds are null");
				}
			};

			var sendMessageToIFrame = function (message) {
				var win = $window.document.getElementById('gameIFrame').contentWindow;
				win.postMessage(message, "*");
			};

			function listener(event) {
				var data = event.data;
//				console.log("********** The container receives data from the game iFrame...");
//				console.log(data['type']);
				if (data['type'] === "GameReady") {
					replyGameReady();
				} else if (data['type'] === "MakeMove") {
					var operations = data['operations'];
//					console.log("********** The container sends operations to the server...");
//					console.log(angular.toJson(operations));
					sendMoveToServer(operations);
				} else if (data['type'] === "VerifyMoveDone") {
					// Deal with verifyMoveDone, currently deleted...
					if (isUndefinedOrNullOrEmpty(data['hackerPlayerId'])) {
						// No hacker detected
						sendUpdateUIToGame();
					} else {
						// Hacker detected
//						console.log("********** Hacker Detected!!! Hacker id is: " + data['hackerPlayerId']);
					}
				} else {
//					console.log("********** The container can't deal with the message from the game iFrame which Type is: " + data['type']);
				}
			}

			/****************************** End of functions: iFrame ******************************/

			/************************************* Start point ************************************/

			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else {

				// Make sure the page will be reloaded every time.
				if ($rootScope.hasRefreshed === false) {
					$rootScope.hasRefreshed = true;
					location.reload();
				}

				// Adjust the size of the game container.
				adjustGameContainer();
//				window.onresize = adjustGameContainer();

				if ($window.addEventListener) {
					addEventListener("message", listener, false);
				} else {
					attachEvent("onmessage", listener);
				}

				if ($routeParams.mode === "pass_and_play") {
					playerIds = [
						$cookies.playerId,
						$cookies.playerId + "11111"
					];
				} else if ($routeParams.mode === "play_with_ai") {
					playerIds = [
						$cookies.playerId,
						"0"
					];
				}

				// 1. Get game information.
				getGameInfo();

				// 2. Get playerIds from server: this is used for case when user refresh the web browser.
				getCurrentPlayerInfo();
				initiatePlayerTurn();
			}

			/************************************* End point ************************************/
		}
);