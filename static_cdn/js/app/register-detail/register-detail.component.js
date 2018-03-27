'use strict';

angular.module('registerDetail').component('registerDetail', {
    templateUrl: '/api/templates/register-detail.html',
    controller: function ($cookies,
                          $http,
                          $location,
                          $routeParams,
                          $rootScope,
                          $scope) {
        var registerUrl = '/api/users/register/'
        $scope.registerError = {}
        $scope.user = {}

        $scope.$watch(function () {
            if ($scope.user.password) {
                $scope.registerError.password = ""
            } else if ($scope.user.username) {
                $scope.registerError.username = ""
            } else if ($scope.user.email) {
                $scope.registerError.email = ""
            } else if ($scope.user.email2) {
                $scope.registerError.email2 = ""
            }
        })

        var tokenExists = $cookies.get("token")
        if (tokenExists) {
            // warn user
        }

        $scope.doRegister = function (user) {
            console.log(user)
            if (!user.username) {
                $scope.registerError.username = ["This field may not be blank."]
            }
            if (!user.email) {
                $scope.registerError.email = ["This field may not be blank."]
            }
            if (!user.email2) {
                $scope.registerError.email2= ["This field may not be blank."]
            }
            if (user.email !== user.email2) {
                $scope.registerError.email = ["Your email must match"]
            }
            if (!user.password) {
                $scope.register.password = ["This field is required."]
            }

            if (user.username && user.email && user.email2 && user.password) {
                var reqConfig = {
                    method: "POST",
                    url: registerUrl,
                    data: {
                        username: user.username,
                        email: user.email,
                        email2: user.email2,
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
                    $scope.registerError = error_data
                })
            }
        }
    }
})
