import {Config} from "@/models/config";
import {Size} from "@/utils/drawing/size";

export class Page {
    constructor(page) {
        /**
         * @type {Config[]}
         */
        this.configs = page != null ? page.configs : [];
        this.size = page != null ? page.size : new Size(900, 700);
        this.url = page != null ? page.url : '';
    }
}