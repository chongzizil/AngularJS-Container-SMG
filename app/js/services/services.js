'use strict';

/* Services */

smgContainer.factory('PlayerService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/players/:playerId',
		{playerId: '@playerId', password: '@password'}//,
		//{register: {method:'POST', params:{}, headers:{'Content-Type': 'application/json'},  isArray:false}}
		);
}]);

smgContainer.factory('GetGameInfoService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/games/:gameId',
			{gameId: '@gameId'}
	);
}]);

smgContainer.factory('InsertMatchService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/newMatch',
			{}
	);
}]);

smgContainer.factory('MatchService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/matches/:matchId',
			{matchId: '@matchId', accessSignature: '@accessSignature', playerId: '@playerId'}
	);
}]);

smgContainer.factory('DevService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/developers/:developerId',
			{developerId: '@developerId', password: '@password'}
	);
}]);

smgContainer.factory('UploadGameService', ['$resource', function($resource) {
	return $resource('http://1.smg-server.appspot.com/games',
			{}
	);
}]);

/*
smgContainer.factory('TestService', ['$resource', function($resource) {
	return $resource('https://www.googleapis.com/urlshortener/v1/url',
			{}
	);
}]);
*/