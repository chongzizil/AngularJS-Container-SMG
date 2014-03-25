'use strict';

smgContainer.controller('DevRegisterController',
	function ($scope, $rootScope, $location, DevService) {
		$scope.submitRegister = function(registerInfo) {
			var developer = {
				email: registerInfo.email,
				password: registerInfo.password
			};

			var jsonDeveloper = angular.toJson(developer);
			console.log(developer);
			console.log(typeof jsonDeveloper);

			DevService.save({}, jsonDeveloper).
					$promise.then(function(data) {
						$scope.developerId = data['developerId'];
						console.log(data);

						var $sentAlert = $("#sentAlert");
						$sentAlert.show();
					}
			);

			//$location.url('/');
		};
	});