angular.module('mjAdmin').controller('SettingsCtrl', ['$state', '$scope', '$timeout', 'apiService', 'settingsresolve', 'SweetAlert', function ($state, $scope, $timeout, apiService, settingsresolve, SweetAlert) {

    var sc = this;
    sc.settingData = (settingsresolve && settingsresolve.status == 1) ? settingsresolve.response : {}
    sc.settings = (settingsresolve && settingsresolve.status == 1) ? settingsresolve.response.settings : {}
    var theme = settingsresolve.response && settingsresolve.response.settings ? settingsresolve.response.settings.themes : ''
    sc.fileuploaded = false;
    $scope.upload = function (files) {
        sc.fileuploaded = true;
        sc.upload_image = files[0];
        sc.settings.logo = sc.upload_image;

    }

    sc.submitSettings = function (form, data) {
        if (form) {
            if (sc.settingData._id) {
                data._id = sc.settingData._id;
            }
            data.name = sc.settingData.name ? sc.settingData.name : 'general';
            apiService.fileRequest('/admin/saveSettings', 'POST', data).then(function (respo) {
                if (respo.status == 0) {
                    sc.settings = {}
                } else {
                    if (theme != data.themes) {
                        // sc.settings = data.response.settings
                        location.reload();
                    } else {
                        $state.reload();
                    }

                }
            })

        } else {
            SweetAlert.swal("Some Value Are Missing !", "Try Again!", "error")
        }

    }

}]);