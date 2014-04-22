'use strict';


// Declare app level module which depends on filters, and services
var smgContainer = angular.module('smgContainer', ['ngResource', 'ngRoute', 'ngCookies', 'ngSanitize','ui.bootstrap']);

smgContainer.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
				when('/selectGame', {
					templateUrl: 'templates/selectGame.html',
					controller: 'SelectGameController'
				}).
				when('/:gameId/match/:matchId', {
					templateUrl: 'templates/match.html',
					controller: 'MatchController'
				}).
				when('/lobby/:gameId', {
					templateUrl: 'templates/lobby.html',
					controller: 'LobbyController'
				}).
				when('/logout', {
					templateUrl: 'templates/logout.html',
					controller: 'LogoutController'
				}).
				when('/:gameId/standalone', {
					templateUrl: 'templates/standalone.html',
					controller: 'StandaloneController'
				}).
				when('/gameResult/:matchId', {
					templateUrl: 'templates/gameResult.html',
					controller: 'GameResultController'
				}).
				otherwise({
					redirectTo: '/'
				});
}]);

smgContainer.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);