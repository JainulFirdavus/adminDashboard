'use strict';

var app = angular.module('mjAdmin');
app.service('apiService', function ($http, $q, Upload) {
    // function apiService($http, $q) {
    var apiService = {};
    apiService.apiRequest = function (requesturl, method, values) {
        var deferred = $q.defer();
        $http({
            url: requesturl,
            method: method,
            data: values
        }).then(
            function (res) {
                deferred.resolve(res.data);
            },
            function (err) {
                deferred.resolve(err);
            }
        );
        return deferred.promise;
    }

    apiService.fileRequest = function (requesturl, method, values) {
        var deferred = $q.defer();
        Upload.upload({
            url: requesturl, //webAPI exposed to upload the file
            data: values //pass file as data, should be user ng-model
        }).then(
            function (res) {
               
                deferred.resolve(res.data);
            },
            function (err) {
                deferred.resolve(err);
            }
        );
        return deferred.promise;
    }
    return apiService;
})
