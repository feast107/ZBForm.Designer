import {Config} from "@/models/config";

export class Page {
    constructor(page) {
        /**
         * @type {Config[]}
         */
        this.configs = page != null ? page.configs : [];
    }
}