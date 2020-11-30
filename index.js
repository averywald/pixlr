const cors = require('cors'); // CORS middleware
const dotenv = require('dotenv'); // global vars
const helmet = require('helmet'); // header security
let mongoClient = require('mongodb').MongoClient; // MongoDB hook
const morgan = require('morgan'); // request logger

// set up express app
const express = require('express');
let app = express();

// set up the web server
const httpServer = require('http').createServer(app);
// set up socket io and attach it to the web server
const io = require('socket.io')(httpServer);

// allow for .env global imports
dotenv.config();
// specify ports to use
const port = process.env.ALT_PORT;

app.use([
    helmet(), // attach middleware
    morgan('dev'), // attach request logger
    cors() // attach CORS management
]);
app.use(express.static('public')); // set up static file serving root

// serve app core
app.get('/', (res) => {

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

// a client connects
io.on('connection', socket => {

    // 
    function updateClient() {
        // get the canvas master copy
        retrieve().then(data => {
            // send to the client
            socket.emit('update', data);
        });
    }

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

// have the app listen to traffic at the set port
httpServer.listen(port, () => {

    // log port listening message to server console
    console.log(`listening at http://localhost:${port}`);

});
