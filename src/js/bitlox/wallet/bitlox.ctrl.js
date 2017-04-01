(function(window, angular) {
  'use strict';

  angular.module('app.core')
      .controller('BitLoxCtrl', BitLoxCtrl);

  BitLoxCtrl.$inject = ['$scope', 'hidchrome', 'hidweb', 'bleapi', 'platformInfo'];

  function BitLoxCtrl($scope, hidchrome, hidweb, bleapi, platformInfo) {

    var api = hidweb;
    if (platformInfo.isChromeApp) {
      api = hidchrome
    }
    else if(platformInfo.isMobile) {
      api = bleapi
    }

    $scope.api = api;

    $scope.bitlox = {
      isMobile: platformInfo.isMobile,
      connectAttempted: false,
      connected: false,
      statusString: "No Bitlox",
      alertClass: "danger"
    }

    $scope.wallet = {
      status: null,
      alertClass: "warning"
    };
    $scope.refreshBitlox = function($event) {
      if($event) $event.stopPropagation();

      if(platformInfo.isMobile) {
        api.startScanNew();
        setTimeout(function() {
          api.stopScan();
        },5000)
      }
    }
    $scope.connectBle = function(address, $event) {
      if($event) {
        console.log(JSON.stringify($event))
        $event.stopPropagation();
      }
      console.log('connecting to '+address)
      api.connect(address)
    }
    if($scope.bitlox.isMobile) {
      api.initialize();
    }

    $scope.$watch('api.getBleReady()', function(newVal) {
      if(newVal) {
        $scope.refreshBitlox()
      }
    });

    $scope.$watch('api.getStatus()', function(hidstatus) {
      console.warn("New device status: " + hidstatus)
      switch(hidstatus) {
      case api.STATUS_CONNECTED:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.connected = true;
          $scope.bitlox.statusString = "Bitlox connected";
          $scope.bitlox.alertClass = "success";
          $scope.bitlox.glyph = "glyphicon-ok";
          break;
      case api.STATUS_CONNECTING:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.statusString = "Bitlox connecting";
          $scope.bitlox.alertClass = "success";
          $scope.bitlox.glyph = "glyphicon-refresh";
          break;
      case api.STATUS_DISCONNECTED:
          $scope.bitlox.connected = false;
          $scope.bitlox.statusString = "Bitlox disconnected!";
          $scope.bitlox.alertClass = "danger";
          $scope.bitlox.glyph = "glyphicon-remove";
          break;
      case api.STATUS_WRITING:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.connected = true;
          $scope.bitlox.statusString = "Bitlox writing";
          $scope.bitlox.alertClass = "info";
          $scope.bitlox.glyph = "glyphicon-upload";
          break;
      case api.STATUS_READING:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.connected = true;
          $scope.bitlox.statusString = "Bitlox reading";
          $scope.bitlox.alertClass = "info";
          $scope.bitlox.glyph = "glyphicon-download";
          break;
      default:
          $scope.bitlox.connected = false;
          $scope.bitlox.statusString = null;
      }
    });


  }
})(window, window.angular);
