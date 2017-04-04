(function(angular) {
'use strict';
angular.module('hid')
.service('bitlox',
['platformInfo',
'bitloxChromeHid',
'bitloxWebHid',
'bitloxBleApi',
function Bitlox(platformInfo,
bitloxChromeHid,
bitloxWebHid,
bitloxBleApi) {

this.api = bitloxHidWeb
if (platformInfo.isChromeApp) {
  this.api = bitloxHidChrome
}
else if(platformInfo.isMobile) {
  this.api = bitloxBleApi
}

})})(window.angular);
