declare class _MinioLogic {
    private readonly client;
    private readonly bucketName;
    constructor();
    private initBucket;
    getFileUrl(objectName: string): Promise<string>;
    generatePresignedUploadUrl(fileName: string): Promise<{
        url: string;
        objectName: string;
    }>;
    initiateMultipartUpload(fileName: string): Promise<{
        uploadId: string;
        objectName: string;
    }>;
    getPresignedUrlForPart(objectName: string, uploadId: string, partNumber: number): Promise<string>;
    completeMultipartUpload(objectName: string, uploadId: string, parts: {
        partNumber: number;
        etag: string;
    }[]): Promise<string>;
    abortMultipartUpload(objectName: string, uploadId: string): Promise<void>;
    deleteFile(objectName: string): Promise<void>;
    listFiles(prefix?: string, recursive?: boolean): Promise<string[]>;
    generatePostPresignedUrl(fileName: string): Promise<{
        url: string;
        objectName: string;
        formData: any;
    }>;
}
export declare const MinioLogic: _MinioLogic;
export {};
