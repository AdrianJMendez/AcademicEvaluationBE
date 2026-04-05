import { Op, Transaction } from 'sequelize';
import sequelize from "../../utils/connection";
import JsonResponse from "../../utils/jsonResponse";
import Student from "../../models/users/studentModel";
import User from "../../models/users/userModel";
import Request from "../../models/request/requestModel";
import StudentCareer from "../../models/users/studentCareerModel";
import Career from "../../models/academy/careerModel";
import Employee from "../../models/users/employeeModel";
import Status from "../../models/asset/statusModel";
import StatusType from "../../models/asset/statusTypeModel";
import Discrepancy from "../../models/request/discrepancyModel";
import Justification from "../../models/request/justificationModel";
import DiscrepancyType from "../../models/request/discrepancyTypeModel";
import ScoreCalculation from "../../models/request/scoreCalculationModel";
import ScoringParameter from "../../models/request/scoringParameterModel";
import { RequestRegisterProp } from '../../utils/interfaces/requestInterfaces';
import { title } from 'process';
import JustificationDiscrepancy from '../../models/request/justificationDiscrepancyModel';
import RequestImageService from './requestImageService';
import RequestImage from '../../models/request/requestImageModel';

type EmployeeRequestStatus = 'pending' | 'in-review' | 'reviewed' | 'all';

interface ReviewJustificationPayload {
    idJustification: number;
    impactLevel: 'no-impact' | 'low-impact' | 'high-impact';
    employeeComments?: string;
}

interface ReviewRequestPayload {
    justifications: ReviewJustificationPayload[];
    notes?: string;
}

interface ScoringConfig {
    baseScore: number;
    delayPenaltyPerPeriod: number;
    maxDelayPenalty: number;
    noImpactAdjustment: number;
    lowImpactAdjustment: number;
    highImpactAdjustment: number;
}

class RequestService {

    private static readonly REQUEST_STATUS_TYPE = 'REQUEST';
    private static readonly DEFAULT_EMPLOYEE_PAGE_SIZE = 6;
    private static readonly MAX_EMPLOYEE_PAGE_SIZE = 20;

    private static readonly DEFAULT_SCORING: ScoringConfig = {
        baseScore: 100,
        delayPenaltyPerPeriod: 2,
        maxDelayPenalty: 30,
        noImpactAdjustment: -5,
        lowImpactAdjustment: -3,
        highImpactAdjustment: 5
    };

    private static async getEmployeeProfile(user: User): Promise<Employee | null> {
        return Employee.findOne({
            include: [
                { model: User, required: false }
            ],
            where: {
                idUser: user.idUser
            }
        });
    }

    private static async getRequestStatus(statusName: 'pending' | 'in-review' | 'reviewed'): Promise<Status | null> {
        return Status.findOne({
            include: [
                {
                    model: StatusType,
                    required: true,
                    where: {
                        statusTypeName: this.REQUEST_STATUS_TYPE
                    }
                }
            ],
            where: {
                statusName
            }
        });
    }

    private static getEmployeeListInclude() {
        return [
            {
                model: StudentCareer,
                required: true,
                include: [
                    {
                        model: Student,
                        required: true,
                        include: [
                            { model: User, required: true }
                        ]
                    },
                    { model: Career, required: true }
                ]
            },
            {
                model: Employee,
                required: false,
                include: [
                    { model: User, required: false }
                ]
            },
            {
                model: Status,
                required: true,
                include: [
                    {
                        model: StatusType,
                        required: true,
                        where: {
                            statusTypeName: this.REQUEST_STATUS_TYPE
                        }
                    }
                ]
            },
            {
                model: Discrepancy,
                required: false,
                include: [
                    {
                        model: Justification,
                        required: false,
                        through: {
                            attributes: []
                        }
                    }
                ]
            },
            {
                model: ScoreCalculation,
                required: false
            }
        ];
    }

