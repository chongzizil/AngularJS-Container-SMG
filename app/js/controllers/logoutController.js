'use strict';

smgContainer.controller('LogoutController',
	function ($scope, $rootScope, $location) {

		$cookies.accessSignature = undefined;
		$cookies.playerId = undefined;
		$cookies.developerId = undefined;

		$location.url('/');
	});