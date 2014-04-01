'use strict';

/* Services */

//var domainUrl = 'http://2-dot-smg-server.appspot.com';
var domainUrl = 'http://2-dot-smg-server-rl.appspot.com';

smgContainer.factory('PlayerService', ['$resource', function($resource) {
	return $resource(domainUrl + '/players/:playerId',
		{playerId: '@playerId', password: '@password'}//,
		//{register: {method:'POST', params:{}, headers:{'Content-Type': 'application/json'},  isArray:false}}
		);
}]);

smgContainer.factory('GetGameInfoService', ['$resource', function($resource) {
	return $resource(domainUrl + '/games/:gameId',
			{gameId: '@gameId'}
	);
}]);

smgContainer.factory('GetPlayerInfoService', ['$resource', function($resource) {
	return $resource(domainUrl + '/playerInfo',
			{playerId: '@playerId', targetId: '@targetId', accessSignature: '@accessSignature'}
	);
}]);

smgContainer.factory('joinQueueService', ['$resource', function($resource) {
	return $resource(domainUrl + '/queue',
			{}
	);
}]);

smgContainer.factory('InsertMatchService', ['$resource', function($resource) {
	return $resource(domainUrl + '/newMatch',
			{}
	);
}]);

smgContainer.factory('MatchService', ['$resource', function($resource) {
	return $resource(domainUrl + '/matches/:matchId',
			{matchId: '@matchId', accessSignature: '@accessSignature', playerId: '@playerId'}
	);
}]);

smgContainer.factory('DevService', ['$resource', function($resource) {
	return $resource(domainUrl + '/developers/:developerId',
			{developerId: '@developerId', password: '@password'}
	);
}]);

smgContainer.factory('UploadGameService', ['$resource', function($resource) {
	return $resource(domainUrl + '/games',
			{}
	);
}]);