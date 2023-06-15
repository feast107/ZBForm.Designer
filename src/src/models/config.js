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
        this.region = new Unit(other ? other.region : null);
    }

    get copy(){
        return new UnitConfig(this);
    }
}

export class TableConfig {
    constructor(other) {
        this.type = 'table';
        this.modes = other != null
            ? {
                direction: other.modes.direction,
                configs: other.modes.configs
            }
            : {
                direction: 'horizontal',
                configs: [],
            }
        this.region = new Table(other != null ? other.region : null);
    }

    get copy() {
        return new TableConfig(this);
    }
}