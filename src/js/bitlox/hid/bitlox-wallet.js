(function(angular) {
'use strict';
angular.module('hid')
.service('bitlox',
['platformInfo',
'bitloxHidChrome',
'bitloxHidWeb',
'bitloxBleApi',
'bitloxWallet',

function Bitlox(platformInfo,
bitloxHidChrome,
bitloxHidWeb,
bitloxBleApi,
bitloxWallet) {

this.api = bitloxHidWeb
if (platformInfo.isChromeApp) {
  this.api = bitloxHidChrome
}
else if(platformInfo.isMobile) {
  this.api = bitloxBleApi
}

this.wallet = bitloxWallet

}])})(window.angular);
