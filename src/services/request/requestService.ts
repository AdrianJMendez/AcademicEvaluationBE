import JsonResponse from "../../utils/jsonResponse";
import {Op} from 'sequelize';
import Student from "../../models/users/studentModel";
import User from "../../models/users/userModel";
import Request from "../../models/request/requestModel";
import StudentCareer from "../../models/users/studentCareerModel";
import Career from "../../models/academy/careerModel";

class RequestService {

    static async getRequestByStatusAndCareerForStudent(
        user : User,
        idStatus:number,
        idCareer: number,
        page: number,
        size: number, 
        sort: number) {

        const student = await Student.findOne({
            include: [
                {model: Career, required: true}
            ],
            where :{
                idUser : user.idUser
            }
        });

        if(!student)
            return JsonResponse.error(400,"No se ha encontrado el estudiante.");

        if(!student.Careers.find((c)=>c.idCareer===idCareer))
            return JsonResponse.error(400,"El estudiante no tiene la carrera asignada.");

        if(page <=0){
            page = 1;
        }
        if(size <= 0){
            size = 15;
        }
        if(sort != 0 && sort != 1){
            sort = 0;
        }

        const {count , rows} = await Request.findAndCountAll({
            include: [
                {model : StudentCareer, required: true, 
                    where :{
                        idStudent : student.idStudent,
                        idCareer : idCareer
                    },
                    include :[
                        {model: Career, required: true}
                    ]}
            ],
            where: {
                [Op.or]: [
                    {idStatus : idStatus},
                    idStatus === 0 ? {idStatus : {[Op.ne]: null}} : {}
                ]
            },
            order:[
                ["submittedAt", sort == 0 ? "DESC" : "ASC"],
            ],
            offset: (page-1) * size,
            limit: size
        });

        if(count === 0){
            return JsonResponse.error(400, 'No se han encontrado datos.');
        }

        return JsonResponse.success({data: rows, totalItems: count}, "La petición ha sido un éxito.");
    }

    static async getRequestCountForStudent(user: User) : Promise<JsonResponse> {

        const student = await Student.findOne({
            where :{
                idUser : user.idUser
            }
        });

        if(!student)
            return JsonResponse.error(400,"No se ha encontrado el estudiante.");

        const pending = await Request.count({
            where :{
                idStatus : 4
            }
        });

        const inReview = await Request.count({
            where :{
                idStatus : 5
            }
        });

        const reviewed = await Request.count({
            where :{
                idStatus : 6
            }
        });

        return JsonResponse.success({pending,inReview,reviewed}, "La petición ha sido un éxito.");
    }

}


export default RequestService;