//'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window,
		          $location, MatchService, GetGameInfoService, GetPlayerInfoService) {
			$scope.matchInfo = {};
			$scope.gameInfo = {};
			var matchInfo = {};
			var lastMovePlayerId;
			var operations;
			var playersInfo = [];

			var state = null;
			var lastState = state;
			var hardCodeInitialUpdateUI;
			var hardCodeVerifyMove;
			var hardCodeUpdateUI;
			$scope.playerIds;

			/*
			 * Method used to get all the information for the game,
			 * and create the changeApi channel to get the match information frequently.
			 */
			var getGameInfo = function () {
				GetGameInfoService.get({gameId: $routeParams.gameId}).
						$promise.then(function (data) {
							if (data['error'] == 'WRONG_GAME_ID') {
								alert('Sorry, Wrong Game ID provided!');
							} else {
								console.log(data);
								// 1. Change the onMessage method on socket.
								$rootScope.socket.onmessage = function (event) {
									console.log(event.data);
									var channelApiPushState = event.data['state'];
									getMatchInfo();
									sendUpdateUIToGame(matchInfo.history[0]['gameState']);
								}
								// 2. Get game information.
								$scope.gameInfo.url = sceTrustedUrl(data['url']);
								$scope.gameInfo.height = data['height'];
								$scope.gameInfo.width = data['width'];
								$scope.gameInfo.gameName = data['gameName'];
								$scope.gameInfo.pics = data['pics'];
							}
						}
				);
			}

			/*
			 Method using "GET" method to get all the match information
			 */
			var getMatchInfo = function () {
				MatchService.get({matchId: $routeParams.matchId,
					accessSignature: $cookies.accessSignature, playerId: $cookies.playerId}).
						$promise.then(function (data) {
							if (data['error'] == "WRONG_ACCESS_SIGNATURE") {
								alert('Sorry, Wrong AccessSignature received!');
							} else if (data['error'] == 'WRONG_PLAYER_ID') {
								alert('Sorry, Wrong Player ID received!');
							} else if (data['error'] == 'JSON_PARSE_ERROR') {
								alert('Sorry, Wrong JSON string format received!');
							} else {
								console.log(data);
								// 1. Get all the match information into the matchInfo variable.
								matchInfo.playerIds = data['playerIds'];
								$scope.playerIds = matchInfo.playerIds;
								matchInfo.playerIdThatHasTurn = data['playerIdThatHasTurn'];
								matchInfo.gameOverScores = data['gameOverScores'];
								matchInfo.gameOverReason = data['gameOverReason'];
								matchInfo.history = data['history'];

								// 2. Set certain information to $scope.
								$scope.matchInfo.playerIds = matchInfo.playerIds;
								$scope.playerIds = matchInfo.playerIds;
								lastMovePlayerId = $scope.matchInfo.playerIdThatHasTurn;
								$scope.matchInfo.playerIdThatHasTurn = matchInfo.playerIdThatHasTurn;
							}
						}
				);
			}

			/**
			 * Method used to send converted moves to server.
			 */
			var sendMoveToServer = function (operations) {
				if (operations.length == 1 && operations[0]['type'] == 'GameReady') {
					// If we get "GameReady" operation, no need to send it to the server.
					return;
				}
				// 1. make up a move.
				var move = {
					"accessSignature": $cookies.accessSignature,
					"playerIds": $scope.matchInfo.playerIds,
					"operations": operations
				};
				console.log(move);
				var jsonMove = angular.toJson(move);
				// 2. send jsonfied data to server.
				MatchService.save({matchId: $routeParams.matchId}, jsonMove).
						$promise.then(function (data) {
							console.log(data);
							if (data['error'] == "WRONG_ACCESS_SIGNATURE") {
								alert('Sorry, Wrong Access Signature received!');
							} else if (data['error'] == 'WRONG_PLAYER_ID') {
								alert('Sorry, Wrong Player ID received!');
							} else if (data['error'] == "JSON_PARSE_ERROR") {
								alert('Sorry, Wrong JSON Format received!');
							} else if (data['error'] == "MISSING_INFO") {
								alert('Sorry, Incompleted JSON data received!');
							} else {
								var sentMoveReceivedData = data['state'];
								sendUpdateUIToGame(sentMoveReceivedData);
							}
						}
				);
			}

			/**
			 * Helper function used to get sce trusted url
			 */
			var sceTrustedUrl = function (url) {
				return $sce.trustAsResourceUrl(url);
			}

			/**
			 * Method used to end current game in two situation:
			 * 1. Game has a winner.
			 * 2. One of the players surrenders.
			 */
			$scope.endGame = function () {
				socket = channel.close();
				$location.url('/');
			}

			/**
			 * Method used to get all the players' information.
			 * @param playerIds
			 */
			var getAllPlayersInfo = function (allPlayerIds) {
				for (playerId in allPlayerIds) {
					GetPlayerInfoService.get({playerId: $cookies.playerId,
						targetId: playerId, accessSignature: $cookies.accessSignature}).
							$promise.then(function (data) {
								console.log(data);
								if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, Wrong Access Signature provided!');
								} else if (data['error'] == 'WRONG_TARGETID') {
									alert('Sorry, Wrong Target ID provided!');
								} else {
									playersInfo.push(data);
								}
							}
					);
				}
			}

			/*
			 parameter: message should be : UpdateUI, VerifyMove
			 */
			$scope.sendMessageToIframe = function (message) {
				var win = $window.document.getElementById('iframe1').contentWindow;
				win.postMessage(message, "*");
				//console.log('toIframe');
			};

			function listener(event) {
				var data = event.data;
				console.log(data);
				/*
				 check whether the data is GameReady(), if it is, send updateUI() to the game.
				 format of GameReady: {"type":"GameReady"}
				 */
				if (data['type'] === "GameReady") {
					replyGameReady();
				} else if (data['type'] === "MakeMove") {
					//get operations
					operations = data['operations'];
					sendMoveToServer(operations);
				} else if (data['type'] === "VerifyMoveDone") {
					//deal with verifyMoveDone
					//no hacker detected
				} else {
					console.log("In the container listener, can't deal with the message from the game!!")
				}

				if (angular.isUndefined($scope.debug)) {
					$scope.debug = "Received: " + JSON.stringify(data);
				} else {
					$scope.operations = data;
					$scope.debug += "Received: " + JSON.stringify(data);
				}
				$scope.$apply();
			};


			function replyGameReady() {
				/*
				 The initial updateUI() has this given format
				 [
				 {'yourPlayerId' : $cookies.playerId},
				 {'playersInfo' : [{'playerId' : playerId1},{'playerId' : playerId2}]},   //if your playerId == id1, you should send the initial move
				 {'state' : []},
				 {'lastState' : []},
				 {'lastMove' : []},
				 {'lastMovePlayerId' : ''},
				 {'playerIdToNumberOfTokensInPot' : ''}
				 ]
				 */

				hardCodeInitialUpdateUI = {
					'type': 'UpdateUI',
					'yourPlayerId': '42',
					'playersInfo': [
						{'playerId': '42'},
						{'playerId': '43'}
					],
					'state': {},
					'lastState': null,
					'lastMove': [],
					'lastMovePlayerId': null,
					'playerIdToNumberOfTokensInPot': {}
				};

				var initialUpdateUI = {
					'type': 'UpdateUI',
					'yourPlayerId': $cookies.playerId,
					'playersInfo': [
						{'playerId': $scope.playerIds[0]},
						{'playerId': $scope.playerIds[1]}
					],
					'state': {},
					'lastState': null,
					'lastMove': [],
					'lastMovePlayerId': null,
					'playerIdToNumberOfTokensInPot': {}
				};

				var update = angular.toJson(hardCodeInitialUpdateUI);

				$scope.sendMessageToIframe(hardCodeInitialUpdateUI);
			}

			function sendVerifyMoveToGame(newState) {
				lastState = state;
				state = newState;
				var verifyMove = {
					"type": "VerifyMove",
					'playersInfo': [
						{'playerId': $scope.playerIds[0]},
						{'playerId': $scope.playerIds[1]}
					],
					'state': newState,
					'lastState': state,
					'lastMove': null,
					"lastMovePlayerId": lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
				$scope.sendMessageToIframe(verifyMove);
			};

			function sendUpdateUIToGame(newState) {
				hardCodeUpdateUI = {
					"type": "UpdateUI",
					'yourPlayerId': 42,
					'playersInfo': [
						{'playerId': '42'},
						{'playerId': '43'}
					],
					'state': {},
					'lastState': null,
					'lastMove': [],
					'lastMovePlayerId': null,
					'playerIdToNumberOfTokensInPot': {}
				};
				lastState = state;
				state = newState;
				var updateUI = {
					"type": "UpdateUI",
					'yourPlayerId': $cookies.playerId,
					'playersInfo': [
						{'playerId': $scope.playerIds[0]},
						{'playerId': $scope.playerIds[1]}
					],
					'state': newState,
					'lastState': state,
					'lastMove': null,
					"lastMovePlayerId": lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
				$scope.sendMessageToIframe(updateUI);
			}

			// Formal program starts here.
			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else {
				if ($window.addEventListener) {
					addEventListener("message", listener, false);
				} else {
					attachEvent("onmessage", listener);
				}
				// 1. Get game information.
				getGameInfo();
				// 2. Get match information.
				getMatchInfo();
				// 3. get players information.
				getAllPlayersInfo($scope.playerIds);
			}
		}

);