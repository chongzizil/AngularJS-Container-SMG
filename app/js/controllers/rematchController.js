/**
 * Created by yuanyiyang on 4/12/14.
 */

smgContainer.controller('rematchCtrl', function($scope, $modalInstance){
$scope.cancel = function(){
  $modalInstance.dismiss('cancel');
}
})