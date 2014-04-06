'use strict';

smgContainer.controller('LobbyController', function (
		$scope, $rootScope, $routeParams, $location, $cookies,
		$timeout, joinQueueService, NewMatchService) {

			// Alerts
			var inviteAlert = $("#inviteAlert");
			inviteAlert.on('close.bs.alert', function() {
				inviteAlert.hide();
				return false;
			})
			// Alerts
			var noNewMatchAlert = $("#noNewMatchAlert");
			noNewMatchAlert.on('close.bs.alert', function() {
				noNewMatchAlert.hide();
				return false;
			})
			// Alerts
			var needLoginAlert = $("#needLoginAlert");
			needLoginAlert.on('close.bs.alert', function() {
				needLoginAlert.hide();
				return false;
			})
			// Alerts
			var autoMatching = $("#autoMatching");



			// Check the login is woring
			console.log("cookies.playerId: " + $cookies.playerId);
			console.log("cookies.accessSignature: " + $cookies.accessSignature);

			// Initial the mode check
			$cookies.isSyncMode = false;

			// If the login info is contained in the url, then retrieve the login data
			var urlData = $location.search();
			if (urlData['playerId'] != undefined && urlData['accessSignature'] != undefined){
				$cookies.playerId = urlData['playerId'];
				$cookies.accessSignature = urlData['accessSignature'];
				$rootScope.refreshDisplayId();
			}

			//If the player is not login yet, a popup will alert him/her to login first
			if ($cookies.playerId === "Guest" || $cookies.accessSignature === null) {
				// Show the modal to alert the player
				needLoginAlert.modal('show');

				// A simple count down for login page pop up
				$scope.timer = 3;
				$scope.countDown = function(){
					$scope.timer--;
					if ($scope.timer !== 0) {
						myTimer = $timeout($scope.countDown,1000);
					} else {
						needLoginAlert.modal('hide');
						$("#login").modal('show');
					}
				}

				var myTimer = $timeout($scope.countDown,1000);
			} else {
				// If the player login, then retrieve the login info
				var accessSignature = $cookies.accessSignature;
				var playerId = $cookies.playerId;
				var gameId = $routeParams.gameId;
			}

			/**
			 * Insert a match when one player receive the playerIds
			 * from the server and change the page to start play.
			 */
			var insertMatch = function(playerIds) {
				var Data = {
					accessSignature: accessSignature,
					playerIds: playerIds,
					gameId: gameId
				};
				var jsonData = angular.toJson(Data);
				NewMatchService.save({}, jsonData).
						$promise.then(function(data) {
							console.log(data);
							/*
							 {@code data} contains following data:
							 matchId:
							 playerIds: should be an array, and we can store this into the $cookies and
							 delete it after all players exit the match.
							 */
							if(!data['matchId']) {
								if (data['error'] === 'WRONG_PLAYER_ID') {
									$scope.friendIdHasError = true;
									$scope.inviteInfo.error = 'Sorry, your friend\'s ID does not exist. Please try again.';
									$("#inviteAlert").show();
								} else if (data['error'] === 'WRONG_GAME_ID') {
									alert('Sorry, the game\'s ID does not exist. Please try again.');
								}
							} else {
								$("#autoMatching").hide();
								// Store the playerIds and matchId in the cookies
								$cookies.playerIds = data['playerIds'];
								$cookies.matchId = data['matchId'];
								$location.url(gameId + '/match/' + data['matchId']);
								if(!$scope.$$phase) {
									$scope.$apply();
								}
							}
						}
				);
			}

			/**
			 * Close the channel in order to cancel the auto match
			 */
			$scope.cancel = function() {
				$("#autoMatching").hide();
				$rootScope.socket.close();
			}

			/**
			 * Try to retrieve the match info if there is one for the player
			 */
			var checkHasNewMatch = function() {
				NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature}).
						$promise.then(function(data) {
							console.log(data);
							/*
							 {@code data} contains following data if there's a match:
							 matchId:
							 playerIds: should be an array, and we can store this into the $cookies and
							 delete it after all players exit the match.
							 */
							if(!data['matchId']) {
								if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
									alert('Sorry, your ID does not exist. Please try again.');
									$("#inviteAlert").show();
								} else if (data['error'] === 'WRONG_PLAYER_ID') {
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'NO_MATCH_FOUND') {
									noNewMatchAlert.show();
								}
							} else {
								$("#autoMatching").hide();
								// Store the playerIds and matchId in the cookies
								$cookies.playerIds = data['playerIds'];
								$cookies.matchId = data['matchId'];
								$location.url(gameId + '/match/' + data['matchId']);
								if(!$scope.$$phase) {
									$scope.$apply();
								}
							}
						}
				);
			}



			/**
			 * Start a auto match by using channel API
			 */
			$scope.autoMatch = function() {
				//The data send to the server in order to join a auto match queue
				var joinQueueData = {
					accessSignature: accessSignature,
					playerId: playerId,
					gameId: gameId.toString()
				};
				// Change the data to json object
				var jsonJoinQueueData = angular.toJson(joinQueueData);

				inviteAlert.hide();
				noNewMatchAlert.hide();

				// functions for the socket
				var onopen = function () { console.log("channel opened..."); };
				var onerror = function () { };
				var onclose =function () { console.log("channel closed..."); };
				var onmessage = function (event) {
					autoMatching.show();

					// Sync mode is choosed
					$cookies.isSyncMode = true;

					// Receive the data from the channel
					var data = angular.fromJson(event.data);

					if (data['matchId']) {
						$cookies.playerIds = data['playerIds'];
						// Jump to the game page to start playing :
						$location.url(gameId + '/match/' + data['matchId']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					}
				}

				/**
				 * Once open the page, post data to the server in order
				 * to join the queue for auto match.
				 */
				joinQueueService.save({}, jsonJoinQueueData).
						$promise.then(function(data) {
							console.log(data);
							if(!data['channelToken']) {
								if (data['error'] === 'WRONG_PLAYER_ID') {
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'WRONG_GAME_ID') {
									alert('Sorry, the game\'s ID does not exist. Please try again.');
								}else if (data['error'] === 'MISSING_INFO') {
									alert(jsonJoinQueueData);
								}
							} else {
								$("#autoMatching").hide();
								$rootScope.channel = new goog.appengine.Channel(data['channelToken']);
								$rootScope.socket = $rootScope.channel.open();
								$rootScope.socket.onopen = onopen;
								$rootScope.socket.onerror = onerror;
								$rootScope.socket.onclose = onclose;
								$rootScope.socket.onmessage = onmessage;
								if (data['playerIds']) {
									insertMatch(data['playerIds']);
								}
							}
						}
				);
			} // End of autoMatch

			/**
			 * Start a match by inviting a friend
			 */
			$scope.invite = function(inviteInfo) {
				// Retrieve the friend's Id
				var friendId = inviteInfo.friendId;

				// Async mode is choosed
				$cookies.isSyncMode = false;

				// Initiate the alert
				$scope.friendIdHasError = false;

				// Cancel the auto match
				$scope.cancel();
				autoMatching.hide();

				var playerIds = [playerId, friendId];

				insertMatch(playerIds);
			 }
		});