    private static getEmployeeDetailInclude() {
        return [
            {
                model: StudentCareer,
                required: true,
                include: [
                    {
                        model: Student,
                        required: true,
                        include: [
                            { model: User, required: true }
                        ]
                    },
                    { model: Career, required: true }
                ]
            },
            {
                model: Employee,
                required: false,
                include: [
                    { model: User, required: false }
                ]
            },
            {
                model: Status,
                required: true,
                include: [
                    {
                        model: StatusType,
                        required: true,
                        where: {
                            statusTypeName: this.REQUEST_STATUS_TYPE
                        }
                    }
                ]
            },
            {
                model: Discrepancy,
                required: false,
                include: [
                    { model: DiscrepancyType, required: true },
                    {
                        model: Justification,
                        required: false,
                        through: {
                            attributes: []
                        }
                    }
                ]
            },
            {
                model: ScoreCalculation,
                required: false
            }
        ];
    }

    private static getUniqueJustificationsFromDiscrepancies(discrepancies: any[]) {
        const justificationMap = new Map<number, any>();

        for (const discrepancy of discrepancies) {
            for (const justification of discrepancy.Justifications ?? []) {
                if (!justificationMap.has(Number(justification.idJustification))) {
                    justificationMap.set(Number(justification.idJustification), justification);
                }
            }
        }

        return Array.from(justificationMap.values());
    }

    private static formatEmployeeRequestSummary(request: Request) {
        const data = request.toJSON() as any;
        const discrepancies = data.Discrepancies ?? [];
        const reviewer = data.Employee ?? data.EmployeeReviewer ?? null;
        const uniqueJustifications = this.getUniqueJustificationsFromDiscrepancies(discrepancies);
        const scoreCalculation = data.ScoreCalculation ?? null;

        return {
            idRequest: data.idRequest,
            submittedAt: data.submittedAt,
            reviewedAt: data.reviewedAt,
            finalScore: data.finalScore ?? scoreCalculation?.finalScore ?? null,
            status: data.Status ? {
                idStatus: data.Status.idStatus,
                statusName: data.Status.statusName
            } : null,
            student: data.StudentCareer?.Student ? {
                idStudent: data.StudentCareer.Student.idStudent,
                name: data.StudentCareer.Student.User?.name ?? null,
                email: data.StudentCareer.Student.User?.email ?? null,
                accountNumber: data.StudentCareer.Student.accountNumber,
                currentPeriod: data.StudentCareer.Student.currentPeriod
            } : null,
            career: data.StudentCareer?.Career ? {
                idCareer: data.StudentCareer.Career.idCareer,
                careerName: data.StudentCareer.Career.careerName,
                careerCode: data.StudentCareer.Career.careerCode,
                facultyName: data.StudentCareer.Career.facultyName
            } : null,
            reviewer: reviewer ? {
                idEmployee: reviewer.idEmployee,
                employeeCode: reviewer.employeeCode,
                name: reviewer.User?.name ?? null,
                email: reviewer.User?.email ?? null
            } : null,
            discrepancyCount: discrepancies.length,
            justificationCount: uniqueJustifications.length
        };
    }

