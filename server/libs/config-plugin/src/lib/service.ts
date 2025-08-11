
export class Service {
    public readonly url: string;

    constructor(url: string) {
        this.url = url;
    }

    toString(): string {
        return JSON.stringify({
            url: this.url
        }, null, 2);
    }
}
