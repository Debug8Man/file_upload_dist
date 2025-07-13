"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
class _Config {
    port = 2052;
    upload_fullpath_admin = "/wwwroot/uploads/u";
    upload_fullpath_admin_temp = "/wwwroot/uploads/u_temp";
    upload_url_admin = "https://localhost:9999/superapi/uploads/u";
    minio_endpoint = "localhost";
    minio_port = 8080;
    minio_use_ssl = false;
    minio_access_key = "your_minio_access_key";
    minio_secret_key = "your_minio_secret_key";
    minio_domain = "f1.dl-invest.online";
    isOnline = true;
    initConifig(config) {
        console.error("init config", config);
        for (const key in config) {
            this[key] = config[key];
        }
        console.error("after config", this);
    }
}
exports.AppConfig = new _Config();
//# sourceMappingURL=AppConfig.js.map