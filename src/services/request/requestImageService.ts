import ImageKitService from '../../utils/imageKitService';
import { Transaction } from 'sequelize';
import { ImageUploadData } from '../../utils/interfaces/requestInterfaces';
import Request from '../../models/request/requestModel';
import RequestImage from '../../models/request/requestImageModel';

class RequestImageService {

    private static imageKit = ImageKitService;

    private static folder = "academic-evaluation-plataform/request";

    public static async uploadRequestmage(request: Request,imageData: ImageUploadData, t: Transaction): Promise<boolean> {

        try {
            if (!this.imageKit.validateImageFormat(imageData.base64Image)) {
                throw new Error('Formato de imagen no válido. Formatos permitidos: JPG, PNG, WEBP, GIF');
            }

            const fileName = `request_${request.idRequest}_${Date.now()}`;
        
            const tags = [
                'academic-evaluation-plataform',
                'request',
                `request${request.idRequest}`,
            ];

            const uploadResult = await this.imageKit.uploadImage({
                file: imageData.base64Image,
                fileName : fileName,
                folder: this.folder,
                tags: tags,
            });

            const requestImage = await RequestImage.create({
                idRequest: request.idRequest,
                imageName: uploadResult.name,
                imageUrl: uploadResult.url,
                thumbnailUrl: uploadResult.thumbnailUrl,
            }, { transaction: t });

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public static async uploadMultipleRequestImages(request: Request,imageDataArray: ImageUploadData[], t: Transaction): Promise<boolean> {
        try {
            const newImageDataArray = imageDataArray.map((imageData)=>{
                if (!this.imageKit.validateImageFormat(imageData.base64Image)) {
                    throw new Error('Formato de imagen no válido. Formatos permitidos: JPG, PNG, WEBP, GIF');
                }

                const tags = [
                    'academic-evaluation-plataform',
                    'request',
                    `request${request.idRequest}`,
                ];

                const fileName = `request_${request.idRequest}_${Date.now()}`;

                return {
                    file: imageData.base64Image,
                    fileName: fileName,
                    tags: tags
                }
            });

            const uploadResult = await this.imageKit.uploadMultipleImages(
                newImageDataArray,
                this.folder
            );

            const requestImages = await RequestImage.bulkCreate(
                uploadResult.map((result) => {
                    return {
                        idRequest: request.idRequest,
                        imageName: result.name,
                        imageUrl: result.url,
                        thumbnailUrl: result.thumbnailUrl
                    }
                })
                , { 
                    transaction: t 
                }
            );

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    

}

export default RequestImageService;
