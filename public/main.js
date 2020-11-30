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