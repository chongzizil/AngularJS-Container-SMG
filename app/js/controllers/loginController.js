'use strict';

smgContainer.controller('LoginController',
	function ($scope, $rootScope, $location, $cookies, PlayerService) {
		$scope.login = function(loginInfo) {
			$cookies.playerId = loginInfo.playerId;

			PlayerService.get({playerId: loginInfo.playerId, password: loginInfo.password}).
					$promise.then(function(data) {
						$cookies.accessSignature = data['accessSignature'];
						$location.url('/');
					}
			);
		}
	}
);