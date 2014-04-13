//'use strict';

/**
 * Match Controller contains two parts:
 * 1. Container interacts with Server side:
 *  (1). In asynchronous mode, get new state and last move from Server.
 *  (2). In synchronous mode, receive channel API pushed new state and last move.
 *  (3). Send new moves to Server.
 * 2. Container interacts with Game side:
 *  (1). Get operations made by players
 *  (2). Send new state to Game for updateUI
 *  (3). Send new state, last state and last move to Game for verify move.
 *
 *  Match Controller contains two modes:
 *  1. Synchronous Mode: Player A presses "autoMatch" and wait for another player, player B also presses
 *  the "autoMatch", system pairs player A and B automatically, they communicate through channel API.
 *  2. Asynchronous Mode: Player A invite Player B with B's playerId, when B presses "check new game",
 *  player A and B pair, after that, they make moves and check new states manually.
 */

smgContainer.controller('MatchController',
    function ($scope, $route, $routeParams, $rootScope, $cookies, $sce, $window, $location, $modal, NewMatchStateService, GetGameInfoService, GetPlayerInfoService, SendMakeMoveService) {
      /*
       * Variables for interacting with Server side.
       */
      $scope.gameInfo = {};
      $scope.displayGetNewStateButton = false;
      $scope.displayEndGameButton = false;
      $scope.playerId = $cookies.playerId;
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
        playersInfo: {},
        /*
         All new match state will be saved here:
         (1). Synchronous: from channel API and response from make move.
         (2). Asynchronous: get new game state.
         */
        state: {},
        /*
         All last moves will be saved here, array of operations:
         (1). Synchronous: from channel API and response from make move.
         (2). Asynchronous: get new game state.
         */
        lastMove: [],
        /*
         Array of match states, will be used for save and load match.
         */
        history: [],
        /*
        The winner of the game. If loading a new game, it should be set to the default value
         */
        winner : Number.MIN_VALUE
      };

      /*
       * Variables for interacting with Game side. Temporarily store the game state locally.
       * Initiated empty every time container loads the game
       */
      var state = {};
      var lastState = state;
      var endGameFlag = undefined;

      /**
       * Method used to retrieve Game Information, mainly the
       * {@code $scope.gameInfo.url}
       * {@code $scope.gameInfo.height}
       * {@code $scope.gameInfo.width}
       */
      var getGameInfo = function () {
        GetGameInfoService.get({gameId: $routeParams.gameId}).
            $promise.then(function (data) {
              if (data['error'] == 'WRONG_GAME_ID') {
                alert('Sorry, Wrong Game ID provided!');
              } else {
                //console.log("Log: get game info from server: " + angular.toJson(data));
                // 1. Get game information, all the .
                $scope.gameInfo.url = $sce.trustAsResourceUrl(data['url']);
                $scope.gameInfo.height = data['height'];
                $scope.gameInfo.width = data['width'];
                $scope.gameInfo.gameName = data['gameName'];
                /** *************************************************/
//	              var margin = 20;
                if (data['width'] >= $(window).width()) {
                  $scope.gameInfo.width = "90%";
                }
//	              console.log("********************** The windows height is: " + $(window).height());
//	              console.log("********************** The windows width is: " + $(window).width());
//	              console.log("********************** The height is: " + $scope.gameInfo.height);
//	              console.log("********************** The width is: " + $scope.gameInfo.width);
              }
            }
        );
      };

      /**
       * Method used to check whether the state is updated. Takes two object as parameters
       */
      var isStateSame = function (oldState, newState) {
        return angular.toJson(oldState) === angular.toJson(newState);
      }

      /**
       * Method send UpdateUI/VerifyMove to game. If the two parameters are the same, which means that
       * it's the same player who mode the last move. No need to verify, so it sends the updateUI,
       * otherwise send the VerifyMove. Id is a string.
       */
      var sendMessageToGame = function (IdOne, IdTwo) {
        if (IdOne === IdTwo) {
          sendUpdateUIToGame();
        } else {
          //sendVerifyMoveToGame();
          sendUpdateUIToGame();
        }
      }

      /**
       * Method used to call POST method inside {@code SendMakeMoveService}.
       */
      var sendMakeMoveServicePost = function (jsonMove) {
        console.log("Log: input data for send make move to server: " + jsonMove);
        //console.log("Post Request: Make a move in the game.")
        SendMakeMoveService.save({matchId: $routeParams.matchId}, jsonMove).
            $promise.then(function (data) {
              if (data['error'] == "WRONG_ACCESS_SIGNATURE") {
                alert('Sorry, Wrong Access Signature received!');
              } else if (data['error'] == 'WRONG_PLAYER_ID') {
                alert('Sorry, Wrong Player ID received!');
              } else if (data['error'] == "JSON_PARSE_ERROR") {
                alert('Sorry, Wrong JSON Format received!');
              } else if (data['error'] == "MISSING_INFO") {
                alert('Sorry, Incomplete JSON data received!');
              } else {
                console.log("Log: response for making move to server: " + angular.toJson(data));
                //console.log("Server responds a move with new state and lastMove.")
                $scope.matchInfo.state = data['state'];
                $scope.matchInfo.lastMove = data['lastMove'];
                processLastMoveAndState();
                processLastPlayer(data);
                sendMessageToGame($scope.playerId, $scope.matchInfo.lastMovePlayerId);
              }
            }
        );
      }

      /**
       * Method used to send operation from Game to Server, of cause data will be wrapped before sending.
       * @param operations operations got from Game.
       */
      var sendMoveToServer = function (operations) {
        // 1. Wrap up the operations as a move.
        var move;
        for (var operationMessage in operations) {
          var endGameOperation = operations[operationMessage];
          if (endGameOperation['type'] === 'EndGame') {
            endGameFlag = 'true'
          }
        }
        if (endGameFlag === 'true') {
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
       * Method used to end current game in two situation:
       * 1. Game has a winner.
       * 2. One of the players surrenders.
       *
       * Add GameOver reason. 'p' stands for quit and 'Time Out' stands for time out
       */
      $scope.endGame = function (reason) {
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
         1.1 If one player is pressing the "End Game" button, he is considered to surrender,
         and current implementation supports multiple players (>= 2).
         */
        var forkPlayerIds = $rootScope.playerIds.slice(0);
        var index = forkPlayerIds.indexOf($cookies.playerId);
        forkPlayerIds.splice(index, 1);
        for (var index in forkPlayerIds) {
          move["operations"][0]['playerIdToScore'][forkPlayerIds[index]] = 1;
        }
        move["operations"][0]['playerIdToScore'][$cookies.playerId] = 0;
        var jsonMove = angular.toJson(move);
        sendMakeMoveServicePost(jsonMove);
        // 2. If in synchronous mode, also close the channel API.
        if ($cookies.isSyncMode === 'true') {
          $rootScope.socket.close();
        }
        //$location.url('/');
      };

      /**
       * Method used to override the onmessage method on channel API's socket
       */
      var overrideOnMessage = function () {
        $rootScope.socket.onmessage = function (event) {
          // 1. Get pushed data from channel API and parse it from JSON to object
          var data = angular.fromJson(event.data);
          console.log("Log: data pushed by channel API: " + angular.toJson(data));
          //console.log("Log: data pushed by channel API:")
          $scope.matchInfo.state = data['state'];
          $scope.matchInfo.lastMove = data['lastMove'];
          // 2. UpdateUI for Game with the received state.
          processLastMoveAndState();
          processLastPlayer(data);
          sendMessageToGame($scope.playerId, $scope.matchInfo.lastMovePlayerId);
        };
      }

      /**
       * Method used to get new game state in asynchronous game mode.
       */
      $scope.getNewMatchState = function () {
        NewMatchStateService.get({matchId: $routeParams.matchId, playerId: $cookies.playerId,
          accessSignature: $cookies.accessSignature})
            .$promise.then(function (data) {
              if (data['error'] === 'WRONG_ACCESS_SIGNATURE') {
                alert('Sorry, wrong access signature provided!');
              } else if (data['error'] === 'WRONG_PLAYER_ID') {
                alert('Sorry, wrong player ID provided!');
              } else if (data['error'] === 'WRONG_MATCH_ID') {
                alert('Sorry, wrong match ID provided!');
              } else {
                console.log("Log: get new match state (async mode): " + angular.toJson(data));
                //console.log("Log: the match info for this game: " + angular.toJson($scope.matchInfo));
                //console.log("Log: get new match state (async mode): ");
                // 1. Get state and last move
                $scope.matchInfo.state = data['state'];
                $scope.matchInfo.lastMove = data['lastMove'];
                // 2. UpdateUI for Game with the received state.
                if (isStateSame($scope.matchInfo.state, {})) {
                  replyGameReady();
                }
                //console.log("!isStateSame(state,$scope.matchInfo.state) " + !isStateSame(state,$scope.matchInfo.state));
                if (!isStateSame(state, $scope.matchInfo.state)) {
                  console.log("Log: Get new match state from server(changing local state)!")
                  console.log("Log: New State is " + angular.toJson($scope.matchInfo.state));
                  processLastMoveAndState();
                  processLastPlayer(data);
                  sendMessageToGame($scope.playerId, $scope.matchInfo.lastMovePlayerId);
                }
              }
            }
        );
      }

      /**
       * Method used to get all the players' info.
       * @param playerIds
       */
      var getAllPlayersInfo = function (playerIds) {
        $scope.matchInfo.playersInfo = {};
        var playerNum = 0;
        for (var index in playerIds) {
          GetPlayerInfoService.get({playerId: $cookies.playerId,
            targetId: playerIds[index], accessSignature: $cookies.accessSignature}).
              $promise.then(function (data) {
                if (data['error'] == "WRONG_PLAYER_ID") {
                  alert("Sorry, Wrong Player ID provided!");
                } else if (data['error'] == 'WRONG_ACCESS_SIGNATURE') {
                  alert('Sorry, Wrong Access Signature provided!');
                } else if (data['error'] == 'WRONG_TARGET_ID') {
                  alert('Sorry, Wrong Target ID provided!');
                } else {
                  //console.log("Log: get players info: " + angular.toJson(data));
                  $scope.matchInfo.playersInfo[playerIds[playerNum]] = data;
                  playerNum = playerNum + 1;
                  //console.log("Log: inside getAllPlayersInfo method, matchInfo: " + angular.toJson($scope.matchInfo));
                }
              }
          );
        }
      };

      /**
       * Method used to get all opponents' information
       */
      $scope.getOpponentsInfo = function () {
        var forkPlayerIds = $rootScope.playerIds.slice(0);
        var currentPlayerIndex = forkPlayerIds.indexOf($cookies.playerId);
        var opponentsInfo = [];

        forkPlayerIds.splice(currentPlayerIndex, 1);
        for (var index in forkPlayerIds) {
          var opponentPlayerId = forkPlayerIds[index];
          opponentsInfo.push($scope.matchInfo.playersInfo[opponentPlayerId]);
        }
        return opponentsInfo;
      }

      function isUndefinedOrNull(val) {
        return angular.isUndefined(val) || val == null;
      }

      /**
       * This function should be called to update state and lastMoveplayerId after fetch
       */
      function processLastMoveAndState() {
        if (!isUndefinedOrNull($scope.matchInfo.lastMove)) {
          //console.log("Here we change the state/laststate and lastPlayerId" );
          lastState = state;
          //console.log("VerifyMove: lastState " + angular.toJson(lastState));
          state = $scope.matchInfo.state;
          //console.log("VerifyMove: state " + angular.toJson(state));
          for(var operationMessage in $scope.matchInfo.lastMove){
            var endGameOperation = $scope.matchInfo.lastMove[operationMessage];
            if(endGameOperation['type'] === 'EndGame'){
              var score = endGameOperation['playerIdToScore'];
              for(var playerId in score){
                if(score[playerId]=='1'){
                  $scope.matchInfo.winner = playerId;
                  //console.log("We have the winner: " + $scope.matchInfo.winner)
                }
              }
            }
          }
        } else {
          console.log("Exception: From the server the last move is undefined!");
        }
      }

      function processLastPlayer(data) {
        if (!isUndefinedOrNull(data)) {
          $scope.matchInfo.lastMovePlayerId = data['playerThatHasLastTurn'];
          for (var operationMessage in $scope.matchInfo.lastMove) {
            var setTurnOperation = $scope.matchInfo.lastMove[operationMessage];
            if (setTurnOperation['type'] === "SetTurn") {
              $scope.matchInfo.playerThatHasTurn = setTurnOperation['playerId'];
              if ($scope.matchInfo.playerThatHasTurn == $cookies.playerId) {
                $scope.displayEndGameButton = true;
              } else {
                $scope.displayEndGameButton = false;
              }
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            }
          }
        } else {
          console.log("Exception: From the server the response data is undefined!");
        }
      }

      $scope.sendMessageToIframe = function (message) {
        var win = $window.document.getElementById('gameIFrame').contentWindow;
        win.postMessage(message, "*");
      };

      function listener(event) {
        var data = event.data;
        console.log("In the container, it receives the data from the game Iframe " + data['type']);
        /*
         if (!data['type']) {
         console.log("The undefined data is " + angular.toJson(data));
         }
         */
        if (data['type'] === "GameReady") {
          //replyGameReady();
          $scope.getNewMatchState();
        } else if (data['type'] === "MakeMove") {
          var operations = data['operations'];
          //console.log("In the container, it sends to the server, operations are " + angular.toJson(operations));
          sendMoveToServer(operations);
        } else if (data['type'] === "VerifyMoveDone") {
          //deal with verifyMoveDone
          //no hacker detected
          if (isUndefinedOrNull(data['hackerPlayerId'])) {
            sendUpdateUIToGame();
          } else {
            console.log("Hacker Detected!!! " + data['hackerPlayerId']);
          }
        } else {
//          console.log("In the container listener, can't deal with the message from the game!!");
//          console.log("It is " + data['type']);
        }
      }


      function replyGameReady() {
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
        //console.log("in the container, it sends the initial UpdateUI is " + angular.toJson(initialUpdateUI));
        console.log("in the container, it sends the initial UpdateUI");
        $scope.sendMessageToIframe(initialUpdateUI);
      }

      function sendVerifyMoveToGame() {

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
        //console.log("In the container, it sends the following VerifyMove to the game: " + angular.toJson(verifyMove));
        console.log("In the container, it sends the following VerifyMove to the game: ");
        $scope.sendMessageToIframe(verifyMove);
      }


      function sendUpdateUIToGame() {
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
        console.log("In the container, it sends the following UpdateUI to the game: " + angular.toJson(updateUI));
        //console.log("In the container, it sends the following UpdateUI");
        $scope.sendMessageToIframe(updateUI);
      }

      function initiatePlayerTurn() {
        if (!isUndefinedOrNull($rootScope.playerIds)) {
          $scope.matchInfo.playerThatHasTurn = $rootScope.playerIds[0];
          $scope.matchInfo.lastMovePlayerId = $scope.matchInfo.playerThatHasTurn;
          $scope.matchInfo.winner = Number.MIN_VALUE;
          state = {};
          lastState = state;
          endGameFlag = undefined;
        } else {
          console.log("Exception: playerIds are null");
        }
      }

      $scope.open = function(){
        showGameOverResult();
      }
      /**
       * This function should be called when the game is over, which is determined by the fact that there is a
       * EndGame operation in the lastMove response by server
       */
      function showGameOverResult(){
          var resultModal = $modal.open({
            templateUrl: 'templates/directives/rematch.html',
            controller: 'rematchCtrl'
            });

        resultModal.result.then(function(){
          //A promise that is resolved when a modal is closed

        }, function(){
          //A promise that is resolved when a modal is dismissed

        });
      }

      /**
       * Formal code starts here.
       */
      if (!$cookies.accessSignature || !$cookies.playerId) {
        alert('You have to log in first!');
        $location.url('/');
      } else {
        if ($window.addEventListener) {
          addEventListener("message", listener, false);
        } else {
          attachEvent("onmessage", listener);
        }
        // Display different button based on different mode: synchronous and asynchronous.
        if ($cookies.isSyncMode === 'true') {
          // 0. Override the onmessage method on socket.
          overrideOnMessage();
          $scope.displayGetNewStateButton = false;
        } else {
          $scope.displayGetNewStateButton = true;
        }
        // Check whether need to display the "End Game" button
        if ($scope.matchInfo.playerThatHasTurn == $scope.playerId) {
          $scope.displayEndGameButton = true;
        } else {
          $scope.displayEndGameButton = false;
        }
        // 1. Get game information.
        getGameInfo();
        // 2. Update Game UI with new state.
        //$scope.getNewMatchState();
        // 3. Get players information.
        getAllPlayersInfo($rootScope.playerIds);
        // 4. Initiate lastMovePlayerId and playerThatHasTurn
        initiatePlayerTurn();
      }
    }
);