'use strict';

smgContainer.controller('DevRegisterController',
	function ($scope, $rootScope, $location, DevService, $http) {
		$scope.post = function(player) {
			$http.post("http://1.smg-server.appspot.com/players/:playerId", {}).success(function(result) {
				console.log(result);
				$scope.resultPost = result;
			}).error(function() {
						console.log("error");
					});
		};

		$scope.submitRegister = function(registerInfo) {
			var player = {
					email: registerInfo.email,
					password: registerInfo.password
				};
			console.log(player);
			DevService.save({}, player);
			/*var result = PlayerService.save({}, player);*/

			//$rootScope.playerId = result['playerId'];
			//console.log(result);

			//$location.url('/');
		};

	});