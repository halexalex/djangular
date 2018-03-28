'use strict';

angular.module('core.post').factory('Post', function (LoginRequiredInterceptor, $cookies, $resource) {
    var url = '/api/posts/:slug/';
    var postQuery = {
        url: url,
        method: "GET",
        params: {},
        isArray: true,
        cache: false,
        transformResponse: function (data, headersGetter, status) {
            var finalData = angular.fromJson(data);
            return finalData.results
        }

    };

    var postCreate = {
        url: 'api/posts/create/',
        method: "POST",
        interceptor: {responseError: LoginRequiredInterceptor}
    };

    var postGet = {
        method: "GET",
        params: {"slug": "@slug"},
        isArray: false,
        cache: false
    };

    var postUpdate = {
        url: '/api/posts/:slug/edit/',
        method: "PUT",
        params: {"slug": "@slug"},
        interceptor: {responseError: LoginRequiredInterceptor}
    };

    var postDelete = {
        url: '/api/posts/:slug/delete/',
        method: "DELETE",
        params: {"slug": "@slug"},
        interceptor: {responseError: LoginRequiredInterceptor}
    };

    var token = $cookies.get("token");
    if (token) {
        postCreate["headers"] = {"Authorization": "JWT " + token};
        postUpdate["headers"] = {"Authorization": "JWT " + token};
        postDelete["headers"] = {"Authorization": "JWT " + token};
    }

    return $resource(url, {}, {
        query: postQuery,
        create: postCreate,
        get: postGet,
        update: postUpdate,
        delete: postDelete
    })
});


