angular.module('mjAdmin').factory('GflTextAvatarService', GflTextAvatarService)
    .controller('someController', function ($scope, $filter) {
        $scope.countries = [];
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        $scope.maxSize = 20;
        $scope.totalItems = 250;

        for (var i = 0; i < 250; i++) {
            $scope.countries[i] = { name: 'country ' + i }
        }
    })
    .directive('customTable', function customTable($compile) {
        return {
            restrict: 'E',
            templateUrl: 'app/admin/modules/common/views/table.html',
            scope: {
                data: '=data'
            },
            controller: TableCtrl,
            controllerAs: 'TC',
            bindToController: true
        };
    }).directive('contentItem', function ($compile) {
        return {
            restrict: "EA",
            // controller: customContentCtrl,
            controllerAs: 'CCC',
            link: function (scope, element, attrs) {
                element.html(scope.template);
                $compile(element.contents())(scope);
            },
            scope: {
                content: '=content',
                options: '=options',
                template: '=template',
                currentpage: '=currentpage',
                filterDataArray: '=filterData',
                entrylimit: '=entrylimit',
                predicate: '=predicate',
                reverse: '=reverse',
                usertablesearch: '=usertablesearch'
            }
        };
    });



function TableCtrl($scope, $attrs, $timeout, apiService, $rootScope) {



    var tc = this;
    tc.predicate = '';
    tc.reverse = -1;
    if (tc.filterDataArray) {
        tc.temp = {
            data: {},
            alias: {}
        };
        for (var k = 0; k < tc.filterDataArray.length; k++) {
            tc.temp.data[tc.filterDataArray[k].name] = 0;
            tc.temp.alias[tc.filterDataArray[k].name] = tc.filterDataArray[k].alias;

        }
        for (var j = 0; j < tc.dataLength; j++) {
            tc.data[j].selected = false;
            for (var i = 0; i < tc.filterDataArray.length; i++) {
                if (tc.data[j][tc.filterDataArray[i].variable] == tc.filterDataArray[i].name) {
                    tc.temp.data[tc.filterDataArray[i].name]++;
                }
                if (tc.filterDataArray[i].name == "all") {
                    tc.temp.data[tc.filterDataArray[i].name]++;
                }
            }
        }
    }
    tc.order = function (predicate) {
        tc.unSelectAll();
        tc.predicate = predicate;
        tc.reverse = (tc.reverse == 1) ? -1 : 1;
        tc.sort = { field: predicate, order: tc.reverse };
        tc.data.delete.getData(tc.currentPage, tc.entryLimit, tc.sort);
    };

    tc.filterOPtion = function () {
        tc.valueSelectAction = '';
    }
    tc.filterValue = function (value) {
        tc.unSelectAll();
        tc.data.filterValue(value);
    };


    /*   $scope.totalItems = 64;
      $scope.currentPage = 4; */

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $log.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.maxSize = 5;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;

    // tc.totalItems = parseInt(tc.data.count) || 0;
    tc.currentPage = 1;
    tc.entryLimit = $rootScope.limit;

    tc.pageSizes = [5, 10, 20, 50, 100];
    tc.maxPaginationSize = 5;

    tc.maxSize = Math.ceil(tc.totalItems / tc.entryLimit);

    /* tc.selectAll = function (el, cp) {
        angular.forEach(tc.data.data, function (user, key) {
            user.selected = tc.selectedAll;
        });
    };
    tc.seletcheck = function (data) {
        if (data.selected == false) {
            tc.selectedAll = false;
        }
    };

    tc.unSelectAll = function () {
        angular.forEach(tc.data.data, function (data) {
            if (data.selected == true) {
                tc.selectedAll = false;
                data.selected = false;
            }
        });
    }; */
    tc.lastUpdateTime = Date.now();
    tc.messageSend = Date.now();

    /* tc.pageChangetimer = function () {
        var currentTime = Date.now();
        var diffsections = currentTime - tc.lastUpdateTime;
        if (diffsections < 1000) {
            var aftersections = 1000 - diffsections;
            $timeout(function () {
                tc.pageChangetimer();
            }, aftersections);
        } else {
            tc.data.delete.getData(tc.currentPage, tc.entryLimit, tc.sort, tc.userTableSearch, tc.valueSelectAction)
        }
    } */

    tc.pageChange = function (currentPage, entryLimit, search) {
        tc.lastUpdateTime = Date.now();
        // tc.pageChangetimer();
        tc.data.delete.getData(currentPage, entryLimit, tc.sort, search);

    };


    if (tc.filterDataArray) {
        tc.temp = {
            data: {},
            alias: {},
            count: {}
        };
        for (var k = 0; k < tc.filterDataArray.length; k++) {
            tc.temp.data[tc.filterDataArray[k].name] = 0;
            tc.temp.alias[tc.filterDataArray[k].name] = tc.filterDataArray[k].alias;
            tc.temp.count[tc.filterDataArray[k].name] = tc.filterDataArray[k].count;
        }


        for (var j = 0; j < tc.data.length; j++) {
            tc.data[j].selected = false;
            for (var i = 0; i < tc.filterDataArray.length; i++) {
                tc.temp.data[tc.filterDataArray[i].name] = tc.filterDataArray[i].count;
            }
        }

    }






}
function GflTextAvatarService() {
    var colors = [];
    colors = colors.concat(['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5']);
    colors = colors.concat(['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50']);
    colors = colors.concat(['#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800']);
    colors = colors.concat(['#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000']);

    return {
        getBgColor: getBgColor,
        getInitials: getInitials
    };

    function getBgColor(text) {
        var dec = text.charCodeAt(0);
        var index = Math.round(dec < 65 ? Math.random() * colors.length : dec % colors.length);

        return colors[index];
    }

    function getInitials(text) {
        text.replace(/[^a-zA-Z- ]/g, '');
        var texts = text.split(' ');
        var initials = texts.length > 1 ? (texts[0].charAt(0) + texts[1].charAt(0)) : texts[0].charAt(0);

        return initials.toUpperCase();
    }
}