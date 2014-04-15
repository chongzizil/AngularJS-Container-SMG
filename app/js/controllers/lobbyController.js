'use strict';

/**
 * Lobby Controller has two ways to play a game for noe:
 * 1. Synchronous:
 *    The player can play the game synchronously through auto match.
 *    Once the player click the auto match button, the player will join a queue waiting for another player.
 *    When other player has join the queue, one of them will get the info from channel and start a match.
 *    Then both of them will be automatically redirected to the match page.
 *    The player can also cancel it and exit the queue.
 * 2. Asynchronous:
 *    The player can play the game asynchronously through invite.
 *    Once the player fill out the other player's ID and click the invite button, the player will start a match.
 *    The player's page will be redirected to the match page but the other player will need to click the
 *    "check new match" button to check if he/she is invited and if yes, the page will be redirected to match page.
 */

smgContainer.controller('LobbyController', function ($scope, $rootScope, $routeParams, $location, $cookies, $timeout, joinQueueService, NewMatchService, InsertMatchService, GetGameInfoService, GetPlayerInfoService, GetAllMatchInfoService) {

  // Alerts for lobby.html
  var inviteAlert = $("#inviteAlert");
  inviteAlert.on('close.bs.alert', function () {
    inviteAlert.hide();
    return false;
  })

  var noNewMatchAlert = $("#noNewMatchAlert");
  noNewMatchAlert.on('close.bs.alert', function () {
    noNewMatchAlert.hide();
    return false;
  })

  var needLoginAlert = $("#needLoginAlert");
  needLoginAlert.on('close.bs.alert', function () {
    needLoginAlert.hide();
    return false;
  })

  var autoMatching = $("#autoMatching");

  // Initial the mode check
  $cookies.isSyncMode = false;

  // If the login info is contained in the url, then retrieve the login data
  var urlData = $location.search();
  if (urlData['playerId'] != undefined && urlData['accessSignature'] != undefined) {
    $cookies.playerId = urlData['playerId'];
    $cookies.accessSignature = urlData['accessSignature'];
    $rootScope.refreshDisplayId();
  }

  // Get the game name from the server
  var getGameName = function () {
    GetGameInfoService.get({gameId: $routeParams.gameId}).
        $promise.then(function (data) {
          if (data['error'] == 'WRONG_GAME_ID') {
            alert('Sorry, Wrong Game ID provided!');
          } else {
            $scope.gameName = data['gameName'];
            $scope.gameDescription = data['description'];
          }
        }
    );
  };
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
            console.log(data)
            $scope.allMatches = data['currentGames'];
          }
        }
    );
  };
  getMatchesInfo();


	//Get FB info
