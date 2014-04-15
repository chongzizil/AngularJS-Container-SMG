'use strict';

/* Services */

/* Official domain*/
//var domainUrl = 'http://4-dot-smg-server.appspot.com';

/* Container test domain */
var domainUrl = 'http://4-dot-smg-server-rl.appspot.com';

// Self container test domain 1 */
//var domainUrl = 'http://4-1.smg-container-server2.appspot.com';

// Self container test domain 2 */';
//var domainUrl = 'http://4-1.smg-container-testserver.appspot.com';

var facebookGraphApiUrl = "https://graph.facebook.com";

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
 * To send make moves to server
 */
smgContainer.factory('SendMakeMoveService', ['$resource', function($resource) {
return $resource(domainUrl + '/matches/:matchId',
{matchId: '@matchId'}
);
}]);

/**
 * To get on going match info
 */
smgContainer.factory('GetAllMatchInfoService', ['$resource', function($resource) {
	return $resource(domainUrl + '/gameinfo/stats',
			{gameId: '@gameId'}
	);
}]);

/**
 * To post status on Facebook page, e.g. "I have won a match of XXX again YYY".
 */
smgContainer.factory('PostMessageToFBService', ['$resource', function($resource) {
	return $resource(facebookGraphApiUrl + '/me/feed',
			{message: '@message', access_token: '@access_token'}
	);
}]);

/**
 * To get the profile picture of the player if he/she login with FB account
 */
smgContainer.factory('GetPicFromFBService', ['$resource', function($resource) {
	return $resource(facebookGraphApiUrl + '/me/picture',
			{redirect: '0', height: '50', width: '50', type: 'normal', access_token: '@access_token'}
	);
}]);

/**
 * To get accessToken
 */
/*smgContainer.factory('GetTokenFromFBService', ['$resource', function($resource) {
	return $resource(facebookGraphApiUrl + '/oauth/access_token',
			{client_id: '227131944153073', redirect_uri: 'http://smg-angularjs-container.appspot.com/', client_secret: '540d2fa6851aa96dc183571874afc110', code: '@code'}
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
