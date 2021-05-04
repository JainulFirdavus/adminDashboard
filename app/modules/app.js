
angular.module('Authentication', []);

var app = angular.module('mjAdmin', [
    "ui.router",
    "ngAnimate",
    "ngSanitize",
    "googlechart",
    "Authentication",
    "chart.js",
    "ui.bootstrap",
    "oitozero.ngSweetAlert",
    'ngFileUpload',
    'gfl.textAvatar'
]);

app.run(['$rootScope', '$location', '$http',
    function ($rootScope, $location, $http) {

        $rootScope.auth = JSON.parse(window.localStorage.getItem("token")) || {};
        if ($rootScope.auth) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.auth.authdata;
        }
        // keep user logged in after page refresh

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            $rootScope.auth = JSON.parse(window.localStorage.getItem("token")) || {};
            if (!$rootScope.auth.logindate) {
                $location.path('/admin/login');
            }

            if ($rootScope.auth.logindate) {

                var date = $rootScope.auth.logindate
                var expiryTime = Date.now() - (1 * 12 * 60 * 60 * 1000)

                if (date < expiryTime) {
                    window.localStorage.removeItem("token");
                    $location.path('/admin/login');
                }
            }

            // redirect to login page if not logged in
            if ($location.path() !== '/admin/login' && !$rootScope.auth) {
                $location.path('/admin/login');
            }
        });
    }]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
    $urlMatcherFactoryProvider.caseInsensitive(false);
    $urlMatcherFactoryProvider.strictMode(true);
    $urlRouterProvider.otherwise("/admin/dashboard");
    var limit = 20;
    var skip = 0;

    $stateProvider
        .state("login", {
            url: "/admin/login",
            templateUrl: "app/modules/authentication/views/login.html",
            controller: "LoginCtrl",
            controllerAs: "LC"
        })
        .state("admin", {
            url: "/admin",
            templateUrl: "app/modules/common/main.html",
            controller: "MainCtrl",
        })
        .state("admin.adminedit", {
            url: "/adminprofile/:id",
            templateUrl: "app/modules/admin/views/adminEdit.html",
            controller: "AdminCtrl",
            controllerAs: "AC",
            resolve: {
                adminprofileresolve: function (apiService, $stateParams) {
                    return apiService.apiRequest('/admin/getadmin', 'POST', { _id: $stateParams.id });
                },
            }
        })
        .state("admin.adminlist", {
            url: "/adminlist",
            templateUrl: "app/modules/admin/views/admin.html",
            controller: "AdminListCtrl",
            controllerAs: "AC",
            resolve: {
                adminresolve: function (apiService) {
                    return apiService.apiRequest('/admin/adminlist', 'POST', { limit: limit, skip: skip });
                },
            }
        })
        .state("admin.dashboard", {
            url: "/dashboard",
            templateUrl: "app/modules/dashboard/views/dashboard.html",
            controller: "DashboardCtrl",
            controllerAs: "DC",
            resolve: {
                countsresolve: function (apiService) {
                    return apiService.apiRequest('/admin/dashboard_sync', 'POST', {});
                },
            }
        }).state("admin.users", {
            url: "/users",
            templateUrl: "app/modules/users/views/users.html",
            controller: "UsersCtrl",
            controllerAs: "UC",
            resolve: {
                usersresolve: function (apiService) {
                    return apiService.apiRequest('/admin/userList', 'POST', { limit: limit, skip: skip });
                },
            }
        }).state("admin.viewUsers", {
            url: "/user-view/:id",
            templateUrl: "app/modules/users/views/userEdit.html",
            controller: "UserViewCtrl",
            controllerAs: "UVC",
            resolve: {
                usersresolve: function (apiService, $stateParams) {
                    return apiService.apiRequest('/admin/getuser', 'POST', { _id: $stateParams.id });
                },
            }
        }).state("admin.settings", {
            url: "/settings",
            templateUrl: "app/modules/settings/views/settings.html",
            controller: "SettingsCtrl",
            controllerAs: "SC",
            resolve: {
                settingsresolve: function (apiService) {
                    return apiService.apiRequest('/admin/get-settings', 'POST', {});
                },
            }
        });


}]);



app.controller("MainCtrl", function ($rootScope, apiService, SweetAlert, $state) {
    apiService.apiRequest('/admin/get-settings', 'POST', {}).then(function (data) {
        if (data.status == 0) {
            $rootScope.settings = {}
        } else {
            $rootScope.settings = (data && data.response) ? data.response.settings : {};
            $rootScope.title = (data && data.response) ? data.response.settings.title : {};

        }
    })
    $rootScope.limit = 20;
    $rootScope.skip = 0

    $rootScope.menuList = [
        { title: 'Dashboard', url: 'admin.dashboard', icon: 'fa-tachometer', color: 'blue' },
        { title: 'Users', url: 'admin.users', icon: 'fa-users', color: 'brown' },
        { title: 'Settings', url: 'admin.settings', icon: 'fa-cogs ', color: 'green' },
    ];

    $rootScope.logout = function () {
        apiService.apiRequest('/admin/logout', 'POST', { _id: $rootScope.auth._id }).then(function (data) {
            if (data.status == 0) {
                SweetAlert.swal("Something Worng!", "Try Again!", "error")
            } else {
                if (data.userId == $rootScope.auth._id) {
                    window.localStorage.removeItem("token");
                    $state.go("login", {}, { reload: true });
                }
            }
        })
    }
});