    private static formatEmployeeRequestDetail(request: Request) {
        const data = request.toJSON() as any;
        const reviewer = data.Employee ?? data.EmployeeReviewer ?? null;
        const discrepancies = data.Discrepancies ?? [];

        return {
            idRequest: data.idRequest,
            submittedAt: data.submittedAt,
            reviewedAt: data.reviewedAt,
            finalScore: data.finalScore,
            generatedReportUrl: data.generatedReportUrl,
            notes: data.notes,
            status: data.Status ? {
                idStatus: data.Status.idStatus,
                statusName: data.Status.statusName
            } : null,
            student: data.StudentCareer?.Student ? {
                idStudent: data.StudentCareer.Student.idStudent,
                name: data.StudentCareer.Student.User?.name ?? null,
                email: data.StudentCareer.Student.User?.email ?? null,
                accountNumber: data.StudentCareer.Student.accountNumber,
                enrollmentDate: data.StudentCareer.Student.enrollmentDate,
                currentPeriod: data.StudentCareer.Student.currentPeriod
            } : null,
            career: data.StudentCareer?.Career ? {
                idCareer: data.StudentCareer.Career.idCareer,
                careerName: data.StudentCareer.Career.careerName,
                careerCode: data.StudentCareer.Career.careerCode,
                facultyName: data.StudentCareer.Career.facultyName,
                totalPeriods: data.StudentCareer.Career.totalPeriods,
                yearLength: data.StudentCareer.Career.yearLength
            } : null,
            reviewer: reviewer ? {
                idEmployee: reviewer.idEmployee,
                employeeCode: reviewer.employeeCode,
                name: reviewer.User?.name ?? null,
                email: reviewer.User?.email ?? null,
                department: reviewer.department,
                position: reviewer.position
            } : null,
            discrepancies: discrepancies.map((discrepancy: any) => ({
                idDiscrepancy: discrepancy.idDiscrepancy,
                expectedPeriod: discrepancy.expectedPeriod,
                actualPeriod: discrepancy.actualPeriod,
                periodDifference: discrepancy.periodDifference,
                description: discrepancy.description,
                severity: discrepancy.severity,
                detectedAt: discrepancy.detectedAt,
                discrepancyType: discrepancy.DiscrepancyType ? {
                    idDiscrepancyType: discrepancy.DiscrepancyType.idDiscrepancyType,
                    typeName: discrepancy.DiscrepancyType.typeName
                } : null,
                justifications: (discrepancy.Justifications ?? []).map((justification: any) => ({
                    idJustification: justification.idJustification,
                    title: justification.title,
                    description: justification.description,
                    impactLevel: justification.impactLevel,
                    employeeComments: justification.employeeComments,
                    submittedAt: justification.submittedAt,
                    reviewedAt: justification.reviewedAt
                }))
            })),
            scoreCalculation: data.ScoreCalculation ? {
                idScoreCalculation: data.ScoreCalculation.idScoreCalculation,
                baseScore: Number(data.ScoreCalculation.baseScore),
                totalDelay: data.ScoreCalculation.totalDelay,
                delayPenalty: Number(data.ScoreCalculation.delayPenalty),
                impactAdjustment: Number(data.ScoreCalculation.impactAdjustment),
                finalScore: Number(data.ScoreCalculation.finalScore),
                discrepanciesCount: data.ScoreCalculation.discrepanciesCount,
                calculatedAt: data.ScoreCalculation.calculatedAt
            } : null
        };
    }

    private static async getScoringConfig(): Promise<ScoringConfig> {
        const config = { ...this.DEFAULT_SCORING };
        const parameters = await ScoringParameter.findAll({
            where: {
                isActive: true
            }
        });

        for (const parameter of parameters) {
            const value = Number(parameter.parameterValue ?? 0);

            switch (parameter.parameterName) {
                case 'base_score':
                    config.baseScore = value;
                    break;
                case 'delay_penalty_per_period':
                    config.delayPenaltyPerPeriod = value;
                    break;
                case 'max_delay_penalty':
                    config.maxDelayPenalty = value;
                    break;
                case 'no_impact_adjustment':
                    config.noImpactAdjustment = value;
                    break;
                case 'low_impact_adjustment':
                    config.lowImpactAdjustment = value;
                    break;
                case 'high_impact_adjustment':
                    config.highImpactAdjustment = value;
                    break;
            }
        }

        return config;
    }

