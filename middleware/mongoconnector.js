
var db = require('../middleware/mongoservices');

const AggregationDoc = (model, query, callback) => {
    db.get().collection(model).aggregate(query).toArray(function (err, docs) {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }
    });

}

const GetOneDoc = (model, query, projection, callback) => {
    db.get().collection(model).findOne(query, { projection: projection }, (err, docs) => {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }
    });

}

const GetDocs = (model, query, projection, callback) => {
    db.get().collection(model).find(query, { projection: projection }).toArray((err, docs) => {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }

    });

}

const UpdateDoc = (model, criteria, doc, options, callback) => {
    db.get().collection(model).updateOne(criteria, doc, options, (err, docs) => {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs.result);
        }
    });
}



const UpdateDocMany = (model, criteria, doc, callback) => {
    db.get().collection(model).updateMany(criteria, doc, (err, docs) => {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs.result);
        }
    });
}


const FindOneAndUpdateDoc = (model, criteria, doc, options, callback) => {

    db.get().collection(model).findOneAndUpdate(criteria, doc, options, (err, docs) => {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }
    });
}


const InsertDoc = (model, docs, callback) => {

    db.get().collection(model).insertOne(docs, function (err, result) {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }
    })

}



const DeleteDoc = (model, docs, callback) => {

    db.get().collection(model).remove(docs, function (err, result) {
        if (err) {
            callback(err, docs);
        } else {
            callback(err, docs);
        }
    })

}

module.exports = {
    // "FindDocument": FindDocument,
    "AggregationDoc": AggregationDoc,
    "GetOneDoc": GetOneDoc,
    "GetDocs": GetDocs,
    "UpdateDoc": UpdateDoc,
    "UpdateDocMany": UpdateDocMany,
    "InsertDoc": InsertDoc,
    "FindOneAndUpdateDoc": FindOneAndUpdateDoc,
    "DeleteDoc": DeleteDoc
};