app.filter('capitalize', function () {
    return function (input, scope) {
        if (input != undefined) {
            if (input != null)
                input = input.toLowerCase();
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
    }
}).directive('copyToClipboard', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    $temp_input.remove();
                }
            });
        }
    };
})/* .directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            var watcher = scope.$watch(function () {
                return attrs['ngSrc'];
            }, function (value) {
                if (!value) {
                    element.attr('src', "/image_holder_ur_circle.png");
                }
            });
            element.bind('error', function () {
                element.attr('src', "/image_holder_ur_circle.png");
            });
            //unsubscribe on success
            element.bind('load', watcher);

        }
    }
}) */.directive('errSrctext', function (GflTextAvatarService, $interpolate) {
    return {
        template: '<p>inserted image using</p>',
        link: function (scope, element, attrs) {
            var watcher = scope.$watch(function () {
                return attrs['ngSrc'];
            }, function (value) {
                if (!value) {
                    // console.log(element.attr);
                    // element.wrap('<gfl-text-avatar>John Doe</gfl-text-avatar>')
                    // element.replaceWith()
                    var text = $interpolate('<gfl-text-avatar>John Doe</gfl-text-avatar>')(scope);
                    var initials = GflTextAvatarService.getInitials(text);
                    var bgColor = attrs.bgColor ? attrs.bgColor : GflTextAvatarService.getBgColor(initials);
                    var size = parseInt(attrs.size, 10) ? attrs.size : 36;
                    var square = attrs.shape === 'square';
                    var textColor = attrs.textColor ? attrs.textColor : '#FFF';

                    element.html(initials);
                    element.css({
                        backgroundColor: bgColor,
                        borderRadius: square ? '2px' : '50%',
                        color: textColor,
                        display: 'inline-block',
                        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                        fontSize: size / 2 + 'px',
                        height: size + 'px',
                        lineHeight: size + 'px',
                        textAlign: 'center',
                        width: size + 'px'
                    });
                    // element.remove();
                }
            });
            element.bind('error', function () {
                element.wrap('<div>I should not be red</div>')
                element.remove();
            });
            //unsubscribe on success
            element.bind('load', watcher);


        },
        /*  compile: function (element, attributes) {
             return {
                 pre: function (scope, element, attrs, controller, transcludeFn) {
                     var watcher = scope.$watch(function () {
                         return attrs['ngSrc'];
                     }, function (value) {
                         if (!value) {
                             element.attr('src', "/image_holder_ur_circle.png");
                         }
                     });
                     element.bind('error', function () {
                         element.attr('src', "/image_holder_ur_circle.png");
                     });
                 },
                 post: function (scope, element, attrs, controller, transcludeFn) {
 
                 }
             }
         }, */

        /* link: function (scope, element, attrs) {
            var watcher = scope.$watch(function () {
                return attrs['ngSrc'];
            }, function (value) {
                if (!value) {
                    element.attr('src', "/image_holder_ur_circle.png");
                }
            });
            element.bind('error', function () {
                element.attr('src', "/image_holder_ur_circle.png");
            });
            //unsubscribe on success
            element.bind('load', watcher);
 
        } */
    }
})
/*
GflTextAvatarDirective.$inject = ['$interpolate', 'GflTextAvatarService'];
function GflTextAvatarDirective($interpolate, GflTextAvatarService) {
console.log("errSrctext");

    return {
        link: link,
        replace: true,
        restrict: 'E',
        template: template,
        transclude: true
    };
    function link(scope, element, attrs) {
        var text = $interpolate(element.text())(scope);
        var initials = GflTextAvatarService.getInitials(text);
        var bgColor = attrs.bgColor ? attrs.bgColor : GflTextAvatarService.getBgColor(initials);
        var size = parseInt(attrs.size, 10) ? attrs.size : 48;
        var square = attrs.shape === 'square';
        var textColor = attrs.textColor ? attrs.textColor : '#FFF';

        element.html(initials);
        element.css({
            backgroundColor: bgColor,
            borderRadius: square ? '2px' : '50%',
            color: textColor,
            display: 'inline-block',
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            fontSize: size / 2 + 'px',
            height: size + 'px',
            lineHeight: size + 'px',
            textAlign: 'center',
            width: size + 'px'
        });
    }

    function template(element, attrs) {
        return '<div class="gfl-text-avatar" ng-transclude></div>';
    }
} */
