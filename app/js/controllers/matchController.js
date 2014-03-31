//'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies,
		          $sce, $window, $location, MatchService, GetGameInfoService) {
			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else if (!$cookies.matchId) {
				alert('You have to start a match by invite a friend or something...')
				$location.url('/');
			} else {
				$scope.matchInfo = {};
				var gameInfo = {};
				var matchInfo = {};
				var lastMovePlayerId;
				var operations;
				var sentMoveReceivedData;
				var channelApiPushState;
				var channel;
				var socket;
				var handler = {
					onopen: function () { alert("onopen") },
					onerror: function () { alert("onerror") },
					onclose: function () { alert("onclose") },
					onmessage:
							function (event) {
								console.log(event.data);
								channelApiPushState = event.data['state'];
								//1. We call 'Get' method to server to get the match information.
								getMatchInfo();
								//2. Sent received game history to game
								sendUpdateUIToGame(matchInfo.history);
							}
				};

				/**
				 * On match page start, match controller should get all the information for the game,
				 * and create the changeApi channel to get the match information frequently.
				 */
				GetGameInfoService.get({gameId: $routeParams.gameId}).
						$promise.then(function(data) {
							if(data['error']) {
								alert('You have provided WRONG_GAME_ID!');
							} else {
								console.log(data);
								// 1. Get game information.
								gameInfo.url = sceTrustedUrl(data['url']);
								gameInfo.height = data['height'];
								gameInfo.width = data['width'];
								gameInfo.gameName = data['gameName'];
								gameInfo.pics = data['pics'];
								// 2. Create the channel to get match information.
								channel = goog.appengine.Channel($cookies.channelToken);
								socket = channel.open(handler);
							}
						}
				);

				/**
				 * Method used to get match information data from server using 'GET' method.
				 */
				var getMatchInfo = function() {
					MatchService.get({matchId: $routeParams.matchId,
						accessSignature : $cookies.accessSignature, playerId : $cookies.playerId}).
							$promise.then(function(data) {
								if(data['error'] == "WRONG_ACCESS_SIGNATURE") {
									alert('Sorry, Wrong AccessSignature received!');
								} else if(data['error'] == 'WRONG_PLAYER_ID') {
									alert('Sorry, Wrong Player ID received!');
								} else if(data['error'] == 'JSON_PARSE_ERROR') {
									alert('Sorry, Wrong JSON string format received!');
								} else {
									console.log(data);
									// 1. Get all the match information into the matchInfo variable.
									matchInfo.playerIds = data['playerIds'];
									matchInfo.playerIdThatHasTurn = data['playerIdThatHasTurn'];
									matchInfo.gameOverScores = data['gameOverScores'];
									matchInfo.gameOverReason = data['gameOverReason'];
									matchInfo.history = data['history'];

									// 2. Set certain information to $scope.
									$scope.matchInfo.playerIds = matchInfo.playerIds;
									lastMovePlayerId = $scope.matchInfo.playerIdThatHasTurn;
									$scope.matchInfo.playerIdThatHasTurn = matchInfo.playerIdThatHasTurn;
								}
							}
					);
				}

				/**
				 * Method used to send converted moves to server.
				 */
				var sendMoveToServer = function(operations){
					if(operations.length == 1 && operations[0]['type'] == 'GameReady') {
						// If we get "GameReady" operation, no need to send it to the server.
						return;
					}
					// 1. make up a move.
					var move = {
						"accessSignature" : $scope.accessSignature,
						"playerIds" : $scope.matchInfo.playerIds,
						"operations" : operations
					};
					console.log(move);
					var jsonMove = angular.json(move);
					// 2. send jsonfied data to server.
					MatchService.save({matchId: $routeParams.matchId}, jsonMove).
							$promise.then(function(data) {
								console.log(data);
								if(data['error'] == "WRONG_ACCESS_SIGNATURE") {
									alert('Sorry, Wrong Access Signature received!');
								} else if(data['error'] == 'WRONG_PLAYER_ID') {
									alert('Sorry, Wrong Player ID received!');
								} else if(data['error'] == "JSON_PARSE_ERROR") {
									alert('Sorry, Wrong JSON Format received!');
								} else if(data['error'] == "MISSING_INFO") {
									alert('Sorry, Incompleted JSON data received!');
								} else {
									sentMoveReceivedData = data['state'];
								}
							}
					);
				}

				/*
				 Helper function used to get sce trusted url
				  */
				var sceTrustedUrl = function(url){
					return $sce.trustAsResourceUrl(url);
				}

				/**
				 * Method used to end current game in two situation:
				 * 1. Game has a winner.
				 * 2. One of the players surrenders.
				 */
				var endGame = function() {
					socket = channel.close();
					$location.url('/');
				}

				/*
				 Code for Yuanyi Yang.
				 */
			}
		}
);