export class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    get Width() {
        return this.width;
    }

    get Height() {
        return this.height;
    }

    set Width(value) {
        this.width = value;
    }

    set Height(value) {
        this.height = value;
    }

    scale(rate) {
        this.width *= rate;
        this.height *= rate;
    }

    get clone() {
        return new Size(this.width, this.height);
    }
}