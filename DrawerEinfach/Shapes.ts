import {Shape, ShapeFactory, ShapeManager} from "./types.js";
const SelectedColor = '#8b008b';

class Point2D {
    constructor(readonly x: number, readonly y: number) {}
}
class AbstractShape {
    private static counter: number = 0;
    readonly id: number;
    backgroundColor: string = "transparent";
    borderColor: string = "black";
    zOrder: number = 0;
    constructor() {
        this.id = AbstractShape.counter++;
    }
    setZOrder(zOrder:number){
        this.zOrder = zOrder;

    }
}
abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    protected constructor(readonly shapeManager: ShapeManager) {}

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x,y)));
        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x,y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x,y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }

}

export class Line extends AbstractShape implements Shape {
    backgroundColor: string;
    borderColor: string;
    constructor(readonly from: Point2D, readonly to: Point2D){
        super();
    }

    draw(ctx: CanvasRenderingContext2D, select?: boolean, selectedFarbe?: string)  {
        ctx.beginPath();
        const oldStroke = ctx.strokeStyle;
        const oldWidth = ctx.lineWidth;
        if(select && selectedFarbe) {
            ctx.lineWidth = 1;
            ctx.fillStyle = SelectedColor;
            ctx.fillRect(this.from.x - 4, this.from.y - 4 ,8, 8);
            ctx.fillRect(this.to.x - 4, this.to.y - 4 ,8, 8);
        }
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();

        if(this.backgroundColor !== undefined){
            ctx.strokeStyle = this.backgroundColor;
            ctx.stroke();
        }
        if(this.borderColor !== undefined ){
            ctx.strokeStyle = this.borderColor;
            ctx.stroke();
        }

        ctx.strokeStyle = oldStroke;
        ctx.lineWidth = oldWidth;
        ctx.shadowBlur = 0;
    }
    collider(x: number, y: number) {
        //Consideration of tolerance
        let dudFrom: Point2D = new Point2D(this.from.x - 10, this.from.y + 10);
        let dudTo: Point2D = new Point2D(this.to.x + 10, this.to.y - 10);
        if (this.from.y < this.to.y) {
            dudFrom = new Point2D(this.from.x - 10, this.from.y - 10);
            dudTo = new Point2D(this.to.x + 10, this.to.y + 10);
        }

        //Out of bounds collision check
        if(x < dudFrom.x || x > dudTo.x) return false;

        const numerator: number = Math.abs((this.to.y - this.from.y) * x  -  (this.to.x - this.from.x) * y  +  this.to.x*this.from.y - this.to.y *this.from.x);
        const denominator: number = Math.sqrt( Math.pow((this.to.y - this.from.y), 2) +  Math.pow((this.to.x - this.from.x), 2) );
        const dist: number = parseFloat(( numerator / denominator).toPrecision(2));
        return dist <= 15.0;

    }


}
export class LineFactory extends  AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(from, to);
    }

}
class Circle extends AbstractShape implements Shape {
    backgroundColor:string;
    borderColor: string;
    constructor(readonly center: Point2D, readonly radius: number){
        super();
    }
    draw(ctx: CanvasRenderingContext2D,select?: boolean, selectedFarbe?: string) {
        ctx.beginPath();

        const oldStroke = ctx.strokeStyle;
        const oldWidth  = ctx.lineWidth;
        if(select && selectedFarbe) {
            ctx.lineWidth = 1;
            ctx.fillStyle = SelectedColor;
            ctx.fillRect(this.center.x + this.radius - 4, this.center.y - 4 ,8, 8);
            ctx.fillRect(this.center.x - this.radius - 4, this.center.y - 4 ,8, 8);
            ctx.fillRect(this.center.x - 4, this.center.y - this.radius - 4 ,8, 8);
            ctx.fillRect(this.center.x - 4, this.center.y + this.radius - 4 ,8, 8);
        }
        ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
        ctx.stroke();
        if(this.backgroundColor !== undefined){
            ctx.fillStyle = this.backgroundColor;
            ctx.fill();
        }
        if(this.borderColor !== undefined ){
            ctx.strokeStyle = this.borderColor;
            ctx.stroke();
        }

        ctx.strokeStyle = oldStroke;
        ctx.lineWidth = oldWidth;
        ctx.shadowBlur = 0;
    }
    collider(x: number, y: number) {
        const pointNearCenter = Math.pow(x - this.center.x, 2) + Math.pow(y - this.center.y, 2);
        const circleArea = Math.pow(this.radius,2);
        return pointNearCenter <= circleArea;
    }
}
export class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory {
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
class Rectangle extends AbstractShape implements Shape {
    backgroundColor:string;
    borderColor: string;
    constructor(readonly from: Point2D, readonly to: Point2D) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D, select?:boolean, selectedFarbe?: string) {
        ctx.beginPath();

        const oldStroke = ctx.strokeStyle;
        const oldWidth  = ctx.lineWidth;
        if(select && selectedFarbe) {
            ctx.lineWidth = 1;
            ctx.fillStyle = SelectedColor;
            ctx.fillRect(this.from.x - 4, this.from.y - 4 ,8, 8);
            ctx.fillRect(this.from.x - 4, this.to.y - 4 ,8, 8);
            ctx.fillRect(this.to.x - 4, this.from.y - 4 ,8, 8);
            ctx.fillRect(this.to.x - 4, this.to.y - 4 ,8, 8);
        }

        ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
        if(this.backgroundColor !== undefined ){
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        }

        if(this.borderColor !== undefined ){
            ctx.strokeStyle = this.borderColor;
            ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        }

        ctx.strokeStyle = oldStroke;
        ctx.lineWidth = oldWidth;
        ctx.shadowBlur = 0;
    }
    collider(x: number, y: number) {
        return (x >= this.from.x && x <= this.to.x && y >= this.from.y && y <= this.to.y);
    }
}
export class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory{
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(from, to);
    }
}
class Triangle extends AbstractShape implements Shape {
    backgroundColor:string;
    borderColor: string;

