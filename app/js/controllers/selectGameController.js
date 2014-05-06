'use strict';

smgContainer.controller('SelectGameController',
    function ($scope, $cookies, $location, $rootScope) {
      // If the login info is contained in the url, then retrieve the login data
      var urlData = $location.search();
      if (urlData['playerId'] != undefined && urlData['accessSignature'] != undefined) {
        $cookies.playerId = urlData['playerId'];
        $cookies.accessSignature = urlData['accessSignature'];

	      //TODO: Delete in formal version
//        $rootScope.refreshUserDisplay();
      }
    }
);