    private static calculateReviewScore(discrepancies: any[], scoringConfig: ScoringConfig) {
        const totalDelay = discrepancies.reduce((total, discrepancy) => {
            const expectedPeriod = Number(discrepancy.expectedPeriod ?? 0);
            const actualPeriod = Number(discrepancy.actualPeriod ?? 0);
            return total + Math.max(0, actualPeriod - expectedPeriod);
        }, 0);

        const delayPenalty = Math.min(
            totalDelay * scoringConfig.delayPenaltyPerPeriod,
            scoringConfig.maxDelayPenalty
        );

        const uniqueJustifications = this.getUniqueJustificationsFromDiscrepancies(discrepancies);

        const impactAdjustment = uniqueJustifications.reduce((total: number, justification: any) => {
            switch (justification.impactLevel) {
                case 'high-impact':
                    return total + scoringConfig.highImpactAdjustment;
                case 'low-impact':
                    return total + scoringConfig.lowImpactAdjustment;
                case 'no-impact':
                    return total + scoringConfig.noImpactAdjustment;
                default:
                    return total;
            }
        }, 0);

        const finalScore = Math.max(
            0,
            Math.min(100, scoringConfig.baseScore - delayPenalty + impactAdjustment)
        );

        return {
            baseScore: scoringConfig.baseScore,
            totalDelay,
            delayPenalty,
            impactAdjustment,
            finalScore: Number(finalScore.toFixed(2)),
            discrepanciesCount: discrepancies.length
        };
    }

