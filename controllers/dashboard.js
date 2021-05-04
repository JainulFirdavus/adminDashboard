"use strict";
var db = require("../middleware/mongoconnector")
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../config'); //configuration variables
var mongo = require('mongodb'), ObjectID = mongo.ObjectID;



function generate_token(username) {
    return jwt.sign({
        username: username
    }, config.jwt_secret.session, {
        expiresIn: config.jwt_secret.token_expiration
    });
}


module.exports = function () {

    var router = {};

    router.dashboard_sync = function (req, res) {

        async.parallel({
            setting: function (cb) {
                db.GetOneDoc('settings', { name: 'general' }, {}, (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            usersCount: function (cb) {
                db.AggregationDoc('users', [{ $group: { _id: null, Count: { $sum: 1 } } }], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            chatsCount: function (cb) {
                db.AggregationDoc('chat', [{ $match: { groupId: { $exists: false } } }, { $group: { _id: null, Count: { $sum: 1 } } }], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            group: function (cb) {
                db.AggregationDoc('groups', [
                    { $match: { status: 1 } },
                    { $sort: { created: 1 } },
                    { '$skip': parseInt(0) }, { '$limit': parseInt(5) },

                    { "$unwind": { path: "$members", preserveNullAndEmptyArrays: true } },
                    {
                        "$lookup": {
                            "from": "users",
                            "let": { "users": "$members.userId" },
                            "pipeline": [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$users"] } } },
                                { "$project": { username: 1, image: 1, thumbnail: 1, image: 1 } }
                            ],
                            "as": "users"
                        }
                    },
                    {
                        "$lookup": {
                            "from": "users",
                            "let": { "users": "$userId" },
                            "pipeline": [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$users"] } } },
                                { "$project": { username: 1, image: 1, thumbnail: 1, image: 1 } }
                            ],
                            "as": "createdusers"
                        }
                    },
                    {
                        $group: { _id: '$_id', name: { $first: '$name' }, createdusers: { $first: '$createdusers.username' }, users: { $push: '$users' }, date: { $first: '$created' }, }
                    }], (err, doc) => {
                        if (err) { return cb(null, []); }
                        cb(null, doc);
                    })
            },

            groupsCount: function (cb) {
                db.AggregationDoc('groups', [{ $match: { status: 1 } }, { $group: { _id: null, Count: { $sum: 1 } } }], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            },
            lastUsers: function (cb) {
                db.AggregationDoc('users', [{ $match: { username: { $exists: true } } }, {
                    "$sort": { //stage 2: sort the remainder last-first
                        "created": -1
                    }
                },
                {
                    "$limit": 5 //stage 3: keep only 12 of the descending order subset
                }, { $group: { _id: null, users: { $push: "$$ROOT" }, Count: { $sum: 1 } } }], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })

            },
            usersByCountry: function (cb) {
                db.AggregationDoc('users', [{ "$group": { "_id": null, "count": { "$sum": 1 }, "data": { "$push": "$$ROOT" } } },
                { "$unwind": "$data" },
                {
                    "$group": {
                        "_id": '$data.country', "count": { "$sum": 1 },
                        "total": { "$first": "$count" }
                    }
                },
                {
                    "$project": {
                        "count": 1,
                        "percentage": { "$multiply": [{ "$divide": [100, "$total"] }, "$count"] }

                    }
                }
                ], (err, doc) => {
                    if (err) { return cb(null, []); }
                    cb(null, doc);
                })
            }

        }, function everything(err, results) {
            if (err)
                throw err;

            res.send({
                user: results.user,
                setting: results.setting,
                usersCount: results.usersCount,
                groupsCount: results.groupsCount,
                chatsCount: results.chatsCount,
                lastUsers: results.lastUsers,
                group: results.group,
                usersByCountry: results.usersByCountry
            });
        });

    }

    return router;
};