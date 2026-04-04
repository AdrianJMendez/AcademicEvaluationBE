import JsonResponse from "../../utils/jsonResponse";
import Career from "../../models/academy/careerModel";
import Subject from "../../models/academy/subjectModel";
import SubjectPrerequisite from "../../models/academy/subjectPrerequisiteModel";
import Student from "../../models/users/studentModel";
import User from "../../models/users/userModel";
import { CareerComparationProp, DiscrepancyProp, ParsedSubject, Prerequisite, PrimarySubject } from "../../utils/interfaces/careerInterfaces";
import StudentCareer from "../../models/users/studentCareerModel";
import CareerSubject from "../../models/academy/careerSubjectModel.ts";
import { analyzeCurriculum } from "../../utils/history-evaluator";

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
                { model: Subject, as: "Prerequisites", required: false}
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
                        { model: Subject, as: "Prerequisites", required: false}
                    ]
                }
            ]
        });

        if (!career) {
            return JsonResponse.error(404, `No se encontró la carrera con id ${idCareer}.`);
        }

        return JsonResponse.success(career, 'Plan académico obtenido con éxito.');
    }

    static async evaluateHistory(user : User,prop: CareerComparationProp): Promise<JsonResponse> {
        
        const studentCareer = await StudentCareer.findOne({
            include: [
                {model: Student, required: true},
                {model: Career, required: true}
            ],
            where: {
                idStudentCareer: prop.idStudentCareer
            }
        });

        if(!studentCareer?.Career || !studentCareer.Student)
            return JsonResponse.error(400,"No se ha encontrado datos para comparación");

        const student = studentCareer.Student;
        const career = studentCareer.Career;

        if(student.idUser != user.idUser)
            return JsonResponse.error(500,"La carrera especificada no pertenece al estudiante registrado.");

        const rawSubjects = await Subject.findAll({
            include: [
                {model: CareerSubject, required: true, 
                    where: {
                        idCareer : career.idCareer
                    }
                },
                { model: Subject, as: "Prerequisites", required: false}
            ]
        });

        const mappedSubjects : PrimarySubject[] = rawSubjects.map((s)=>{
            return {
                idSubject: s.idSubject,
                subjectCode: s.subjectCode,
                subjectName: s.subjectName,
                idealPeriod: s.idealPeriod,
                isOptative: s.isOptative,
                isElective: s.CareerSubjects!.find((cs=>cs.idCareer == career.idCareer))!.isElective,
                prerequisites: s.Prerequisites!.map((r)=>{
                    return {
                        idSubject: r.idSubject,
                        subjectCode: r.subjectCode,
                        subjectName: r.subjectName
                    }
                }) as Prerequisite[]
            }
        });

        const discrepanciesFound = analyzeCurriculum(mappedSubjects,prop.history);

        return JsonResponse.success(discrepanciesFound,"La petición se ha realizado con éxito.");
    }



}

export default CareerService;