'use strict';

smgContainer.controller('DevLoginController',
	function ($scope, $rootScope, $location, DevService) {
		$scope.login = function(loginInfo) {
			$cookies.developerId = loginInfo.developerId;

			DevService.get({developerId: loginInfo.developerId, password: loginInfo.password}).
					$promise.then(function(data) {
						console.log(data);
						$cookies.accessSignature = data['accessSignature'];
						$location.url('/');
					}
			);
		}
	}
);