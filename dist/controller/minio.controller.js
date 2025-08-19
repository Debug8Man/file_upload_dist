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
exports.MinioController = exports.PostPresignedUrlRequestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const AppConfig_1 = require("../AppConfig");
const fs = require("fs");
const MinioLogic_1 = require("../logic/MinioLogic");
class FileUploadDto {
    file;
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], FileUploadDto.prototype, "file", void 0);
class PresignedUrlRequestDto {
    fileName;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name with extension' }),
    __metadata("design:type", String)
], PresignedUrlRequestDto.prototype, "fileName", void 0);
class MultipartUploadInitDto {
    fileName;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name with extension' }),
    __metadata("design:type", String)
], MultipartUploadInitDto.prototype, "fileName", void 0);
class MultipartUploadPartDto {
    objectName;
    uploadId;
    partNumber;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Object name in Minio' }),
    __metadata("design:type", String)
], MultipartUploadPartDto.prototype, "objectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload ID from initiate multipart upload' }),
    __metadata("design:type", String)
], MultipartUploadPartDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Part number (1-10000)' }),
    __metadata("design:type", Number)
], MultipartUploadPartDto.prototype, "partNumber", void 0);
class MultipartUploadCompleteDto {
    objectName;
    uploadId;
    parts;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Object name in Minio' }),
    __metadata("design:type", String)
], MultipartUploadCompleteDto.prototype, "objectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload ID from initiate multipart upload' }),
    __metadata("design:type", String)
], MultipartUploadCompleteDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parts information with part numbers and ETags' }),
    __metadata("design:type", Array)
], MultipartUploadCompleteDto.prototype, "parts", void 0);
class MultipartUploadAbortDto {
    objectName;
    uploadId;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Object name in Minio' }),
    __metadata("design:type", String)
], MultipartUploadAbortDto.prototype, "objectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload ID from initiate multipart upload' }),
    __metadata("design:type", String)
], MultipartUploadAbortDto.prototype, "uploadId", void 0);
class PostPresignedUrlRequestDto {
    fileName;
    fileType;
}
exports.PostPresignedUrlRequestDto = PostPresignedUrlRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name with extension' }),
    __metadata("design:type", String)
], PostPresignedUrlRequestDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name with extension' }),
    __metadata("design:type", String)
], PostPresignedUrlRequestDto.prototype, "fileType", void 0);
class GenerateThumbnailDto {
    videoObjectName;
    timePosition;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Video object name in Minio' }),
    __metadata("design:type", String)
], GenerateThumbnailDto.prototype, "videoObjectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time position for thumbnail extraction (format: HH:MM:SS)', default: '00:00:01' }),
    __metadata("design:type", String)
], GenerateThumbnailDto.prototype, "timePosition", void 0);
class GenerateThumbnailsDto {
    videoObjectNames;
    timePosition;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of video object names in Minio', type: [String] }),
    __metadata("design:type", Array)
], GenerateThumbnailsDto.prototype, "videoObjectNames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time position for thumbnail extraction (format: HH:MM:SS)', default: '00:00:01' }),
    __metadata("design:type", String)
], GenerateThumbnailsDto.prototype, "timePosition", void 0);
let MinioController = class MinioController {
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
    async getPresignedUrl(body) {
        const { fileName } = body;
        const result = await MinioLogic_1.MinioLogic.generatePresignedUploadUrl(fileName);
        return result;
    }
    async initiateMultipartUpload(body) {
        const { fileName } = body;
        const result = await MinioLogic_1.MinioLogic.initiateMultipartUpload(fileName);
        return result;
    }
    async getPartUrl(body) {
        const { objectName, uploadId, partNumber } = body;
        const url = await MinioLogic_1.MinioLogic.getPresignedUrlForPart(objectName, uploadId, partNumber);
        return { url };
    }
    async completeMultipartUpload(body) {
        const { objectName, uploadId, parts } = body;
        const url = await MinioLogic_1.MinioLogic.completeMultipartUpload(objectName, uploadId, parts);
        return { url };
    }
    async abortMultipartUpload(body) {
        const { objectName, uploadId } = body;
        await MinioLogic_1.MinioLogic.abortMultipartUpload(objectName, uploadId);
        return { success: true };
    }
    async getFileUrl(objectName) {
        const url = await MinioLogic_1.MinioLogic.getFileUrl(objectName);
        return { url };
    }
    async getPostPresignedUrl(body) {
        const { fileName } = body;
        const result = await MinioLogic_1.MinioLogic.generatePostPresignedUrl(body);
        return result;
    }
    async generateThumbnail(body) {
        const { videoObjectName, timePosition = '00:00:01' } = body;
        const result = await MinioLogic_1.MinioLogic.generateVideoThumbnail(videoObjectName, timePosition);
        return result;
    }
    async generateThumbnails(body) {
        const { videoObjectNames, timePosition = '00:00:01' } = body;
        const results = await MinioLogic_1.MinioLogic.generateVideoThumbnails(videoObjectNames, timePosition);
        return { results };
    }
};
exports.MinioController = MinioController;
__decorate([
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'select file',
        type: FileUploadDto,
    }),
    (0, common_1.Post)('upload1'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MinioController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('presigned-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a pre-signed URL for direct upload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PresignedUrlRequestDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Post)('multipart/initiate'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a multipart upload for large files' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MultipartUploadInitDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "initiateMultipartUpload", null);
__decorate([
    (0, common_1.Post)('multipart/get-part-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a pre-signed URL for uploading a part' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MultipartUploadPartDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "getPartUrl", null);
__decorate([
    (0, common_1.Post)('multipart/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a multipart upload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MultipartUploadCompleteDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "completeMultipartUpload", null);
__decorate([
    (0, common_1.Post)('multipart/abort'),
    (0, swagger_1.ApiOperation)({ summary: 'Abort a multipart upload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MultipartUploadAbortDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "abortMultipartUpload", null);
__decorate([
    (0, common_1.Get)('file-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a file URL by object name' }),
    (0, swagger_1.ApiQuery)({ name: 'objectName', description: 'Object name in Minio' }),
    __param(0, (0, common_1.Query)('objectName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "getFileUrl", null);
__decorate([
    (0, common_1.Post)('post-presigned-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a pre-signed URL for POST upload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostPresignedUrlRequestDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "getPostPresignedUrl", null);
__decorate([
    (0, common_1.Post)('generate-thumbnail'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a thumbnail from a video file' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateThumbnailDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "generateThumbnail", null);
__decorate([
    (0, common_1.Post)('generate-thumbnails'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate thumbnails from multiple video files' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateThumbnailsDto]),
    __metadata("design:returntype", Promise)
], MinioController.prototype, "generateThumbnails", null);
exports.MinioController = MinioController = __decorate([
    (0, swagger_1.ApiTags)("minio"),
    (0, common_1.Controller)("minio")
], MinioController);
//# sourceMappingURL=minio.controller.js.map