(function(window, angular) {
    'use strict';

    angular.module('app.util')
        .config(ToastConfig)
        .factory('Toast', ToastFactory);


    function ToastConfig() {

    }


    function ToastFactory() {

        var Toast = function(){};

        var show = Toast.prototype.show = function(params) {
            console.log("BITLOX",params);
        };

        Toast.prototype.clear = function(toast) {

        };

        Toast.prototype.info = function(message) {
            console.info("BITLOX",message)
        };

        Toast.prototype.error = function(message) {
            console.error("BITLOX",message)
        };

        Toast.prototype.errorHandler = function(err) {
            console.error("BITLOX",err)
        };

        Toast.prototype.success = function(message) {
            console.info("BITLOX",message)
        };

        Toast.prototype.warning = function(message) {
            console.warn("BITLOX",message)
        };

        return new Toast();
    }

})(window, window.angular);
