
const middlewares = require('../middleware');
module.exports = function (app) {

    try {
        const admin = require('../controllers/admin.js')();
        const users = require('../controllers/users.js')();
        const dashboard = require('../controllers/dashboard.js')();

        const settings = require('../controllers/settings')();

        //admin

        app.post("/admin/register", admin.save);
        app.post("/admin/login", admin.login);
        app.post("/admin/logout", admin.logout);

        //dashboard
        app.post("/admin/dashboard_sync", dashboard.dashboard_sync);

        //user

        app.post("/admin/userList", users.userList);
        app.post("/admin/getuser", users.getuser);


        //setting 
        app.post("/admin/get-settings", settings.getsettings);
        app.post("/admin/saveSettings", middlewares.commonUpload('./uploads/common/').single('logo'), settings.settingSave);
    }
    catch (e) {
        console.log('erroe in index.js---------->>>>', e);
    }
};