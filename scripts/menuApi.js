const MENU_WIDTH = "150px";
const MENU_BACKGROUND = "#666633";
const MENU_STYLE_POSITION = "absolute";
const MENU_ITEM_WIDTH = "145px";
const MENU_ITEM_PADDING = "2px 2px";
const MENU_STYLE_PADDING = "0";
const MENU_ITEM_BACKGROUND = "none";
const MENU_ITEM_HOVER_BACKGROUND = "#ffcccc";
const OVERLAY_STYLE_POSITION = "absolute";


export default class MenuApi{

    /**
     * Create new menu
     * @returns {MenuApi}
     */
    createMenu(){
        return new MenuApi();
    }

    /**
     * Create new item
     * @param label: label of menu item
     * @param listener: listener of menu item
     * @return {PopupMenuItem}
     */
     createItem(label, listener){
         return new PopupMenuItem(label, listener);
    }

    /**
     * Create a separator for menu
     * @return {PopupMenuItem}
     */
    createSeparator(){
        return new PopupMenuItem("|", null);
    }

    constructor() {
        this.items = [];
    }

    /**
     * Creates menu as a DOM object
     * @return {HTMLElement}
     */
    render(){
        const menuUlList = document.createElement("ul");
        menuUlList.id = "menu";
        menuUlList.style.padding = MENU_STYLE_PADDING;
        menuUlList.style.background = MENU_BACKGROUND;
        menuUlList.style.width = MENU_WIDTH;

        for (let i in this.items) {
            menuUlList.appendChild(this.items[i].render());
        }

        return menuUlList;
    }

    /**
     * Add new item to menu
     */
    addItem (item) {
        if (item instanceof PopupMenuItem) {
            this.items.push(item);
        }
        else throw new Error('Invalid parameter: each menu item must be an instance PopupMenuItem');
    }

    /**
     * Remove given item from menu
     */
    removeItem (item) {
        if (item instanceof PopupMenuItem) {
            const index = this.items.indexOf(item);
            if (index > -1) {
                this.items.splice(index, 1);
            }
        }
        else throw new Error('Invalid parameter: each menu item must be an instance PopupMenuItem');
    }

    /**
     * Add new item to menu at a given position
     * @param item: item to add
     * @param index: position to add at
     */
    addItemAt (item, index) {
        if (item instanceof PopupMenuItem && typeof (index) === 'number') {
            if (index >= this.items.length) {
                index = this.items.length - 1;
            }
            this.items.splice(index, 0, item);
        }
        else throw new Error('Invalid parameter: each menu item must be an instance PopupMenuItem');
    }

    /**
     * Adds several items to menu at once
     * @param: args: {PopupMenuItem}
     */
    addItems (...args) {
        for (let i in args) {
            if (args[i] instanceof PopupMenuItem) {
                this.addItem(args[i]);
            }
            else throw new Error('Invalid parameter: each menu item must be an instance PopupMenuItem');
        }
    }

    /**
     * Set or remove Overlay
     * @param status: true - sets, false - removes
     */
    setOverlay(status) {
        if (typeof (status) === 'boolean') {
            let overlay = document.getElementById("overlay-disabled");

            if (status) {
                if (!overlay) {
                    let overlay_div = document.createElement("div");
                    overlay_div.id = "overlay-disabled"
                    overlay_div.className = "disabled";
                    overlay_div.style.position = OVERLAY_STYLE_POSITION;
                    overlay_div.style.left = "0";
                    overlay_div.style.top = "0";
                    overlay_div.style.width = "100%";
                    overlay_div.style.height = "100%";
                    document.body.appendChild(overlay_div);

                    overlay_div.addEventListener("click", () => {
                        this.hideMenu();
                    });

                    overlay_div.addEventListener("contextmenu", (event) => {
                        event.preventDefault();
                        this.hideMenu();
                        this.showMenu(event.clientX, event.clientY);
                    });
                }
            } else if (overlay) {
                document.body.removeChild(overlay);
            }
        }
        else throw new Error('Status of overlay must be boolean');
    }
    /**
     * Hides menu
     */
    hideMenu() {
        const menuElement = document.getElementById("menu");

        if (menuElement !== null && menuElement !== undefined) {
            document.body.removeChild(menuElement);
        }
        this.setOverlay(false);
    }

    /**
     * Shows menu
     * @param x: x coordinate of menu position
     * @param y; y coordinate of menu position
     */
    showMenu(x, y) {
        if (typeof(x) !== 'number' && typeof (y) !== 'number') {
            throw new Error('Invalid Parameter: x and y must be an integer');
        }

        //Delete previous menu, if exists
        const prev_menu = document.getElementById("menu");
        const prev_overlay = document.getElementById("overlay-disabled")
        if (prev_menu !== null && prev_menu !== undefined) {
            document.body.removeChild(prev_menu);
            document.body.removeChild(prev_overlay);
            console.log(prev_overlay);
        }

        const menu = this.render();
        menu.style.position = MENU_STYLE_POSITION;
        //Show over other elements
        menu.style.zIndex = "1";
        menu.style.left = x + "px";
        menu.style.top = y + "px";

        this.setOverlay(true);

        document.body.appendChild(menu);
    }



}
class  PopupMenuItem{
    /**
     * Constructor for PopupMenuItem
     * @param label: label of menu item
     * @param listener: listener of menu item
     */
    constructor(label, listener) {
        if(typeof(label)!== "string") {
            throw new Error('Invalid parameter: the label muss to be string');
        }
        else {
            this.label = label;
            this.listener = listener;
        }

    }

    /**
     * Creates menu list items as DOM objects
     * @returns {HTMLLIElement}
     */
    render(){
        const menuList = document.createElement("li");
        menuList.style.listStyle = "none";
        menuList.style.width = MENU_ITEM_WIDTH;
        menuList.style.padding = MENU_ITEM_PADDING;

        if(this.label === "|"){
            menuList.appendChild(document.createElement("hr"));
        }
        else {
            menuList.textContent = this.label;
            menuList.addEventListener("click", this.listener);
            menuList.addEventListener("mouseover" , function (){
                menuList.style.background = MENU_ITEM_HOVER_BACKGROUND;
            },false);

            menuList.addEventListener("mouseout", function(){
                this.style.background = MENU_ITEM_BACKGROUND;
            }, false);
        }

        return menuList;
    }
}