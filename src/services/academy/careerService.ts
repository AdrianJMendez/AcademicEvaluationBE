import JsonResponse from "../../utils/jsonResponse";
import Career from "../../models/academy/careerModel";
import Subject from "../../models/academy/subjectModel";
import SubjectPrerequisite from "../../models/academy/subjectPrerequisiteModel";
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

    static async getCareerPlanById(idCareer: number) {

        const career = await Career.findOne({
            where: { idCareer },
            include: [
                {
                    model: Subject,
                    required: false,
                    include: [
                        {
                            model: SubjectPrerequisite,
                            as: 'Prerequisites',
                            required: false,
                            include: [
                                {
                                    model: Subject,
                                    as: 'PrerequisiteSubject',
                                    required: false,
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!career) {
            return JsonResponse.error(404, `No se encontró la carrera con id ${idCareer}.`);
        }

        return JsonResponse.success(career, 'Plan académico obtenido con éxito.');
    }
}

export default CareerService;