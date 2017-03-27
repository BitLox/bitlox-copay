(function(window, angular) {
    'use strict';
    var native = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

    angular.module('app.core')
        .controller('StatusCtrl', StatusCtrl);

    StatusCtrl.$inject = ['hidapi', 'WalletStatus', 'bleapi'];

    function StatusCtrl(hidapi, WalletStatus, bleapi) {
        var vm = this;

        vm.ble = bleapi.app;

        var api = native ? bleapi : hidapi;
        vm.bitlox = {
            connectAttempted: false,
            connected: false,
            status: "No Bitlox",
            alertClass: "danger"
        };

        vm.wallet = {
            status: "No Wallet",
            alertClass: "warning"
        };

        vm.refreshBitlox = function() {
            api.ping();
        };

        api.$scope.$watch('status', function(hidstatus) {
            switch(hidstatus) {
            case api.STATUS_CONNECTED:
                vm.bitlox.connectAttempted = true;
                vm.bitlox.connected = true;
                vm.bitlox.status = "Bitlox connected";
                vm.bitlox.alertClass = "success";
                vm.bitlox.glyph = "glyphicon-ok";
                break;
            case api.STATUS_CONNECTING:
                vm.bitlox.connectAttempted = true;
                vm.bitlox.status = "Bitlox connecting";
                vm.bitlox.alertClass = "success";
                vm.bitlox.glyph = "glyphicon-refresh";
                break;
            case api.STATUS_DISCONNECTED:
                console.warn("DISCONNECTED");
                vm.bitlox.connected = false;
                vm.bitlox.status = "Bitlox disconnected!";
                vm.bitlox.alertClass = "danger";
                vm.bitlox.glyph = "glyphicon-remove";
                break;
            case api.STATUS_WRITING:
                vm.bitlox.connectAttempted = true;
                vm.bitlox.connected = true;
                vm.bitlox.status = "Bitlox writing";
                vm.bitlox.alertClass = "info";
                vm.bitlox.glyph = "glyphicon-upload";
                break;
            case api.STATUS_READING:
                vm.bitlox.connectAttempted = true;
                vm.bitlox.connected = true;
                vm.bitlox.status = "Bitlox reading";
                vm.bitlox.alertClass = "info";
                vm.bitlox.glyph = "glyphicon-download";
                break;
            default:
                vm.bitlox.connected = false;
                vm.bitlox.status = null;
            }
        });

        WalletStatus.$watch('status', function(walletstatus) {
            switch(walletstatus) {
            case WalletStatus.STATUS_LOADING:
                vm.wallet.status = "Loading wallet";
                vm.wallet.alertClass = "info";
                vm.wallet.glyph = "glyphicon-download";
                break;
            case WalletStatus.STATUS_LOADING_UNSPENT:
                vm.wallet.status = "Finding unspent outputs";
                vm.wallet.alertClass = "info";
                vm.wallet.glyph = "glyphicon-cloud-download";
                break;
            case WalletStatus.STATUS_LOADING_TRANSACTIONS:
                vm.wallet.status = "Finding transactions";
                vm.wallet.alertClass = "info";
                vm.wallet.glyph = "glyphicon-cloud-download";
                break;
            case WalletStatus.STATUS_SENDING:
                vm.wallet.status = "Wallet sending";
                vm.wallet.alertClass = "info";
                vm.wallet.glyph = "glyphicon-log-out";
                break;
            case WalletStatus.STATUS_SIGNING:
                vm.wallet.status = "Wallet signing";
                vm.wallet.alertClass = "info";
                vm.wallet.glyph = "glyphicon-pencil";
                break;
            default:
                vm.wallet.status = null;
            }
        });


    }

})(window, window.angular);
