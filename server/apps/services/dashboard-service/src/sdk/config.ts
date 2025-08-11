import * as dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';

dotenv.config();

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

type DashboardConfig = {
    nodeEnv: Environment;
    host: string;
    port: number;
    dataPath: string;
    serviceUrl: string;
};

export class DashboardServiceConfig implements DashboardConfig {
    public readonly nodeEnv: Environment;
    public readonly host: string;
    public readonly port: number;
    public readonly dataPath: string;
    public readonly serviceUrl: string;
    public readonly uploadsName: string;
    public readonly serviceName: string;
    public readonly uploads: Folder;
    public readonly data: Folder;
    public readonly logs: Folder;
    public readonly db: Folder;

    constructor() {
        this.nodeEnv =
            (process.env.NODE_ENV as Environment) ||
            'development';
        this.host = process.env.HOST || 'localhost';
        this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
        this.dataPath = process.env.DATA_PATH || '/app/data';
        this.serviceUrl = process.env.SERVICE_URL || `http://${this.host}:${this.port}`;

        this.serviceName = process.env.SERVICE_NAME || 'dashboard-service';
        this.uploadsName = process.env.UPLOADS_NAME || 'uploads';
        this.data = new Folder(this.dataPath);
        this.uploads = new Folder(`${this.dataPath}/${this.uploadsName}`);
        this.db = new Folder(`${this.dataPath}/db`);
        this.logs = new Folder(`${this.dataPath}/logs`);
    }

    private static _instance: DashboardServiceConfig;

    public static get instance(): DashboardServiceConfig {
        if (!DashboardServiceConfig._instance) {
            DashboardServiceConfig._instance = new DashboardServiceConfig();
            console.log(DashboardServiceConfig._instance.toString());
        }
        return DashboardServiceConfig._instance;
    }

    toString(): string {
        return JSON.stringify({
            nodeEnv: this.nodeEnv,
            host: this.host,
            port: this.port,
            dataPath: this.dataPath,
            serviceUrl: this.serviceUrl,
            serviceName: this.serviceName,
            uploadsName: this.uploadsName,
            data: this.data,
            db: this.db,
            uploads: this.uploads,
            logs: this.logs,
        }, null, 2);
    }
}

export const config = DashboardServiceConfig.instance;
