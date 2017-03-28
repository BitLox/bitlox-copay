(function(window, angular) {
    'use strict';

    angular.module('app.core')
        .controller('StatusCtrl', StatusCtrl);

    StatusCtrl.$inject = ['$scope', 'hidapi', 'WalletStatus', 'bleapi'];

    function StatusCtrl($scope, hidapi, WalletStatus, bleapi) {
        $scope.native = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        var api = $scope.native ? bleapi : hidapi;

        $scope.bitlox = {};
        $scope.wallet = {};

        if($scope.native) {

          $scope.knownDevices = bleapi.app.knownDevices;
          $scope.$watch('knownDevices', function(x) {
              console.warn(x)
              console.warn($scope.knownDevices)
          });
          $scope.connectBle = function(address) {
            api.app.connect(address)
          }
          $scope.bleREady = bleapi.app.bleReady;
          $scope.$watch('bleReady', function(ready) {
            if(ready) {
              api.app.startScanNew();
            }
          });
        }
        $scope.bitlox = {
            connectAttempted: false,
            connected: false,
            status: "No Bitlox",
            alertClass: "danger"
        };

        $scope.wallet = {
            status: "No Wallet",
            alertClass: "warning"
        };

        $scope.refreshBitlox = function() {
            api.ping();
        };

        api.$scope.$watch('status', function(hidstatus) {
            console.warn(hidstatus)
            switch(hidstatus) {
            case api.STATUS_CONNECTED:
                $scope.bitlox.connectAttempted = true;
                $scope.bitlox.connected = true;
                $scope.bitlox.status = "Bitlox connected";
                $scope.bitlox.alertClass = "success";
                $scope.bitlox.glyph = "glyphicon-ok";
                break;
            case api.STATUS_CONNECTING:
                $scope.bitlox.connectAttempted = true;
                $scope.bitlox.status = "Bitlox connecting";
                $scope.bitlox.alertClass = "success";
                $scope.bitlox.glyph = "glyphicon-refresh";
                break;
            case api.STATUS_DISCONNECTED:
                console.warn("DISCONNECTED");
                $scope.bitlox.connected = false;
                $scope.bitlox.status = "Bitlox disconnected!";
                $scope.bitlox.alertClass = "danger";
                $scope.bitlox.glyph = "glyphicon-remove";
                break;
            case api.STATUS_WRITING:
                $scope.bitlox.connectAttempted = true;
                $scope.bitlox.connected = true;
                $scope.bitlox.status = "Bitlox writing";
                $scope.bitlox.alertClass = "info";
                $scope.bitlox.glyph = "glyphicon-upload";
                break;
            case api.STATUS_READING:
                $scope.bitlox.connectAttempted = true;
                $scope.bitlox.connected = true;
                $scope.bitlox.status = "Bitlox reading";
                $scope.bitlox.alertClass = "info";
                $scope.bitlox.glyph = "glyphicon-download";
                break;
            default:
                $scope.bitlox.connected = false;
                $scope.bitlox.status = null;
            }
        });

        WalletStatus.$watch('status', function(walletstatus) {
            switch(walletstatus) {
            case WalletStatus.STATUS_LOADING:
                $scope.wallet.status = "Loading wallet";
                $scope.wallet.alertClass = "info";
                $scope.wallet.glyph = "glyphicon-download";
                break;
            case WalletStatus.STATUS_LOADING_UNSPENT:
                $scope.wallet.status = "Finding unspent outputs";
                $scope.wallet.alertClass = "info";
                $scope.wallet.glyph = "glyphicon-cloud-download";
                break;
            case WalletStatus.STATUS_LOADING_TRANSACTIONS:
                $scope.wallet.status = "Finding transactions";
                $scope.wallet.alertClass = "info";
                $scope.wallet.glyph = "glyphicon-cloud-download";
                break;
            case WalletStatus.STATUS_SENDING:
                $scope.wallet.status = "Wallet sending";
                $scope.wallet.alertClass = "info";
                $scope.wallet.glyph = "glyphicon-log-out";
                break;
            case WalletStatus.STATUS_SIGNING:
                $scope.wallet.status = "Wallet signing";
                $scope.wallet.alertClass = "info";
                $scope.wallet.glyph = "glyphicon-pencil";
                break;
            default:
                $scope.wallet.status = null;
            }
        });


    }

})(window, window.angular);
