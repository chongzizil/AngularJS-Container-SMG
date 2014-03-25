'use strict';

smgContainer.controller('MatchController',
		function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, MatchService, GetGameInfoService) {
			var defaultGameUrl = "http://chongzizil.github.io";
			// helper function used to get sce trusted url
			var sceTrustedUrl = function(url){
				return $sce.trustAsResourceUrl(url);
			}
			// object used to store all the information of the game
			$scope.gameInfo = {};

			$scope.gameInfo.url = sceTrustedUrl(defaultGameUrl);
			$scope.gameInfo.height = 400;
			$scope.gameInfo.width = 400;

			GetGameInfoService.get({gameId: $cookies.gameId}).
					$promise.then(function(data) {
						$scope.gameInfo = data;
					}
			);

			MatchService.get({matchId: $routeParams.matchId}).
					$promise.then(function(data){
						$scope.matchInfo = data;
					}
			);

			// method used to reload the match page to get the new match information for the server.
			$scope.reload = function() {
				$route.reload();
			}
});