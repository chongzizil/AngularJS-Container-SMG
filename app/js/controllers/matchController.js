'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window, MatchService, GetGameInfoService) {

			// helper function used to get sce trusted url
			var sceTrustedUrl = function(url){
				return $sce.trustAsResourceUrl(url);
			}
			
			// method used to send converted moves to server.
			var sendMoveToServer = function(){
				MatchService.save({matchId: $routeParams.matchId}, move).
				$promise.then(function(data) {
					console.log(data);
				});
			}
		
			// object used to store all the information of the game and matches.
			$scope.gameInfo = {};
			$scope.matchInfo = {};
			$scope.operations = [
				{"value":"sd", "type":"Set", "visibleToPlayerIds":"ALL", "key":"k"},
				{"to":54, "from":23, "type":"SetRandomInteger", "key":"xcv"}
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

						move.accessSignature = $cookies.accessSignature;
						move.playerIds = [parseInt($cookies.playerId), parseInt($cookies.friendId)];
						move.operations = $scope.operations;
						move = angular.toJson(move);

						console.log(move);
					}
			);

			sendMoveToServer();

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
        		move.accessSignature = $cookies.accessSignature;
				move.playerIds = [parseInt($cookies.playerId), parseInt($cookies.friendId)];
				move.operations = data;
				move = angular.toJson(move);
        		sendMoveToServer();
				
        		if(angular.isUndefined($scope.debug)){
        			$scope.debug = "Received: " + JSON.stringify(data);
        		}else{
        			$scope.operations = data;
      				$scope.debug += "Received: " + JSON.stringify(data);
        		}
      			$scope.$apply();
       		};

});