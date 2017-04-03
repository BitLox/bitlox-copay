(function(window, angular, chrome) {
    'use strict';

    angular.module('app.wallet')
        .controller('WalletCtrl', WalletCtrl);

    WalletCtrl.$inject = ['$scope', '$state', '$timeout', 'MAX_WALLETS', 'Wallet', 'Toast', 'hidweb', 'hidchrome', '$ionicHistory', 'profileService',  'ongoingProcess', 'walletService', 'popupService', 'gettextCatalog', 'derivationPathHelper', 'bwcService', 'bleapi', 'platformInfo'];

    function WalletCtrl($scope, $state, $timeout, MAX_WALLETS, Wallet, Toast, hidweb, hidchrome, $ionicHistory, profileService, ongoingProcess, walletService, popupService, gettextCatalog, derivationPathHelper, bwcService, bleapi, platformInfo) {
        var vm = this;
        var api = hidweb;
        if (platformInfo.isChromeApp) {
          api = hidchrome
        }
        else if(platformInfo.isMobile) {
          api = bleapi;
        }
        $scope.api = api;
        vm.onCreateFinished = function(wallet) {
          console.log("oncreate finished")
          $state.goBack();
        }

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
          // console.warn("START IMPORTING")
          // console.warn(JSON.stringify(opts))
          profileService.createWallet(opts, function(err, walletId) {
            ongoingProcess.set('importingWallet', false);
            // console.warn("DONE IMPORTING")
            if (err) {
              console.error(err)
              popupService.showAlert(gettextCatalog.getString('Error'), err);
              return;
            }


            walletService.updateRemotePreferences(walletId);
            $state.goBack();

          });
        };

        if(chrome && chrome.hid) {
          chrome.hid.onDeviceAdded.addListener(function() {
              vm.readWallets();
          });
        }
        else if(platformInfo.isMobile) {
          $scope.$watch('api.getStatus()', function(newVal) {
            if(newVal === api.STATUS_CONNECTED) {
                $timeout(vm.readWallets.bind(vm), 1000);
            }
          })
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
                    console.log("WALLET LOADED")
                    console.log(wallet.xpub)
                    _importExtendedPublicKey(wallet)
                }, Toast.errorHandler, function(status) {
                    console.debug("open notify", status);
                    if (status === Wallet.NOTIFY_XPUB_LOADED) {
                        vm.loadingXpub = false;
                    }
                })
                .finally(function() {
                    console.debug("done loading wallet", wallet.number);
                    vm.openingWallet = -99;
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
            api.flash().catch(Toast.errorHandler)
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
            console.log("RESET WALLET CONTROLLER")
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
