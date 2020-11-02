const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const bp = require('body-parser');
const dotenv = require('dotenv');

// set up mongodb client object
var mongoClient = require('mongodb').MongoClient;

// allow for .env global imports
dotenv.config();

// initialize express app instance
const app = express();
// attach middleware
app.use(helmet());
// attach request logger
app.use(morgan('dev'));
// attach CORS management
app.use(cors());
// set up JSON formatting for middleware
app.use(bp.json());
// set up static file serving root
app.use(express.static('public'));

// serve app core
app.get('/', (res) => {
    // specify options to pass with served file
    const options = {
        // root path to serve from
        root: __dirname,
        dotfiles: 'deny', // ??
        // response headers
        headers: {
            'x-timestamp': Date.now()
        }
    };

    // serve up pixlpaint html file
    res.sendFile('index.html', options, (err) => {
        if (err) { console.log(err) }
    });
});

// posting a pixl modification event
app.post('/', async (req, res) => {
    try {
        // send client a request receipt
        res.send(req.body);
        // check database for records with the same coordinates
        const filter = { coordinates: { $eq: req.body.coordinates } };
        // connect to database
        const client = await mongoClient.connect(process.env.MONGO_URI,
            { useNewUrlParser: true, useUnifiedTopology: true });
        // select main database
        const d = client.db('pixl');
        // check if pixel exists in database table at the same coordinates
        const result = await d.collection('map').updateOne(filter, { $set: req.body }, { upsert: true });
        // log result action to console
        if (result.matchedCount > 0) {
            console.log(`${result.matchedCount} docs matched; updated ${result.modifiedCount} docs`);
        } else { console.log('created new entry') }
        // close database connection
        client.close();
    } catch (error) {
        console.log(error);
    }
});

// serve index file and send updates from database
app.get('/update', async (req, res, next) => {
    const client = await mongoClient.connect(process.env.MONGO_URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    const d = client.db('pixl');
    const items = await d.collection('map').find({}).toArray();
    console.log(`retreived /update: ${items}`);
            
    client.close();

    res.send(items);
});

// specify ports to use
const port = process.env.PORT || 4200;

// have the app listen to traffic at the set port
app.listen(port, () => {
    // log port listening message to server console
    console.log(`listening at http://localhost:${port}`);
});