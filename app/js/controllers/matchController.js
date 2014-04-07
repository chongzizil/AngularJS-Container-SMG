//'use strict';

/**
 * Match Controller contains two parts:
 * 1. Container interacts with Server side:
 *  (1). In asynchronous mode, get new state and last move from Server.
 *  (2). In synchronous mode, receive channel API pushed new state and last move.
 *  (3). Send new moves to Server.
 * 2. Container interacts with Game side:
 *  (1). Get operations made by players
 *  (2). Send new state to Game for updateUI
 *  (3). Send new state, last state and last move to Game for verify move.
 *
 *  Match Controller contains two modes:
 *  1. Synchronous Mode: Player A presses "autoMatch" and wait for another player, player B also presses
 *  the "autoMatch", system pairs player A and B automatically, they communicate through channel API.
 *  2. Asynchronous Mode: Player A invite Player B with B's playerId, when B presses "check new game",
 *  player A and B pair, after that, they make moves and check new states manually.
 */

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window,
		          $location, NewMatchStateService, GetGameInfoService, GetPlayerInfoService, SendMakeMoveService) {
			/*
			 * Variables for interacting with Server side.
			 */
      $scope.gameInfo = {};
			$scope.displayGetNewStateButton = false;
			$scope.displayEndGameButton = false;
			var matchInfo = {
				playerThatHasTurn: Number.MIN_VALUE,
				lastMovePlayerId: Number.MIN_VALUE,
				state: {},
				lastMove: [],
				history: []
			};

			/*
			 * Variables for interacting with Game side.
			 */
      var state = {};
      var lastState = state;

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
								console.log("GetGameService from Server: " + angular.toJson(data));
								// 1. Get game information, all the .
								$scope.gameInfo.url = $sce.trustAsResourceUrl(data['url']);
								$scope.gameInfo.height = data['height'];
								$scope.gameInfo.width = data['width'];
								$scope.gameInfo.gameName = data['gameName'];
							}
						}
				);
			};

			/**
			 * Method used to send operation from Game to Server, of cause data will be wrapped before sending.
			 * @param operations operations got from Game.
			 */
			var sendMoveToServer = function (operations) {
				if (operations.length == 1 && operations[0]['type'] == 'GameReady') {
					// If we get "GameReady" operation, no need to send it to the server.
					return;
				}
				// 1. Wrap up the operations as a move.
				var move = {
					"accessSignature": $cookies.accessSignature,
					"playerIds": $rootScope.playerIds,
					"operations": operations
				};
				var jsonMove = angular.toJson(move);
				// 2. Send JSON data to server.
				SendMakeMoveService.save({matchId: $routeParams.matchId}, jsonMove).
						$promise.then(function (data) {
							console.log("MatchService after make move: " + angular.toJson(data));
							if (data['error'] == "WRONG_ACCESS_SIGNATURE") {
								alert('Sorry, Wrong Access Signature received!');
							} else if (data['error'] == 'WRONG_PLAYER_ID') {
								alert('Sorry, Wrong Player ID received!');
							} else if (data['error'] == "JSON_PARSE_ERROR") {
								alert('Sorry, Wrong JSON Format received!');
							} else if (data['error'] == "MISSING_INFO") {
								alert('Sorry, Incomplete JSON data received!');
							} else {
								// 2.1. Store data inside {@code matchInfo}
								matchInfo.state = data['state'];
								matchInfo.lastMove = data['lastMove'];
								console.log("MatchService after make move: received returned state: " +
										angular.toJson(matchInfo.state));
								// 2.2. UpdateUI for Game with the received state.
								sendUpdateUIToGame(matchInfo.state);
							}
						}
				);
			};

			/**
			 * Method used to end current game in two situation:
			 * 1. Game has a winner.
			 * 2. One of the players surrenders.
			 */
			$scope.endGame = function () {
				$rootScope.socket.close();
				$location.url('/');
			};

			/**
			 * Method used to override the onmessage method on channel API's socket
			 */
			var overrideOnMessage = function() {
				$rootScope.socket.onmessage = function (event) {
					var data = angular.fromJson(event.data);
					console.log("Data get from the Channel API: " + angular.toJson(data));
					matchInfo.state = data['state'];
					console.log("Game State got from channel API: " + angular.toJson(matchInfo.state));
					matchInfo.lastMove = data['lastMove'];
					sendUpdateUIToGame(matchInfo.state);
				};
			}

			/**
			 * Method used to get new game state in asynchronous game mode.
			 */
			$scope.getNewMatchState = function() {
				NewMatchStateService.get({matchId: $routeParams.matchId, playerId: $cookies.playerId,
					accessSignature: $cookies.accessSignature})
						.$promise.then(function(data) {
							if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
								alert('Sorry, wrong access signature provided!');
							} else if (data['error'] === 'WRONG_PLAYER_ID') {
								alert('Sorry, wrong player ID provided!');
							} else if (data['error'] === 'WRONG_MATCH_ID') {
								alert('Sorry, wrong match ID provided!');
							} else {
								matchInfo.state = data['state'];
								matchInfo.lastMove = data['lastMove'];
								sendUpdateUIToGame(matchInfo.state);
							}
						}
				);
			}

			/**
			 * Method used to get all the players' info.
			 * @param playerIds
			 */
			var getAllPlayersInfo = function (playerIds) {
				matchInfo.playersInfo = [];
				for (var playerId in playerIds) {
					console.log(typeof playerId);
					console.log(playerId);
					GetPlayerInfoService.get({playerId: $cookies.playerId,
						targetId: playerId, accessSignature: $cookies.accessSignature}).
							$promise.then(function (data) {
								console.log("GetPlayerInfoService: " + angular.toJson(data));
								if (data['error'] == "WRONG_PLAYER_ID") {
									alert("Sorry, Wrong Player ID provided!");
								} else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, Wrong Access Signature provided!');
								} else if (data['error'] == 'WRONG_TARGET_ID') {
									alert('Sorry, Wrong Target ID provided!');
								} else {
									matchInfo.playersInfo.push(data);
								}
							}
					);
				}
			};

			/*
			 parameter: message should be : UpdateUI, VerifyMove
			 */
			$scope.sendMessageToIframe = function (message) {
				var win = $window.document.getElementById('gameIFrame').contentWindow;
				win.postMessage(message, "*");
			};

			function listener(event) {
				var data = event.data;
				console.log("In the container, it receives the data from the game Iframe " + data['type']);
                if(!data['type']){
                    console.log("The undefined data is " + angular.toJson(data));
                }
				/*
				 check whether the data is GameReady(), if it is, send updateUI to the game.
				 format of GameReady: {"type":"GameReady"}
				 */
				if (data['type'] === "GameReady") {
					replyGameReady();
				} else if (data['type'] === "MakeMove") {
					//get operations
					var operations = data['operations'];
					console.log("In the container, it sends to the server, operations are " + angular.toJson(operations));
					sendMoveToServer(operations);
				} else if (data['type'] === "VerifyMoveDone") {
					//deal with verifyMoveDone
					//no hacker detected
				} else {
					console.log("In the container listener, can't deal with the message from the game!!");
                    console.log("It is " + data['type']);
				}

				if (angular.isUndefined($scope.debug)) {
					$scope.debug = "Received: " + JSON.stringify(data);
				} else {
					// TODO: no need to put in $scope, comment out.
//					$scope.operations = data;
					$scope.debug += "Received: " + JSON.stringify(data);
				}
				$scope.$apply();
			}


			function replyGameReady() {

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
				console.log("in the container, it sends the initial UpdateUI is " + angular.toJson(initialUpdateUI));
				$scope.sendMessageToIframe(initialUpdateUI);
			}

			function sendVerifyMoveToGame(newState) {
				lastState = state;
				state = newState;
				var verifyMove = {
					"type": "VerifyMove",
					'playersInfo': [
						{'playerId': $rootScope.playerIds[0]},
						{'playerId': $rootScope.playerIds[1]}
					],
					'state': newState,
					'lastState': state,
					'lastMove': null,
					"lastMovePlayerId": matchInfo.lastMovePlayerId,
					"playerIdToNumberOfTokensInPot": {}
				};
				$scope.sendMessageToIframe(verifyMove);
			}

			function sendUpdateUIToGame(newState) {

				lastState = state;
				state = newState;
				var updateUI = {
					"type": "UpdateUI",
					'yourPlayerId': $cookies.playerId,
					'playersInfo': [
						{'playerId': $rootScope.playerIds[0]},
						{'playerId': $rootScope.playerIds[1]}
					],
					'state': state,
					'lastState': lastState,
					'lastMove': [],
					"lastMovePlayerId": $cookies.playerId.toString(),
					"playerIdToNumberOfTokensInPot": {}
				};
				console.log("In the container, it sends the following UpdateUI to the game: " + angular.toJson(updateUI));
				$scope.sendMessageToIframe(updateUI);
			}


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
				// Display different button based on different mode: synchronous and asynchronous.
				if($cookies.isSyncMode === 'true') {
					// 0. Override the onmessage method on socket.
					overrideOnMessage();
					$scope.displayGetNewStateButton = false;
					$scope.displayEndGameButton = true;
				} else {
					$scope.displayGetNewStateButton = true;
					$scope.displayEndGameButton = false;
				}
				console.log("Match Controller: before get all players info");
				console.log(typeof $rootScope.playerIds);
				console.log(angular.toJson($rootScope.playerIds));
				for(var playerId in $rootScope.playerIds) {
					console.log(typeof playerId);
				}
				// 1. Get game information.
				getGameInfo();
				// 2. get players information.
//				getAllPlayersInfo($rootScope.playerIds);
			}
		}

);