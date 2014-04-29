//'use strict';

/**
 * A typical procedure for Mobile Version Match Controller contains:
 * (1). After the player chooses the game, container will ask for state from the server. If the state is empty, which
 *      means that it's a new match, container will send initial signal to the game. Otherwise, it will update UI
 *      based on the state.
 * (2). Wait for game to send operations
 * (3). Wrap the operations and send it the server
 * (4). Container will temporarily store the state from the server. This is only used to help the container determine
 *      whether the match is a new match or not. Since we don't verify last move, each time container updates UI, it
 *      uses the state from the server.
 */

smgContainer.controller('MatchController',
    function ($scope, $route, $routeParams, $rootScope, $cookies, $timeout, $q, $sce, $window, $location, $modal, NewMatchStateService, GetGameInfoService, GetPlayerInfoService, SendMakeMoveService, PostMessageToFBService, NewMatchService, GetPicFromFBService) {

	    /******************************* Initial game container *******************************/

	    /** Adjust the game container to the full size of the broswer. */
	    var adjustGameContainer = function () {
		    var mainContainerWidth = $("#mainContainer").width();
		    var windowHeight = $(window).height();
		    var gameContainer = $("#gameIFrame");
		    gameIFrame.css("width", mainContainerWidth + "px");
		    gameIFrame.css("height", windowHeight + "px");
	    };

	    /** Every time the broswer is resized, adjust the size of the game container too. */
	    $(window).resize(function() {
		    adjustGameContainer();
	    });

	    /*************************** End of initial game container ****************************/

	    /******************************* Variables: Server side *******************************/

	    var isFBLogin = false;
      $scope.playerImageUrl = '';
//      $scope.displayGetNewStateButton = false;
//      $scope.displayQuitButton = false;
      $scope.opponentInfos = [];
      $scope.gameInfo = {};
      $scope.matchInfo = {
        playerThatHasTurn: Number.MIN_VALUE,
        lastMovePlayerId: Number.MIN_VALUE,
        /*
         All players' information:
         (1). If this is the current player: email, firstname, lastname, nickname
         (2). If other players (opponents): firstname, nickname
         e.g.:
         {
           "playerId1" : {"email": "a@b.com", "firstname": "Long", "lastname": "Yang", "nickname": "Jason"},
           "playerId2" : {"firstname" : "Xiao", "nickname" : "Shawn"}
         }
         */
        playersInfo: [],
        /*
         All new match state will be saved here:
         (1). Asynchronous: get new game state.
         */
        state: {},
        /*
         All last moves will be saved here, array of operations:
         (1). Asynchronous: get new game state.
         */
        lastMove: [],
        /*
         Array of match states, will be used for save and load match.
         */
        history: [],
        /*
         The winner of the game. Each time loading a new game, it should be set to the default value
         */
        winner: Number.MIN_VALUE
      };

	    /*************************** End of Variables: Server side ****************************/

	    /******************************** Variables: Game Side ********************************/

      /*
       * Temporarily store the game state locally.
       * Initiated empty each time container loads the game
       */
      var state = {};
      var lastState = state;

      /**
       * hasGameEnded is initiated false when loading the game. And it will be set to true when there is an
       * endGame operation in the last move. And will be set to false again before container updates the game
       * result.
       * @type {boolean}
       */
      var hasGameEnded = true;

      /**
       * After the game is ended, matchResultInfo stores all necessary info.
       * @type {{winner: string, opponentId: string, hasWon: boolean, isStandAlone: boolean, isFBLogin: boolean}}
       */
      $scope.matchResultInfo = {
	      winner: '',
	      opponentId: '',
	      gameId: $routeParams.gameId,
	      hasWon: false,
	      isStandAlone: false,
        isFBLogin: isFBLogin
      };

	    /**************************** End of variables: Game Side *****************************/

      /**
       * Method used to retrieve Game Information, mainly the
       * {@code $scope.gameInfo.url}
       * {@code $scope.gameInfo.height}
       * {@code $scope.gameInfo.width}
       * {@code $scope.gameInfo.gameName}
       */
      var getGameInfo = function () {
	      GetGameInfoService.getGameInfo($routeParams.gameId)
			      .then(function (data) {
				      if (angular.isDefined(data)) {
//					      $scope.gameInfo.url = $sce.trustAsResourceUrl(data['url']);
//					      $scope.gameInfo.height = data['height'];
//					      $scope.gameInfo.width = data['width'];
//					      $scope.gameInfo.gameName = data['gameName'];
//					      if (data['width'] >= $(window).width() * 0.9) {
						    $scope.gameInfo.width = "100%";
//					      }
				      }
			      });
      };

      /*
       Auxiliary functions: isStateSame, isUndefinedOrNullOrEmpty,
       */

      /**
       * Method used to check whether the state is updated. Takes two object as parameters.
       * Convert this two object into JSON string and then check whether they are same or not.
       */
      var isStateSame = function (oldState, newState) {
        return angular.toJson(oldState) === angular.toJson(newState);
      };

      /**
       * Check whether the variable is undefined, null or empty string.
       * @param val
       * @returns {*|boolean}
       */
      var isUndefinedOrNullOrEmpty = function (val) {
        return angular.isUndefined(val) || val == null || val == '';
      };

	    /******************************** Functions: Game Side ********************************/

      /**
       * sendMessageToGame, showGameOverResult, replyGameReady, sendVerifyMoveToGame,
       * sendUpdateUIToGame, processLastMoveAndState, processLastPlayer
       */

      /**
       * Send UpdateUI/VerifyMove to game. If the two parameters are the same, it means that
       * the same player made the last move. So no need to verify and directly send the updateUI,
       * otherwise send the VerifyMove.
       * Id is a string.
       */
      var sendMessageToGame = function (IdOne, IdTwo) {
        if (IdOne === IdTwo) {
          sendUpdateUIToGame();
        } else {
	        // VerifyMove is currently deleted...
          //sendVerifyMoveToGame();
          sendUpdateUIToGame();
        }
        if (hasGameEnded) {
          hasGameEnded = false;
          showGameOverResult();
        }
      };

      /**
       * This function should be called when the game is over, which is
       * determined by the fact that there is a EndGame operation in the
       * lastMove sent by server.
       * This function updates the matchResultInfo.
       * Only support 2 player game for now...
       */
      var showGameOverResult = function () {
        if ($cookies.playerId == $scope.matchInfo.winner) {
	        $scope.matchResultInfo.winner = $cookies.playerId;
          $scope.matchResultInfo.hasWon = true;
        } else {
	        $scope.matchResultInfo.winner = $scope.matchInfo.winner;
	        $scope.matchResultInfo.hasWon = false;
        }

	      if ($cookies.playerId === $rootScope.playerIds[0]) {
		      $scope.matchResultInfo.opponentId = $rootScope.playerIds[1];
	      } else {
		      $scope.matchResultInfo.opponentId = $rootScope.playerIds[0];
	      }

	      $scope.matchResultInfo.isStandAlone = false;
	      $rootScope.matchResultInfo = $scope.matchResultInfo;

	      $location.url('/gameResult/' + $routeParams.matchId);
      };

      /**
       * Send the initial UpdateUI.
       * Currently it supports two players.
       */
      var replyGameReady = function () {
        var initialUpdateUI = {
          'type': 'UpdateUI',
          'yourPlayerId': $cookies.playerId,
          'playersInfo': [
            {'playerId': $rootScope.playerIds[0]},
            {'playerId': $rootScope.playerIds[1]}
          ],
          'state': {},
          'lastState': null,
          'lastMove': [],
          'lastMovePlayerId': null,
          'playerIdToNumberOfTokensInPot': {}
        };
//	      console.log("********** The container sent the initial UpdateUI...");
//	      console.log(angular.toJson(initialUpdateUI));
        sendMessageToIFrame(initialUpdateUI);
      };

	    /**
	     * Send the VerifyMove to the game.
	     * Currently deleted.
	     */
      /*var sendVerifyMoveToGame = function () {
        var verifyMove = {
          "type": "VerifyMove",
          'playersInfo': [
            {'playerId': $rootScope.playerIds[0]},
            {'playerId': $rootScope.playerIds[1]}
          ],
          'state': state,
          'lastState': lastState,
          'lastMove': $scope.matchInfo.lastMove,
          "lastMovePlayerId": $scope.matchInfo.lastMovePlayerId,
          "playerIdToNumberOfTokensInPot": {}
        };
        console.log("********** The container sent the VerifyMove UpdateUI...");
        console.log(angular.toJson(verifyMove));
        sendMessageToIFrame(verifyMove);
      };*/

	    /**
	     * Send the UpdateUI to the game.
	     * Currently deleted.
	     */
      var sendUpdateUIToGame = function () {
        var updateUI = {
          "type": "UpdateUI",
          'yourPlayerId': $cookies.playerId,
          'playersInfo': [
            {'playerId': $rootScope.playerIds[0]},
            {'playerId': $rootScope.playerIds[1]}
          ],
          'state': state,
          'lastState': lastState,
          'lastMove': $scope.matchInfo.lastMove,
          "lastMovePlayerId": $scope.matchInfo.lastMovePlayerId,
          "playerIdToNumberOfTokensInPot": {}
        };
		    console.log("********" + angular.toJson(updateUI));
//	      console.log("********** The container sent the UpdateUI...");
//	      console.log(angular.toJson(initialUpdateUI));
        sendMessageToIFrame(updateUI);
      };

      /**
       * This method updates the state in the container. If there is an EndGame
       * in the last move, change the hasGameEnded to true.
       */
      var processLastMoveAndState = function () {
        if (!isUndefinedOrNullOrEmpty($scope.matchInfo.lastMove)) {
          lastState = state;
          state = $scope.matchInfo.state;
          for (var operationMessage in $scope.matchInfo.lastMove) {
            var endGameOperation = $scope.matchInfo.lastMove[operationMessage];
            if (endGameOperation['type'] === 'EndGame') {
              var score = endGameOperation['playerIdToScore'];
              for (var playerId in score) {
                if (score[playerId] == '1') {
                  $scope.matchInfo.winner = playerId;
                }
              }
              hasGameEnded = true;
            }
          }
        } else {
//          console.log("Exception: The last move from the server is undefined!");
        }
      };


      /**
       * Update the lastPlayer and current Player based on message from the server
       * @param data the data received from server. It should contain lastMove and
       * playerThatHasLastTurn key.
       */
      var processLastPlayer = function (data) {
        if (!isUndefinedOrNullOrEmpty(data)) {
          $scope.matchInfo.lastMovePlayerId = data['playerThatHasLastTurn'];
          var localLastMove = data['lastMove'];
          for (var operationMessage in localLastMove) {
            var setTurnOperation = localLastMove[operationMessage];
            if (setTurnOperation['type'] === "SetTurn") {
              $scope.matchInfo.playerThatHasTurn = setTurnOperation['playerId'];
            }
          }
        } else {
//          console.log("Exception: The response data from the server is undefined!");
        }
      };

	    /**************************** End of functions: Game Side *****************************/

	    /****************************** Functions: "Server" Side ******************************/

      /**
       * sendMakeMoveServicePost(auxiliary method), called inside the sendMoveToServer method.
       * sendMoveToServer(fundamental method used to send operations to server)
       * getNewMatchState
       * $scope.endGame(reason, winner) 'oppo' stands for opponent and 'me' stands for the
       * current player
       */

      /**
       * Method used to call POST method inside {@code SendMakeMoveService}.
       */
      var sendMakeMoveServicePost = function (jsonMove) {
//        console.log("Log: input data for send make move to server: " + jsonMove);
//        console.log("Post Request: Make a move in the game.")
        SendMakeMoveService.save({matchId: $routeParams.matchId}, jsonMove).
            $promise.then(function (data) {
			        if (angular.isDefined(data['error'])) {
//				        console.log(console.log("********** Error from sendMakeMoveServicePost()..."));
//				        console.log(angular.toJson(data));
			        } else {
//                console.log("********** Response for making move to server: ");
//				        console.log(angular.toJson(data));
                $scope.matchInfo.state = data['state'];
                $scope.matchInfo.lastMove = data['lastMove'];
                processLastMoveAndState();
                processLastPlayer(data);
                sendMessageToGame($cookies.playerId, $scope.matchInfo.lastMovePlayerId);
              }
            }
        );
      };

      /**
       * Method used to send operation from Game to Server. Wrap the message
       * with gameOverReason.
       * @param operations operations got from Game.
       */
      var sendMoveToServer = function (operations) {
        // 1. Wrap up the operations as a move.
        var move;

        for (var operationMessage in operations) {
          var endGameOperation = operations[operationMessage];
          if (endGameOperation['type'] === 'EndGame') {
            hasGameEnded = 'true'
          }
        }

        if (hasGameEnded == true) {
          move = {
            "accessSignature": $cookies.accessSignature,
            "playerIds": $rootScope.playerIds,
            "operations": operations,
            "gameOverReason": "Over"
          };
        } else {
          move = {
            "accessSignature": $cookies.accessSignature,
            "playerIds": $rootScope.playerIds,
            "operations": operations
          };
        }

        var jsonMove = angular.toJson(move);
        sendMakeMoveServicePost(jsonMove);
      };

      /**
       * Method used to end current game in 3 situation:
       * 1. Game has a winner.
       * 2. One of the players quits.
       * 3. Time out.
       *
       * Add GameOver reason:
       * 'Over' stands for normal game over.
       * 'Quit' stands for one player quit.
       * 'Time Out' stands for time out
       */
      $scope.endGame = function (reason, passinWinner) {
        // 1. Make up the EndGame typed move.
        var move = {
          "accessSignature": $cookies.accessSignature,
          "playerIds": $rootScope.playerIds,
          "operations": [
            {
              "type": "EndGame",
              "playerIdToScore": {}
            }
          ],
          "gameOverReason": reason
        };

        /*
         * If one player pressed the "quit" button, he is considered to surrender,
         * and current implementation supports multiple players (>= 2).
         */
        var forkPlayerIds = $rootScope.playerIds.slice(0);
        var indexOfPlayerId = forkPlayerIds.indexOf($cookies.playerId);
        forkPlayerIds.splice(indexOfPlayerId, 1);
        if (passinWinner == 'oppo') {
          for (var index in forkPlayerIds) {
            move["operations"][0]['playerIdToScore'][forkPlayerIds[index]] = 1;
          }
          move["operations"][0]['playerIdToScore'][$cookies.playerId] = 0;
        } else if (passinWinner == 'me') {
          for (var index in forkPlayerIds) {
            move["operations"][0]['playerIdToScore'][forkPlayerIds[index]] = 0;
          }
          move["operations"][0]['playerIdToScore'][$cookies.playerId] = 1;
        }
        var jsonMove = angular.toJson(move);
        sendMakeMoveServicePost(jsonMove);
//	      console.log("********** Send the end game...");
      };

      /**
       * Method used to get new game state in asynchronous game mode.
       */
      $scope.getNewMatchState = function () {
	      NewMatchStateService.getNewMatchState($routeParams.matchId, $cookies.playerId,
			      $cookies.accessSignature)
			      .then(function (data) {
				      if (angular.isDefined(data)) {
					      // 1. Get game state and last move
					      $scope.matchInfo.state = data['state'];
					      $scope.matchInfo.lastMove = data['lastMove'];

					      // 2. UpdateUI for Game with the received state.

					      if (isStateSame($scope.matchInfo.state, {})) {
						      /*
						       * If the state is empty, then the game is not initialized, so reply
						       * the game ready sent by the game.
						       */
						      replyGameReady();
					      }
//					      console.log("!isStateSame(state,$scope.matchInfo.state) " + !isStateSame(state,$scope.matchInfo.state));
					      if (!isStateSame(state, $scope.matchInfo.state)) {
//						      console.log("********** Get new match state from server to change the local one...")
//						      console.log(angular.toJson($scope.matchInfo.state));
						      processLastMoveAndState();
						      processLastPlayer(data);
						      sendMessageToGame($cookies.playerId, $scope.matchInfo.lastMovePlayerId);
					      }
				      }
			      })
      };

      /**
       * Method used to get current user's information
       */
      var getCurrentPlayerInfo = function () {
        $scope.matchInfo.playersInfo = [];

	      GetPlayerInfoService.getPlayerInfo($cookies.playerId, $cookies.playerId,
			      $cookies.accessSignature)
			      .then(function (data) {
				      if (angular.isDefined(data)) {
					      $scope.matchInfo.playersInfo.push({playerId: $cookies.playerId, info: data});

					      getPlayerSelfImageUrl();
					      getAllOtherPlayersInfo($rootScope.playerIds);
				      }
			      });
      };

      /**
       * Method used to get User Image Url
       * @return User's Image Url
       */
      var getPlayerSelfImageUrl = function () {
	      //TODO: Check later
	      $scope.playerImageUrl = $scope.matchInfo.playersInfo[0].imageURL;
      };

      /**
       * Method used to get all the players' info except for current player's.
       * @param playerIds
       */
      var getAllOtherPlayersInfo = function (playerIds) {
//	      console.log("********** PlayerIds used to get all player info...");
//	      console.log(angular.toJson(playerIds));

	      var playerNum = 0;
	      var forkPlayerIds = playerIds.slice(0);
	      var index = forkPlayerIds.indexOf($cookies.playerId);
	      forkPlayerIds.splice(index, 1);
	      for (var index in forkPlayerIds) {
		      GetPlayerInfoService.getPlayerInfo($cookies.playerId, forkPlayerIds[index],
				      $cookies.accessSignature)
				      .then(function (data) {
					      if (angular.isDefined(data)) {
//						      console.log("********** Current playerId: " + $cookies.playerId);
//						      console.log("********** Get players info and Number is: " + forkPlayerIds[playerNum] + "...");
//						      console.log(angular.toJson(data));
						      $scope.matchInfo.playersInfo.push(
								      {
									      playerId: forkPlayerIds[playerNum],
									      info: data
								      }
						      );
						      playerNum = playerNum + 1;
//						      console.log("Log: inside getAllOtherPlayersInfo method, matchInfo: " + angular.toJson($scope.matchInfo));
					      }
				      });
	      }
      };

      /**
       * Method used to get playerIds from server
       */
      var getPlayerIds = function () {
	      NewMatchService.getMatchInfo($cookies.playerId, $cookies.accessSignature, $routeParams.gameId)
			      .then(function (data) {
				      if (angular.isDefined(data)) {
					      $rootScope.playerIds = data['playerIds'];
					      $cookies.matchId = data['matchId'];

					      getCurrentPlayerInfo();
					      initiatePlayerTurn();

					      if (!$scope.$$phase) {
						      $scope.$apply();
					      }
				      }
			      });
      };

	    /************************** End of Functions: "Server" Side ***************************/

	    /********************************** Functions: Filter *********************************/

      //Filter out all opponent players information.
      $scope.filterFnOpponents = function (playerInfo) {
        return playerInfo.playerId !== $cookies.playerId;
      };

	    //Filter out the player self information.
      $scope.filterFnCurrentPlayer = function (playerInfo) {
        return playerInfo.playerId === $cookies.playerId;
      };

	    //Filter out all players information except the current turn one.
	    $scope.filterFnCurrentTurnPlayer = function (playerInfo) {
		    return playerInfo.playerId === $scope.matchInfo.playerThatHasTurn;
	    };

	    /****************************** End of Functions: Filter ******************************/

	    /********************************** Functions: iFrame *********************************/
      /**
       * initiatePlayerTurn, $scope.sendMessageToIFrame, listener
       */

      var initiatePlayerTurn = function () {
        if (!isUndefinedOrNullOrEmpty($rootScope.playerIds)) {
          $scope.matchInfo.playerThatHasTurn = $rootScope.playerIds[0];
          $scope.matchInfo.lastMovePlayerId = $scope.matchInfo.playerThatHasTurn;
          $scope.matchInfo.winner = Number.MIN_VALUE;
          state = {};
          lastState = state;
          hasGameEnded = false;
        } else {
//          console.log("Exception from initiatePlayerTurn(): playerIds are null");
        }
      };

      var sendMessageToIFrame = function (message) {
        var win = $window.document.getElementById('gameIFrame').contentWindow;
        win.postMessage(message, "*");
      };

      function listener(event) {
        var data = event.data;
//        console.log("********** The container receives data from the game iFrame...");
//	      console.log(data['type']);
        if (data['type'] === "GameReady") {
          $scope.getNewMatchState();
        } else if (data['type'] === "MakeMove") {
          var operations = data['operations'];
//	        console.log("********** The container sends operations to the server...");
//	        console.log(angular.toJson(operations));
          sendMoveToServer(operations);
        } else if (data['type'] === "VerifyMoveDone") {
          // Deal with verifyMoveDone, currently deleted...
          if (isUndefinedOrNullOrEmpty(data['hackerPlayerId'])) {
	          // No hacker detected
            sendUpdateUIToGame();
          } else {
	          // Hacker detected
//            console.log("********** Hacker Detected!!! Hacker id is: " + data['hackerPlayerId']);
          }
        } else {
//          console.log("********** The container can't deal with the message from the game iFrame which Type is: " + data['type']);
        }
      }

	    /****************************** End of functions: iFrame ******************************/

	    /************************************* Start point ************************************/

      if (!$cookies.accessSignature || !$cookies.playerId) {
        alert('You have to log in first!');
        $location.url('/');
      } else {
	      // Adjust the size of the game container.
	      adjustGameContainer();

        if ($window.addEventListener) {
          addEventListener("message", listener, false);
        } else {
          attachEvent("onmessage", listener);
        }

        $scope.displayGetNewStateButton = true;

        // Check whether the player login with Facebook
        if ($cookies.FBAccessToken == "undefined" || isUndefinedOrNullOrEmpty($cookies.FBAccessToken)) {
          $scope.isFBLogin = false;
        } else {
          $scope.isFBLogin = true;
        }
	      $scope.matchResultInfo.isFBLogin = $scope.isFBLogin;

        // 1. Get game information.
        getGameInfo();
        // 2. Get playerIds from server: this is used for case when user refresh the web browser.
        getPlayerIds();
      }

	    /************************************* End point ************************************/
    }
);