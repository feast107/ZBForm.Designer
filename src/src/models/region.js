import {Rect} from "@/utils/drawing/rect";

export class Region {
    constructor(other) {
        this.layer = other ? other.layer ?? 100 : 100;
        /**
         * @type {Rect}
         */
        this.rectangle = other
            ? other.rectangle?.clone ?? Region.defaultRect
            : Region.defaultRect;
        this.showDrag = false;
    }

    static get MinLayer(){ return 100; }
    static get MaxLayer(){ return 999; }

    static get defaultRect(){
        if(Region.pos === 60){
            Region.pos = 50;
        }else{
            Region.pos += 2;
        }
        return new Rect(Region.pos ,Region.pos ,30,30);
    }

    static pos = 50;
}

export class Unit extends Region {
    constructor(unit) {
        super(unit);
    }

    get clone() {
        return new Unit(this);
    }
}


export class Table extends Region {
    constructor(table) {
        super(table);
        if (table) {
            this.columDefinitions = table.columDefinitions.copy;
            this.rowDefinitions = table.rowDefinitions.copy;
        } else {
            this.columDefinitions = [];
            this.rowDefinitions = [];
        }
    }

    getCells(scale = 1) {
        return this.getMatrix(scale).aggregate([], (arr, cur) => arr.concat(cur));
    }

    getMatrix(scale = 1) {
        let ret = [];
        for (let row = 0; row <= this.rowDefinitions.length; row++) {
            let cache = [];
            let top, height;
            if (row === this.rowDefinitions.length) {
                top = this.rowDefinitions.last() ?? 0;
                height = this.rectangle.Height - top;
            } else {
                top = row === 0 ? 0 : this.rowDefinitions[row - 1];
                height = this.rowDefinitions[row] - top;
            }
            top += this.rectangle.Top;
            for (let col = 0; col <= this.columDefinitions.length; col++) {
                let left, width;
                if (col === this.columDefinitions.length) {
                    left = this.columDefinitions.last() ?? 0;
                    width = this.rectangle.Width - left;
                } else {
                    left = col === 0 ? 0 : this.columDefinitions[col - 1];
                    width = this.columDefinitions[col] - left;
                }
                left += this.rectangle.Left;
                cache.push({
                    rectangle: new Rect(
                        left * scale,
                        top * scale,
                        width * scale,
                        height * scale),
                    row,
                    col
                });
            }
            ret.push(cache);
        }
        return ret;
    }

    get clone() {
        return new Table(this);
    }

    get refRectangle() {
        const ret = this.clone;
        ret.rectangle = this.rectangle;
        return ret;
    }
}