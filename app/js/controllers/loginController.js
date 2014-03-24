'use strict';

smgContainer.controller('LoginController',
		function ($scope, $rootScope, $location, PlayerService) {

			$scope.login = function(loginInfo) {
				$scope.playerInfo = PlayerService.login({playerId: loginInfo.playerId, password: loginInfo.password});
				$rootScope.playerId = loginInfo.playerId;
				$rootScope.email = playerInfo.email;
				$rootScope.accessSignature = playerInfo.accessSignature;
				console.log($rootScope.accessSignature);

				//$location.url('/');
			}
		});