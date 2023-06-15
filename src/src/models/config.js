import {TemplateItem} from "./template";
import {Unit} from "@/models/unit";
import {Table} from "@/models/table";

export class Config {
    constructor(type, region) {
        this.type = type;
        this.region = region;
    }

    get clone() {return null;}

    scale(rate = 1) {}
}

export class UnitConfig extends Config {
    /**
     * @param other
     */
    constructor(other) {
        super('unit', other ? other.region.clone : new Unit());
        this.mode = other ? other.mode : '';
    }

    get clone() {
        return new UnitConfig(this);
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
    }
}

export class TableConfig extends Config {
    constructor(other) {
        super('table', other != null ? other.region.clone : new Table());
        this.modes = other != null
            ? {
                direction: other.modes.direction,
                configs: other.modes.configs?.copy ?? new Map()
            }
            : {
                direction: 'horizontal',
                configs: new Map(),
            }
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