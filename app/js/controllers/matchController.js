//'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window, MatchService, GetGameInfoService) {
			if (!$cookies.accessSignature || !$cookies.playerId) {
				alert('You have to log in first!');
				$location.url('/');
			} else if (!$cookies.matchId) {
				alert('You have to start a match by invite a friend or something...')
				$location.url('/');
			} else {
				// helper function used to get sce trusted url
				var sceTrustedUrl = function(url){
					return $sce.trustAsResourceUrl(url);
				}

				// object used to store all the information of the game and matches.
				$scope.gameInfo = {};
				$scope.matchInfo = {};
				$scope.operations = [
					{
						"value":"sd",
						"type":"Set",
						"visibleToPlayerIds":"ALL",
						"key":"k"
					}
				];
				var move = {};

				GetGameInfoService.get({gameId: $cookies.gameId}).
						$promise.then(function(data) {
							$scope.gameInfo.url = sceTrustedUrl(data['url']);
							$scope.gameInfo.height = data['height'];
							$scope.gameInfo.width = data['width'];
						}
				);

				MatchService.get({matchId: $routeParams.matchId, accessSignature: $cookies.accessSignature, playerId: $cookies.playerId}).
						$promise.then(function(data){
							$scope.matchInfo.playerIds = data['playerIds'];
							$scope.matchInfo.playerThatHasTurn = data['playerThatHasTurn'];
							$scope.matchInfo.gameOverScores = data['gameOverScores'];
							$scope.matchInfo.gameOverReason = data['gameOverReason'];
							$scope.matchInfo.history = data['history'];
						}
				);

				// method used to send converted moves to server.
				var sendMoveToServer = function(operations){
					var move = {};
					move.accessSignature = $cookies.accessSignature;
					move.playerIds = [$cookies.playerId, $cookies.friendId];
					if((typeof operations == "object")){
						move.operations = [operations];
					}else{
						move.operations = operations;
					}
					move = angular.toJson(move);
					console.log(move);

					MatchService.save({matchId: $routeParams.matchId}, move).
							$promise.then(function(data) {
								console.log(data);
							});
				}

				// method used to reload the match page to get the new match information for the server.
				$scope.reload = function() {
					$route.reload();
				}

				var hardCodeState = {"type" : "StartGame", "state": "gameState", "yourPlayerId" : 1, "playerIds" : [0, 1]};

				$scope.sendMessage = function(){
					var win = $window.document.getElementById('iframe1').contentWindow;
					win.postMessage(hardCodeState, "*");
				};

				if($window.addEventListener){
					addEventListener("message", listener, false);
				}else{
					attachEvent("onmessage", listener);
				};

				function listener(event) {
					var data = event.data;
					sendMoveToServer(data);

					if(angular.isUndefined($scope.debug)){
						$scope.debug = "Received: " + JSON.stringify(data);
					}else{
						$scope.operations = data;
						$scope.debug += "Received: " + JSON.stringify(data);
					}
					$scope.$apply();
				};
			}
		}
);