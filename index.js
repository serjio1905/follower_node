require('dotenv').config()
const express = require('express');
let cors = require('cors')
let bodyParser = require('body-parser')
const app = express();
const routes = require('./routes');
const proxy = require('http-proxy-middleware');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(proxy('*', { target: 'http://localhost:5000/' }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors())
app.use('/', routes);
console.log(`PORT: ${process.env.PORT}`)
app.listen(process.env.PORT, () => {
    console.log(`SERVER STARTED ON PORT ${process.env.PORT}`)
});