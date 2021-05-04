"use strict";
var db = require("../middleware/mongoconnector")
const bcrypt = require('bcrypt');
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../config'); //configuration variables
var mongo = require('mongodb'), ObjectID = mongo.ObjectID;


module.exports = () => {

    var router = {};
    router.userList = (req, res) => {
        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }
        var usersQuery = [
            { "$match": { status: { $ne: 0 } } },
            {
                "$project": {
                    username: 1, phone: 1, created: 1, device_type: 1, country: 1, last_seen: 1, thumbnail: 1, image: 1,
                    logout: 1, last_logout: 1, last_login: 1, device_type: 1, user_status: { $cond: [{ $not: ["$username"] }, 'Pending', 'Active'] }
                }
            },
            { "$project": { username: 1, document: "$$ROOT" } },
            {
                $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }
        ];

        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        var countquery = [...usersQuery];
        countquery.push({ $group: { "_id": "$documentData.user_status", "count": { "$sum": 1 } } });

        if (req.body.search) {
            var searchs = req.body.search;
            usersQuery.push({
                "$match": {
                    $or: [
                        { "documentData.username": { $regex: searchs + '.*', $options: 'i' } },
                        { "documentData.phone": { $regex: searchs + '.*', $options: 'i' } },
                        { "documentData.country": { $regex: searchs + '.*', $options: 'i' } }
                    ]
                }

            });
        }


        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            usersQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.created"] = -1;
            usersQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }

        usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        db.AggregationDoc('users', usersQuery, (err, docdata) => {
            if (err || docdata.length <= 0) {
                res.send([0, 0]);
            } else {
                db.AggregationDoc('users', countquery, (err, countdata) => {
                    if (err || docdata.length <= 0) {
                        res.send([0, 0, 0]);
                    } else {

                        res.send([docdata[0].documentData, docdata[0].count, countdata]);
                    }
                })
            }
        });
    };

    router.getuser = (req, res) => {
        var data = { status: 0 };
        async.parallel({
            user: function (cb) {
                db.GetOneDoc('users', { _id: ObjectID(req.body._id) }, {}, (err, userDoc) => {
                    if (err) { return cb(null, {}); }
                    cb(null, userDoc);
                })
            },
            userschat: function (cb) {
                db.AggregationDoc('chat', [
                    { "$match": { users: { $in: [ObjectID(req.body._id)] } } },
                    {
                        "$group": {
                            "_id": null,
                            "count": { "$sum": 1 }
                        }
                    }
                ], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            usersgroup: function (cb) {
                db.AggregationDoc('groups', [
                    // { "$match": { 'members.userId': { $eq: ObjectID(req.body._id) } } },
                    { $unwind: "$members" },
                    { $match: { "members.userId": { $eq: ObjectID(req.body._id) } } },
                    {
                        "$group": {
                            "_id": null,
                            "count": { "$sum": 1 }
                        }
                    }
                ], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            userscall: function (cb) {
                db.AggregationDoc('call', [
                    { "$match": { status: { $ne: 0 }, users: { $in: [ObjectID(req.body._id)] } } },
                    {
                        "$project": {
                            type: {
                                "$cond": [{ "$eq": ["$type", { $literal: "video" }] },
                                { $literal: "Video" }, { $literal: "Audio" }]
                            },
                        }
                    },
                    {
                        "$group": {
                            "_id": "$type",
                            "count": { "$sum": 1 }
                        }
                    }
                ], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
        }, function everything(err, results) {

            if (err) {
                data.message = 'user not found';
                res.send(data);
            } else {
                data.status = 1;
                data.response = results;
                res.send(data);
            }

        })

    }
    return router;
};