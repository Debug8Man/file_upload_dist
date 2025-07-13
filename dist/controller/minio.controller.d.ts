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
declare class PostPresignedUrlRequestDto {
    fileName: string;
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
}
export {};
