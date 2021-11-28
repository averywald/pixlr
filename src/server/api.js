const cors = require('cors'); // CORS middleware
const dotenv = require('dotenv'); // global vars
const helmet = require('helmet'); // header security

const morgan = require('morgan'); // request logger
const express = require('express'); // set up express app

// allow for .env global imports
dotenv.config();
// specify ports to use
const port = process.env.ALT_PORT;

let app = express(); // init express web api
app.use([
    helmet(), // attach middleware
    morgan('dev'), // attach request logger
    cors() // attach CORS management
]);
app.use(express.static('public')); // set up static file serving root

// NOTE
// https://expressjs.com/en/api.html:
// Once set, the value of app.locals properties persist throughout the life of the application, 
// in contrast with res.locals properties that are valid only for the lifetime of the request.
app.locals.title = 'pixlr';

// serve app root
app.get('/', (res, req, next) => {

    // specify options to pass with served file
    const options = {
        // root path to serve from
        root: __dirname,
        // response headers
        headers: {
            'x-timestamp': Date.now(),
            'x-content-type': 'application/javascript;'
        }
    };

    // serve up pixlpaint html file
    res.sendFile('index.html', options, (err) => {
        if (err) { console.log(err) }
    });
    
});

// have the app listen to traffic at the set port
app.listen(port, () => {

    // log port listening message to server console
    console.log(`listening at http://localhost:${port}`);

});

// socket.io stuff ==========================================================================

import { app } from './api.js';

const httpServer = require('http').createServer(app); // set up the web server via the express API
const io = require('socket.io')(httpServer); // set up socket io and attach it to the web server
const mongoClient = require('mongodb').MongoClient; // MongoDB hook

// a client connects
io.on('connection', socket => {

    // send the client the current master copy
    updateClient();

    // client clicks somewhere on the canvas
    socket.on('click', data => {
        // update the master canvas copy
        updateMaster(data);

        // send the updates to the client
        updateClient();
    });

});

// 
function updateClient() {
    // get the canvas master copy
    retrieve().then(data => {
        // send to the client
        socket.emit('update', data);
    });
}

async function retrieve() {

    // establish connection to MongoDB
    const client = await mongoClient.connect(process.env.MONGO_URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    // the database we want to use
    const d = client.db('pixl');
    // get the pixel data from the 'map' table
    const items = await d.collection('map').find({}).toArray();
    // close the connection
    client.close();
    // hand off data
    return items;

}

async function updateMaster(data) {

    try {

        // check database for records with the same coordinates
        const filter = { coordinates: { $eq: data.coordinates } };
        // connect to database
        const client = await mongoClient.connect(process.env.MONGO_URI,
            { useNewUrlParser: true, useUnifiedTopology: true });
        // select main database
        const d = client.db('pixl');
        // check if pixel exists in database table at the same coordinates
        const result = await d.collection('map').updateOne(filter, { $set: data }, { upsert: true });
        // log result action to console
        if (result.matchedCount > 0) {
            console.log(`${result.matchedCount} docs matched; updated ${result.modifiedCount} docs`);
        } else { console.log('created new entry') }
        // close database connection
        client.close();

    } catch (error) {

        console.log(error);

    }

}
