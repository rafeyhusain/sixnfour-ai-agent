import * as path from 'path';
import fs from 'fs';

export type Environment = 'development' | 'production' | 'test';

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

type AdminConfigProps = {
    nodeEnv: Environment;
    host: string;
    port: number;
};

export class AdminConfig implements AdminConfigProps {
    public readonly nodeEnv: Environment;
    public readonly host: string;
    public readonly port: number;
    public readonly auth: Service;
    public readonly dashboard: Service;
    public readonly marketing: Service;

    constructor() {
        this.nodeEnv = process.env.NODE_ENV as Environment || 'development';
        this.host = process.env.HOST || 'localhost';
        this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
        this.auth = new Service(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:5000');
        this.dashboard = new Service(process.env.NEXT_PUBLIC_DASHBOARD_SERVICE_URL || 'http://localhost:5001');
        this.marketing = new Service(process.env.NEXT_PUBLIC_MARKETING_SERVICE_URL || 'http://localhost:5002');
    }

    private static _instance: AdminConfig;

    public static get instance(): AdminConfig {
        if (!AdminConfig._instance) {
            AdminConfig._instance = new AdminConfig();
            console.log(AdminConfig._instance.toString());
        }
        return AdminConfig._instance;
    }

    toString(): string {
        return JSON.stringify({
            nodeEnv: this.nodeEnv,
            host: this.host,
            port: this.port,
            auth: this.auth,
            dashboard: this.dashboard,
            marketing: this.marketing,
        }, null, 2);
    }
}

export const config = AdminConfig.instance;
