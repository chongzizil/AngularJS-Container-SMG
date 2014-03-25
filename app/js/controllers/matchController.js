'use strict';

smgContainer.controller('MatchController',
		function ($scope, $routeParams, $rootScope, $cookies, MatchService, GetGameInfoService) {
			GetGameInfoService.get({gameId: $cookies.gameId}).
					$promise.then(function(data) {
						console.log('test--------test');
						console.log(data);
					}
			);
});