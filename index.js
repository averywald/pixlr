// const bp = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
let app = express();

// const helmet = require('helmet');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
// var mongoClient = require('mongodb').MongoClient;
// const morgan = require('morgan');
// const path = require('path');

dotenv.config(); // allow for .env global imports
const port = process.env.PORT || 4200; // specify ports to use

// const app = express(); // initialize express app
// app.use([
//     helmet(), // attach middleware
//     morgan('dev'), // attach request logger
//     cors(), // attach CORS management
//     bp.json() // set up JSON formatting for middleware
// ]);
// app.use('/assets', express.static('node_modules')); // serve node_modules
app.use(express.static('public')); // set up static file serving root

// serve app core
app.get('/', (res) => {
    // specify options to pass with served file
    const options = {
        // root path to serve from
        root: __dirname,
        // dotfiles: 'deny',
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

// posting a pixl modification event
// app.post('/', async (req, res) => {
//     try {
//         // send client a request receipt
//         res.send(req.body);
//         // check database for records with the same coordinates
//         const filter = { coordinates: { $eq: req.body.coordinates } };
//         // connect to database
//         const client = await mongoClient.connect(process.env.MONGO_URI,
//             { useNewUrlParser: true, useUnifiedTopology: true });
//         // select main database
//         const d = client.db('pixl');
//         // check if pixel exists in database table at the same coordinates
//         const result = await d.collection('map').updateOne(filter, { $set: req.body }, { upsert: true });
//         // log result action to console
//         if (result.matchedCount > 0) {
//             console.log(`${result.matchedCount} docs matched; updated ${result.modifiedCount} docs`);
//         } else { console.log('created new entry') }
//         // close database connection
//         client.close();
//     } catch (error) {
//         console.log(error);
//     }
// });

// serve index file and send updates from database
// app.get('/update', async (req, res, next) => {
//     const client = await mongoClient.connect(process.env.MONGO_URI,
//         { useNewUrlParser: true, useUnifiedTopology: true });
//     const d = client.db('pixl');
//     const items = await d.collection('map').find({}).toArray();
//     console.log(`retreived /update: ${items}`);
            
//     client.close();

//     res.send(items);
// });

// a client connects
io.on('connection', socket => {
    socket.emit('update', 'hi from the server'); // send hello message

    // client clicks somewhere on the canvas
    socket.on('click', data => {
        console.log(data);
    });
});

// have the app listen to traffic at the set port
httpServer.listen(port, () => {
    // log port listening message to server console
    console.log(`listening at http://localhost:${port}`);
});