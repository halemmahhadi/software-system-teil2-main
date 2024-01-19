import MenuApi from "./menuApi.js";


let myMenuApi = new MenuApi();
const menu = setupContextMenu(myMenuApi);

const myCanvas = document.getElementById("canvas");
let coords_array = [];

myCanvas.addEventListener("mousemove", displayCoords, false);
myCanvas.addEventListener("mousedown", printCoords, false);
myCanvas.addEventListener("mouseout", clearCoords, false);


myCanvas.addEventListener('contextmenu',  e => {
    e.preventDefault();
    e.stopPropagation();
    menu.showMenu(e.clientX, e.clientY);
}, true);


//Function to show coordinates of mouse inside the canvas
function displayCoords(event) {
    let offsetRect = event.target.getBoundingClientRect();
    const x = event.clientX - offsetRect.left;
    const y = event.clientY - offsetRect.top;
    const coords = "X: " + x + ", Y: " + y;
    document.getElementById("display-coords").innerHTML = coords;
}

//Function to clear coordinates of mouse, when mouse is outside the canvas
function clearCoords() {
    document.getElementById("display-coords").innerHTML = "";
}

//Function to print coordinates of mouse, when clicked inside of canvas
function printCoords(event) {
    let offsetRect = event.target.getBoundingClientRect();
    const x = event.clientX - offsetRect.left;
    const y = event.clientY - offsetRect.top;
    const coords = "X: " + x + ", Y: " + y;
    coords_array.push(coords);
    document.getElementById("print-coords").innerHTML = "Coordinates:" + '<br>' + coords_array.join('<br>');
}

//Function to set up context menu
function setupContextMenu(myMenuApi){
    const menu = myMenuApi.createMenu();
    const mItem1 = myMenuApi.createItem("Item 1", (event) => {
        console.log("Item 1");
        menu.hideMenu();
    });
    const mItem2 = myMenuApi.createItem("Item 2", () => {
        console.log("Item 2");
        menu.hideMenu();
    });
    const mSep1 = myMenuApi.createSeparator();
    const mItem3 = myMenuApi.createItem("Item 3", () => {
        console.log("Item 3");
        menu.hideMenu();
    });

    menu.addItems(mItem1, mItem2);
    menu.addItem(mSep1);
    menu.addItem(mItem3);

    return menu;
}