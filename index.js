require('dotenv').config()
const express = require('express');
let cors = require('cors')
let bodyParser = require('body-parser')
const app = express();
const routes = require('./routes');

app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);
console.log(`PORT: ${process.env.PORT}`)
app.listen(process.env.PORT, () => {
    console.log(`SERVER STARTED ON PORT ${process.env.PORT}`)
});