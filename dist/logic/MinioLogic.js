"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioLogic = void 0;
const minio_1 = require("minio");
const path = require("path");
const logger_1 = require("./logger");
const crypto = require("crypto");
const AppConfig_1 = require("../AppConfig");
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
            return url;
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
    async generatePostPresignedUrl(fileName) {
        try {
            const objectName = `${Date.now()}-${fileName}`;
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
}
exports.MinioLogic = new _MinioLogic();
//# sourceMappingURL=MinioLogic.js.map