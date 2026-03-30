import Role from "../models/users/roleModel";
import JsonResponse from "../utils/jsonResponse";

class PublicService {
    static async getRolesForRegistration() {
        const data = await Role.findAll({
            where : {
                isPublic : 1
            }
        });

        if(data.length === 0){
            return JsonResponse.error(400, 'No se han encontrado datos.');
        }

        return JsonResponse.success(data, "La petición ha sido un éxito.");
    }
}

export default PublicService;