import {Rect} from "@/utils/drawing/rect";

export class Table {
    constructor(table) {
        if (table) {
            this.columDefinitions = table.columDefinitions;
            this.rowDefinitions = table.rowDefinitions;
            this.rectangle = table.rectangle;
        } else {
            this.columDefinitions = [];
            this.rowDefinitions = [];
            this.rectangle = new Rect(0, 0, 0, 0);
        }
    }

    getCells() {
        return this.getMatrix().aggregate([], (arr, cur) => arr.concat(cur));
    }

    getMatrix() {
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
                    rectangle : new Rect(left, top, width, height), row, col
                });
            }
            ret.push(cache);
        }
        return ret;
    }
}