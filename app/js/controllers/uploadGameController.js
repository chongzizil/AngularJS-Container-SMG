'use strict';

smgContainer.controller('UploadGameController',
		function ($scope, $rootScope, $location, UploadGameService) {
			$scope.upload = function(gameInfo) {
				/*
				gameInfo.accessSignature = '907dfe373b69161f65352546b9933e0f';
				gameInfo.gameName = 'TicTacToe';
				gameInfo.description = 'None';
				gameInfo.url = 'http://chongzizil.github.io/';
				gameInfo.height = '500';
				gameInfo.width = '500';
				*/

				var gameInfo1 = {
					gameName: 'TicTacToe',
					url: 'http://chongzizil.github.io/',
					description: 'None',
					width: '500',
					height: '500',
					pic: '{"icon" : "www.google.com" , "screenshots" : ["www.test1.com","www.test2.com"]}',
					developerId: '6248215343005696',
					accessSignature: '907dfe373b69161f65352546b9933e0f'
				}


				var jsonGameInfo = angular.toJson(gameInfo1);
				console.log(gameInfo1);
				console.log(jsonGameInfo);

				UploadGameService.save({}, jsonGameInfo).$promise.then(function(data) {
							console.log(data);
						}
				);

				/*var result = PlayerService.save({}, player);*/

				//$rootScope.playerId = result['playerId'];
				//console.log(result);

				//$location.url('/');
			};

		});