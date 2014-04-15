'use strict';

smgContainer.controller('MenuController',
    function ($scope, $cookies, $rootScope, $location, GetTokenFromFBService) {

	    var absUrl = $location.absUrl();
	    var begIndex = '';
	    var endIndex = '';
	    var isFBLogin = false;
	    for (var i = 1; i < absUrl.length; i++) {
		    if(absUrl[i] === '=' && i > 4 && absUrl.slice(i-4, i) === 'code') {
					console.log("111: " + i);
			    begIndex = i;
			    isFBLogin = true;
		    }
		    if(absUrl[i] === '#') {
			    console.log("222: " + i);
			    endIndex = i;
		    }
	    }

	    if (isFBLogin === true) {
		    var code = absUrl.slice(begIndex + 1, endIndex);
		    console.log(code);
		    GetTokenFromFBService.get({code: code}).
				    $promise.then(function (data) {
					    console.log(data);
					    console.log(typeof data);
					    var s = '';
					    for (var i in data) {
						    s = s + data[i];
					    }
					    console.log(s);

					    var begIndex = '';
					    var endIndex = '';
					    for (var i = 1; i < s.length; i++) {
						    if(absUrl[i] === '=' && i > 5 && absUrl.slice(i-5, i) === 'token') {
							    console.log("333: " + i);
							    begIndex = i;
							    isFBLogin = true;
						    }
						    if(absUrl[i] === '&') {
							    console.log("444: " + i);
							    endIndex = i;
						    }
					    }

							$cookies.accessToken = s.splice(begIndex + 1, endIndex);
					    console.log($cookies.accessToken);
				    }
		    );
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