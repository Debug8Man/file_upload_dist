"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const AppConfig_1 = require("../AppConfig");
const fs = require("fs");
class FileUploadDto {
    file;
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], FileUploadDto.prototype, "file", void 0);
let FileAdminController = class FileAdminController {
    uploadFile(file) {
        console.log(file);
        let src = AppConfig_1.AppConfig.upload_fullpath_admin_temp + "/" + file.filename;
        let targetFileName = file.filename + "-" + file.originalname;
        let target = AppConfig_1.AppConfig.upload_fullpath_admin + "/" + targetFileName;
        fs.renameSync(src, target);
        let url = AppConfig_1.AppConfig.upload_url_admin + "/" + targetFileName;
        console.log({ target });
        let obj = {
            url,
            originalname: file.originalname,
            filename: targetFileName,
            fieldname: file.fieldname,
            ver: 2,
        };
        return obj;
    }
};
exports.FileAdminController = FileAdminController;
__decorate([
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'select file',
        type: FileUploadDto,
    }),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FileAdminController.prototype, "uploadFile", null);
exports.FileAdminController = FileAdminController = __decorate([
    (0, swagger_1.ApiTags)("file"),
    (0, common_1.Controller)("file")
], FileAdminController);
//# sourceMappingURL=file.admin.controller.js.map