import JsonResponse from "../../utils/jsonResponse";
import Career from "../../models/academy/careerModel";
import Subject from "../../models/academy/subjectModel";
import SubjectPrerequisite from "../../models/academy/subjectPrerequisiteModel";
import Student from "../../models/users/studentModel";
import User from "../../models/users/userModel";

class CareerService {

    ////PRIMER SERVICIO DE PRUEBA PARA LAS RELACIONES MUCHOS A MUCHOS NO TIENE UTILIDAD REAL
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

    static async getCareersForStudent(user: User): Promise<JsonResponse> {

        const data = await Student.findOne({
            include : [
                {model: Career, required: true}
            ],
            where :{
                idUser : user.idUser
            }
        });

        if(!data?.Careers){
            return JsonResponse.error(400, 'No se han encontrado datos.');
        }

        return JsonResponse.success(data.Careers, "La petición ha sido un éxito.");
    }

    static async getSubjectsByCareer(idCareer:number): Promise<JsonResponse> {

        const career = await Career.findByPk(idCareer);

        if(!career)
            return JsonResponse.error(400,"No se ha encontrado la carrera");

        const data = await Subject.findAll({
            include : [
                {model: Career, required: true, where:{
                    idCareer: career.idCareer
                }},
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
        });

        if(!data){
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