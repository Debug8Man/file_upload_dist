declare class _Config {
    port: number;
    upload_fullpath_admin: string;
    upload_fullpath_admin_temp: string;
    upload_url_admin: string;
    minio_endpoint: string;
    minio_port: number;
    minio_use_ssl: boolean;
    minio_access_key: string;
    minio_secret_key: string;
    minio_domain: string;
    isOnline: boolean;
    initConifig(config: any): void;
}
export declare let AppConfig: _Config;
export {};
