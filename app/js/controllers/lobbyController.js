'use strict';

smgContainer.controller('LobbyController',
		function ($scope, $rootScope, $routeParams, $location, $cookies, $timeout,
		          joinQueueService, InsertMatchService, GetGameInfoService) {

			if ($cookies.playerId === "Guest" || $cookies.accessSignature === null){
				var urlData = $location.search();
				if (urlData['playerId']) {
					$cookies.playerId = urlData['playerId'];
					$cookies.accessSignature = urlData['accessSignature'];
					$rootScope.refreshDisplayId();
				}
			}

			/**
			 * If the player is not login yet, a window will pop up for him/her to login
			 */
			if ($cookies.playerId === "Guest" || $cookies.accessSignature === null) {
				var needLoginAlert = $("#needLoginAlert");
				needLoginAlert.on('close.bs.alert', function() {
					needLoginAlert.hide();
					return false;
				})
				needLoginAlert.modal('show');

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
				InsertMatchService.save({}, jsonData).
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
									alert('Sorry, your ID does not exist. Please try again.');
								} else if (data['error'] === 'WRONG_GAME_ID') {
									alert('Sorry, the game\'s ID does not exist. Please try again.');
								}
							} else {
								$("#autoMatching").modal('hide');
								// Store the playerIds and matchId in the cookies
								$cookies.playerIds = data['playerIds'];
								$cookies.matchId = data['matchId'];

								$scope.pageJump = function(){
									$location.url(gameId + '/match/' + data['matchId']);
									if(!$scope.$$phase) {
										$scope.$apply();
									}
								}
								$timeout($scope.pageJump, 200);
							}
						}
				);
			}

			/**
			 * Close the channel in order to cancel the auto match
			 */
			$scope.cancel = function() {
				$rootScope.socket.close();
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

				// functions for the socket
				var onopen = function () { console.log("channel opened..."); };
				var onerror = function () { };
				var onclose =function () { console.log("channel closed..."); };
				var onmessage = function (event) {
					// Receive the data from the channel
					var data = angular.fromJson(event.data);
					if (data['matchId']) {
						$cookies.playerIds = data['playerIds'];
						// Jump to the game page to start playing :
						$("#autoMatching").modal('hide');
						$scope.pageJump = function(){
							$location.url(gameId + '/match/' + data['matchId']);
							if(!$scope.$$phase) {
								$scope.$apply();
							}
						}
						$timeout($scope.pageJump, 200);
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
				var accessSignature = $cookies.accessSignature;
				var friendId = inviteInfo.friendId;

				// Initiate the alert
				$scope.friendIdHasError = false;

				var inviteAlert = $("#inviteAlert");
				inviteAlert.on('close.bs.alert', function() {
					inviteAlert.hide();
					return false;
				})

				var playerIds = [playerId, friendId];

				insertMatch(playerIds);
			 }

		});