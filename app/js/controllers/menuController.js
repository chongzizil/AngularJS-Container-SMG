'use strict';

smgContainer.controller('MenuController',
	function ($scope, $cookies, $rootScope) {
		$rootScope.refreshDisplayId = function() {
			$scope.idDisplay = 'Guest';
			if ($cookies.playerId !== undefined) {
				$scope.idDisplay =  $cookies.playerId;
				$scope.accessSignature = $cookies.accessSignature;
			} else if ($cookies.developerId !== undefined) {
				$scope.idDisplay =  $cookies.developerId;
				$scope.accessSignature = $cookies.accessSignature;
			}
		}
		$rootScope.refreshDisplayId();
	}
);