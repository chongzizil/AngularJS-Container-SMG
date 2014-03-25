'use strict';

smgContainer.controller('LogoutController',
	function ($scope, $rootScope, $location) {

		$rootScope.accessSignature = undefined;
		$rootScope.playerId = undefined;
		$rootScope.developerId = undefined;

		$location.url('/');
	});