'use strict';

/**
 * Lobby Controller has only one ways to play a game for now:
 * 1. Asynchronous: The player can play the game asynchronously through auto match.
 *    The player first need to click the auto match button. The server will auto pair two players and return the matchId
 *    to the second player in order for him to insert a match. The first player will need to check the off canvas menu for
 *    a new match, either wait for auto refresh or click the refresh button to check for new match info. Once he/she click
 *    a match, the page will be redirected to the match page.
 */

smgContainer.controller('LobbyController', function ($scope, $rootScope, $routeParams, $location, $cookies, $q, $timeout, joinQueueService, NewMatchService, InsertMatchService, GetGameInfoService, GetPlayerInfoService, GetAllMatchesService) {

	/********************************** Initial jumbotron *********************************/

	/** Adjust the jumbotron's size. */
	var adjustJumbotron = function () {
		var windowHeight = $(window).height();
		var justPlayJumbotron = $("#justPlay");
		if (windowHeight > 800) {
			justPlayJumbotron.height(600);
		} else {
			justPlayJumbotron.height(windowHeight * 0.60);
		}

		// Adjust the three buttons position
		var heightOfJustPlay = justPlayJumbotron.height();
		var autoMatchButton = $("#autoMatch");
		var passAndPlayButton = $("#passAndPlay");
		var playWithAiButton = $("#playWithAi");

		var buttonHeight = autoMatchButton.height();


		var restOfJustPlay = heightOfJustPlay - 3 * buttonHeight;
		var autoMatchOffset = restOfJustPlay * 0.10;
		var passAndPlayOffset = restOfJustPlay * 0.20;
		var PlayAiOffset = restOfJustPlay * 0.30;

		autoMatchButton.css({position: 'relative', top: autoMatchOffset + 'px'});
		passAndPlayButton.css({position: 'relative', top: passAndPlayOffset + 'px'});
		playWithAiButton.css({position: 'relative', top: PlayAiOffset + 'px'});
	};

	/** Every time the broswer is resized, adjust the size of the jumbotron. */
	$(window).resize(function () {
		adjustJumbotron();
	});

	/****************************** End of initial jumbotron ******************************/

	/************************************** Variables *************************************/

	// Get the game ID
	$cookies.gameId = $routeParams.gameId;

	// Initial the mode check
	$cookies.isSyncMode = false;

	// If the url containers a player's info, retrieve it.
	var urlData = $location.search();

	if (urlData['playerId'] != undefined && urlData['accessSignature'] != undefined) {
		$cookies.playerId = urlData['playerId'];
		$cookies.accessSignature = urlData['accessSignature'];
		$rootScope.refreshUserDisplay();
	}

	/********************************** End of Variables **********************************/

	/************************************** Functions *************************************/

	/** Get the player */
	var getPlayerInfo = function () {
		GetPlayerInfoService.getPlayerInfo($cookies.playerId, $cookies.playerId,
				$cookies.accessSignature)
				.then(function (data) {
					if (angular.isDefined(data)) {
						$cookies.playerImageUrl = data['imageURL'];
						$scope.playerImageUrl = $cookies.playerImageUrl;
						$cookies.playerEmail = data['email'];

						$rootScope.refreshUserDisplay();
					}
				});
	};

	/** Get all on ongoing matches from the server. */
	var getMatchesInfo = function () {
		GetAllMatchesService.getAllMatches($routeParams.gameId).then(function (data) {
			if (angular.isDefined(data)) {
				$scope.allMatches = data['currentGames'];
			}
		});
	};

	/**
	 * Insert a match when one player receive the playerIds
	 * from the server and change the page to start play.
	 */
	var insertMatch = function (playerIds) {
		var data = {
			accessSignature: $cookies.accessSignature,
			playerIds: playerIds,
			gameId: $routeParams.gameId
		};
		console.log("********** Inserting a match...");

		InsertMatchService.sendInsertMatch(angular.toJson(data))
				.then(function (data) {
					if (angular.isDefined(data)) {
//						$("#autoMatching").hide();

						// Store the playerIds and matchId in the cookies
						$rootScope.playerIds = data['playerIds'];
						$cookies.matchId = data['matchId'];

						// Redirect the page
						$location.url($routeParams.gameId + '/match/' + data['matchId']);
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					}
				});
	};

	/** Start a auto match. */
	$scope.autoMatch = function () {
		//The data send to the server in order to join a auto match queue
		var joinQueueData = {
			accessSignature: $cookies.accessSignature,
			playerId: $cookies.playerId,
			gameId: $routeParams.gameId
		};

		console.log("********** Trying to join the queue for auto match...");

		/**
		 * Post data to the server in order to join the queue for auto match.
		 */
		joinQueueService.joinQueue(angular.toJson(joinQueueData))
				.then(function (data) {
					if (angular.isDefined(data)) {
						console.log("********** Joined the queue, waiting for auto match...");
						if (data['playerIds']) {
							console.log("********** Auto matched... Ready to insert a new match...");
							$cookies.isSyncMode = false;
							var playerIds = flipPlayerIds(data['playerIds']);
							insertMatch(playerIds);
						}
					}
				});
	};

	/**
	 * Flip the playerIds, so the second player who enter the game
	 * automatically will make the move first without waiting...
	 */
	var flipPlayerIds = function (playerIds) {
		return [playerIds[1], playerIds[0]];
	};

	/** Start pass and play game mode. */
	$scope.passAndPlay = function () {
		console.log("Stand along url is:" + $routeParams.gameId + '/standalone?mode=pass_and_play&timeOfEachTurn=' + $scope.timeOfEachTurn);
		var opponentPlayerId = $cookies.playerId + "11111";
		$rootScope.playerIds = [$cookies.playerId, opponentPlayerId];
		$location.url($routeParams.gameId + '/standalone?mode=pass_and_play&timeOfEachTurn=' + $scope.timeOfEachTurn);
	};

	/** Start pass and play game mode. */
	$scope.playWithAi = function () {
		console.log("Stand along url is:" + $routeParams.gameId + '/standalone?mode=play_with_ai');
		$location.url($routeParams.gameId + '/standalone?mode=play_with_ai');
	};

	/********************************** End of Functions **********************************/

	/************************************* Start point ************************************/

	adjustJumbotron();

	getPlayerInfo();

	$rootScope.refreshOffCanvasMenu();

	getMatchesInfo();

	/************************************* End point ************************************/
});