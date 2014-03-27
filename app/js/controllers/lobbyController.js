'use strict';

smgContainer.controller('LobbyController',
		function ($scope, $rootScope, InsertMatchService, $location, $cookies) {
			$scope.invite = function(inviteInfo) {
				var accessSignature = $cookies.accessSignature;
				var playerId = $cookies.playerId;
				var friendId = inviteInfo.friendId;
				var gameId = inviteInfo.gameId;
				$cookies.friendId = friendId;
				$cookies.gameId = gameId;

				// Initiate the alert
				$scope.friendIdHasError = false;
				$scope.gameIdHasError = false;

				var inviteAlert = $("#inviteAlert");
				inviteAlert.on('close.bs.alert', function() {
					inviteAlert.hide();
					return false;
				})

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
			}
		});