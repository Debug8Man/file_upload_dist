export declare class FileAdminController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        originalname: string;
        filename: string;
        fieldname: string;
        ver: number;
    };
}
