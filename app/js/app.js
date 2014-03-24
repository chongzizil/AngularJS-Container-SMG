'use strict';


// Declare app level module which depends on filters, and services
var smgContainer = angular.module('smgContainer', ['ngResource', 'ngRoute']);

smgContainer.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
				when('/invite', {
					templateUrl: 'templates/invite.html',
					controller: 'InviteController'
				}).
				when('/match/:matchId', {
					templateUrl: 'templates/match.html',
					controller: 'MatchController'
				}).
				when('/login', {
					templateUrl: 'templates/login.html',
					controller: 'LoginController'
				}).
				when('/logout', {
					templateUrl: 'templates/logout.html',
					controller: 'LogoutController'
				}).
				when('/register', {
					templateUrl: 'templates/register.html',
					controller: 'RegisterController'
				}).
				otherwise({
					redirectTo: '/'
				});
}]);