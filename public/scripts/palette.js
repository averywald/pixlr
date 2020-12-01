// get the initial hexadecimal value from the color picker
let rawColor = document.getElementById('palette').value;
// convert to rgb object
let COLOR = hexToRGB(rawColor);

function setColor() {
    // get the value from the HTML color picker
    let hexColor = document.getElementById('palette').value;
    // convert the hexadecimal values to RGB
    let rgb = hexToRGB(hexColor);
    // set the global color value
    COLOR = rgb;
}

function hexToRGB(hexVal) {
    // grab the hex value couplets, and convert from hex to int
    return {
        r: parseInt(hexVal.slice(1, 3), 16),
        g: parseInt(hexVal.slice(3, 5), 16),
        b: parseInt(hexVal.slice(5, 7), 16)
    };
}
