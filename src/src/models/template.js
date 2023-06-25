import {Config, TableConfig, UnitConfig} from "@/models/config";

export class TemplateGroup {
    constructor(label, icon, style, items) {
        this.label = label;
        this.icon = icon;
        this.style = style;
        /**
         * @type {TemplateItem[]}
         */
        this.items = items;
        items.forEach(x => {
            x.style = style;
        })
    }

    static from(other) {
        return Object.move(other, new TemplateGroup());
    }
}


export class TemplateItem {
    constructor(label, type, color, relate, options) {
        this.label = label;
        this.type = type;
        this.color = Config.modifyColor(color);
        /**
         * @type {()=>Config}
         */
        this.generate = null;
        this.relate = relate;
        this.options = options;
    }

    static from(other) {
        return Object.move(other, new TemplateItem());
    }

    set relate(value) {
        switch (value) {
            case 'UnitConfig' :
                this.generate = function () {
                    return UnitConfig.fromTemplate(this);
                };
                break;
            case 'TableConfig' :
                this.generate = function () {
                    return TableConfig.fromTemplate(this);
                };
                break;
            default:
                break;
        }
    }
}