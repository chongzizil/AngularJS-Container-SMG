'use strict';

/* Services */

/* Official domain*/
//var domainUrl = 'http://2-dot-smg-server.appspot.com';
var domainUrl = 'http://3-dot-smg-server.appspot.com';
/* Container test domain */
//var domainUrl = 'http://2-dot-smg-server-rl.appspot.com';
// Self container test domain 1 */
//var domainUrl = 'http://2-dot-smg-container-server2.appspot.com/';
//var domainUrl = 'http://3-dot-smg-container-server2.appspot.com/';
// Self container test domain 2 */';
//var domainUrl = 'http://2-dot-smg-container-server2.appspot.com/';
//var domainUrl = 'http://3-dot-smg-container-testserver.appspot.com/';

/**
 * For login as a player
 */
smgContainer.factory('PlayerService', ['$resource', function($resource) {
	return $resource(domainUrl + '/players/:playerId',
			{playerId: '@playerId', password: '@password'}//,
			//{register: {method:'POST', params:{}, headers:{'Content-Type': 'application/json'},  isArray:false}}
	);
}]);

/**
 * To get the game info
 */
smgContainer.factory('GetGameInfoService', ['$resource', function($resource) {
	return $resource(domainUrl + '/games/:gameId',
			{gameId: '@gameId'}
	);
}]);

/**
 * To get a player's info
 */
smgContainer.factory('GetPlayerInfoService', ['$resource', function($resource) {
	return $resource(domainUrl + '/playerInfo',
			{playerId: '@playerId', targetId: '@targetId', accessSignature: '@accessSignature'}
	);
}]);

/**
 * To join a queue for auto match through Channel API
 */
smgContainer.factory('joinQueueService', ['$resource', function($resource) {
	return $resource(domainUrl + '/queue',
			{}
	);
}]);

/**
 * To insert a match to the server.
 */
smgContainer.factory('InsertMatchService', ['$resource', function($resource) {
	return $resource(domainUrl + '/newMatch',
			{}
	);
}]);

/**
 * To get new match info (asynchronous mode)
 */
smgContainer.factory('NewMatchService', ['$resource', function($resource) {
	return $resource(domainUrl + '/newMatch/:playerId',
			{playerId: '@playerId', accessSignature: '@accessSignature'}
	);
}]);

/**
 * To get the new state from the server (asynchronous mode)
 */
smgContainer.factory('NewMatchStateService', ['$resource', function($resource) {
	return $resource(domainUrl + '/state/:matchId',
			{matchId: '@matchId', playerId: '@playerId', accessSignature: '@accessSignature'}
	);
}]);

/**
 * To get match info
 */
/*smgContainer.factory('GetMatchInfoService', ['$resource', function($resource) {
 return $resource(domainUrl + '/matches/:matchId',
 {matchId: '@matchId', accessSignature: '@accessSignature', playerId: '@playerId'}
 );
 }]);*/

/**
 * To login as a developer
 */
/*smgContainer.factory('DevService', ['$resource', function($resource) {
 return $resource(domainUrl + '/developers/:developerId',
 {developerId: '@developerId', password: '@password'}
 );
 }]);*/

/**
 * To submit a game
 */
/*
 smgContainer.factory('UploadGameService', ['$resource', function($resource) {
 return $resource(domainUrl + '/games',
 {}
 );
 }]);*/
