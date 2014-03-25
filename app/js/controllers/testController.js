'use strict';

smgContainer.controller('TestController',
		function ($scope, $rootScope, $location, TestService, $http) {
			$scope.post = function(player) {
				$http.post("http://1.smg-server.appspot.com/players/:playerId", {}).success(function(result) {
					console.log(result);
					$scope.resultPost = result;
				}).error(function() {
							console.log("error");
						});
			};

			$scope.submitUrl = function(url) {
				var value = {
					longUrl: url
				};
				TestService.save({}, value).
						$promise.then(function(data) {
					console.log(data);
					console.log(data['id']);
					$scope.url.short = data['id'];
				});
				/*var result = PlayerService.save({}, player);*/

				//$rootScope.playerId = result['playerId'];
				//console.log(result);

				//$location.url('/');
			};

		});