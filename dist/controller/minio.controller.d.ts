declare class PresignedUrlRequestDto {
    fileName: string;
}
declare class MultipartUploadInitDto {
    fileName: string;
}
declare class MultipartUploadPartDto {
    objectName: string;
    uploadId: string;
    partNumber: number;
}
declare class MultipartUploadCompleteDto {
    objectName: string;
    uploadId: string;
    parts: {
        partNumber: number;
        etag: string;
    }[];
}
declare class MultipartUploadAbortDto {
    objectName: string;
    uploadId: string;
}
export declare class PostPresignedUrlRequestDto {
    fileName: string;
    fileType: string;
}
declare class GenerateThumbnailDto {
    videoObjectName: string;
    timePosition?: string;
}
declare class GenerateThumbnailsDto {
    videoObjectNames: string[];
    timePosition?: string;
}
export declare class MinioController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        originalname: string;
        filename: string;
        fieldname: string;
        ver: number;
    };
    getPresignedUrl(body: PresignedUrlRequestDto): Promise<{
        url: string;
        objectName: string;
    }>;
    initiateMultipartUpload(body: MultipartUploadInitDto): Promise<{
        uploadId: string;
        objectName: string;
    }>;
    getPartUrl(body: MultipartUploadPartDto): Promise<{
        url: string;
    }>;
    completeMultipartUpload(body: MultipartUploadCompleteDto): Promise<{
        url: string;
    }>;
    abortMultipartUpload(body: MultipartUploadAbortDto): Promise<{
        success: boolean;
    }>;
    getFileUrl(objectName: string): Promise<{
        url: string;
    }>;
    getPostPresignedUrl(body: PostPresignedUrlRequestDto): Promise<{
        url: string;
        objectName: string;
        formData: any;
    }>;
    generateThumbnail(body: GenerateThumbnailDto): Promise<{
        thumbnailUrl: string;
        thumbnailObjectName: string;
    }>;
    generateThumbnails(body: GenerateThumbnailsDto): Promise<{
        results: {
            videoObjectName: string;
            thumbnailUrl: string;
            thumbnailObjectName: string;
            error?: string;
        }[];
    }>;
}
export {};
