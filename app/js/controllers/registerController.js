'use strict';

smgContainer.controller('RegisterController',
	function ($scope, $rootScope, $location, PlayerService) {
		$scope.submitRegister = function(registerInfo) {
			$scope.player = {
					email: registerInfo.email,
					password: registerInfo.password
				};
			var result = PlayerService.register(player);
			$rootScope.playerId = result['playerId'];
			console.log(result);

			$location.url('/');
		};

	});