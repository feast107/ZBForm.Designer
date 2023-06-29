import {TemplateItem} from "./template";
import {Unit, Table} from "@/models/region";
import {Rect} from "@/utils/drawing/rect";

export class Config {
    /**
     * @param {TemplateItem} template
     * @param {Unit | Table} region
     * @param {String} comment
     */
    constructor(template, region, comment) {
        this.id = new Date().getTime().toString().substring(4);
        this.name = `${template.type}${this.id}`;
        this.region = region;
        this.template = template;
        this.comment = comment;
    }

    get backgroundColor() {
        return this.template.color;
    }

    get type() {
        return this.template.type ?? null;
    }

    get clone() {
        return null;
    }

    get refRect() {
        return null;
    }

    scale(rate = 1) {
    }

    round() {
    }

    static modifyColor(color) {
        if (!color || color.length === 0) color = "#c2c2c2";
        return color.length === 7 ? color + '80' : color;
    }

    static fromTemplate(template) {
        return null;
    }

    static get UnitConfig() {
        return "UnitConfig";
    }

    static get TableConfig() {
        return "TableConfig";
    }

    /**
     * @param {[]} rawConfigs
     */
    static setProto(rawConfigs) {
        rawConfigs.forEach(c => {
            if (!c.modes) {
                c.__proto__ = UnitConfig.prototype;
                c.region.__proto__ = Unit.prototype;
            } else {
                c.__proto__ = TableConfig.prototype;
                c.region.__proto__ = Table.prototype;
            }
            c.region.rectangle.__proto__ = Rect.prototype;
            c.template.__proto__ = TemplateItem.prototype;
        })
    }
}

export class UnitConfig extends Config {
    /**
     * @param other
     */
    constructor(other) {
        super(other?.template,
            other ? other.region.clone : new Unit(),
            other ? other.comment : '');
        if (other.mode) {
            this.mode = other.mode;
        }
    }

    get clone() {
        return new UnitConfig(this);
    }

    get refRect() {
        let ret = new UnitConfig(this);
        ret.region = this.region;
        return ret;
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
    }

    round() {
        this.region.rectangle.round();
    }

    static default(template) {
        return new UnitConfig({
            template,
            mode: '',
            comment: '',
            region: new Unit({})
        })
    }

    static fromTemplate(template) {
        return [UnitConfig.default(template)];
    }
}

export class TableConfig extends Config {
    constructor(other) {
        super(other?.template,
            other != null ? other.region.clone : new Table(),
            other ? other.comment : '');
        this.modes = other != null
            ? {
                direction: other.modes.direction,
                configs: other.modes.configs?.copy ?? {}
            }
            : {
                direction: 'horizontal',
                configs: {},
            }
    }

    get clone() {
        return new TableConfig(this);
    }

    get refRect() {
        let ret = new TableConfig(this);
        ret.region = this.region;
        return ret;
    }

    scale(rate = 1) {
        this.region.rectangle.scale(rate);
        for (let i = 0; i < this.region.rowDefinitions.length; i++) {
            this.region.rowDefinitions.insert(i, (this.region.rowDefinitions.removeAt(i) * rate).round());
        }
        for (let i = 0; i < this.region.columDefinitions.length; i++) {
            this.region.columDefinitions.insert(i, (this.region.columDefinitions.removeAt(i) * rate).round());
        }
    }

    round() {
        this.region.rectangle.round();
    }

    static default(template) {
        return new TableConfig({
            template,
            comment: '',
            modes: {
                direction: 'horizontal',
                configs: {},
            },
            region: new Table({
                rowDefinitions: [15],
                columDefinitions: [15]
            })
        });
    }

    static fromTemplate(template) {
        return [TableConfig.default(template)];
    }

    static get Horizontal() {
        return 'horizontal';
    }

    static get Vertical() {
        return 'vertical';
    }

    static get type() {
        return "BG";
    }
}
