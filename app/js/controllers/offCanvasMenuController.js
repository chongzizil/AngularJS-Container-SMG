'use strict';

smgContainer.controller('OffCanvasMenuController',
		function ($scope, $cookies, $location, $routeParams, $timeout, GetGameInfoService, NewMatchService) {

			var url = $location.url();

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
									alert('Sorry, Wrong Game ID provided!');
								} else {
									$scope.gameName = data['gameName'];
									$scope.gameDescription = data['description'];
								}
							}
					);
				}
				getGameName();

				/**
				 * Try to retrieve the match info if there is one for the player
				 */
				$scope.checkMatches = function () {
					NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature, gameId: gameId}).
							$promise.then(function (data) {
								/*
								 {@code data} contains following data if there's a match:
								 matchId:
								 playerIds: should be an array, and we can store this into the $cookies and
								 delete it after all players exit the match.
								 */
								if (!data['matchId']) {
									if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
										alert('Sorry, your ID does not exist. Please try again.');
										alert('Sorry, your ID does not exist. Please try again.');
									} else if (data['error'] === 'WRONG_PLAYER_ID') {
										alert('WRONG_PLAYER_ID');
									} else if (data['error'] === 'NO_MATCH_FOUND') {
										//TODO: delte later
										alert('NO_MATCH_FOUND');
									}
								} else {
									playerIds = data['playerIds'];
									matchId = data['matchId'];
//									$location.url($routeParams.gameId + '/match/' + data['matchId']);
//									if (!$scope.$$phase) {
//										$scope.$apply();
//									}
								}
							}
					);
					$scope.matchUrl = '#/' + gameId + '/match/' + matchId;
				}

				/** Auto refresh all match info in a specific time */
				var autoRefresh = function(time) {
					$scope.countDown = function () {
						$scope.checkMatches();
						myTimer = $timeout($scope.countDown, 1000);
					}
					var myTimer = $timeout($scope.countDown, 1000);
				}
				autoRefresh(5000);
			}
		}
);
