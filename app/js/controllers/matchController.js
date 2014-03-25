'use strict';

smgContainer.controller('MatchController',
		function ($scope, $routeParams, $rootScope, MatchService, GetGameInfoService) {
			console.log($routeParams.matchId);
			GetGameInfoService.get({gameId: 5122315436163072}).
					$promise.then(function(data) {
						console.log(data);
					}
			);
});