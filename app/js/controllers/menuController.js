'use strict';

smgContainer.controller('MenuController',
    function ($scope, $cookies, $rootScope, $translate) {
	    $scope.getToken = function () {
		    $cookies.FBAccessToken = $scope.accessToken;
		    console.log($cookies.FBAccessToken);
	    };

      $rootScope.refreshUserDisplay = function () {
        $scope.idDisplay = 'Guest';
        if ($cookies.playerId !== undefined) {
          $scope.idDisplay = $cookies.playerEmail;
          $scope.accessSignature = $cookies.accessSignature;
        } else if ($cookies.developerId !== undefined) {
          $scope.idDisplay = $cookies.playerEmail;
          $scope.accessSignature = $cookies.accessSignature;
        }

	      if (angular.isDefined($cookies.playerImageUrl)) {
		      $scope.playerImageUrl = $cookies.playerImageUrl;
	      } else {
		      $scope.playerImageUrl = "img/giraffe.gif";
	      }
      };

	    $scope.changeLanguage = function (langKey) {
		    $translate.use(langKey);
	    };

      $rootScope.refreshUserDisplay();
    }
);