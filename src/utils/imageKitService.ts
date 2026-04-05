import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';
import { IMAGE_REPO_PUBLIC_KEY,IMAGE_REPO_PRIVATE_KEY,IMAGE_REPO_URL } from '../config';

const imagekitConfig = new ImageKit({
    publicKey: IMAGE_REPO_PUBLIC_KEY,
    privateKey: IMAGE_REPO_PRIVATE_KEY,
    urlEndpoint: IMAGE_REPO_URL,
});

const imagekitOptions = {
    folder: '/academic-evaluation-plataform',
    transformation: {
        quality: 80,
        format: 'webp',
        progressive: true,
    },
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
};


export interface UploadImageOptions {
    file: string | Buffer; // Base64 string or buffer
    fileName: string;
    folder?: string;
    tags?: string[];
    customCoordinates?: string;
    extensions?: Array<{
        name: string;
        value: string;
    }>;
    webhookUrl?: string;
    responseFields?: string[];
}

export interface UploadResult {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    filePath: string;
    height: number;
    width: number;
    size: number;
    fileType: string;
    tags?: string[];
    customCoordinates?: string;
}

class ImageKitService {
    private static instance: ImageKitService;
    private imagekit: typeof imagekitConfig;

    private constructor() {
        this.imagekit = imagekitConfig;
    }

    public static getInstance(): ImageKitService {
        if (!ImageKitService.instance) {
            ImageKitService.instance = new ImageKitService();
        }
        return ImageKitService.instance;
    }

    /**
     * Subir una imagen individual
     */
    async uploadImage(options: UploadImageOptions): Promise<UploadResult> {
        try {

            const { file, fileName, folder, tags, extensions, webhookUrl, responseFields } = options;

            if (typeof file === 'string' && file.startsWith('data:image')) {
                const base64Data = file.split(',')[1];
                const sizeInBytes = Buffer.from(base64Data, 'base64').length;
                if (sizeInBytes > imagekitOptions.maxFileSize) {
                    throw new Error(`El archivo excede el tamaño máximo de ${imagekitOptions.maxFileSize / (1024 * 1024)}MB`);
                }
            }

            const uploadOptions: any = {
                file,
                fileName,
                folder: folder || imagekitOptions.folder,
                useUniqueFileName: true,
                tags: tags || ['sports-platform'],
                isPrivateFile: false,
            };

            if (extensions) {
                uploadOptions.extensions = extensions;
            }
            if (webhookUrl) {
                uploadOptions.webhookUrl = webhookUrl;
            }
            if (responseFields) {
                uploadOptions.responseFields = responseFields;
            }

            const result = await this.imagekit.upload(uploadOptions);

            return {
                fileId: result.fileId,
                name: result.name,
                url: result.url,
                thumbnailUrl: result.thumbnailUrl || result.url,
                filePath: result.filePath,
                height: result.height,
                width: result.width,
                size: result.size,
                fileType: result.fileType,
                tags: result.tags,
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Error al subir la imagen: ${error}`);
        }
    }

    /**
     * Subir múltiples imágenes
     */
    async uploadMultipleImages(files: Array<{ file: string | Buffer; fileName: string, tags?: string[] }>,folder?: string): Promise<UploadResult[]> {
        const uploadPromises = files.map(file => 
            this.uploadImage({
                file: file.file,
                fileName: file.fileName,
                folder: folder,
                tags: file.tags
            })
        );
        
        return Promise.all(uploadPromises);
    }

    /**
     * Eliminar imagen por ID
     */
    async deleteImage(fileId: string): Promise<boolean> {
        try {
            await this.imagekit.deleteFile(fileId);
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw new Error(`Error al eliminar la imagen: ${error}`);
        }
    }

    /**
     * Eliminar múltiples imágenes
     */
    async deleteMultipleImages(fileIds: string[]): Promise<{ success: string[]; failed: string[] }> {
        const results = {
            success: [] as string[],
            failed: [] as string[],
        };

        for (const fileId of fileIds) {
            try {
                await this.imagekit.deleteFile(fileId);
                results.success.push(fileId);
            } catch (error) {
                results.failed.push(fileId);
                console.error(`Error deleting image ${fileId}:`, error);
            }
        }

        return results;
    }

    /**
     * Obtener detalles de una imagen
     */
    async getImageDetails(fileId: string): Promise<any> {
        try {
            return await this.imagekit.getFileDetails(fileId);
        } catch (error) {
            console.error('Error getting image details:', error);
            throw new Error(`Error al obtener detalles de la imagen: ${error}`);
        }
    }

    /**
     * Obtener imágenes por tags
     */
    async getImagesByTag(tag: string, limit: number = 100): Promise<any[]> {
        try {
            const result = await this.imagekit.listFiles({
                tags: [tag],
                limit,
            });
            return result;
        } catch (error) {
            console.error('Error listing images:', error);
            throw new Error(`Error al listar imágenes: ${error}`);
        }
    }

    /**
     * Generar URL con transformaciones
     */
    generateImageUrl(filePath: string, transformations?: any): string {
        if (!transformations) {
            return `${imagekitOptions.folder}/${filePath}`;
        }

        return this.imagekit.url({
            path: filePath,
            transformation: transformations,
        });
    }

    /**
     * Generar URL para thumbnail
     */
    getThumbnailUrl(filePath: string, width: number = 300, height: number = 300): string {
        return this.imagekit.url({
            path: filePath,
            transformation: [
                {
                    height: height.toString(),
                    width: width.toString(),
                    crop: 'at_max',
                },
                {
                    quality: '80',
                    format: 'webp',
                },
            ],
        });
    }

    /**
     * Validar formato de imagen
     */
    validateImageFormat(base64String: string): boolean {
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const format = base64String.split(';')[0].split(':')[1];
        return validFormats.includes(format);
    }

    /**
     * Convertir archivo a Base64
     */
    fileToBase64(file: Buffer | File): string {
        if (Buffer.isBuffer(file)) {
            return file.toString('base64');
        }
        // Para archivos de tipo File (desde formulario)
        return file as any;
    }
}

export default ImageKitService.getInstance();