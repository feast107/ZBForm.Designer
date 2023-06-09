// noinspection JSVoidFunctionReturnValueUsed

export default (function () {
    let copy;
    copy = (from, to) => {
        let c = copy;
        Object.keys(from).forEach(k => {
            let tar = from[k];
            if (typeof (tar) == 'object') {
                to[k] = tar.copy;
            } else {
                to[k] = from[k];
            }
        });
    };
    /**
     * Remove specified target
     * @param {any} item
     */
    Array.prototype.remove = function (item) {
        let index = this.findIndex((x) => Object.is(x, item));
        return index >= 0 ? this.splice(index, 1)[0] : false;
    };
    Object.defineProperty(Object.prototype,'serialize',{
        get: function (){
            return JSON.stringify(this);
        }
    })
    Object.defineProperty(Object.prototype, "copy", {
        get: function () {
            let ret;
            if (this instanceof Array) {
                ret = [];
                this.forEach((x) => {
                    ret.push(x);
                });
            } else if (this instanceof Map) {
                ret = new Map();
                let tmp = Object.fromEntries(this);
                Object.keys(tmp).forEach((k) => {
                    ret.set(k, tmp[k]);
                });
                this.forEach((v, k) => ret.set(k, v))
            } else {
                ret = {};
                ret.__proto__ = this.__proto__;
            }
            copy(this, ret);
            return ret;
        },
        set: (_) => {
        },
    });
    Object.move = (from, to) => {
        Object.keys(from).forEach(prop => {
            to[prop] = from[prop];
        })
        return to;
    }
    Date.prototype.timestamp = function () {
        return this - new Date(1970);
    };
    Promise.prototype.result = async function () {
        try {
            let ret = await this;
            if (ret.status === 200) {
                ret = ret.data;
                let getter = {
                    get: function () {
                        return this.code === 1;
                    },
                };
                Object.defineProperty(ret, "Success", getter);
                Object.defineProperty(ret, "success", getter);
            }
            return ret;
        } catch (e) {
            return {
                get Success() {
                    return false;
                },
                code: 0,
                msg: e,
                data: null,
            };
        }
    };
    Number.prototype.round = function (){
        return this.toFixed().toInt();
    }
    String.prototype.deserialize = function(type = null){
        let ret = JSON.parse(this);
        if (type) {
            if (typeof type == 'function') {
                ret.__proto__ = type.prototype;
            } else {
                ret.__proto__ = type;
            }
        }
        return ret;
    }
    window.Demo = class {
        get value() {
            console.log("this is getter");
            return new Demo();
        }

        set value(value) {
            console.log("this is setter");
        }
    }
})();
