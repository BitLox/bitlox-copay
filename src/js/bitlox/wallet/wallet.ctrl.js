(function(window, angular, chrome) {
    'use strict';

    angular.module('app.wallet')
        .controller('WalletCtrl', WalletCtrl);

    WalletCtrl.$inject = ['$scope', '$timeout', 'MAX_WALLETS', 'Wallet', 'Toast', 'hidapi', '$ionicHistory', 'profileService',  'ongoingProcess', 'walletService', 'popupService', 'gettextCatalog', 'derivationPathHelper', 'bwcService', 'bleapi'];

    function WalletCtrl($scope, $timeout, MAX_WALLETS, Wallet, Toast, hidapi, $ionicHistory, profileService, ongoingProcess, walletService, popupService, gettextCatalog, derivationPathHelper, bwcService, bleapi) {
        var vm = this;

        vm.ble = bleapi.app;

        // dave says this comes from the import.js file by copay, with edits
        var _importExtendedPublicKey = function(wallet) {

          var opts = {};
          opts.externalSource = 'bitlox'
          opts.extendedPublicKey = wallet.xpub
          opts.derivationPath = derivationPathHelper.default
          opts.derivationStrategy = 'BIP44'
          opts.hasPassphrase = false;
          opts.name = wallet.name;
          opts.account = 0

          var b = bwcService.getBitcore();
          var x = b.HDPublicKey(wallet.xpub);
          opts.entropySource = x.publicKey.toString(); //"40c13cfdbafeccc47b4685d6e7f6a27c";
          opts.account = 0;
          opts.networkName = 'livenet';
          opts.m = 1;
          opts.n = 1;
          opts.singleAddress = false;

          opts.network = true
          opts.bwsurl = 'https://bws.bitpay.com/bws/api'
          ongoingProcess.set('importingWallet', true);
          console.warn("START IMPORTING")
          profileService.createWallet(opts, function(err, walletId) {
            ongoingProcess.set('importingWallet', false);
            console.warn("DONE IMPORTING")
            if (err) {
              console.error(err)
              popupService.showAlert(gettextCatalog.getString('Error'), err);
              return;
            }


            walletService.updateRemotePreferences(walletId);
            $ionicHistory.removeBackView();
            $state.go('tabs.home');

          });
          // $timeout(function() {
          //
          // }, 100);
        };

        if(chrome && chrome.hid) {
          chrome.hid.onDeviceAdded.addListener(function() {
              vm.readWallets();
          });
        }
        vm.readWallets = function() {
            vm.readingWallets = true;
            return Wallet.list()
                .then(function(wallets) {
                    vm.wallets = wallets;
                    vm.openWallet = null;
                    refreshAvailableNumbers(wallets);
                }, Toast.errorHandler)
                .finally(function() {
                    vm.readingWallets = false;
                });
        };

        vm.loadWallet = function(wallet) {
            vm.openWallet = null;
            vm.loadingXpub = true;
            // console.debug("loading wallet", wallet.number);
            vm.openingWallet = wallet.number;
            wallet.open()
                .then(function() {
                    vm.openWallet = wallet;
                }, Toast.errorHandler, function(status) {
                    // console.debug("open notify", status);
                    // dave says, I think this is not needed any more
                    // if (status === Wallet.NOTIFY_XPUB_LOADED) {
                    //     vm.loadingXpub = false;
                    // }
                })
                .finally(function() {
                    console.debug("done loading wallet", wallet.number);
                    vm.openingWallet = null; // changed from -99 because I think it's fucking things up
                    console.log("WALLET LOADED", wallet.xpub)
                    _importExtendedPublicKey(wallet)
                });
        };

        vm.refreshBalance = function() {
            vm.refreshingBalance = true;
            vm.openWallet.updateBalance().catch(Toast.errorHandler)
                .finally(function() {
                    vm.refreshingBalance = false;
                });
        };

        vm.directOpenNumber = 0;
        vm.directLoad = function() {
            var wallet;
            vm.wallets.forEach(function(w) {
                if (w.number === vm.directOpenNumber) {
                    wallet = w;
                }
            });
            if (!wallet) {
                wallet = new Wallet({
                    wallet_number: vm.directOpenNumber,
                    version: 4,
                    wallet_name: "HIDDEN",
                    wallet_uuid: "HIDDEN",
                });
            }
            vm.loadWallet(wallet);
        };

        vm.prepForFlash = function() {
            vm.flashing = true;
            hidapi.flash().catch(Toast.errorHandler)
                .finally(function() {
                    vm.flashing = false;
                });
        };


        function refreshAvailableNumbers(wallets) {
            if (!wallets) {
                return;
            }
            // assemble array of wallet numbers
            var available = [];
            for(var i = 0; i < (MAX_WALLETS + 1); i++) {
                available.push(i);
            }
            // now loop through the wallets and remove existing
            // numbers
            wallets.forEach(function(wallet) {
                available.splice(available.indexOf(wallet.number), 1);
            });
            // set to the vm for the new wallet form
            vm.availableWalletNumbers = available;
        }

        function reset() {
            // status variables
            vm.readingWallets = true;
            vm.openingWallet = -99;
            vm.scanningWallet = false;
            vm.creatingWallet = false;
            vm.refreshingBalance = false;
            vm.openWallet = null;
            // read after a timeout, so angular does not hang and show
            // garbage while the browser is locked form readin the device
            $timeout(vm.readWallets.bind(vm), 100);
        }



        reset();
    }

})(window, window.angular, window.chrome);
