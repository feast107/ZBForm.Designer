import {Rect} from "@/utils/drawing/rect";

export class Unit {
    constructor(unit) {
        this.rectangle = unit
            ? unit.rectangle.copy
            : new Rect(0, 0, 0, 0);
    }

    get copy() {
        return new Unit(this);
    }
}