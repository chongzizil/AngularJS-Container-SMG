'use strict';

smgContainer.controller('DevLoginController',
	function ($scope, $rootScope, $location, DevService) {

		$scope.login = function(loginInfo) {
			$rootScope.developerId = loginInfo.developerId;

			console.log(loginInfo);

			DevService.get({developerId: loginInfo.developerId, password: loginInfo.password}).
					$promise.then(function(data) {
						console.log(data);
						$rootScope.accessSignature = data['accessSignature'];
						$location.url('/');
					}
			);


		}
	}
);