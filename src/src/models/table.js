import {Rect} from "@/utils/drawing/rect";

export class Table {
    constructor(table) {
        if (table) {
            this.columDefinitions = table.columDefinitions.copy;
            this.rowDefinitions = table.rowDefinitions.copy;
            this.rectangle = table.rectangle.copy;
        } else {
            this.columDefinitions = [];
            this.rowDefinitions = [];
            this.rectangle = new Rect(0, 0, 0, 0);
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
                    row: row * scale,
                    col: col * scale
                });
            }
            ret.push(cache);
        }
        return ret;
    }

    copy(){
        return new Table(this);
    }
}