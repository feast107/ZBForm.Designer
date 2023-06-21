import {Config, TableConfig, UnitConfig} from "@/models/config";

export class TemplateGroup {
    constructor(label, icon, style, items) {
        this.label = label;
        this.icon = icon;
        this.style = style;
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
    constructor(label, type, color, event, options) {
        this.label = label;
        this.type = type;
        this.color = Config.modifyColor(color)
        this.event = event;
        this.options = options;
    }

    static from(other) {
        return Object.move(other, new TemplateItem());
    }

    set relate(value) {
        switch (value) {
            case 'UnitConfig' :
                this.event = function (configs) {
                    configs.push(UnitConfig.fromTemplate(this))
                };
                break;
            case 'TableConfig' :
                this.event = function (configs) {
                    configs.push(TableConfig.fromTemplate(this))
                };
                break;
        }
    }
}