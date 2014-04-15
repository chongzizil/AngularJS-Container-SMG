'use strict';

smgContainer.controller('MenuController',
    function ($scope, $cookies, $rootScope, $location) {

//	    // If the login info is contained in the url, then retrieve the login data
//	    var urlData = $location.search();
//	    if (urlData['code'] != undefined) {
//		    $cookies.code = urlData['code'];
//				console.log("Code received: " + $cookies.code);
//				var code = "AQAg61TQOYqtKKo-b4CoE7-ZxdkS7lGIyQJs_WS4JQix8ffRUltTc0byovrBMvfQCRGWOOjWPmKts9r95Kk0wVkgKryDGj-YPulkFIQN1sKhqJ85RMxy0XGKZOjm9giDdndYKybNcq-cUVLs7hErShfpu6SOYgKVeKjQMq0adXIufgS71o8itqD_GNCdNM0GHWSe_mRTJctcJYTGq1Oe3LBAvJo0mzemyq5wCkDK1Weat6fert8MokTCoqu_xq8brBKJOnSgj9dUdjah1jbAohENbJSnPAF4aj8-fW-Dr6QmGCFJHemZ-YifYtofmQN_n4E";
//		    GetTokenFromFBService.get({code: code}).
//				    $promise.then(function (data) {
//					    if (!data['access_token']) {
//						    alert(data);
//					    } else {
//						    $cookies.accessToken = data['access_token'];
//					    }
//				    }
//		    );
//	    }

      $rootScope.refreshDisplayId = function () {
        $scope.idDisplay = 'Guest';
        if ($cookies.playerId !== undefined) {
          $scope.idDisplay = $cookies.playerId;
          $scope.accessSignature = $cookies.accessSignature;
        } else if ($cookies.developerId !== undefined) {
          $scope.idDisplay = $cookies.developerId;
          $scope.accessSignature = $cookies.accessSignature;
        }
      }
      $rootScope.refreshDisplayId();
    }
);