    private static async findRequestForEmployee(idRequest: number, transaction?: Transaction) {
        return Request.findByPk(idRequest, {
            include: this.getEmployeeDetailInclude(),
            transaction
        });
    }

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
            distinct: true,
            include: [
                {model : StudentCareer, required: true, 
                    include :[
                        {model: Career, required: true}
                    ]},
                {model: Discrepancy, required:true}
            ],
            where: {
                [Op.or]: [
                    {idStatus : idStatus},
                    idStatus === 0 ? {idStatus : {[Op.ne]: null}} : {}
                ],
                "$StudentCareer.idStudent$" : student.idStudent,
                "$StudentCareer.idCareer$" : idCareer
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

    static async getRequestCountForEmployee(user: User): Promise<JsonResponse> {
        const employee = await this.getEmployeeProfile(user);

        if (!employee) {
            return JsonResponse.error(403, "El usuario autenticado no pertenece al personal evaluador.");
        }

        const [pendingStatus, inReviewStatus, reviewedStatus] = await Promise.all([
            this.getRequestStatus('pending'),
            this.getRequestStatus('in-review'),
            this.getRequestStatus('reviewed')
        ]);

        if (!pendingStatus || !inReviewStatus || !reviewedStatus) {
            return JsonResponse.error(500, "No se han configurado correctamente los estados de solicitud.");
        }

        const [pending, inReview, reviewed] = await Promise.all([
            Request.count({ where: { idStatus: pendingStatus.idStatus } }),
            Request.count({ where: { idStatus: inReviewStatus.idStatus } }),
            Request.count({ where: { idStatus: reviewedStatus.idStatus } })
        ]);

        return JsonResponse.success({ pending, inReview, reviewed }, "La petición ha sido un éxito.");
    }

    static async getRequestsForEmployeeByStatus(
        user: User,
        statusName: EmployeeRequestStatus,
        page?: number,
        size?: number
    ): Promise<JsonResponse> {
        const employee = await this.getEmployeeProfile(user);

        if (!employee) {
            return JsonResponse.error(403, "El usuario autenticado no pertenece al personal evaluador.");
        }

        const normalizedPage = Number.isFinite(page) && Number(page) > 0 ? Number(page) : 1;
        const requestedSize = Number.isFinite(size) && Number(size) > 0 ? Number(size) : this.DEFAULT_EMPLOYEE_PAGE_SIZE;
        const normalizedSize = Math.min(requestedSize, this.MAX_EMPLOYEE_PAGE_SIZE);

        const where: { idStatus?: number } = {};

        if (statusName !== 'all') {
            const status = await this.getRequestStatus(statusName);

            if (!status) {
                return JsonResponse.error(400, "El estado solicitado no es válido.");
            }

            where.idStatus = status.idStatus;
        }

        const requests = await Request.findAll({
            include: this.getEmployeeListInclude(),
            where,
            order: [
                ['submittedAt', 'DESC']
            ],
            offset: (normalizedPage - 1) * normalizedSize,
            limit: normalizedSize
        });

        return JsonResponse.success(
            requests.map((request) => this.formatEmployeeRequestSummary(request)),
            "La petición ha sido un éxito."
        );
    }

    static async getRequestDetailForEmployee(user: User, idRequest: number): Promise<JsonResponse> {
        const employee = await this.getEmployeeProfile(user);

        if (!employee) {
            return JsonResponse.error(403, "El usuario autenticado no pertenece al personal evaluador.");
        }

        const request = await this.findRequestForEmployee(idRequest);

        if (!request) {
            return JsonResponse.error(404, "No se ha encontrado la solicitud.");
        }

        return JsonResponse.success(this.formatEmployeeRequestDetail(request), "La petición ha sido un éxito.");
    }

    static async getRequestDetailForStudent(user : User, idRequest: number) : Promise<JsonResponse> {

        const student = await user.getStudent();
        if(!student)
            return JsonResponse.error(400, "El usuario autenticado no pertenece al estudiantado.");

        const request = await Request.findByPk(idRequest, {
            include: [
                {model: Discrepancy, required: true, include :[
                    {model: Justification, required: false},
                    {model: DiscrepancyType, required: true}
                ]},
                {model: Employee, required: false},
                {model: Status, required: true},
                {model: StudentCareer, required: true, include: [
                    { model: Career, required: true}
                ]},
                {model: ScoreCalculation, required: false},
                {model: RequestImage, required: false}
            ]
        });

        if(!request)
            return JsonResponse.error(400,"No se ha encontrado la solicitud");

        return JsonResponse.success(request, "La peticióin se ha completado con éxito.");
    }

    static async takeRequestForEmployee(user: User, idRequest: number): Promise<JsonResponse> {
        const employee = await this.getEmployeeProfile(user);

        if (!employee) {
            return JsonResponse.error(403, "El usuario autenticado no pertenece al personal evaluador.");
        }

        const [pendingStatus, inReviewStatus] = await Promise.all([
            this.getRequestStatus('pending'),
            this.getRequestStatus('in-review')
        ]);

        if (!pendingStatus || !inReviewStatus) {
            return JsonResponse.error(500, "No se han configurado correctamente los estados de solicitud.");
        }

        const request = await this.findRequestForEmployee(idRequest);

        if (!request) {
            return JsonResponse.error(404, "No se ha encontrado la solicitud.");
        }

        const requestData = request.toJSON() as any;
        const reviewer = requestData.Employee ?? requestData.EmployeeReviewer ?? null;

        if (request.idStatus !== pendingStatus.idStatus) {
            if (request.idStatus === inReviewStatus.idStatus && reviewer) {
                return JsonResponse.error(
                    409,
                    `La solicitud ya fue tomada por ${reviewer.User?.name ?? 'otro evaluador'}.`
                );
            }

            return JsonResponse.error(409, "La solicitud ya no se encuentra disponible para ser tomada.");
        }

        await Request.update({
            idStatus: inReviewStatus.idStatus,
            idEmployeeReviewer: employee.idEmployee
        }, {
            where: {
                idRequest: request.idRequest,
                idStatus: pendingStatus.idStatus
            }
        });

        const updatedRequest = await this.findRequestForEmployee(idRequest);

        if (!updatedRequest) {
            return JsonResponse.error(404, "No se ha encontrado la solicitud actualizada.");
        }

        return JsonResponse.success(
            this.formatEmployeeRequestDetail(updatedRequest),
            "La solicitud ha sido tomada correctamente."
        );
    }

    static async finishReviewForEmployee(user: User, idRequest: number, payload: ReviewRequestPayload): Promise<JsonResponse> {
        const employee = await this.getEmployeeProfile(user);

        if (!employee) {
            return JsonResponse.error(403, "El usuario autenticado no pertenece al personal evaluador.");
        }

        if (!Array.isArray(payload.justifications)) {
            return JsonResponse.error(400, "Se requiere el listado de justificaciones revisadas.");
        }

        const [inReviewStatus, reviewedStatus] = await Promise.all([
            this.getRequestStatus('in-review'),
            this.getRequestStatus('reviewed')
        ]);

        if (!inReviewStatus || !reviewedStatus) {
            return JsonResponse.error(500, "No se han configurado correctamente los estados de solicitud.");
        }

        const transaction = await sequelize.transaction();

        try {
            const request = await this.findRequestForEmployee(idRequest, transaction);

            if (!request) {
                await transaction.rollback();
                return JsonResponse.error(404, "No se ha encontrado la solicitud.");
            }

            if (request.idStatus !== inReviewStatus.idStatus) {
                await transaction.rollback();
                return JsonResponse.error(409, "La solicitud debe estar en revisión para poder finalizarla.");
            }

            if (request.idEmployeeReviewer !== employee.idEmployee) {
                await transaction.rollback();
                return JsonResponse.error(403, "La solicitud fue tomada por otro evaluador.");
            }

            const requestData = request.toJSON() as any;
            const discrepancies = requestData.Discrepancies ?? [];
            const uniqueJustifications = this.getUniqueJustificationsFromDiscrepancies(discrepancies);
            const payloadMap = new Map<number, ReviewJustificationPayload>();

            for (const justification of payload.justifications) {
                payloadMap.set(Number(justification.idJustification), justification);
            }

            for (const existingJustification of uniqueJustifications) {
                const payloadJustification = payloadMap.get(Number(existingJustification.idJustification));

                if (!payloadJustification && !existingJustification.impactLevel) {
                    await transaction.rollback();
                    return JsonResponse.error(
                        400,
                        "Todas las justificaciones existentes deben recibir un parámetro de evaluación."
                    );
                }
            }

            for (const [idJustification, justificationPayload] of payloadMap.entries()) {
                const existsInRequest = uniqueJustifications.some(
                    (existingJustification: any) => Number(existingJustification.idJustification) === idJustification
                );

                if (!existsInRequest) {
                    await transaction.rollback();
                    return JsonResponse.error(400, "Se recibió una justificación que no pertenece a la solicitud.");
                }

                await Justification.update({
                    impactLevel: justificationPayload.impactLevel,
                    employeeComments: justificationPayload.employeeComments ?? null,
                    reviewedAt: new Date()
                }, {
                    where: {
                        idJustification
                    },
                    transaction
                });
            }

            const refreshedRequest = await this.findRequestForEmployee(idRequest, transaction);

            if (!refreshedRequest) {
                await transaction.rollback();
                return JsonResponse.error(404, "No se pudo recargar la solicitud actualizada.");
            }

            const refreshedData = refreshedRequest.toJSON() as any;
            const refreshedDiscrepancies = refreshedData.Discrepancies ?? [];
            const scoringConfig = await this.getScoringConfig();
            const score = this.calculateReviewScore(refreshedDiscrepancies, scoringConfig);
            const reviewDate = new Date();

            const currentScoreCalculation = refreshedData.ScoreCalculation ?? null;

            if (currentScoreCalculation) {
                await ScoreCalculation.update({
                    baseScore: score.baseScore,
                    totalDelay: score.totalDelay,
                    delayPenalty: score.delayPenalty,
                    impactAdjustment: score.impactAdjustment,
                    finalScore: score.finalScore,
                    discrepanciesCount: score.discrepanciesCount,
                    calculatedAt: reviewDate
                }, {
                    where: {
                        idRequest: refreshedRequest.idRequest
                    },
                    transaction
                });
            } else {
                await ScoreCalculation.create({
                    idRequest: refreshedRequest.idRequest,
                    baseScore: score.baseScore,
                    totalDelay: score.totalDelay,
                    delayPenalty: score.delayPenalty,
                    impactAdjustment: score.impactAdjustment,
                    finalScore: score.finalScore,
                    discrepanciesCount: score.discrepanciesCount,
                    calculatedAt: reviewDate
                }, {
                    transaction
                });
            }

            await Request.update({
                idStatus: reviewedStatus.idStatus,
                reviewedAt: reviewDate,
                finalScore: score.finalScore,
                notes: payload.notes ?? refreshedRequest.notes
            }, {
                where: {
                    idRequest: refreshedRequest.idRequest
                },
                transaction
            });

            await transaction.commit();

            const finalizedRequest = await this.findRequestForEmployee(idRequest);

            if (!finalizedRequest) {
                return JsonResponse.error(404, "No se pudo recuperar la solicitud finalizada.");
            }

            return JsonResponse.success(
                this.formatEmployeeRequestDetail(finalizedRequest),
                "La revisión se ha finalizado con éxito."
            );
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            return JsonResponse.error(500, "Error al finalizar la revisión de la solicitud.");
        }
    }

    static async createRequest(user: User, prop: RequestRegisterProp): Promise<JsonResponse>{
        const studentFromUser = await user.getStudent();

        if(!studentFromUser)
            return JsonResponse.error(500,"El usuario registrado no es un estudiante.");

        const studentCareer = await StudentCareer.findByPk(prop.idStudentCareer);

        if(studentFromUser.idStudent != studentCareer?.idStudent)
            return JsonResponse.error(500,"La carrera ingresada no pertenece al estudiante registrado.");

        let hasDiscrepancies = prop.discrepancies.find((d)=>d.type != 'Observacion');
        if(hasDiscrepancies && !prop.justifications)
            return JsonResponse.error(500,"Existen discrepancias que requieren justificacion, y estas no existen.");

        const t = await sequelize.transaction();
        try{   

            const newRequest = await Request.create({
                idStatus : 4,   ///Request Pendiente
                idStudentCareer: prop.idStudentCareer
            },{
                transaction: t
            });

            const discrepancyIndexes : Array<{idDiscrepancy:number,idProp:number}> = [];
            for(let i = 0; i < prop.discrepancies.length; i++){

                const discrepancyProp = prop.discrepancies[i];

                let discrepancyType = discrepancyProp.type == "Retraso" ? 1 :
                discrepancyProp.type == "Baja carga académica" ? 2:
                discrepancyProp.type == "Observacion" ? 3 : 4;

                console.log(discrepancyType);

                const newDiscrepancy = await Discrepancy.create({
                    idRequest: newRequest.idRequest,
                    idDiscrepancyType: discrepancyType,
                    description: discrepancyProp.description,
                    severity: discrepancyProp.severity
                },{
                    transaction: t
                });

                discrepancyIndexes.push({
                    idDiscrepancy: newDiscrepancy.idDiscrepancy,
                    idProp: i
                });
            }

            if(prop.justifications){

                const justificationIndexes : Array<{idJustification:number, idProp: number}>  = [];

                for(let i = 0; i < prop.justifications.length; i++){

                    const newJustification = await Justification.create({
                        title: prop.justifications[i].title,
                        description : prop.justifications[i].description
                    },{
                        transaction: t
                    });

                    justificationIndexes.push({
                        idJustification: newJustification.idJustification,
                        idProp: i
                    });
                }

                for(let i = 0; i < prop.justifications.length; i++){

                    let idJustification = justificationIndexes.find((ji)=>ji.idProp == i)?.idJustification;

                    await JustificationDiscrepancy.bulkCreate(

                        prop.justifications[i].discrepancyProps.map((discrepancyProp) => {

                            let idDiscrepancy = discrepancyIndexes.find((di)=>di.idProp == discrepancyProp)?.idDiscrepancy;
                            return {
                                idDiscrepancy,
                                idJustification
                            }
                        })
                    ,{
                        transaction:t
                    })
                }
            }

            //Subir imagenes si existen
            if(prop.images){

                var imageResult;

                if(prop.images.length == 1){
                    imageResult = await RequestImageService.uploadRequestmage(newRequest,prop.images[0],t);
                }else{
                    imageResult = await RequestImageService.uploadMultipleRequestImages(newRequest,prop.images,t);
                }

                if(!imageResult){
                    await t.rollback();

                    return JsonResponse.error(500,"Error al subir imagen.");
                }
            }

            await t.commit();

            return JsonResponse.success(newRequest,"La petición se ha registrado con éxito.");

        }catch(err){
            console.log(err);
            await t.rollback();
            return JsonResponse.error(500,"Ha ocurrido un error al crear la solicitud.");
        }
    }

}

export default RequestService;
