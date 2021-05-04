'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const debug = require('debug')('app:server');
const config = require('./config');
const MongoConnect = require('./middleware/mongoservices');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const port = normalizePort(process.env.PORT || config.port);
// const eventAction = require('./api/routes/app-modules/app-event-listener');
app.set('port', config.port);
// const db = require('./middleware/mongoconnector');
var mongo = require('mongodb'), ObjectID = mongo.ObjectID;

// Configuration 
if ('production' == app.settings.env) {
  // app.set('db'    ,'dburilocalhost/mydevdb'); 
} else {
  app.use(logger('dev'));
}


app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }))


// view engine setup
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  req.header('Referer', "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})


// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
//  use Express's caching , if you like:
app.set('view cache', false);

MongoConnect.connect(() => {
  server.listen(config.port);
  console.log('server port:', config.port);
  console.info('Connection to db has been successfully established');
  server.on('error', onError);
  server.on('listening', onListening);

});


app.use('/app', express.static(path.join(__dirname, '/app'), { maxAge: 7 * 86400000 })); // 1 day = 86400000 ms
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), { maxAge: 7 * 86400000 })); // 1 day = 86400000 ms
app.use(express.static(path.join(__dirname, 'public')));
require('./router')(app);


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}

