/**
 * Created by yuanyiyang on 4/14/14.
 */


smgContainer.controller('offLineCtrl', function ($scope, $modalInstance,$cookies,$rootScope) {

  $scope.offLineMessage = {
    message : 'Your Opponent has been offline.'
  };

  $scope.options = [
    'Click Continue to stay at the page! If you don\'t close the page, you will automatically receive the opponent\'s move',
    'Click Return to play in another mode. You can make the move at the time you want!',
    'Click Win to win the game! Not cool, man!',
    'Click Anywhere outside the popup you will still automatically receive opponent\' move!'
  ]

  $scope.inSyn = function(){
    $modalInstance.dismiss('Syn')
  }

  $scope.isASyn = function(){
    $modalInstance.dismiss('ASyn')
  }

  $scope.win = function(){
    $modalInstance.close('I win');
  }

})