    constructor(readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D) {
        super();
    }
    calculateSign (p1x, p1y, p2, p3) {
        return (p1x - p3.x + 10) * (p2.y - p3.y + 10) - (p2.x - p3.x + 10) * (p1y - p3.y + 10);
    }
    draw(ctx: CanvasRenderingContext2D, select?:boolean, selectedFarbe?: string) {
        ctx.beginPath();

        const oldStroke = ctx.strokeStyle;
        const oldWidth  = ctx.lineWidth;
        if(select && selectedFarbe) {
            ctx.lineWidth = 1;
            ctx.fillStyle = SelectedColor;
            ctx.fillRect(this.p1.x - 4, this.p1.y - 4 ,8, 8);
            ctx.fillRect(this.p2.x - 4, this.p2.y - 4 ,8, 8);
            ctx.fillRect(this.p3.x - 4, this.p3.y - 4 ,8, 8);
        }

        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();

        if(this.backgroundColor !== undefined ){
            ctx.fillStyle = this.backgroundColor;
            ctx.fill();
        }

        if(this.borderColor !== undefined ){
            ctx.strokeStyle = this.borderColor;
        }

        ctx.strokeStyle = oldStroke;
        ctx.lineWidth = oldWidth;
        ctx.shadowBlur = 0;
    }
    collider(x: number, y: number) {
        const b1 = this.calculateSign(x, y, this.p1, this.p2) < 0;
        const b2 = this.calculateSign(x, y, this.p2, this.p3) < 0;
        const b3 = this.calculateSign(x, y, this.p3, this.p1) < 0;

        return ((b1 === b2) && (b2 === b3));
    }
}
export class TriangleFactory implements ShapeFactory{
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(
                new Triangle(this.from, this.tmpTo, new Point2D(x,y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x,y);
            this.thirdPoint = new Point2D(x,y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x,y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x,y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }
}
export class SelectionFactory implements ShapeFactory{
    public label: string = "Selektion";

    constructor(readonly shapeManager: ShapeManager) {
    }

    handleMouseDown(x: number, y: number) {
    }

    handleMouseUp(x: number, y: number) {
        this.shapeManager.selectShapeFor(x, y, true);
    }
    handleMouseMove(x: number, y: number) {
        this.shapeManager.selectShapeFor(x, y);
    }
}