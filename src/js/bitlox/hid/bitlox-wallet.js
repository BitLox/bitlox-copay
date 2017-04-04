(function(angular) {
'use strict';
angular.module('hid')
.service('bitlox',
['platformInfo',
'bitloxHidChrome',
'bitloxHidWeb',
'bitloxBleApi',
function Bitlox(platformInfo,
bitloxHidChrome,
bitloxHidWeb,
bitloxBleApi) {

this.api = bitloxHidWeb
if (platformInfo.isChromeApp) {
  this.api = bitloxHidChrome
}
else if(platformInfo.isMobile) {
  this.api = bitloxBleApi
}

}])})(window.angular);
