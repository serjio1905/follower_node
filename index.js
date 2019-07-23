require('dotenv').config()
const express = require('express');
let bodyParser = require('body-parser')
const app = express();
const routes = require('./routes');

app.use(bodyParser.json());
app.use('/', routes);

app.listen(process.env, () => {
    console.log(`SERVER STARTED ON PORT ${process.env.PORT}`)
});