'use strict';

smgContainer.controller('LobbyController',
		function ($scope, $rootScope, $routeParams, $location, $cookies, joinQueueService, InsertMatchService) {
			var accessSignature = $cookies.accessSignature;
			var playerId = $cookies.playerId;
			var gameId = parseInt($routeParams.gameId);
			var channel;
			var socket;
			var handler =
			{
				onopen: function () { alert("onopen") },
				onerror: function () { alert("onerror") },
				onclose: function () { alert("onclose") },
				onmessage:
						function (event) {
							//evt.data will be what the server sends in channel.send_message
							if (event.data['playerIds']) {
								insertMatch(event.data['playerIds']);
							} else if (event.data['matchId']) {
								$location.url(gameId + '/match/' + event.data['matchId']);
							}

							console.log("evt.data received from authhandler: " + evt.data);
							alert("evt.data is: " + evt.data)
						}
			};

			var joinQueueData = {
				accessSignature: accessSignature,
				playerIds: playerId,
				gameId: gameId
			};

			var jsonJoinQueueData = angular.toJson(joinQueueData);

			// Once open the page,
			joinQueueService.save({}, jsonJoinQueueData).
					$promise.then(function(data) {
						console.log(data);
						if(!data['matchId']) {
							if (data['error'] === 'WRONG_PLAYER_ID') {
								alert('Sorry, your ID does not exist. Please try again.');
							} else if (data['error'] === 'WRONG_GAME_ID') {
								alert('Sorry, the game\'s ID does not exist. Please try again.');
							}
						} else {
							console.log(data['channelToken']);
							$cookies.channelToken = data['channelToken'];
							channel = goog.appengine.Channel(token);
							socket = channel.open(handler);
							//$location.url('/match/' + data['matchId']);
						}
					}
			);

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