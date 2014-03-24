'use strict';

smgContainer.controller('LogoutController',
	function ($scope, $rootScope, $location) {

		$rootScope = {};

		$location.url('/');
	});