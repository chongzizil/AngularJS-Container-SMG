'use strict';

smgContainer.controller('LobbyController',
		function ($scope, $rootScope, $routeParams, $location, $cookies, $timeout,
		          joinQueueService, InsertMatchService, GetGameInfoService) {

			console.log($location.search());
			if ($cookies.playerId === "Guest" || $cookies.accessSignature === null){
				var urlData = $location.search();
				if (urlData['playerId']) {
					$cookies.playerId = urlData['playerId'];
					$cookies.accessSignature = urlData['accessSignature'];
					$rootScope.refreshDisplayId();
				}
			}

			if ($cookies.accessSignature === undefined || $cookies.playerId === 'Guest') {
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

				console.log($cookies.playerId);
				console.log($cookies.accessSignature);
				console.log(gameId);

				//var handler;

				var joinQueueData = {
					accessSignature: accessSignature,
					playerId: playerId,
					gameId: gameId.toString()
				};

				var jsonJoinQueueData = angular.toJson(joinQueueData);
				console.log(jsonJoinQueueData);


				// functions for the socket
				var onopen = function () { console.log("channel opened..."); };
				var onerror = function () { };
				var onclose =function () { };
				var onmessage = function (event) {
					var originalData = event.data;
					var jsonData = JSON.stringify(eval("(" + originalData + ')'));
					var data = angular.fromJson(jsonData);

					console.log(event.data);
					console.log(data);
					if (data['matchId']) {
						console.log(gameId + '/match/' + data['matchId']);

						/** Option 1*/
						/*
						var matchUrl = gameId + '/match/' + data['matchId'];
						var changeLocation = function(matchUrl) {
							$location.path(matchUrl);

							if(!$scope.$$phase) {
								$scope.$apply();
							}
						};
						changeLocation();
						*/

						/** Option 2*/

						$location.url(gameId + '/match/' + data['matchId']);
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					}
				}

				/* Once open the page, post data to the server in order
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


				var closeChannel = function() {
					socket.close();
				}

				/* Insert a match when one player receive the playerIds
				 * from the server.
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
								// TODO: add playerIds here into $scope.
								if(!data['matchId']) {
									if (data['error'] === 'WRONG_PLAYER_ID') {
										alert('Sorry, your ID does not exist. Please try again.');
									} else if (data['error'] === 'WRONG_GAME_ID') {
										alert('Sorry, the game\'s ID does not exist. Please try again.');
									}
								} else {
									console.log(data['matchId']);
									$cookies.matchId = data['matchId'];
									$location.url(gameId + '/match/' + data['matchId']);
								}
							}
					);
				}
			}



			/*
			 $scope.invite = function(inviteInfo) {
			 var accessSignature = $cookies.accessSignature;

			 var friendId = inviteInfo.friendId;


			 // Initiate the alert
			 $scope.friendIdHasError = false;
			 $scope.gameIdHasError = false;

			 var inviteAlert = $("#inviteAlert");
			 inviteAlert.on('close.bs.alert', function() {
			 inviteAlert.hide();
			 return false;
			 })

			 // ChannelAPI
			 //var channel = goog.appengine.Channel(token);

			 if (playerId !== undefined && accessSignature !== undefined) {
			 var inviteData = {
			 accessSignature: accessSignature,
			 playerIds: [playerId, parseInt(friendId)],
			 gameId: parseInt(gameId)
			 };
			 var jsonInviteData = angular.toJson(inviteData);

			 InsertMatchService.save({}, jsonInviteData).
			 $promise.then(function(data) {
			 console.log(data);
			 if(!data['matchId']) {
			 if (data['error'] === 'WRONG_PLAYER_ID') {
			 $scope.friendIdHasError = true;
			 $scope.inviteInfo.error = 'Sorry, your friend\'s ID does not exist. Please try again.';
			 inviteAlert.show();
			 } else if (data['error'] === 'WRONG_GAME_ID') {
			 $scope.gameIdHasError = true;
			 $scope.inviteInfo.error = 'Sorry, the game\'s ID does not exist. Please try again.';
			 inviteAlert.show();
			 }
			 } else {
			 console.log(data['matchId']);
			 $cookies.matchId = data['matchId'];
			 $location.url('/match/' + data['matchId']);
			 }
			 }
			 );
			 } else {
			 alert('You have to login first!');
			 }
			 }*/

		});