'use strict';

smgContainer.controller('MenuController',
    function ($scope, $cookies, $rootScope) {
	    if (angular.isDefined($cookies.playerImageUrl)) {
		    $scope.playerImageUrl = $cookies.playerImageUrl;
	    } else {
		    $scope.playerImageUrl = "/img/giraffe.gif";
	    }


	    $scope.getToken = function () {
		    $cookies.FBAccessToken = $scope.accessToken;
		    console.log($cookies.FBAccessToken);
	    };

      $rootScope.refreshDisplayId = function () {
        $scope.idDisplay = 'Guest';
        if ($cookies.playerId !== undefined) {
          $scope.idDisplay = $cookies.playerId;
          $scope.accessSignature = $cookies.accessSignature;
        } else if ($cookies.developerId !== undefined) {
          $scope.idDisplay = $cookies.developerId;
          $scope.accessSignature = $cookies.accessSignature;
        }
      };

      $rootScope.refreshDisplayId();
    }
);