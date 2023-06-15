import {Rect} from "@/utils/drawing/rect";

export class Unit {
    constructor(unit) {
        this.rectangle = unit != null
            ? unit.rectangle.clone
            : new Rect(0, 0, 0, 0);
        this.rectangle.showDrag = false;
    }

    get clone() {
        return new Unit(this);
    }
}