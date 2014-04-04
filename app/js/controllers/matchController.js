//'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window,
		          $location, MatchService, GetGameInfoService, GetPlayerInfoService) {
			/*
			 * Variables for interacting with Server side.
			 */
      $scope.gameInfo = {};
      $scope.playerIds;
			var matchInfo = {};

			/*
			 * Variables for interacting with Game side.
			 */
      var state = {};
      var lastState = state;
			// {@code lastMovePlayerId} has been moved to {@code matchInfo.lastMovePlayerId}
//			var lastMovePlayerId;
			var operations;

			/**
			 * Helper method used to convert an normal url to sce trusted url.
			 * @param url input non-sceTruested url
			 * @returns { the sce trusted url }
			 */
			var sceTrustedUrl = function (url) {
				return $sce.trustAsResourceUrl(url);
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
								console.log("GetGameService from Server: " + angular.toJson(data));
								// 1. Get game information, all the .
								$scope.gameInfo.url = sceTrustedUrl(data['url']);
								$scope.gameInfo.height = data['height'];
								$scope.gameInfo.width = data['width'];
								$scope.gameInfo.gameName = data['gameName'];
								/**
								 * TODO: still need verification from Server team, comment out temporarily.
								 */
//								$scope.gameInfo.pics = data['pics'];
							}
						}
				);
			};

			/**
			 * Method used to retrieve Match Information
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
								console.log("MatchService after get match info from Server : " + angular.toJson(data));
								// 1. Get all the match information into the matchInfo variable.
                matchInfo.playerIds = angular.fromJson(data['playerIds']);
								matchInfo.playerThatHasTurn = data['playerThatHasTurn'];
								matchInfo.lastMovePlayerId = matchInfo.playerThatHasTurn;
								matchInfo.gameOverScores = data['gameOverScores'];
								matchInfo.gameOverReason = data['gameOverReason'];
								matchInfo.history = data['history'];
								// 2. Also expose the {@code matchInfo.playerIds} to HTML who can use it to display statistic info.
                $scope.playerIds = matchInfo.playerIds;
                                for(var i=0;i<$scope.playerIds.length;i++){
                                    $scope.playerIds[i] = $scope.playerIds[i].toString();
                                }
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
					"playerIds": $scope.playerIds,
					"operations": operations
				};
				var jsonMove = angular.toJson(move);
				// 2. Send JSON data to server.
				MatchService.save({matchId: $routeParams.matchId}, jsonMove).
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
								matchInfo.gameStateAfterMakeMove = data['gameState'];
								console.log("MatchService after make move: received returned state: " +
										angular.toJson(matchInfo.gameStateAfterMakeMove));
								// 2.2. UpdateUI for Game with the received state.
								sendUpdateUIToGame(matchInfo.gameStateAfterMakeMove);
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
				$cookies.socket.close();
				$location.url('/');
			};

			/**
			 * Method used to get all the players' info.
			 * @param playerIds
			 */
			var getAllPlayersInfo = function (playerIds) {
				matchInfo.playersInfo = [];
				for (var playerId in playerIds) {
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
				var win = $window.document.getElementById('iframe1').contentWindow;
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
					operations = data['operations'];
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
					$scope.operations = data;
					$scope.debug += "Received: " + JSON.stringify(data);
				}
				$scope.$apply();
			}


			function replyGameReady() {

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
				console.log("in the container, it sends the initial UpdateUI is " + angular.toJson(initialUpdateUI));
				$scope.sendMessageToIframe(initialUpdateUI);
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
						{'playerId': $scope.playerIds[0]},
						{'playerId': $scope.playerIds[1]}
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
				// 0. Override the onmessage method on socket.
				$rootScope.socket.onmessage = function (event) {
					var data = angular.fromJson(event.data);
					console.log("Data get from the Channel API: " + angular.toJson(data));
					matchInfo.gameStateFromChannelAPI = data['gameState'];
					console.log("Game State got from channel API: " + angular.toJson(matchInfo.gameStateFromChannelAPI));
					sendUpdateUIToGame(matchInfo.gameStateFromChannelAPI);
				};

				// 1. Get game information.
				getGameInfo();
				// 2. Get match information.
				getMatchInfo();
				// 3. get players information.
				getAllPlayersInfo($scope.playerIds);
			}
		}

);