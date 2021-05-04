"use strict";
var db = require("../middleware/mongoconnector")
const bcrypt = require('bcrypt');
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../config'); //configuration variables
var mongo = require('mongodb'), ObjectID = mongo.ObjectID;



function generate_token(username) {
    return jwt.sign({
        username: username
    }, config.jwt_secret.session, {
        //  expiresIn: config.jwt_secret.token_expiration //token doesn't expire forever
        expiresIn: config.jwt_secret.token_expiration //expires in 24 hour
    });
}


module.exports = function () {

    var router = {};
    router.save = function (req, res) {
        var data = {
            activity: {}
        };
        var returndata = {
            status: 0,
            response: 'Invalid response'
        }
        data.username = req.body.username;
        data.email = req.body.email;
        data.role = 'admin';
        data.status = 1;
        if (!req.body.confirmPassword || !req.body.password) {
            returndata.response = !req.body.password ? 'Password Requird' : !req.body.confirmPassword ? 'confirmPassword Requird' : '';
            res.send(returndata);
            return
        }
        if (req.body.confirmPassword) {
            // data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
            data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
        }
        if (req.body._id) {
            db.UpdateDoc('admins', { _id: ObjectID(req.body._id) }, data, {}, function (err, docdata) {
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
            db.GetDocs('admins', { 'username': req.body.username }, {}, function (err, getdata) {
                if (getdata.length != 0) {
                    returndata.response = 'Username is Already Exist';
                    res.send(returndata);
                } else {
                    //  data.activity.created = new Date();
                    data.status = 1;
                    db.InsertDoc('admins', data, function (err, result) {
                        if (err) {
                            returndata.response = err;
                            res.send(returndata);
                        } else {
                            returndata.status = 1;
                            returndata.response = result;
                            res.send(returndata);
                        }
                    });
                }
            });
        }
    };



    router.login = function (req, res) {


        let returndata = {
            status: 0,
            response: 'Invalid response'
        }
        try {
            console.log("try");
            var password = req.body.password;
            var authHeader = generate_token(req.body.username);
            console.log("username", req.body);

            db.GetOneDoc('admins', { 'username': req.body.username }, {}, (err, user) => {
                if (err || !user) {
                    returndata.response = 'Admin Not Found';
                    res.send(returndata);
                } else {
                    const isMatch = bcrypt.compareSync(password, user.password);
                    if (!isMatch) {
                        returndata.response = 'You are not authorized to sign in. Verify that you are using valid credentials';
                        res.send(returndata);
                    } else {
                        var data = { activity: {} };
                        data.activity.last_login = Date.now();
                        db.UpdateDoc('admins', { _id: ObjectID(user._id) }, { $set: data }, {}, function (err, docdata) {
                            if (err) {
                                returndata.response = err;
                                res.send(err);
                            } else {
                                var data = {};
                                data.username = user.username;
                                data._id = user._id;
                                data.token = authHeader;
                                data.email = user.emil;
                                // req.session.user = data;
                                // res.cookie('username', data.user);
                                returndata.response = data;
                                returndata.status = 1;
                                res.send(returndata);
                            }
                        });
                    }
                }
            });
        } catch (error) {
            console.log(error);

            returndata.response = error;
            res.send(returndata);
        }
    };


    router.logout = function (req, res) {
        let returndata = {
            status: 0,
            response: 'Invalid response'
        }
        try {
            db.GetOneDoc('admins', {
                '_id': ObjectID(req.body._id), 'status': 1
            }, {}, (err, admin) => {
                if (err || !admin) {
                    returndata.response = err;
                    res.send(returndata);
                } else {
                    var data = { activity: {} };
                    data.activity.last_logout = Date.now();
                    db.UpdateDoc('admins', { _id: ObjectID(admin._id) }, { $set: data }, {}, function (err, docdata) {
                        if (err) {
                            returndata.response = err;
                            res.send(err);
                        } else {
                            var data = {};
                            returndata.status = 1;
                            returndata.userId = admin._id
                            res.send(returndata);
                        }
                    });
                }
            });
        } catch (error) {
            returndata.response = error;
            res.send(returndata);
        }
    };

    router.getList = function (req, res) {
        var usersQuery = [
            { "$match": { status: { $ne: 0 } } },
            {
                "$project": {
                    created: 1,
                    username: 1,
                    status: 1,
                    role: 1,
                    username: 1,
                    activity: 1
                }
            },
            { "$project": { username: 1, document: "$$ROOT" } }, {
                $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }
        ];

        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            var searchs = req.body.search;
            usersQuery.push({
                "$match": {
                    $or: [
                        { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }
                    ]
                }

            });
            //search limit
            usersQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
            usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
            if (req.body.limit && req.body.skip >= 0) {
                usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
            }
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
            //search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            usersQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.created"] = -1;
            sorting["documentData.created"] = -1
            usersQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        if (!req.body.search) {
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.AggregationDoc('admins', usersQuery, function (err, docdata) {
            var data = {}
            if (err || docdata.length <= 0) {
                data.response = err ? err : 'No data found.';
                res.send(data);
            } else {

                res.send([docdata[0].documentData, docdata[0].count]);
            }
        });
    };



    router.edit = function (req, res) {
        db.GetDocs('admins', { _id: ObjectID(req.body.id) }, { password: 0 }, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    };




    return router;
};