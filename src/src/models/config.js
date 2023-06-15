import {TemplateItem} from "./template";
import {Unit} from "@/models/unit";
import {Table} from "@/models/table";

export class UnitConfig {
    /**
     * @param other
     */
    constructor(other) {
        this.type = 'unit';
        this.mode = other ? other.mode : '';
        this.region = other ? other.region.clone : new Unit();
        this.showDrag = false;
    }

    get clone() {
        return new UnitConfig(this);
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
    }
}

export class TableConfig {
    constructor(other) {
        this.type = 'table';
        this.modes = other != null
            ? {
                direction: other.modes.direction,
                configs: other.modes.configs?.copy ?? new Map()
            }
            : {
                direction: 'horizontal',
                configs: new Map(),
            }
        this.region = other != null ? other.region.clone : new Table();
    }

    get clone() {
        return new TableConfig(this);
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
        for (let i = 0; i < this.region.rowDefinitions.length; i++) {
            this.region.rowDefinitions.insert(i, this.region.rowDefinitions.removeAt(i) * rate);
        }
        for (let i = 0; i < this.region.columDefinitions.length; i++) {
            this.region.columDefinitions.insert(i, this.region.columDefinitions.removeAt(i) * rate);
        }
    }
}