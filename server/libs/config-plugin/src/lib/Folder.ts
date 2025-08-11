import * as fs from 'fs';
import * as path from 'path';


export class Folder {
    public readonly path: string;
    public readonly absPath: string;

    constructor(relativePath: string) {
        this.path = relativePath;
        this.absPath = path.resolve(relativePath);
        this.ensureExists();
    }

    ensureExists(): void {
        if (!fs.existsSync(this.absPath)) {
            fs.mkdirSync(this.absPath, { recursive: true });
        }
    }

    toString(): string {
        return JSON.stringify({
            path: this.path,
            absPath: this.absPath,
        }, null, 2);
    }
}
