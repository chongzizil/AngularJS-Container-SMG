'use strict';

smgContainer.controller('GameResultController', function ($scope, $rootScope, $location, $q, $cookies, GetPlayerInfoService, PostMessageToFBService) {

	/************************************** Variables *************************************/

	var winnerId = $rootScope.matchResultInfo['winner'];
//	var opponentId = $rootScope.matchResultInfo['opponentId'];
	var hasWon = $rootScope.matchResultInfo['hasWon'];

	/********************************** End of variables **********************************/


	/************************************** Functions *************************************/

	/** Get winner's info */
	var getWinnerInfo = function (targetId) {
		GetPlayerInfoService.getPlayerInfo($cookies.playerId, targetId, $cookies.accessSignature)
				.then(function (data) {
					if (angular.isDefined(data)) {
						$scope.winnerNickName = data['nickname'];
						$scope.winnerImageUrl = data['imageURL'];
					}
				});
	};

	/**
	 * Post message on Facebook,
	 */
//	var postMsgToFB = function () {
//		PostMessageToFBService.save({message: messageToFB, access_token: $cookies.FBAccessToken}, "")
//				.$promise.then(function (response) {
//					console.log("********** Response from posting to FB: " + angular.toJson(response));
//				}
//		);
//	};

	/*********************************** End of functions *********************************/


	/************************************* Start point ************************************/

	if (!$rootScope.matchResultInfo['isStandAlone']) {
		getWinnerInfo(winnerId);
	} else {
		if ($rootScope.matchResultInfo.winner === $cookies.playerId) {
			getWinnerInfo(winnerId);
		} else {
			$scope.winnerNickName = "player 2";
			$scope.winnerImageUrl = "img/giraffe.gif";
		}
	}

	if (!$rootScope.matchResultInfo['isStandAlone']) {
		if (hasWon) {
			$scope.winnerMsg = true;
			$scope.loserMsg = false;
			$scope.passAndPlayMsg = false;
		} else {
			$scope.winnerMsg = false;
			$scope.loserMsg = true;
			$scope.passAndPlayMsg = false;
		}
	} else {
		$scope.passAndPlayMsg = true;
	}

	$scope.backUrl = "#/lobby/" + $rootScope.matchResultInfo.gameId;

	/************************************* End point ************************************/
});