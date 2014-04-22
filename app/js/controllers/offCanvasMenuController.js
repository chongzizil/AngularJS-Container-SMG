'use strict';

smgContainer.controller('OffCanvasMenuController',
		function ($scope, $rootScope, $cookies, $location, $routeParams, $timeout, GetGameInfoService, NewMatchService) {

			var url = $location.url();

			$scope.enterMatch = function (matchInfo) {
				$rootScope.playerIds = matchInfo['playerIds'];
				console.log("Jump to" + matchInfo['matchUrl']);
				$location.url(matchInfo['matchUrl']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			}


			$scope.refreshOffCanvasMenu = function () {
				if (angular.isDefined(gameId)) {
					getGameName();
				} else {
					$scope.gameName = "No game!?";
				}
			}

			/** If it's in the lobby page */
			if (url.substr(0, 6) === "/lobby") {
				var gameId = url.substr(7);
				var playerIds;
				var matchId;

				// Get the game info from the server
				var getGameName = function () {
					GetGameInfoService.get({gameId: gameId}).
							$promise.then(function (data) {
								if (data['error'] == 'WRONG_GAME_ID') {
									alert('Sorry, wrong Game ID provided!');
								} else {
									$scope.gameName = data['gameName'];
									$scope.gameDescription = data['description'];
								}
							}
					);
				}
				getGameName();
			}


			/**
			 * Try to retrieve the match info if there is one for the player
			 */
			$scope.checkMatches = function () {
				console.log("Refreshing match info...");
				NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature, gameId: gameId}).
						$promise.then(function (data) {
							console.log("Got match info...");
							console.log(data);
							/*
							 {@code data} contains following data if there's a match:
							 matchId:
							 playerIds: should be an array, and we can store this into the $cookies and
							 delete it after all players exit the match.
							 */
							if (!data['matchId']) {
								if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'WRONG_PLAYER_ID') {
									alert('WRONG_PLAYER_ID');
								} else if (data['error'] === 'NO_MATCH_FOUND') {
									//TODO: delte later
									alert('NO_MATCH_FOUND');
								}
							} else {
								$scope.matchInfos = [
									{matchUrl: '/' + gameId + '/match/' + data['matchId'], playerIds: data['playerIds']}
								];
								console.log($scope.matchInfos);
							}
						}
				);
			}

			/** Auto refresh all match info in a specific time */
			var autoRefresh = function (time) {
				$scope.countDown = function () {
					$scope.checkMatches();
					myTimer = $timeout($scope.countDown, time);
				}
				var myTimer = $timeout($scope.countDown, time);
			}
			autoRefresh(60 * 1000);

		}
);
