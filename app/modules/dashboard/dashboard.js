angular.module('mjAdmin').controller('DashboardCtrl', ['$scope', '$timeout', 'countsresolve', '$interval', '$state', function ($scope, $timeout, countsresolve, $interval, $state) {
    var dc = this;

  



    dc.usersCount = countsresolve && countsresolve.usersCount[0] ? countsresolve.usersCount[0].Count : 0;
    dc.chatsCount = countsresolve && countsresolve.chatsCount[0] ? countsresolve.chatsCount[0].Count : 0;
    dc.groupsCount = countsresolve && countsresolve.groupsCount[0] ? countsresolve.groupsCount[0].Count : 0;
    dc.lastUsers = countsresolve && countsresolve.lastUsers[0] ? countsresolve.lastUsers[0].users : []
    dc.group = countsresolve && countsresolve.group[0] ? countsresolve.group : []
    var chart = {};
    chart.data = [['Locale', 'Count', 'Percent']]


    countsresolve.usersByCountry.forEach(function (country) {
        chart.data.push([country._id.substring(0, 1).toUpperCase() + country._id.substring(1), country.count, country.percentage]);
    });
    chart.type = "GeoChart";
    chart.options = {
        width: 600,
        height: 300,
        chartArea: { left: 10, top: 10, bottom: 0, height: "100%" },
        colorAxis: { colors: ['#aec7e8', '#1f77b4'] },
        displayMode: 'regions',
        // backgroundColor: '#1f2940',
        is3D: true
    };

    chart.formatters = {
        number: [{
            columnNum: 1,
            // pattern: "$ #,##0.00"
            pattern: "#,##0.00"
        }]
    };
    $scope.chart = chart;



    $scope.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'];
    $scope.series = ['Series A', 'Series B'];

    $scope.data = [
        [75, 63, 59, 79, 13, 91, 113],
        [27, 48, 54, 70, 89, 35, 53]
    ];

    $scope.ColorBar = ['#90EE90', '#FF6600'];
    $scope.DataSetOverride = [{ yAxisID: 'y-axis-1' }]; //y-axis-1 is the ID defined in scales under options.

    $scope.options = {
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        },
        scales: {
            responsive: !0,
            maintainAspectRatio: !0,
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                gridLines: {
                    color: "rgba(0, 0, 0, 0.03)",
                    drawBorder: !1
                },
                ticks: {
                    min: 20,
                    max: 80,
                    stepSize: 20,
                    fontColor: "#212529",
                    maxTicksLimit: 3,
                    callback: function (a, e, r) {
                        return a + " K"
                    },
                    padding: 10
                }
            }],
            xAxes: [{
                display: !1,
                barPercentage: .3,
                gridLines: {
                    display: !1,
                    drawBorder: !1
                }
            }]
        },
        legend: {
            display: !1
        }
    }



}]);