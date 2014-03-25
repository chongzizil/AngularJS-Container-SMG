'use strict';

smgContainer.controller('InviteController',
		function ($scope, $rootScope, InsertMatchService, $location) {

			$scope.invite = function(inviteInfo) {
				console.log(inviteInfo);
				// The player's info
				$rootScope.playerId = 5974892214222848;
				$rootScope.accessSignature = 'd9e7f9a6d7a2a9c9dddcba550e5743ad';

				if ($rootScope.playerId !== undefined) {
					var data = {
						accessSignature: $rootScope.accessSignature,
						playerIds: [$rootScope.playerId, parseInt(inviteInfo.friendId)],
						gameId: parseInt(inviteInfo.gameId)
					};
					var jsonData = angular.toJson(data);
					console.log(data);
					console.log(jsonData);


					var result = InsertMatchService.save({}, data).$promise.then(function(data) {
								console.log(data);
								var matchId = data['matchId'];
								console.log(data['matchId']);
								$location.url('/match/' + data['matchId']);
							}
					);
				} else {
					alert('You have to login first!');
				}
			}
});