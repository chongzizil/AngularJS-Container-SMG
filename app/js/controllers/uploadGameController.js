'use strict';

smgContainer.controller('UploadGameController',
		function ($scope, $rootScope, $location, UploadGameService) {
			$scope.upload = function(gameInfo) {
				gameInfo.gameName = 'TicTacToe';
				gameInfo.description = 'None';
				gameInfo.url = '';
				gameInfo.height = '500px';
				gameInfo.width = '500px';
				console.log(gameInfo);
				UploadGameService.save({}, gameInfo);
				/*var result = PlayerService.save({}, player);*/

				//$rootScope.playerId = result['playerId'];
				//console.log(result);

				//$location.url('/');
			};

		});