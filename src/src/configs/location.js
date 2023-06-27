const concat = (a, b) => `${a}/${b}`

export class Url {
    static get Domain() {
        return "";
    }

    static get authservice() {
        let route = "authservice";
        return {
            route,
            url: concat('', route),
            get admin() {
                let url = this.url;
                let route = 'admin';
                return {
                    route,
                    url: concat(url, route),
                    get queryItem() {
                        return concat(this.url, 'queryItem');
                    },
                    get queryFormInfo() {
                        return concat(this.url, 'queryFormInfo');
                    },
                    get design() {
                        let url = concat(this.url, 'design');
                        return {
                            url,
                            get saveConfig() {
                                return concat(this.url, 'saveConfig');
                            },
                            get saveInfo() {
                                return concat(this.url, 'saveInfo');
                            }
                        };
                    }
                };
            }
        };
    }
}