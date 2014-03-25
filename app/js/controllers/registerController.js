'use strict';

smgContainer.controller('RegisterController',
	function ($scope, $rootScope, $location, PlayerService) {
		$scope.submitRegister = function(registerInfo) {
			var player = {
				email: registerInfo.email,
				password: registerInfo.password
			};

			var jsonPlayer = angular.toJson(player);
			console.log(player);
			console.log(typeof jsonPlayer);



			PlayerService.save({}, jsonPlayer).
					$promise.then(function(data) {
						console.log(data);
						$scope.playerId = data['playerId'];

						var $sentAlert = $("#sentAlert");
						$sentAlert.show();
					}
			);

			//$location.url('/');
		};

	});