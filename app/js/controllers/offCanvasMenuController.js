'use strict';

smgContainer.controller('OffCanvasMenuController',
		function ($scope, $rootScope, $cookies, $location, $routeParams, $timeout, $q, $translate, GetGameInfoService, NewMatchService) {

			/****************************** Initial off canvas menu *******************************/

			/** Adjust the off canvas menu size. */
			var adjustOffCanvasMenu = function () {
				var windowHeight = $(window).height();
				var offCanvasMenu = $("#offCanvasMenu");
				if (windowHeight > 800) {
					offCanvasMenu.height(600);
				} else {
					offCanvasMenu.height(windowHeight * 0.60);
				}
			};

			/** Every time the broswer is resized, adjust the size of the off canvas menu. */
			$(window).resize(function () {
				adjustOffCanvasMenu();
			});


			/*************************** End of initial game container ****************************/

			/************************************** Variables *************************************/
			// All joined onging match info
			$scope.matchInfos = [];

			/********************************** End of Variables **********************************/

			/************************************** Functions *************************************/

			/** Get the game id. */
			var getGameId = function () {
				var url = $location.url();
				if (url.substr(0, 6) === "/lobby") {
					return url.substr(7, 16);
				} else if (url.substr(0, 10) === "/gameResult") {
					return url.substr(11, 16);
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
				console.log("******* The gameID from the url is: " + getGameId());
				GetGameInfoService.getGameInfo(getGameId())
						.then(function (data) {
							if (angular.isDefined(data)) {
								$scope.gameName = data['gameName'];
							} else {
								$scope.gameName = "No game name... error...";
							}
						});
			};

			/** Refresh the off canvas menu. */
			$rootScope.refreshOffCanvasMenu = function () {
				getGameName();
			};

			/** Enter a match by given a match's info. */
			$scope.enterMatch = function (matchInfo) {
				$rootScope.playerIds = matchInfo['playerIds'];
				console.log("********** Entering the match by redirect to: " + matchInfo['matchUrl']);
				$location.url(matchInfo['matchUrl']);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

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

			/** Auto refresh all match info and game's name in a specific time. */
			var autoRefresh = function (time) {
				if (angular.isDefined(getGameId())) {
					$scope.autoRefreshHelper = function () {
						console.log("********** Auto refresh the off canvas menu per " + time/1000 + " seconds...");
						getGameName();
						$scope.checkMatches();
						myTimer = $timeout($scope.autoRefreshHelper, time);
					};
					var myTimer = $timeout($scope.autoRefreshHelper, time);
				}
			};

			/** Change the language of the page. */
			$scope.changeLanguage = function (langKey) {
				$translate.use(langKey);
			};

			/********************************** End of Functions **********************************/

			/************************************* Start point ************************************/

			getGameName();

			adjustOffCanvasMenu();

			// Auto refresh every 60 seconds...
			autoRefresh(60 * 1000);

			/************************************* End point ************************************/
		}
);
