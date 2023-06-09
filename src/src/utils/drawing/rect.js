import { Point } from "./point";
import { Size } from "./size";
export class Rect {
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get Left() {
        return this.x;
    }

    set Left(value) {
        let right = this.Right;
        if (value > right) {
            this.x = right;
            this.width = value - right;
        } else {
            this.width += this.x - value;
            this.x = value;
        }
    }

    get Top() {
        return this.y;
    }

    set Top(value) {
        let bottom = this.Bottom;
        if (value > bottom) {
            this.y = bottom;
            this.height = value - bottom;
        } else {
            this.height += this.y - value;
            this.y = value;
        }
    }

    get Right() {
        return this.x + this.width;
    }

    set Right(value) {
        if (value < this.x) {
            this.width = this.x - value;
            this.x = value;
        } else {
            this.width = value - this.x;
        }
    }

    get Bottom() {
        return this.y + this.height;
    }

    set Bottom(value) {
        if (value < this.y) {
            this.height = this.y - value;
            this.y = value;
        } else {
            this.height = value - this.y;
        }
    }

    get Width() {
        return this.width;
    }

    set Width(value) {
        this.width = value;
    }

    get Height() {
        return this.height;
    }

    set Height(value) {
        this.height = value;
    }

    get Size() {
        return new Size(this.x, this.y);
    }

    set Size(value) {
        this.width = value.width;
        this.height = value.height;
    }

    get LeftTop() {
        return new Point(this.Left, this.Top);
    }

    set LeftTop(value) {
        this.Left = value.X;
        this.Top = value.Y;
    }

    get RightBottom() {
        return new Point(this.Right, this.Bottom);
    }

    set RightBottom(value) {
        this.Right = value.X;
        this.Bottom = value.Y;
    }

    get LeftBottom() {
        return new Point(this.Left, this.Bottom);
    }

    set LeftBottom(value) {
        this.Left = value.X;
        this.Bottom = value.Y;
    }

    get RightTop() {
        return new Point(this.Right, this.Top);
    }

    set RightTop(value) {
        this.Right = value.X;
        this.Top = value.Y;
    }

    /**
     * 
     * @param {Point} position 
     */
    moveTo(position){
        this.x = position.X;
        this.y = position.Y;
    }
}