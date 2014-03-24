'use strict';

smgContainer.controller('InviteController',
		function ($scope, $rootScope, MatchService) {

			$scope.invite = function(inviteInfo) {
				console.log(inviteInfo);
				$rootScope.playerId = 0;
				$rootScope.accessSignature = 'abcdefg';
				if ($rootScope.playerId !== undefined) {
					var data = {
						accessSignature: $rootScope.accessSignature,
						playerIds: [$rootScope.playerId, parseInt(inviteInfo.friendId)],
						gameId: parseInt(inviteInfo.gameId)
					};
					console.log(data);
					var result = MatchService.insert(data);
					var matchId = result.matchId;

					//$location.url('/match/:matchId');
				} else {
					alert('You have to login first!');
				}
			}
});