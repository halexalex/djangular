'use strict';

angular.module('loginDetail').component('loginDetail', {
    templateUrl: '/api/templates/login-detail.html',
    controller: function ($cookies,
                          $http,
                          $location,
                          $routeParams,
                          $rootScope,
                          $scope) {
        var loginUrl = '/api/users/login/'
        $scope.loginError = {}
        $scope.user = {}

        $scope.$watch(function () {
            if ($scope.user.password) {
                $scope.loginError.password = ""
            } else if ($scope.user.username) {
                $scope.loginError.username = ""
            }
        })

        var tokenExists = $cookies.get("token")
        if (tokenExists) {
            // verify token
            console.log(tokenExists)
            $scope.loggedIn = true;
            $cookies.remove("token")
            $scope.user = {
                username: $cookies.get("username")
            }
            window.location.reload()
        }

        $scope.doLogin = function (user) {
            console.log(user)
            if (!user.username) {
                $scope.loginError.username = ["This field may not be blank."]
            }

            if (!user.password) {
                $scope.loginError.password = ["This field is required."]
            }

            if (user.username && user.password) {
                var reqConfig = {
                    method: "POST",
                    url: loginUrl,
                    data: {
                        username: user.username,
                        password: user.password
                    },
                    headers: {}
                }
                var requestAction = $http(reqConfig)

                requestAction.success(function (response_data, response_status, response_headers, response_config) {
                    // console.log(r_data) // token
                    $cookies.put("token", response_data.token)
                    $cookies.put("username", response_data.username)
                    // message
                    $location.path("/")
                    window.location.reload()
                })
                requestAction.error(function (error_data, error_status, error_headers, error_config) {
                    // console.log(error_data) // error
                    $scope.loginError = error_data
                })
            }
        }
    }
})
