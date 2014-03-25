'use strict';

smgContainer.controller('MatchController',
		function ($scope, $routeParams, $rootScope, $cookies, $sce, MatchService, GetGameInfoService) {
			var defaultGameUrl = "http://chongzizil.github.io";
			// helper function used to get sce trusted url
			var sceTrustedUrl = function(url){
				return $sce.trustAsResourceUrl(url);
			}

			$scope.game = {};
			$scope.game.url = sceTrustedUrl(defaultGameUrl);
			$scope.game.height = 400;
			$scope.game.width = 400;

			GetGameInfoService.get({gameId: $cookies.gameId}).
					$promise.then(function(data) {
						console.log('test--------test');
						console.log(data);

						$scope.url = sceTrustedUrl(data.url);
						$scope.height = data.height;
						$scope.width = data.width;
					}
			);
});