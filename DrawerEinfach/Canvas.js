import { MenuApi } from "./PopupMenuApi.js";
export class Canvas {
    constructor(canvasDomElement, toolarea) {
        this.shapes = {};
        this.isMarked = false;
        this.iterated = false;
        this.allSelectedShapes = [];
        let self = this;
        const { width, height } = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove", createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown", createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup", createMouseHandler("handleMouseUp"));
        canvasDomElement.addEventListener("contextmenu", function (event) {
            let x = event.clientX;
            let y = event.clientY;
            event.preventDefault();
            menu.show(x, y);
            setInterval(function () {
                let radiosHinter = document.getElementsByName("Hintergrundfarbe");
                let radiosRand = document.getElementsByName("Randfarbe");
                radiosHinter.forEach(radio => radio.onclick = function () {
                    self.fillBackColorSelectedShapes(radio.className);
                });
                radiosRand.forEach(radio => radio.onclick = function () {
                    self.fillRandColorSelectedShapes(radio.className);
                });
            }, 3);
            //menu.show( x, y);
        });
        canvasDomElement.addEventListener("click", function (event) {
            let x = event.clientX;
            let y = event.clientY;
            event.preventDefault();
            menu.hide();
        });
        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 17) {
                self.isMarked = true;
            }
            else if (e.keyCode === 18) {
                self.iterated = true;
            }
        });
        document.addEventListener("keyup", function (e) {
            self.isMarked = false;
            self.iterated = false;
        });
        function createMouseHandler(methodName) {
            return function (e) {
                e = e || window.event;
                if ('object' === typeof e) {
                    const btnCode = e.button, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            };
        }
        function setupContextMenu(self) {
            const menu = new MenuApi();
            const menuItem1 = MenuApi.createRadioOption("Hintergrundfarbe", { "rot": "#ff0000",
                "gelb": "#ffff00",
                "grün": "#008000",
                "schwarz": "#000000",
                "blue": "#0000ff",
                "transparent": "transparent"
            }, "");
            const menuItem3 = MenuApi.createRadioOption("Randfarbe", { "rot": "#ff0000",
                "gelb": "#ffff00",
                "grün": "#008000",
                "schwarz": "#000000",
                "blue": "#0000ff",
                "transparent": "transparent"
            }, "");
            /**
             * Move the shape forward.
             */
            const menuItem4 = MenuApi.createItem("+Z-Order ", (m) => {
                for (let id in this.allSelectedShapes) {
                    this.shapes[this.allSelectedShapes[id]].zOrder++;
                }
                menu.hide(); // Here , we just want to hide the menu
            });
            /**
             * Shifting the shape backwards.
             */
            const menuItem5 = MenuApi.createItem("- Z-Order ", (m) => {
                for (let id in this.allSelectedShapes) {
                    this.shapes[this.allSelectedShapes[id]].zOrder--;
                }
                menu.hide(); // Here , we just want to hide the menu
            });
            const menuItem = MenuApi.createSeparator();
            /**
             * Delete Shapes
             */
            const menuItem2 = MenuApi.createItem("Löschen ", (m) => {
                self.removeSelectedShapes();
                menu.hide(); // Here , we just want to hide the menu
            });
            menu.addItems(menuItem1);
            menu.addItem(menuItem);
            menu.addItems(menuItem3);
            menu.addItem(menuItem);
            menu.addItems(menuItem4);
            menu.addItem(menuItem);
            menu.addItems(menuItem5);
            menu.addItem(menuItem);
            menu.addItems(menuItem2);
            return menu;
        }
        const menu = setupContextMenu(this);
    }
    draw() {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();
        // draw shapes
        this.ctx.fillStyle = 'black';
        var ordered_shapes = Object.keys(this.shapes).sort((a, b) => { return this.shapes[a].zOrder - this.shapes[b].zOrder; }).reduce((obj, id) => {
            this.ctx.fillStyle = this.shapes[id].fillColor;
            this.ctx.strokeStyle = this.shapes[id].borderColor;
            this.shapes[id].draw(this.ctx, this.allSelectedShapes.some(key => key == this.shapes[id].id));
            obj[id] = this.shapes[id];
            return obj;
        }, {});
        return this;
    }
    selectShapeFor(x, y, setSelect = false) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        let allSelectedShapes = [];
        const self = this;
        Object.keys(this.shapes).forEach(function (id, pos) {
            if (self.shapes[id].collider(x, y)) {
                allSelectedShapes.push(+id);
                const nextCollider = ((pos + 1) * 13) % 60;
                self.shapes[id].draw(self.ctx, true, nextCollider);
            }
            else {
                self.shapes[id].draw(self.ctx);
            }
        });
        if (setSelect && allSelectedShapes.length > 0) {
            if (this.allSelectedShapes.length === 0) {
                this.allSelectedShapes.push(allSelectedShapes[allSelectedShapes.length - 1]);
            }
            else {
                // load last selected element
                const lastSel = this.allSelectedShapes[this.allSelectedShapes.length - 1];
                // check for ctrl-key being pressed
                if (this.iterated) {
                    if (!this.isMarked) {
                        this.allSelectedShapes = [];
                    }
                    // choose next
                    let curIn = allSelectedShapes.lastIndexOf(lastSel);
                    console.log(curIn);
                    // selected shape is not part of selectables push first new
                    if (curIn < 0) {
                        this.allSelectedShapes.push(allSelectedShapes[allSelectedShapes.length - 1]);
                    }
                    else {
                        curIn += 2;
                        if (allSelectedShapes.length <= curIn) {
                            curIn %= allSelectedShapes.length;
                        }
                        this.allSelectedShapes.push(allSelectedShapes[curIn]);
                    }
                }
                else {
                    if (!this.isMarked) {
                        this.allSelectedShapes = [];
                        this.allSelectedShapes.push(allSelectedShapes[allSelectedShapes.length - 1]);
                    }
                    else {
                        this.allSelectedShapes.push(allSelectedShapes[allSelectedShapes.length - 1]);
                    }
                }
            }
        }
        // the focus is on chosen items
        let j = 0;
        for (j; j < this.allSelectedShapes.length; j++) {
            this.shapes[this.allSelectedShapes[j]].draw(this.ctx, true);
        }
        return this;
    }
    addShape(shape, redraw = true) {
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    }
    checkSelection() {
        return (this.allSelectedShapes.length > 0);
    }
    removeSelectedShapes() {
        for (let i = 0; i < this.allSelectedShapes.length; i++) {
            this.removeShapeWithId(this.allSelectedShapes[i]);
        }
        this.allSelectedShapes = [];
    }
    removeShape(shape, redraw = true) {
        const id = shape.id;
        delete this.shapes[id];
        return redraw ? this.draw() : this;
    }
    removeShapeWithId(id, redraw = true) {
        delete this.shapes[id];
        return redraw ? this.draw() : this;
    }
    fillBackColorSelectedShapes(backgroundColor) {
        for (let i = 0; i < this.allSelectedShapes.length; i++) {
            let id = this.allSelectedShapes[i];
            this.shapes[id].backgroundColor = backgroundColor;
            this.shapes[id].draw(this.ctx, true);
        }
    }
    fillRandColorSelectedShapes(borderColor) {
        for (let i = 0; i < this.allSelectedShapes.length; i++) {
            let id = this.allSelectedShapes[i];
            this.shapes[id].borderColor = borderColor;
            this.shapes[id].draw(this.ctx, true);
        }
    }
}
//# sourceMappingURL=Canvas.js.map