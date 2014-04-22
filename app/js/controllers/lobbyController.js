'use strict';

/**
 * Lobby Controller has only one ways to play a game for now:
 * 1. Asynchronous: The player can play the game asynchronously through auto match.
 *    The player first need to click the auto match button. The server will auto pair two players and return the matchId
 *    to the second player in order for him to insert a match. The first player will need to check the off canvas menu for
 *    a new match, either wait for auto refresh or click the refresh button to check for new match info. Once he/she click
 *    a match, the page will be redirected to the match page.
 */

smgContainer.controller('LobbyController', function ($scope, $rootScope, $routeParams, $location, $cookies, $timeout, joinQueueService, NewMatchService, InsertMatchService, GetGameInfoService, GetPlayerInfoService, GetAllMatchInfoService) {

	/** Set the jumbotron */
	var setJumbotron = function() {
		// Adjust the jumbotron to a suitable size
		if ($(window).height() > 800) {
			$("#justPlay").height(600);
		} else {

			$("#justPlay").height($(window).height() * 0.60);
		}

		// Adjust the three buttons position
		var heightOfJustPlay = $("#justPlay").height();
		var heightOfEachButton = $("#autoMatch").height();
		var restOfJustPlay = heightOfJustPlay - 3 * heightOfEachButton;
		var autoMatchOffset = restOfJustPlay * 0.10;
		var passAndPlayOffset = restOfJustPlay * 0.20 ;
		var PlayAiOffset = restOfJustPlay * 0.30 ;

		$("#autoMatch").css({position: 'relative', top: autoMatchOffset + 'px'});
		$("#passAndPlay").css({position: 'relative', top: passAndPlayOffset + 'px'});
		$("#PlayAi").css({position: 'relative', top: PlayAiOffset + 'px'});
	}
	setJumbotron();

	$cookies.gameId=$routeParams.gameId;

  var needLoginAlert = $("#needLoginAlert");
  needLoginAlert.on('close.bs.alert', function () {
    needLoginAlert.hide();
    return false;
  })

  // Initial the mode check
  $cookies.isSyncMode = false;

  // If the login info is contained in the url, then retrieve the login data
  var urlData = $location.search();
  if (urlData['playerId'] != undefined && urlData['accessSignature'] != undefined) {
    $cookies.playerId = urlData['playerId'];
    $cookies.accessSignature = urlData['accessSignature'];
    $rootScope.refreshDisplayId();
  }

  // Get the game info from the server
  var getGameName = function () {
    GetGameInfoService.get({gameId: $routeParams.gameId}).
        $promise.then(function (data) {
          if (data['error'] == 'WRONG_GAME_ID') {
            alert('Sorry, Wrong Game ID provided!');
          } else {
//	          console.log("**************** Game Info ****************");
//	          console.log(data);
            $scope.gameName = data['gameName'];
            $scope.gameDescription = data['description'];
	          console.log("Game's name got!");
          }
        }
    );
  };
	console.log("Getting game's name...");
  getGameName();

  // Get the player email from the server
  GetPlayerInfoService.get({playerId: $cookies.playerId,
    targetId: $cookies.playerId, accessSignature: $cookies.accessSignature}).
      $promise.then(function (data) {
        if (data['error'] == "WRONG_PLAYER_ID") {
          alert("Sorry, Wrong Player ID provided!");
        } else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
          alert('Sorry, Wrong Access Signature provided!');
        } else if (data['error'] == 'WRONG_TARGET_ID') {
          alert('Sorry, Wrong Target ID provided!');
        } else {
	        $cookies.imageUrl = data['imageURL'];
	        $scope.imageUrl = $cookies.imageUrl;
          $scope.playerEmail = data['email'];
        }
      }
  );
  GetPlayerInfoService();

  // Get all on ongoing matches from the server
  var getMatchesInfo = function () {
    GetAllMatchInfoService.get({gameId: $routeParams.gameId}).
        $promise.then(function (data) {
          if (data['error'] == 'WRONG_GAME_ID') {
            alert('Sorry, Wrong Game ID provided!');
          } else {
//            console.log(data)
            $scope.allMatches = data['currentGames'];
          }
        }
    );
  };
  getMatchesInfo();

  /**
   * Insert a match when one player receive the playerIds
   * from the server and change the page to start play.
   */
  var insertMatch = function (playerIds) {
    var data = {
      accessSignature: $cookies.accessSignature,
      playerIds: playerIds,
      gameId: $routeParams.gameId
    }
    console.log("Inserting a match..........................");
//    console.log(data);
    var jsonData = angular.toJson(data);
    InsertMatchService.save({}, jsonData).
        $promise.then(function (data) {
//          console.log("From insertMatch.............................");
//          console.log(data);
          /*
           {@code data} contains following data:
           matchId:
           playerIds: should be an array, and we can store this into the $cookies and
           delete it after all players exit the match.
           */
          if (!data['matchId']) {
            if (data['error'] === 'WRONG_PLAYER_ID') {
              alert('Sorry, you need to finish the current match first. (multiple match is not supported yet...)');
            } else if (data['error'] === 'WRONG_GAME_ID') {
              alert('Sorry, the game\'s ID does not exist. Please try again.');
            }
          } else {
//            console.log("insertMatch");
            $("#autoMatching").hide();
            // Store the playerIds and matchId in the cookies
            $rootScope.playerIds = data['playerIds'];
//            console.log($rootScope.playerIds);
            $cookies.matchId = data['matchId'];
            $location.url($routeParams.gameId + '/match/' + data['matchId']);
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          }
        }
    );
  }

  /**
   * Try to retrieve the match info if there is one for the player
   */
  $scope.checkHasNewMatch = function () {
    NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature}).
        $promise.then(function (data) {
//          console.log("Getting new match info.......................");
//          console.log(data);
          /*
           {@code data} contains following data if there's a match:
           matchId:
           playerIds: should be an array, and we can store this into the $cookies and
           delete it after all players exit the match.
           */
          if (!data['matchId']) {
            if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
              alert('Sorry, your ID does not exist. Please try again.');
            } else if (data['error'] === 'WRONG_PLAYER_ID') {
              popupLoginPage();
            } else if (data['error'] === 'NO_MATCH_FOUND') {
              noNewMatchAlert.show();
            }
          } else {
            autoMatching.hide();
            // Store the playerIds and matchId in the cookies
            $rootScope.playerIds = data['playerIds'];
            $cookies.matchId = data['matchId'];
            $location.url($routeParams.gameId + '/match/' + data['matchId']);
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          }
        }
    );
  }

  /**
   * Start a auto match
   */
  $scope.autoMatch = function () {
    //The data send to the server in order to join a auto match queue
    var joinQueueData = {
      accessSignature: $cookies.accessSignature,
      playerId: $cookies.playerId,
      gameId: $routeParams.gameId
    };
    // Change the data to json object
    var jsonJoinQueueData = angular.toJson(joinQueueData);

	  /**
	   * Post data to the server in order to join the queue for auto match.
	   */
	  joinQueueService.save({}, jsonJoinQueueData).
			  $promise.then(function (data) {
				  if (!data['channelToken']) {
					  if (data['error'] === 'WRONG_PLAYER_ID') {
						  alert('Sorry, you have the wrong player ID');
					  } else if (data['error'] === 'WRONG_GAME_ID') {
						  alert('Sorry, the game\'s ID does not exist. Please try again.');
					  } else if (data['error'] === 'MISSING_INFO') {
						  alert("Missing info:" + jsonJoinQueueData);
					  }
				  } else {
					  console.log("Join the queue, waiting for auto match...");
					  if (data['playerIds']) {
						  console.log("Auto matched... Ready to insert a new match...");
						  $cookies.isSyncMode = false;
						  insertMatch(data['playerIds']);
					  }
				  }
			  }
	  );
  } // End of autoMatch

	/**
	 * Start pass and play game mode
	 */
	$scope.passAndPlay = function () {
		console.log("Stand along url is:" + $routeParams.gameId + '/standalone?mode=pass_and_play&timeOfEachTurn=' + $scope.timeOfEachTurn);
		$location.url($routeParams.gameId + '/standalone?mode=pass_and_play&timeOfEachTurn=' + $scope.timeOfEachTurn);
	}

	/**
	 * Start pass and play game mode
	 */
	$scope.playWithAi = function () {
		console.log("Stand along url is:" + $routeParams.gameId + '/standalone?mode=play_with_ai');
		$location.url($routeParams.gameId + '/standalone?mode=play_with_ai');
	}
});