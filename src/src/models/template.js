import {Config} from "@/models/config";

export class TemplateGroup{
    constructor(label,icon,style,items) {
        this.label = label;
        this.icon = icon;
        this.style = style;
        this.items = items;
        items.forEach(x=>{
            x.style = style;
        })
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
}