//'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window,
		          $location, MatchService, GetGameInfoService, GetPlayerInfoService) {
			$scope.matchInfo = {};
			var gameInfo = {};
			var matchInfo = {};
			var lastMovePlayerId;
			var operations;
			var playersInfo = [];
			var channel;
			var socket;
			var handler = {
				onopen: function () { alert("onopen") },
				onerror: function () { alert("onerror") },
				onclose: function () { alert("onclose") },
				onmessage:
						function (event) {
							console.log(event.data);
							var channelApiPushState = event.data['state'];
							getMatchInfo();
							sendUpdateUIToGame(matchInfo.history[0]['gameState']);
						}
			};

			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else if (!$cookies.matchId) {
				alert('You have to start a match by invite a friend or something...')
				$location.url('/');
			} else {
				// 1. Get game information.
				getGameInfo();
				// 2. Get match information.
				getMatchInfo();
				// 3. get players information.
				getAllPlayersInfo($scope.matchInfo.playerIds);
			}

			/*
			 * Method used to get all the information for the game,
			 * and create the changeApi channel to get the match information frequently.
			 */
			var getGameInfo = function() {
				GetGameInfoService.get({gameId: $routeParams.gameId}).
						$promise.then(function(data) {
							if(data['error'] == 'WRONG_GAME_ID') {
								alert('Sorry, Wrong Game ID provided!');
							}else {
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
			}

			/*
			 Method using "GET" method to get all the match information
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
								var sentMoveReceivedData = data['state'];
								sendUpdateUIToGame(sentMoveReceivedData);
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

			/**
			 * Method used to get all the players' information.
			 * @param playerIds
			 */
			var getAllPlayersInfo = function(playerIds) {
				for(playerId in playerIds) {
					GetPlayerInfoService.get({playerId : $cookies.playerId,
						targetId : playerId, accessSignature : $cookies.accessSignature}).
							$promise.then(function(data) {
								console.log(data);
								if(data['error'] == 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, Wrong Access Signature provided!');
								} else if(data['error'] == 'WRONG_TARGETID') {
									alert('Sorry, Wrong Target ID provided!');
								} else {
									playersInfo.push(data);
								}
							}
					);
				}
			}

			/*
			 Code for Yuanyi Yang.
			 */
		}
);