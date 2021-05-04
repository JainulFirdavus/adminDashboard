'use strict';

module.exports = {
  // MongoDB connection options
  port: 3000,
  host: 3000,
  mongo: {
    url: 'mongodb://localhost:27017/',
    MongoStore: "mongodb://localhost:27017/",
    name: "mj_dashboard"
  },
  seedDB: true,
  jwt_secret: {
    session: 'DBbFZX3ZsUPRVniUA1Y1020NZzhRasrApsjGlPg2Nq8vB',
    token_expiration: 86400 // expires in 24 hour
  }

};