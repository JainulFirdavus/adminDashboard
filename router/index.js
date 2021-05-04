'use strict';
const db = require('../middleware/mongoconnector');
module.exports = function (app) {
  require('./admin')(app)
  try {
    app.get('/*', function (req, res, next) {
        db.GetOneDoc('settings', { name: 'general' }, {}, (err, settingsDoc) => {
          var themes = 'demo_1';
          if (err || !settingsDoc) {
            res.render('admin', { page: 'admin', menuId: 'Dashboard', themes: themes });
          } else {
            if (settingsDoc.settings.themes) {
              themes = settingsDoc.settings.themes;
            }
            res.render('admin', { page: 'admin', menuId: 'Dashboard', themes: themes });
          }
        })
      // res.render('admin', { page: 'admin', menuId: 'Dashboard', themes: 'demo_1' });

    });
  } catch (e) {
    console.log('error in index.js---------->>>>', e);
  }
}