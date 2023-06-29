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
                    get template(){
                        let url = this.url
                        let route = 'template'
                        return {
                            route,
                            url : concat(url,route),
                            get saveTemplate(){ return concat(this.url, 'saveTemplate') },
                            get deleteTemplate(){ return concat(this.url, 'deleteTemplate') }
                        };
                    },
                    get queryItem() {return concat(this.url, 'queryItem');},
                    get queryFormInfo() {return concat(this.url, 'queryFormInfo');},
                    get design() {
                        let route = 'design';
                        let url = this.url;
                        return {
                            route,
                            url: concat(url, 'design'),
                            get saveConfig() {return concat(this.url, 'saveConfig');},
                            get saveInfo() {return concat(this.url, 'saveInfo');},
                            get queryInfo() {return concat(this.url, 'queryInfo');}
                        };
                    }
                };
            }
        };
    }
}