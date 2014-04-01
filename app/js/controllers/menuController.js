'use strict';

smgContainer.controller('MenuController',
	function ($scope, $cookies, $rootScope) {
		var test = "[111,111]";
		var jsonData = JSON.stringify(eval("(" + test + ')'));
		var data = angular.fromJson(jsonData);
		console.log(typeof data);
		console.log(data[0]);
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