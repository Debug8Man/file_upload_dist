"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioLogic = void 0;
const minio_1 = require("minio");
const path = require("path");
const logger_1 = require("./logger");
const crypto = require("crypto");
const AppConfig_1 = require("../AppConfig");
const fs = require("fs");
const os = require("os");
const child_process_1 = require("child_process");
class _MinioLogic {
    client;
    bucketName = 'uploads';
    constructor() {
        this.client = new minio_1.Client({
            endPoint: AppConfig_1.AppConfig.minio_endpoint,
            port: AppConfig_1.AppConfig.minio_port,
            useSSL: !!AppConfig_1.AppConfig.minio_use_ssl,
            accessKey: AppConfig_1.AppConfig.minio_access_key || 'minioadmin',
            secretKey: AppConfig_1.AppConfig.minio_secret_key || 'minioadmin',
        });
        this.initBucket();
    }
    async initBucket() {
        try {
            const exists = await this.client.bucketExists(this.bucketName);
            if (!exists) {
                await this.client.makeBucket(this.bucketName, 'us-east-1');
                logger_1.default.log(`Bucket '${this.bucketName}' created successfully`);
            }
        }
        catch (error) {
            logger_1.default.error(`Error initializing bucket: ${error.message}`);
        }
    }
    async getFileUrl(objectName) {
        try {
            let url = await this.client.presignedGetObject(this.bucketName, objectName);
            url = url.split("?")[0];
            return url.replaceAll(AppConfig_1.AppConfig.minio_endpoint, AppConfig_1.AppConfig.minio_domain);
        }
        catch (error) {
            logger_1.default.error(`Error getting file URL: ${error.message}`);
            throw error;
        }
    }
    async generatePresignedUploadUrl(fileName) {
        try {
            const timestamp = Date.now();
            const randomString = crypto.randomBytes(8).toString('hex');
            const extension = path.extname(fileName);
            const baseName = path.basename(fileName, extension);
            const objectName = `${baseName}-${timestamp}-${randomString}${extension}`;
            const url = await this.client.presignedPutObject(this.bucketName, objectName, 60 * 60);
            logger_1.default.log(`Generated presigned URL for ${objectName}`);
            return { url, objectName };
        }
        catch (error) {
            logger_1.default.error(`Error generating presigned URL: ${error.message}`);
            throw error;
        }
    }
    async initiateMultipartUpload(fileName) {
        try {
            const timestamp = Date.now();
            const randomString = crypto.randomBytes(8).toString('hex');
            const extension = path.extname(fileName);
            const baseName = path.basename(fileName, extension);
            const objectName = `${baseName}-${timestamp}-${randomString}${extension}`;
            const uploadId = await this.client.initiateNewMultipartUpload(this.bucketName, objectName, {});
            logger_1.default.log(`Initiated multipart upload for ${objectName} with uploadId: ${uploadId}`);
            return { uploadId, objectName };
        }
        catch (error) {
            logger_1.default.error(`Error initiating multipart upload: ${error.message}`);
            throw error;
        }
    }
    async getPresignedUrlForPart(objectName, uploadId, partNumber) {
        try {
            const url = await this.client.presignedUrl('PUT', this.bucketName, objectName, 3600, {
                'uploadId': uploadId,
                'partNumber': partNumber.toString()
            });
            logger_1.default.log(`Generated presigned URL for part ${partNumber} of ${objectName}`);
            return url;
        }
        catch (error) {
            logger_1.default.error(`Error generating presigned URL for part: ${error.message}`);
            throw error;
        }
    }
    async completeMultipartUpload(objectName, uploadId, parts) {
        try {
            const formattedParts = parts.map(part => ({
                part: part.partNumber,
                etag: part.etag
            }));
            await this.client.completeMultipartUpload(this.bucketName, objectName, uploadId, formattedParts);
            const url = await this.client.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60);
            logger_1.default.log(`Completed multipart upload for ${objectName}`);
            return url;
        }
        catch (error) {
            logger_1.default.error(`Error completing multipart upload: ${error.message}`);
            throw error;
        }
    }
    async abortMultipartUpload(objectName, uploadId) {
        try {
            await this.client.abortMultipartUpload(this.bucketName, objectName, uploadId);
            logger_1.default.log(`Aborted multipart upload for ${objectName}`);
        }
        catch (error) {
            logger_1.default.error(`Error aborting multipart upload: ${error.message}`);
            throw error;
        }
    }
    async deleteFile(objectName) {
        try {
            await this.client.removeObject(this.bucketName, objectName);
            logger_1.default.log(`Deleted file ${objectName}`);
        }
        catch (error) {
            logger_1.default.error(`Error deleting file: ${error.message}`);
            throw error;
        }
    }
    async listFiles(prefix = '', recursive = true) {
        try {
            const objectsStream = this.client.listObjects(this.bucketName, prefix, recursive);
            const objects = [];
            return new Promise((resolve, reject) => {
                objectsStream.on('data', (obj) => {
                    if (obj.name) {
                        objects.push(obj.name);
                    }
                });
                objectsStream.on('error', (err) => {
                    reject(err);
                });
                objectsStream.on('end', () => {
                    resolve(objects);
                });
            });
        }
        catch (error) {
            logger_1.default.error(`Error listing files: ${error.message}`);
            throw error;
        }
    }
    async generatePostPresignedUrl(body) {
        try {
            let objectName = `${Date.now()}-${body.fileName}`;
            let isVideoExtension = body.fileName.endsWith(".mp4") || body.fileName.endsWith(".mov") || body.fileName.endsWith(".avi") || body.fileName.endsWith(".flv") || body.fileName.endsWith(".wmv") || body.fileName.endsWith(".mkv");
            if (body.fileType == "video" && !isVideoExtension) {
                objectName = `${Date.now()}-${body.fileName}.mp4`;
            }
            const policy = this.client.newPostPolicy();
            policy.setContentType('application/octet-stream');
            policy.setBucket(this.bucketName);
            policy.setKey(objectName);
            const postPolicy = await this.client.presignedPostPolicy(policy);
            return {
                url: postPolicy.postURL.replaceAll(AppConfig_1.AppConfig.minio_endpoint, AppConfig_1.AppConfig.minio_domain),
                objectName,
                formData: postPolicy.formData
            };
        }
        catch (error) {
            logger_1.default.error(`Error generating POST presigned URL: ${error.message}`);
            throw error;
        }
    }
    async generateVideoThumbnail(videoObjectName, timePosition = '00:00:01') {
        try {
            const thumbnailObjectName = `${videoObjectName}_thumbnail.jpg`;
            const tempDir = os.tmpdir();
            const uniqueId = Date.now();
            const tempVideoPath = path.join(tempDir, `temp_video_${uniqueId}.mp4`);
            const tempThumbnailPath = path.join(tempDir, `temp_thumbnail_${uniqueId}.jpg`);
            try {
                const videoStream = await this.client.getObject(this.bucketName, videoObjectName);
                const videoWriteStream = fs.createWriteStream(tempVideoPath);
                await new Promise((resolve, reject) => {
                    videoStream.pipe(videoWriteStream);
                    videoWriteStream.on('finish', resolve);
                    videoWriteStream.on('error', reject);
                });
                await this.extractThumbnail(tempVideoPath, tempThumbnailPath, timePosition);
                const thumbnailStream = fs.createReadStream(tempThumbnailPath);
                await this.client.putObject(this.bucketName, thumbnailObjectName, thumbnailStream);
                const thumbnailUrl = await this.getFileUrl(thumbnailObjectName);
                logger_1.default.log(`Generated thumbnail for ${videoObjectName} at ${timePosition}`);
                return { thumbnailUrl, thumbnailObjectName };
            }
            finally {
                this.cleanupTempFiles([tempVideoPath, tempThumbnailPath]);
            }
        }
        catch (error) {
            logger_1.default.error(`Error generating video thumbnail: ${error.message}`);
            throw error;
        }
    }
    async extractThumbnail(inputPath, outputPath, timePosition) {
        return new Promise((resolve, reject) => {
            const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
                '-i', inputPath,
                '-ss', timePosition,
                '-vframes', '1',
                '-q:v', '2',
                '-y',
                outputPath
            ]);
            let stderr = '';
            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
                }
            });
            ffmpeg.on('error', (error) => {
                reject(new Error(`FFmpeg error: ${error.message}`));
            });
        });
    }
    cleanupTempFiles(filePaths) {
        filePaths.forEach(filePath => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            catch (error) {
                logger_1.default.error(`Error cleaning up temp file ${filePath}: ${error.message}`);
            }
        });
    }
    async generateVideoThumbnails(videoObjectNames, timePosition = '00:00:01') {
        const results = [];
        for (const videoObjectName of videoObjectNames) {
            try {
                const result = await this.generateVideoThumbnail(videoObjectName, timePosition);
                results.push({
                    videoObjectName,
                    ...result
                });
            }
            catch (error) {
                logger_1.default.error(`Failed to generate thumbnail for ${videoObjectName}: ${error.message}`);
                results.push({
                    videoObjectName,
                    thumbnailUrl: '',
                    thumbnailObjectName: `${videoObjectName}_thumbnail.jpg`,
                    error: error.message
                });
            }
        }
        return results;
    }
}
exports.MinioLogic = new _MinioLogic();
//# sourceMappingURL=MinioLogic.js.map