'use strict';

smgContainer.controller('MenuController',
    function ($scope, $cookies, $rootScope, $location) {

//	    var absUrl = $location.absUrl();
//	    var begIndex = '';
//	    var endIndex = '';
//	    var isFBLogin = false;
//	    for (var i = 1; i < absUrl.length; i++) {
//		    if(absUrl[i] === '=' && i > 4 && absUrl.slice(i-4, i) === 'code') {
//					console.log("111: " + i);
//			    begIndex = i;
//			    isFBLogin = true;
//		    }
//		    if(absUrl[i] === '#') {
//			    console.log("222: " + i);
//			    endIndex = i;
//		    }
//	    }
//
//	    if (isFBLogin === true) {
//		    var code = absUrl.slice(begIndex + 1, endIndex);
//		    console.log(code);
//		    GetTokenFromFBService.get({code: code}).
//				    $promise.then(function (data) {
//	    var data = {0: "a", 1: "c", 2: "c", 3: "e", 4: "s", 5: "s", 6: "_", 7: "t", 8: "o", 9: "k", 10: "e", 11: "n", 12: "=", 13: "C", 14: "A", 15: "A", 16: "D", 17: "O", 18: "k", 19: "0", 20: "b", 21: "Z", 22: "A", 23: "L", 24: "Z", 25: "C", 26: "E", 27: "B", 28: "A", 29: "M", 30: "W", 31: "s", 32: "M", 33: "V", 34: "u", 35: "O", 36: "K", 37: "Z", 38: "A", 39: "o", 40: "P", 41: "n", 42: "B", 43: "d", 44: "Z", 45: "B", 46: "a", 47: "A", 48: "L", 49: "l", 50: "n", 51: "k", 52: "Q", 53: "g", 54: "r", 55: "l", 56: "7", 57: "g", 58: "8", 59: "7", 60: "P", 61: "s", 62: "f", 63: "F", 64: "j", 65: "G", 66: "R", 67: "d", 68: "r", 69: "n", 70: "s", 71: "o", 72: "9", 73: "v", 74: "J", 75: "1", 76: "M", 77: "5", 78: "D", 79: "x", 80: "l", 81: "Q", 82: "M", 83: "Z", 84: "B", 85: "L", 86: "5", 87: "t", 88: "7", 89: "2", 90: "y", 91: "2", 92: "o", 93: "w", 94: "N", 95: "E", 96: "Q", 97: "&", 98: "e", 99: "x"};
//					    console.log(data);
//					    console.log(typeof data);
//					    var s = '';
//					    for (var i in data) {
//						    s = s + data[i];
//					    }
//					    console.log(s);
//
//					    var begIndex = '';
//					    var endIndex = '';
//					    for (var i = 1; i < s.length; i++) {
//						    if(s[i] === '=' && i > 5 && s.slice(i-5, i) === 'token') {
//							    console.log("333: " + i);
//							    begIndex = i;
//							    isFBLogin = true;
//						    }
//						    if(s[i] === '&') {
//							    console.log("444: " + i);
//							    endIndex = i;
//							    break;
//						    }
//					    }
//
//							$cookies.accessToken = s.slice(begIndex + 1, endIndex);
//					    console.log($cookies.accessToken);
//				    }
//		    );
//	    }

	    $scope.getToken = function () {
		    $cookies.FBAccessToken = $scope.accessToken;
		    console.log($cookies.FBAccessToken);
	    }

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