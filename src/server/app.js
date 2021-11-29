const path = require('path/posix');

const cors = require('cors'); // CORS middleware
const express = require('express'); // set up express app
const helmet = require('helmet'); // header security
const morgan = require('morgan'); // request logger

var app = express(); // init express web api

/**
 * NOTE:
 * https://expressjs.com/en/api.html
 * 
 * Once set, the value of app.locals properties persist 
 * throughout the life of the application, 
 * in contrast with res.locals properties that are valid 
 * only for the lifetime of the request.
 */
app.locals.title = 'pixlr';

app.use([
    helmet(), // attach middleware
    morgan('dev'), // attach request logger
    cors(), // attach CORS management
    express.static(path.resolve('src/client')) // set up static file serving root
]);

// serve app root
app.get('/', (req, res) => {

    // specify options to pass with served file
    const options = {
        // root path to serve from
        root: path.resolve('../client'),
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

const dotenv = require('dotenv'); // global vars
dotenv.config(); // allow for .env global imports
const port = process.env.PORT || process.env.ALT_PORT; // specify ports to use

// socket.io server ===========================================================

const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app); // bind express API to web server
const io = new Server(httpServer); // init socket.io server

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

// listen on the port after the express API server
httpServer.listen(port, () => {
    console.log(`listening for requests at port ${port}`);
});

const mongoClient = require('mongodb').MongoClient; // MongoDB hook

function updateClient() {
    // get the canvas master copy
    retrieve().then(data => {
        // send to the client
        io.emit('update', data);
    });
}

async function retrieve() {

    // establish connection to MongoDB
    const client = await mongoClient.connect(process.env.MONGO_URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    // the database we want to use
    const d = client.db(process.env.DB_NAME);
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
        const d = client.db(process.env.DB_NAME);
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
