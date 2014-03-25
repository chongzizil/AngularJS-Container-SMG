'use strict';


// Declare app level module which depends on filters, and services
var smgContainer = angular.module('smgContainer', ['ngResource', 'ngRoute', 'ngCookies']);

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
				when('/register', {
					templateUrl: 'templates/register.html',
					controller: 'RegisterController'
				}).
				when('/devLogin', {
					templateUrl: 'templates/DevLogin.html',
					controller: 'DevLoginController'
				}).
				when('/devRegister', {
					templateUrl: 'templates/devRegister.html',
					controller: 'DevRegisterController'
				}).
				when('/uploadGame', {
					templateUrl: 'templates/uploadGame.html',
					controller: 'UploadGameController'
				}).
				when('/logout', {
					templateUrl: 'templates/logout.html',
					controller: 'LogoutController'
				}).
				otherwise({
					redirectTo: '/'
				});
}]);

smgContainer.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);