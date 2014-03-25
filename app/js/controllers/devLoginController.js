'use strict';

smgContainer.controller('DEVLoginController',
		function ($scope, $rootScope, $location, DevService) {

			$scope.login = function(loginInfo) {
				var playerInfo = DevService.login(/*{playerId: loginInfo.playerId, password: loginInfo.password}*/);
				$rootScope.playerId = loginInfo.playerId;
				$rootScope.email = playerInfo.email;
				$rootScope.accessSignature = playerInfo.accessSignature;
				console.log($rootScope.accessSignature);

				//$location.url('/');
			}
		});