'use strict';

smgContainer.controller('LogoutController',
    function ($scope, $rootScope, $location, $cookies) {

      $cookies.accessSignature = null;
      $cookies.playerId = "Guest";
      $cookies.developerId = "Guest";
      $rootScope.refreshUserDisplay();
      $location.url('/');
    });