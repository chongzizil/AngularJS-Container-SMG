'use strict';

/* Services */

/* Official domain*/
var domainUrl = 'http://5-dot-smg-server.appspot.com';

/* Container test domain */
//var domainUrl = 'http://5-dot-smg-server-rl.appspot.com';

// Self container test domain 1 */
//var domainUrl = 'http://4-1.smg-container-server2.appspot.com';

// Self container test domain 2 */';
//var domainUrl = 'http://4-1.smg-container-testserver.appspot.com';

var facebookGraphApiUrl = "https://graph.facebook.com";

/**
 * For login as a player
 */
smgContainer.factory('PlayerService', ['$resource', function ($resource) {
	return $resource(domainUrl + '/players/:playerId',
			{playerId: '@playerId', password: '@password'}//,
			//{register: {method:'POST', params:{}, headers:{'Content-Type': 'application/json'},  isArray:false}}
	);
}]);

/**
 * To get the game info
 */
smgContainer.factory('GetGameInfoService', ['$resource', '$q', function ($resource, $q) {
	return {
		getGameInfo: function (gameId) {
			var deferred = $q.defer();

			$resource(domainUrl + '/games/:gameId', {gameId: '@gameId'}).get({gameId: gameId}).
					$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.error("********** Error from GetGameInfoService...");
							console.error(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Get game info from the server...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	}
}]);

/**
 * To get a player's info
 */
smgContainer.factory('GetPlayerInfoService', ['$resource', '$q', function ($resource, $q) {
	return {
		getPlayerInfo: function (playerId, targetId, accessSignature) {
			var deferred = $q.defer();

			$resource(domainUrl + '/playerInfo',
					{playerId: '@playerId', targetId: '@targetId', accessSignature: '@accessSignature'})
					.get({playerId: playerId, targetId: targetId, accessSignature: accessSignature})
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.error("********** Error from GetPlayerInfoService...");
							console.error(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Get player info from the server...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	}
}]);

/**
 * To join a queue for auto match through Channel API
 */
smgContainer.factory('joinQueueService', ['$resource', '$q', function ($resource, $q) {
	return {
		joinQueue: function (data) {
			var deferred = $q.defer();

			$resource(domainUrl + '/queue', {}).save({}, data)
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.error("********** Error from joinQueueService...");
							console.error(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Join a queue...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	};
}]);

/**
 * To insert a match to the server.
 */
smgContainer.factory('InsertMatchService', ['$resource', '$q', function ($resource, $q) {
	return {
		sendInsertMatch: function (data) {
			var deferred = $q.defer();

			$resource(domainUrl + '/newMatch', {}).save({}, data)
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.error("********** Error from InsertMatchService...");
							console.error(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Insert a match to the server...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	};
}]);

/**
 * To get new match info (asynchronous mode)
 */
smgContainer.factory('NewMatchService', ['$resource', '$q', function ($resource, $q) {
	return {
		getMatchInfo: function (playerId, accessSignature, gameId) {
			var deferred = $q.defer();

			$resource(domainUrl + '/newMatch/:playerId',
					{playerId: '@playerId', accessSignature: '@accessSignature', gameId: '@gameId'})
					.get({playerId: playerId, accessSignature: accessSignature, gameId: gameId})
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.warn("********** Error from NewMatchService...");
							console.warn(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Get match info from the server...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	};

}]);

/**
 * To get the new state from the server (asynchronous mode)
 */
smgContainer.factory('NewMatchStateService', ['$resource', '$q', function ($resource, $q) {
	return {
		getNewMatchState: function (matchId, playerId, accessSignature) {
			var deferred = $q.defer();

			$resource(domainUrl + '/state/:matchId',
					{matchId: '@matchId', playerId: '@playerId', accessSignature: '@accessSignature'})
					.get({matchId: matchId, playerId: playerId, accessSignature: accessSignature})
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.error("********** Error from NewMatchStateService...");
							console.error(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Get game state from the server through NewMatchStateService...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	}
}]);

/**
 * To send make moves to server
 */
smgContainer.factory('SendMakeMoveService', ['$resource', function ($resource) {
	return $resource(domainUrl + '/matches/:matchId',
			{matchId: '@matchId'}
	);
}]);

/**
 * To get on going match info
 */
smgContainer.factory('GetAllMatchesService', ['$resource', '$q', function ($resource, $q) {
	return {
		getAllMatches: function (gameId) {
			var deferred = $q.defer();

			$resource(domainUrl + '/gameinfo/stats', {gameId: '@gameId'})
					.get({gameId: gameId})
					.$promise.then(function (data) {
						if (angular.isDefined(data['error'])) {
							console.warn("********** Error from GetAllMatchesService...");
							console.warn(angular.toJson(data));
							deferred.resolve(undefined);
						} else {
//							console.log("********** Get all matches...");
//							console.log(angular.toJson(data));
							deferred.resolve(data);
						}
					}
			);

			return deferred.promise;
		}
	}
}]);

/**
 * To post status on Facebook page, e.g. "I have won a match of XXX again YYY".
 */
smgContainer.factory('PostMessageToFBService', ['$resource', function ($resource) {
	return $resource(facebookGraphApiUrl + '/me/feed',
			{message: '@message', access_token: '@access_token'}
	);
}]);

/**
 * To get the profile picture of the player if he/she login with FB account
 */
smgContainer.factory('GetPicFromFBService', ['$resource', function ($resource) {
	return $resource(facebookGraphApiUrl + '/me/picture',
			{redirect: '0', height: '50', width: '50', type: 'normal', access_token: '@access_token'}
	);
}]);

/**
 * To get accessToken
 */
//smgContainer.factory('GetTokenFromFBService', ['$resource', function($resource) {
// return $resource(facebookGraphApiUrl + '/oauth/access_token',
// {client_id: '227131944153073', redirect_uri: 'http://smg-angularjs-container.appspot.com/', client_secret: '540d2fa6851aa96dc183571874afc110', code: '@code'}
// );
// }]);

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
