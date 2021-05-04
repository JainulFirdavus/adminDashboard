"use strict";
var db = require("../middleware/mongoconnector")
var fs = require('fs');
var mongo = require('mongodb'), ObjectID = mongo.ObjectID;
module.exports = () => {

    var router = {};

    router.getsettings = (req, res) => {

        var returndata = {
            status: 0,
            response: "Invalid response"
        }
        db.GetOneDoc('settings', { name: 'general' }, {}, (err, docdata) => {
            if (err || !docdata) {
                returndata.response = err;
                res.send(returndata);
            } else {
                returndata.status = 1;
                returndata.response = docdata;
                res.send(returndata);
            }
        })

    }

    router.settingfile = (req, res) => {
        res.send(req.files[0]);
    }

    router.settingSave = (req, res) => {
        var returndata = {
            status: 0,
            response: "Invalid response"
        }
        try {
            var data = { name: req.body.name }
            var settingsID = req.body._id;
            delete req.body.name
            delete req.body._id
            data.settings = req.body
            if (req.file) {
                data.settings.logo = req.file.path;
            }
            

            if (settingsID) {
                db.UpdateDoc('settings', { _id: ObjectID(settingsID) }, { $set: data }, {}, function (err, docdata) {
                    if (err) {
                        returndata.response = err;
                        res.send(returndata);
                    } else {
                        returndata.status = 1;
                        returndata.response = docdata;
                        res.send(returndata);
                    }
                });
            } else {
                db.InsertDoc('settings', data, (err, docdata) => {
                    if (err) {
                        returndata.response = err;
                        res.send(returndata);
                    } else {
                        returndata.status = 1;
                        returndata.response = docdata;
                        res.send(returndata);
                    }
                })
            }
        } catch (error) {
            returndata.response = error;
            res.send(returndata);
        }
    };

    return router;
}