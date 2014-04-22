'use strict';

smgContainer.controller('OffCanvasMenuController',
		function ($scope, $rootScope, $cookies, $location, $routeParams, $timeout, GetGameInfoService, NewMatchService) {

			/** Refresh the off canvas menu */
			$rootScope.refreshOffCanvasMenu = function () {
				getGameName();
			}

			var getGameId = function () {
				var url = $location.url();
				if (url.substr(0, 6) === "/lobby") {
					return url.substr(7);
				} else {
					return undefined;
				}
			}

			var getGameName = function () {
				$scope.gameId = getGameId();
				if (angular.isDefined($scope.gameId)) {
					GetGameInfoService.get({gameId: $scope.gameId}).
							$promise.then(function (data) {
								if (data['error'] == 'WRONG_GAME_ID') {
									alert('Sorry, wrong Game ID provided!');
								} else {
									$scope.gameName = data['gameName'];
//									$scope.gameDescription = data['description'];
								}
							}
					);
				} else {
					$scope.gameName = "No game name... error...";
				}
			}

			$scope.enterMatch = function (matchInfo) {
				$rootScope.playerIds = matchInfo['playerIds'];
				console.log("Jump to" + matchInfo['matchUrl']);
				$location.url(matchInfo['matchUrl']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			}

			/**
			 * Try to retrieve the match info if there is one for the player
			 */
			$scope.checkMatches = function () {
				if (angular.isDefined($scope.gameId)) {
					$scope.matchInfos = [];
					NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature, gameId: $scope.gameId}).
							$promise.then(function (data) {
								console.log("Got match info from checkMatches()...");
								/*
								 {@code data} contains following data if there's a match:
								 matchId:
								 playerIds: should be an array, and we can store this into the $cookies and
								 delete it after all players exit the match.
								 */
								if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'WRONG_PLAYER_ID') {
									alert('WRONG_PLAYER_ID');
								} else if (data['error'] === 'WRONG_GAME_ID') {
									//TODO: delete later
									//alert('WRONG_GAME_ID');
								} else if (data['error'] === 'NO_MATCH_FOUND') {
									//TODO:
									$scope.noMatch = true;
								} else {
									$scope.noMatch = false;
									$scope.matchInfos = [
										{matchUrl: '/' + $scope.gameId + '/match/' + data['matchId'], playerIds: data['playerIds']}
									];
								}
							}
					);
				}
			}

			/** Auto refresh all match info in a specific time */
			var autoRefresh = function (time) {
				$scope.autoRefreshHelper = function () {
					console.log("Auto refresh the match info in off canvas menu per " + time/1000 + " seconds...");
					$scope.checkMatches();
					myTimer = $timeout($scope.autoRefreshHelper, time);
				}
				var myTimer = $timeout($scope.autoRefreshHelper, time);
			}
			autoRefresh(60 * 1000);
		}
);
