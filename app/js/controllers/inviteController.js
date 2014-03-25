'use strict';

smgContainer.controller('InviteController',
	function ($scope, $rootScope, InsertMatchService, $location, $cookies) {
		$scope.invite = function(inviteInfo) {
			var accessSignature = $cookies.accessSignature;
			var playerId = $cookies.playerId;
			var friendId = inviteInfo.friendId;
			var gameId = inviteInfo.gameId;
			$cookies.friendId = friendId;
			$cookies.gameId = gameId;

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
							console.log(data['matchId']);
							$location.url('/match/' + data['matchId']);
						}
				);
			} else {
				alert('You have to login first!');
			}
		}
});