window.onload = () => {

    // socket.io entry point
    const socket = io();

    // the server sends the client the canvas master copy
    socket.on('update', data => {

        data.forEach(pixlObj => renderUpdates(pixlObj));

    });

    // click event listener on the canvas element
    canv.addEventListener('click', (e) => {

        // send the pixel to the server
        socket.emit('click', createPixel(e.clientX, e.clientY, COLOR));

    });

    // the client presses the 'c' key
    document.addEventListener('keypress', (e) => {
        if (e.key === 'c') {
            // toggle div#colorWheel's visibility
            toggleColorWheel();
        }
    });

};