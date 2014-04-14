/**
 * Created by yuanyiyang on 4/12/14.
 */

smgContainer.controller('rematchCtrl', function ($scope, $modalInstance) {

  $scope.PostFB = function(){
    $modalInstance.close('PostFB');
  };

  $scope.rematch = function(){
    $modalInstance.close('Rematch');
  };

  $scope.newMatch = function(){
    $modalInstance.close('NewMatch');
  };


  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


})