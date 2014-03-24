'use strict';

/* Services */

smgContainer.factory('PlayerService', ['$resource', function($resource){
	return $resource('/players/:playerId', {playerId: '@playerId', password: '@password'}, {
		login: {method:'GET', params:{}, isArray:true}
	});

	return $resource('/players', {}, {
		register: {method:'POST', params:{}, headers: {'Content-Type': 'application/json'}}
	});
}]);

smgContainer.factory('MatchService', ['$resource', function($resource){

	return $resource('/newMatches', {}, {
		insert: {method:'POST', params:{}, headers: {'Content-Type': 'application/json'}}
	});

	return $resource('/matches/:matchId', {matchId: '@matchId'}, {
		makeMove: {method:'POST', params:{}, headers: {'Content-Type': 'application/json'}}
	});

	return $resource('/matches/:matchId', {matchId: '@matchId', accessSignature: '@accessSignature', playerId: '@playerId'}, {
		login: {method:'GET', params:{}, isArray:true}
	});
}]);