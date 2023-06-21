import {Config} from "@/models/config";

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
        this.relate = 'UnitConfig' | 'TableConfig';
        this.options = options;
    }

    static from(other) {
        return Object.move(other, new TemplateItem());
    }
}