'use strict';

smgContainer.controller('OffCanvasMenuController',
		function ($scope, $rootScope, $cookies, $location, $routeParams, $timeout, $q, GetGameInfoService, NewMatchService) {

			$scope.matchInfos = [];

			/** Refresh the off canvas menu. */
			$rootScope.refreshOffCanvasMenu = function () {
				getGameName();
			}

			/** Get the game id. */
			var getGameId = function () {
				var url = $location.url();
				if (url.substr(0, 6) === "/lobby") {
					return url.substr(7);
				} else if (url.substr(17, 6) === "/match") {
					return url.substr(1, 16);
				} else if (url.substr(17, 11) === "/standalone") {
					return url.substr(1, 16);
				} else {
					return undefined;
				}
			};

			/** Get the game name. */
			var getGameName = function () {
				GetGameInfoService.getGameInfo(getGameId())
						.then(function (data) {
							if (angular.isDefined(data)) {
								$scope.gameName = data['gameName'];
							} else {
								$scope.gameName = "No game name... error...";
							}
						});
			};

			/** Enter a match by given a match's info. */
			$scope.enterMatch = function (matchInfo) {
				$rootScope.playerIds = matchInfo['playerIds'];
				console.log("********** Entering the match by redirect to: " + matchInfo['matchUrl']);
				$location.url(matchInfo['matchUrl']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			}

			/** Retrieve the player's match info. */
			$scope.checkMatches = function () {
				if (angular.isDefined(getGameId())) {
					NewMatchService.getMatchInfo($cookies.playerId, $cookies.accessSignature, $routeParams.gameId)
							.then(function (data) {
								if (angular.isDefined(data)) {
									$scope.hasNoMatch = false;
									$scope.matchInfos = [
										{matchUrl: '/' + getGameId() + '/match/' + data['matchId'], playerIds: data['playerIds']}
									];
								} else {
									//TODO: need to improve the work flow
									$scope.hasNoMatch = true;
								}
							});
				}
			};

			/** Auto refresh all match info and game's name in a specific time */
			var autoRefresh = function (time) {
				$scope.autoRefreshHelper = function () {
					console.log("********** Auto refresh the off canvas menu per " + time/1000 + " seconds...");
					getGameName();
					$scope.checkMatches();
					myTimer = $timeout($scope.autoRefreshHelper, time);
				}
				var myTimer = $timeout($scope.autoRefreshHelper, time);
			}

			// Auto refresh every 60 seconds...
			autoRefresh(60 * 1000);
		}
);
