'use strict';


// Declare app level module which depends on filters, and services
var smgContainer = angular.module('smgContainer', ['ngResource', 'ngRoute']);

smgContainer.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
				when('/invite', {
					templateUrl: 'templates/invite.html',
					controller: 'inviteController'
				}).
				when('/match', {
					templateUrl: 'templates/match.html',
					controller: 'matchController'
				}).
				otherwise({
					redirectTo: '/'
				});
}]);