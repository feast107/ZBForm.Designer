import {TemplateItem} from "./template";
import {Unit} from "@/models/unit";
import {Table} from "@/models/table";
import {Rect} from "@/utils/drawing/rect";

export class Config {
    constructor(template, region) {
        this.id = new Date().getTime()
        this.region = region;
        /**
         * @type {TemplateItem}
         */
        this.template = template;
    }

    get backgroundColor(){
        return this.template.color;
    }
    get type(){
        return this.template.type ?? null;
    }
    get clone() {
        return null;
    }

    get refRect(){
        return null;
    }

    scale(rate = 1) {
    }

    static modifyColor(color){
        if(!color || color.length === 0) color = "#c2c2c2";
        return color.length === 7 ? color + '80' : color;
    }

    static fromTemplate(template){
        let ret = TableConfig.default;
        ret.template = template;
        return ret;
    }
}

export class UnitConfig extends Config {
    /**
     * @param other
     */
    constructor(other) {
        super(other?.template,other ? other.region.clone : new Unit());
        this.mode = other ? other.mode : '';
    }

    get clone() {
        return new UnitConfig(this);
    }

    get refRect(){
        let ret = new UnitConfig(this);
        ret.region = this.region;
        return ret;
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
    }

    static default(template){
        return new UnitConfig({
            template,
            mode: '',
            region: new Unit({
                rectangle: new Rect(50, 50, 50, 50)
            })
        })
    }

    static fromTemplate(template){
        return UnitConfig.default(template);
    }
}

export class TableConfig extends Config {
    constructor(other) {
        super(other?.template,other != null ? other.region.clone : new Table());
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

    get refRect(){
        let ret = new TableConfig(this);
        ret.region = this.region;
        return ret;
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

    static default(template){
        return new TableConfig({
            template,
            modes: {
                direction: 'horizontal',
                configs: new Map(),
            },
            region: new Table({
                rectangle: new Rect(50, 50, 50, 50),
                rowDefinitions: [25],
                columDefinitions: [25]
            })
        });
    }

    static fromTemplate(template){
        return TableConfig.default(template);
    }
}