'use strict';

smgContainer.controller('LoginController',
		function ($scope, $rootScope, $location, PlayerService) {

			$scope.login = function(loginInfo) {
				$rootScope.playerId = loginInfo.playerId;

				console.log(loginInfo);

				DevService.get({playerId: loginInfo.playerId, password: loginInfo.password}).
						$promise.then(function(data) {
							$rootScope.accessSignature = data['accessSignature'];
							$location.url('/');
						}
				);
			}
		});