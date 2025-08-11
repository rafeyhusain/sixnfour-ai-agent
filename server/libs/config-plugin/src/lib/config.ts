import * as dotenv from 'dotenv';
import { Folder } from './Folder';
import { Service } from './service';

dotenv.config();

export type Environment = 'development' | 'production' | 'test';

export class Config {
    public readonly nodeEnv: Environment;
    public readonly host: string;
    public readonly port: number;
    public readonly dataPath: string;
    public readonly service: Service;
    public readonly llm: Service;
    public readonly uploadsName: string;
    public readonly serviceName: string;
    public readonly uploads: Folder;
    public readonly data: Folder;
    public readonly logs: Folder;
    public readonly db: Folder;

    constructor() {
        this.nodeEnv = process.env.NODE_ENV as Environment || 'development';
        this.host = process.env.HOST || 'localhost';
        this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
        this.dataPath = process.env.DATA_PATH || '/app/data';
        this.service = new Service(process.env.SERVICE_URL || `http://${this.host}:${this.port}`);
        this.llm = new Service(process.env.LLM_SERVICE_URL || `http://localhost:11434`);
        this.serviceName = process.env.SERVICE_NAME || 'dashboard-service';
        this.uploadsName = process.env.UPLOADS_NAME || 'uploads';

        this.data = new Folder(this.dataPath);
        this.uploads = new Folder(`${this.dataPath}/${this.uploadsName}`);
        this.db = new Folder(`${this.dataPath}/db`);
        this.logs = new Folder(`${this.dataPath}/logs`);
    }

    private static _instance: Config;

    public static get instance(): Config {
        if (!Config._instance) {
            Config._instance = new Config();
            console.log(Config._instance.toString());
        }
        return Config._instance;
    }

    toString(): string {
        return JSON.stringify({
            nodeEnv: this.nodeEnv,
            host: this.host,
            port: this.port,
            dataPath: this.dataPath,
            service: this.service,
            llm: this.llm,
            serviceName: this.serviceName,
            uploadsName: this.uploadsName,
            data: this.data,
            db: this.db,
            uploads: this.uploads,
            logs: this.logs,
        }, null, 2);
    }
}

export const config = Config.instance;
