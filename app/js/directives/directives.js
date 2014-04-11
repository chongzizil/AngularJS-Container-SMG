'use strict';

/* Directives */

smgContainer.directive('playerLogin', function() {
	return {
		restrict: 'ACE',
		replace: false,
		controller: function ($scope, $rootScope, $location, $cookies, $route, PlayerService) {

					$scope.login = function(loginInfo) {

						var loginAlert = $("#loginAlert");
						loginAlert.on('close.bs.alert', function() {
							loginAlert.hide();
							return false;
						})

						PlayerService.get({playerId: loginInfo.playerId, password: loginInfo.password}).
								$promise.then(function(data) {
									if (!data['accessSignature']) {
										if (data['error'] === 'WRONG_PLAYER_ID') {
											$scope.idHasErrorr = true;
											$scope.loginInfo.error = 'Sorry, the player ID does not exist. Please try again.';
										} else if (data['error'] === 'WRONG_PASSWORD') {
											$scope.idHasError = false;
											$scope.passwordHasError = true;
											$scope.loginInfo.error = 'Sorry, the password is invalid. Please try again.';
										}

										loginAlert.show();
									} else {
										$cookies.playerId = loginInfo.playerId;
										$cookies.accessSignature = data['accessSignature'];
										$rootScope.refreshDisplayId();
										$('#login').modal('hide');
									}
								}
						);
					}
				},
		controllerAs: 'LoginController',
		templateUrl: 'templates/directives/login.html'
	};
});


smgContainer.directive('playerRegister', function() {
	return {
		restrict: 'ACE',
		replace: false,
		controller: function ($scope, $rootScope, $location, PlayerService) {
		$scope.submitRegister = function(registerInfo) {

			var registerSuccessAlert = $("#registerSuccessAlert");
			registerSuccessAlert.on('close.bs.alert', function() {
				registerSuccessAlert.hide();
				return false;
			})

			var registerFailedAlert = $("#registerFailedAlert");
			registerFailedAlert.on('close.bs.alert', function() {
				registerFailedAlert.hide();
				return false;
			})

			var player = {
				email: registerInfo.email,
				password: registerInfo.password
			};
			var jsonPlayer = angular.toJson(player);

			PlayerService.save({}, jsonPlayer).
					$promise.then(function(data) {
						if (!data['accessSignature']) {
							if (data['error'] === 'EMAIL_EXISTS') {
								$scope.emailHasError = true;
								$scope.registerInfo.error = 'Sorry, the email has already been registered. Please try a new one.';
							} else if (data['error'] === 'PASSWORD_TOO_SHORT') {
								$scope.emailHasError = false;
								$scope.passwordHasError = true;
								$scope.registerInfo.error = 'Sorry, the password must be at least 6 characters. Please try again.';
							}
							registerFailedAlert.show();
						} else {
							$scope.emailHasError = false;
							$scope.passwordHasError = false;
							$scope.registerInfo.playerId = data['playerId'];
							registerFailedAlert.hide();
							registerSuccessAlert.show();
						}
					}
			);
		};
	},
		controllerAs: 'RegisterController',
		templateUrl: 'templates/directives/register.html'
	};
});