//	var getFBInfo = function () {
//		if ($cookies.accessToken != undefined || $cookies.accessToken != '') {
//			GetPicFromFBService.get({access_token: $cookies.accessToken}).
//					$promise.then(function (data) {
//						console.log(data);
//						$scope.imageUrl = data['data']['url'];
//
//					}
//			);
//		}
//	}
//	getFBInfo();

  /**
   * Check if the player has login, if not, pop up the login page for him/her
   */
  var popupLoginPage = function () {
    // Show the modal to alert the player
    needLoginAlert.modal('show');

    // A simple count down for login page pop up
    $scope.timer = 3;
    $scope.countDown = function () {
      $scope.timer--;
      if ($scope.timer !== 0) {
        myTimer = $timeout($scope.countDown, 1000);
      } else {
        needLoginAlert.modal('hide');
        $("#login").modal('show');
      }
    }

    var myTimer = $timeout($scope.countDown, 1000);
  }

  //If the player is not login yet, a popup will alert him/her to login first
  if ($cookies.playerId === "Guest" || $cookies.accessSignature === null) {
    popupLoginPage();
  }

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
    console.log(data);
    var jsonData = angular.toJson(data);
    InsertMatchService.save({}, jsonData).
        $promise.then(function (data) {
          console.log("From insertMatch.............................");
          console.log(data);
          /*
           {@code data} contains following data:
           matchId:
           playerIds: should be an array, and we can store this into the $cookies and
           delete it after all players exit the match.
           */
          if (!data['matchId']) {
            if (data['error'] === 'WRONG_PLAYER_ID') {
              $scope.friendIdHasError = true;
              $scope.inviteInfo = {};
              $scope.inviteInfo.error = 'Sorry, your friend\'s ID does not exist. Please try again.';
              alert('Sorry, please provide the correct player id!');
              inviteAlert.show();
            } else if (data['error'] === 'WRONG_GAME_ID') {
              alert('Sorry, the game\'s ID does not exist. Please try again.');
            }
          } else {
            console.log("insertMatch");
            $("#autoMatching").hide();
            // Store the playerIds and matchId in the cookies
            $rootScope.playerIds = data['playerIds'];
            console.log($rootScope.playerIds);
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
   * Close the channel in order to cancel the auto match
   */
  $scope.cancel = function () {
    $("#autoMatching").hide();
    $cookies.timeOfEachTurn = '';
    $rootScope.socket.close();
  }

  /**
   * Try to retrieve the match info if there is one for the player
   */
  $scope.checkHasNewMatch = function () {
    NewMatchService.get({playerId: $cookies.playerId, accessSignature: $cookies.accessSignature}).
        $promise.then(function (data) {
          console.log("Getting new match info.......................");
          console.log(data);
          /*
           {@code data} contains following data if there's a match:
           matchId:
           playerIds: should be an array, and we can store this into the $cookies and
           delete it after all players exit the match.
           */
          if (!data['matchId']) {
            if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
              alert('Sorry, your ID does not exist. Please try again.');
              inviteAlert.show();
            } else if (data['error'] === 'WRONG_PLAYER_ID') {
              popupLoginPage();
            } else if (data['error'] === 'NO_MATCH_FOUND') {
              noNewMatchAlert.show();
            }
          } else {
            autoMatching.hide();
            // Initial the time of each turn
            $cookies.timeOfEachTurn = "";
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
   * Start a auto match by using channel API
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

    inviteAlert.hide();
    noNewMatchAlert.hide();

    // functions for the socket
    var onopen = function () {
      console.log("channel opened...");
    };
    var onerror = function () {
    };
    var onclose = function () {
      console.log("channel closed...");
    };
    var onmessage = function (event) {
      autoMatching.show();

      // Sync mode is choosed
      $cookies.isSyncMode = true;

      // Receive the data from the channel
      var data = angular.fromJson(event.data);

      if (data['matchId']) {
        $rootScope.playerIds = data['playerIds'];
        // Jump to the game page to start playing :
        $location.url($routeParams.gameId + '/match/' + data['matchId']);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    }

    /**
     * Once open the page, post data to the server in order
     * to join the queue for auto match.
     */
    joinQueueService.save({}, jsonJoinQueueData).
        $promise.then(function (data) {
          if (!data['channelToken']) {
            if (data['error'] === 'WRONG_PLAYER_ID') {
              popupLoginPage();
            } else if (data['error'] === 'WRONG_GAME_ID') {
              alert('Sorry, the game\'s ID does not exist. Please try again.');
            } else if (data['error'] === 'MISSING_INFO') {
              alert("Missing info:" + jsonJoinQueueData);
            }
          } else {
            $("#autoMatching").hide();
            $cookies.timeOfEachTurn = 60;
            $rootScope.channel = new goog.appengine.Channel(data['channelToken']);
            $rootScope.socket = $rootScope.channel.open();
            $rootScope.socket.onopen = onopen;
            $rootScope.socket.onerror = onerror;
            $rootScope.socket.onclose = onclose;
            $rootScope.socket.onmessage = onmessage;
            if (data['playerIds']) {
              $cookies.isSyncMode = true;
              insertMatch(data['playerIds']);
            }
          }
        }
    );
  } // End of autoMatch

  /**
   * Start a match by inviting a friend
   */
  $scope.invite = function (inviteInfo) {

    // Retrieve the friend's Id
    var friendId = inviteInfo.friendId;
    $cookies.timeOfEachTurn = inviteInfo.timeOfEachTurn;

    // Async mode is chose
    $cookies.isSyncMode = false;

    // Initiate the alert
    $scope.friendIdHasError = false;

    // Cancel the auto match
    if ($rootScope.socket) {
      $scope.cancel();
      autoMatching.hide();
    }

    $rootScope.playerIds = [$cookies.playerId, friendId];

    insertMatch($rootScope.playerIds);
  }
});