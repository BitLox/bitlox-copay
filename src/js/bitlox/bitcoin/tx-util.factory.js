(function(window, angular) {
    'use strict';

    angular.module('bitcoin')
        .factory('txUtil', txUtilFactory);

    txUtilFactory.$inject = [
        '$q',
        '$http',
        'hexUtil',
    ];

    function txUtilFactory($q, $http) {

        var baseUrl = 'https://bitlox.io/api';
//         var baseUrl = '/api';

        var txUtil = {
            getHex: getHex,
            submit: submit,
        };

        function getHex(bigEndianTxid) {
        	console.debug("raw source txid " + bigEndianTxid);
            var url = baseUrl + '/rawtx/' + bigEndianTxid 
            console.log(url)
            return $http.get(url).success(function(res) {
                if(res.data && res.data.rawtx) {
                    console.warn("raw tx " + res.data.rawtx)
                }
            }).error(function(err) {
                console.error(err)
            });
        }

        function submit(signedHex) {
        	console.debug("raw signed tx ", signedHex);
            return $http.post(baseUrl + '/tx/send', {
                rawtx: signedHex
            }).success(function(res) {
                if (res.data.error) {
                	console.debug("tx error ", res.data.error);
                    if (res.data.error.indexOf("already spent") >= 0) {
                        return $q.reject(new Error("Some inputs already spent, please try transaction again in a few minutes"));
                    } else {
                        return $q.reject(new Error(res.data.error));
                    }
                }
            }).error(function(err) {
                console.error(err)
                return $q.reject(new Error(err));
            });
        }

        return txUtil;
    }

})(window, window.angular);
