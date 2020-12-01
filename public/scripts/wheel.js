let colorWheel = document.getElementById('colorWheel');

// fill color wheel with color divs
for (var i = 0; i < 15; i++) {
    // create new div element
    let div = document.createElement('div');
    // add to 'wheel' class
    div.className = 'wheel';
    // give it a color
    div.style.backgroundColor = pickColor();
    // add to DOM
    colorWheel.appendChild(div);
}

// temporary function until the coloring scheme is built
function pickColor() {
    let r = Math.floor(Math.random() * Math.floor(4));
    let color;
    switch (r) {
        case 1:
            color = 'blue';
            break;
        case 2:
            color = 'red';
            break;
        case 3:
            color = 'yellow';
            break;
        case 4:
            color = 'green';
            break;
        default:
            color = 'orange';
            break;
    }
    return color;
}

function toggleColorWheel() {
    if (colorWheel.style.display === 'none') {
        // show it
        colorWheel.style.display = 'block';
    } else {
        // hide it
        colorWheel.style.display = 'none';
    }
}
