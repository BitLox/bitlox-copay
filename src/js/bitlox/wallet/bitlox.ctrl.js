(function(window, angular) {
  'use strict';

  angular.module('app.core')
      .controller('BitLoxCtrl', BitLoxCtrl);

  BitLoxCtrl.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'gettextCatalog', '$ionicHistory', '$ionicLoading', 'popupService', 'bitloxHidChrome', 'bitloxHidWeb', 'bitloxBleApi', 'platformInfo'];

  function BitLoxCtrl($rootScope, $scope, $log, $stateParams, gettextCatalog, $ionicHistory, $ionicLoading, popupService,  hidchrome, hidweb, bleapi, platformInfo) {

    var api = hidweb;
    if (platformInfo.isChromeApp) {
      api = hidchrome
    }
    else if(platformInfo.isMobile) {
      api = bleapi
    }
    $scope.api = api;
    if(platformInfo.isMobile) {
      api.initialize();
    }
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



    $scope.getEntropy = function(data) {
      api.getEntropy(1024).then(function(data) {

        console.warn("ENTROPY SUCCESS "+data.payload.entropy)
      }).catch(function(e) {
        console.warn("ENTROPY FAILURE")
        console.warn(e)
      });
    }
    $scope.ping = function(data) {
      api.ping({greeting:"wbalbadubs"}).then(function(data) {

        console.warn("PING SUCCESS "+data.payload.echoed_greeting + " " + data.payload.echoed_session_id)
      }).catch(function(e) {
        console.warn("PING FAILURE")
        console.warn(e)
      });
    }
    $scope.refreshBitlox = function($event) {

      if(platformInfo.isMobile) {
        api.startScanNew();
        setTimeout(function() {
          api.stopScan();
        },60000)
      }
    }
    $scope.connectBle = function(address) {
      $ionicLoading.show({
            template: 'Connecting to BitLox, Please Wait...'
          });
      console.log('connecting to '+address)
      api.connect(address).then(function() {
        $ionicLoading.hide()
        $rootScope.$broadcast('bitloxConnectSuccess')
      }, function(err) {
        $log.debug("BitLox Connection Error", err)
      }).finally(function() {

      })
    }


    $scope.$watch('api.getBleReady()', function(newVal) {
      if(newVal) {
        $scope.refreshBitlox()
      }
    });

    $scope.$watch('api.getStatus()', function(hidstatus) {
      checkStatus(hidstatus)
    });

    function checkStatus(hidstatus) {
      console.warn("New device status: " + hidstatus)
      switch(hidstatus) {
      case api.STATUS_CONNECTED:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.connected = true;
          $scope.bitlox.statusString = "Bitlox connected";
          $scope.bitlox.alertClass = "success";
          $scope.bitlox.glyph = "glyphicon-ok";
          break;
      case api.STATUS_IDLE:
          $scope.bitlox.connectAttempted = true;
          $scope.bitlox.connected = true;
          $scope.bitlox.statusString = "Bitlox idle";
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
    }



  }
})(window, window.angular);
