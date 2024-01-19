export interface Shape {
    readonly id: number;
    backgroundColor: string;
    borderColor:string;
    zOrder: number;
    draw(ctx: CanvasRenderingContext2D, select?:boolean);
    collider(x: number, y: number); // check, ob eine shape in collision steht.
}

export interface ShapeManager {
    addShape(shape: Shape, redraw?: boolean): this;
    removeShape(shape: Shape, redraw?: boolean): this;
    removeShapeWithId(id: number, redraw?: boolean): this;
    selectShapeFor(x: number, y: number, setSelect?: boolean): this;
    checkSelection(): boolean;

}

export interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number);
    handleMouseUp(x: number, y: number);
    handleMouseMove(x: number, y: number);
}
