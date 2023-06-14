export class Point {
    /**
     *
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    set X(value) {
        this.x = value;
    }

    set Y(value) {
        this.y = value;
    }

    /**
     *
     * @param {Point} another
     */
    distanceTo(another) {
        let xd = this.x - another.x;
        let yd = this.y - another.y;
        return Math.sqrt(xd * xd + yd * yd);
    }

    resize(rate){
        this.x *= rate;
        this.y *= rate;
    }
}