import JsonResponse from "../../utils/jsonResponse";
import Career from "../../models/academy/careerModel";
import Student from "../../models/users/studentModel";

class CareerService {

    static async getCareersByStudentId() {

        const data = await Student.findAll({
            include : [
                {model: Career, required: true}
            ]
        });

        if(data.length === 0){
            return JsonResponse.error(400, 'No se han encontrado datos.');
        }

        return JsonResponse.success(data, "La petición ha sido un éxito.");
    }
}

export default CareerService;