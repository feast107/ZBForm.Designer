const concat = (a, b) => `${a}/${b}`

export class Url {
    static get Domain() {
        return "http://47.93.86.37:8383";
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
                        let url = this.url
                        return concat(url, 'queryItem');
                    },
                    get queryFormInfo() {
                        let url = this.url;
                        return concat(url, 'queryFormInfo');
                    }
                };
            }
        };
    }
}