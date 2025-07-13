"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppStarter_1 = require("./AppStarter");
(0, AppStarter_1.starter)("file_upload");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const AppConfig_1 = require("./AppConfig");
const swagger_1 = require("@nestjs/swagger");
const fs = require('fs');
async function bootstrap() {
    fs.mkdirSync(AppConfig_1.AppConfig.upload_fullpath_admin, { recursive: true });
    fs.mkdirSync(AppConfig_1.AppConfig.upload_fullpath_admin_temp, { recursive: true });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    if (!AppConfig_1.AppConfig.isOnline) {
        const options = new swagger_1.DocumentBuilder()
            .setTitle("uploadfile")
            .setDescription("uploadfile api")
            .setVersion("1.0")
            .addTag("API").addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, options);
        swagger_1.SwaggerModule.setup("doc", app, document);
    }
    await app.listen(AppConfig_1.AppConfig.port);
    console.log("http://localhost:" + AppConfig_1.AppConfig.port + "/doc");
}
bootstrap();
//# sourceMappingURL=main.js.map