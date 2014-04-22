'use strict';

smgContainer.controller('GameResultController', function ($scope, $rootScope, $location, $cookies, GetPlayerInfoService) {
	/** Get a winner's info */
	var getWinnerInfo = function (targetId) {
		GetPlayerInfoService.get({playerId: $cookies.playerId,
			targetId: targetId, accessSignature: $cookies.accessSignature}).
				$promise.then(function (data) {
					if (data['error'] == "WRONG_PLAYER_ID") {
						alert("Sorry, Wrong Player ID provided!");
					} else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
						alert('Sorry, Wrong Access Signature provided!');
					} else if (data['error'] == 'WRONG_TARGET_ID') {
						alert('Sorry, Wrong Target ID provided!');
					} else {
						$scope.winnerNickName = data['nickname'];
						$scope.winnerImageUrl = data['imageURL'];
					}
				}
		);
	}

	var winnerId = $rootScope.matchResultInfo['winner'];
//	var opponentId = $rootScope.matchResultInfo['opponentId'];
//	var yourId = $cookies.playerId;
	var hasWon = $rootScope.matchResultInfo['hasWon'];

	getWinnerInfo(winnerId);

	if (hasWon) {
		$scope.resultMsg = "Congratulation, You won!";
	} else {
		$scope.resultMsg = "Sorry, maybe next time...";
	}
});