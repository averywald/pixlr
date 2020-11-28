// pixel width and height (in real pixels)
const PIXELSIZE = 10;

// get the canvas element from DOM
var canv = document.getElementById('pixl');

// resize canvas
canv.width = window.innerWidth;
canv.height = window.innerHeight;

// adjust the pixel's coordinates to conform to grid
function clipClickToBounds(coord) {
    // floor the block coordinate and re-apply coordinate multiple
    return Math.floor(coord / PIXELSIZE) * PIXELSIZE;
}

function getColorIndicesForCoord(x, y) {
    const red = y * (canv.pageX * 4) + x * 4;
    return {
        r: red,
        g: red + 1,
        b: red + 2,
        a: red + 3
    };
}

// initialize a pixel instance based on user input
function createPixel(x, y, color) {
    console.log(color);

    // sanitize coordinates
    let newX = clipClickToBounds(x);
    let newY = clipClickToBounds(y);

    // get the canvas render context
    const context = canv.getContext('2d');
    // create an imagedata object to serve as the "pixel"
    const img = context.createImageData(PIXELSIZE, PIXELSIZE);

    // paint the imagedata nodes with a color value
    for (var i = 0; i < img.data.length; i += 4) {
        img.data[i + 0] = color.r;
        img.data[i + 1] = color.g;
        img.data[i + 2] = color.b;
        img.data[i + 3] = 255; // a
    }

    let pixl = {
        imgData: img,
        coordinates: {
            x: newX,
            y: newY
        },
        bitMapIndices: getColorIndicesForCoord(newX, newY),
        rgbaVals: {
            r: img.data[0],
            g: img.data[1],
            b: img.data[2],
            a: img.data[3]
        }
    };

    return pixl;
}

// request new data from server
async function getUpdates() {
    const newData = await fetch('/update', {
        method: 'GET',
        mode: 'same-origin',
        cache: 'reload',
        referrerPolicy: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    // returns a promise
    return newData.json();
}

function renderUpdates(data) {
    let p = createPixel(data.coordinates.x, data.coordinates.y, data.rgbaVals);
    canv.getContext('2d').putImageData(p.imgData, p.coordinates.x, p.coordinates.y);
 }

// xmlhttp post to server db
async function sendUpdate(pixel) {
    const response = await fetch('/', {
        method: 'POST',
        mode: 'same-origin',
        cache: 'no-cache',
        referrerPolicy: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pixel)
    });
    // returns a promise
    return response.json();
}

window.onload = () => {

    // socket.io entry point
    var socket = io();

    // the server sends the client the canvas master copy
    socket.on('update', data => {

        data.forEach(pixlObj => renderUpdates(pixlObj));

    });

    // click event listener on the canvas element
    canv.addEventListener('click', (e) => {

        // send the pixel to the server
        socket.emit('click', createPixel(e.clientX, e.clientY, COLOR));

    });

};
