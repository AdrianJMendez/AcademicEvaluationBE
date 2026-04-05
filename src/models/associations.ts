import User from "./users/userModel";
import Role from "./users/roleModel";
import Student from "./users/studentModel";
import Employee from "./users/employeeModel";
import Career from "./academy/careerModel";
import Subject from "./academy/subjectModel";
import SubjectPrerequisite from "./academy/subjectPrerequisiteModel";
import StudentCareer from "./users/studentCareerModel";
import DiscrepancyType from "./request/discrepancyTypeModel";
import Request from "./request/requestModel";
import Discrepancy from "./request/discrepancyModel";
import Justification from "./request/justificationModel";
import ScoreCalculation from "./request/scoreCalculationModel";
import ScoringParameter from "./request/scoringParameterModel";
import RequestImage from "./request/requestImageModel";
import RequestReport from "./request/requestReportModel";
import Status from "./asset/statusModel";
import EmailVerification from "./asset/emailVerificationModel";
import StatusType from "./asset/statusTypeModel";
import CareerSubject from "./academy/careerSubjectModel.ts";
import JustificationDiscrepancy from "./request/justificationDiscrepancyModel";
import RequestAcademicHistory from "./request/requestAcademicHistoryModel";

/********** USERS SCHEMA *********/
//User
User.belongsTo(Role, { foreignKey: "idRole", targetKey: "idRole" });
User.hasMany(EmailVerification, { foreignKey: "idUser", sourceKey: "idUser" });
User.hasOne(Student, { foreignKey: "idUser", sourceKey: "idUser" });
User.hasOne(Employee, { foreignKey: "idUser", sourceKey: "idUser" });

//Role
Role.hasMany(User, { foreignKey: "idRole", sourceKey: "idRole" });

//Student
Student.belongsTo(User, { foreignKey: "idUser", targetKey: "idUser" });
Student.belongsToMany(Career, {through: StudentCareer, foreignKey:"idStudent", otherKey:"idCareer", uniqueKey: "ukStudent_Career"});
Student.hasMany(StudentCareer, {foreignKey:"idStudent", sourceKey:"idStudent"});    /////ASOCIACION NECESARIA POR LA TABLA REQUEST

//Employee
Employee.belongsTo(User, { foreignKey: "idUser", targetKey: "idUser" });
Employee.hasMany(Request, { foreignKey: "idEmployeeReviewer", sourceKey: "idEmployee" });

//StudentPlan
StudentCareer.hasMany(Request, { foreignKey: "idStudentCareer", sourceKey: "idStudentCareer" });
StudentCareer.belongsTo(Student, { foreignKey: "idStudent", targetKey: "idStudent" });  /////ASOCIACION NECESARIA POR LA TABLA REQUEST
StudentCareer.belongsTo(Career, { foreignKey: "idCareer", targetKey: "idCareer" });  /////ASOCIACION NECESARIA POR LA TABLA REQUEST

/********** ACADEMY SCHEMA *********/
//Career
Career.belongsToMany(Student, {through : StudentCareer, foreignKey : "idCareer", otherKey:"idStudent", uniqueKey:"ukStudent_Career"});
Career.belongsToMany(Subject, {through : CareerSubject, foreignKey : "idCareer", otherKey:"idSubject", uniqueKey:"ukCareerSubject"});
Career.hasMany(StudentCareer, {foreignKey:"idCareer", sourceKey:"idCareer"});    /////ASOCIACION NECESARIA POR LA TABLA REQUEST
Career.hasMany(CareerSubject, {foreignKey:"idCareer", sourceKey:"idCareer"});

//Subject
Subject.hasMany(SubjectPrerequisite, { foreignKey: "idSubject", sourceKey: "idSubject", as: "PrerequisiteLinks" });
Subject.hasMany(SubjectPrerequisite, { foreignKey: "idPrerequisiteSubject", sourceKey: "idSubject", as: "DependentLinks" });
Subject.hasMany(CareerSubject, {foreignKey:"idSubject", sourceKey:"idSubject"});
Subject.belongsToMany(Career, {through: CareerSubject, foreignKey:"idSubject", otherKey:"idCareer", uniqueKey:"ukCareerSubject"});
Subject.belongsToMany(Subject, {through: SubjectPrerequisite, as:"Prerequisites", foreignKey:"idSubject", otherKey:"idPrerequisiteSubject",uniqueKey:"ukPrerequisite_Subject"});
Subject.belongsToMany(Subject, {through: SubjectPrerequisite, as:"Dependents", foreignKey:"idPrerequisiteSubject", otherKey:"idSubject",uniqueKey:"ukPrerequisite_Subject"});

//CareerSubject
CareerSubject.belongsTo(Subject, {foreignKey:"idSubject", targetKey:"idSubject"});
CareerSubject.belongsTo(Career, {foreignKey:"idCareer", targetKey:"idCareer"});

//SubjectPrerequisite
SubjectPrerequisite.belongsTo(Subject, { foreignKey: "idSubject", targetKey: "idSubject", as: "Subject" });
SubjectPrerequisite.belongsTo(Subject, { foreignKey: "idPrerequisiteSubject", targetKey: "idSubject", as: "PrerequisiteSubject" });

/********** ASSET SCHEMA  ***********/
Status.hasMany(EmailVerification, { foreignKey: "idStatus", sourceKey: "idStatus" });
Status.hasMany(Request, { foreignKey: "idStatus", sourceKey: "idStatus" });
Status.belongsTo(StatusType, { foreignKey: "idStatusType", targetKey: "idStatusType" });

//StatusTypes
StatusType.hasMany(Status, { foreignKey: "idStatusType", sourceKey: "idStatusType" });

//EmailVerifications
EmailVerification.belongsTo(Status, { foreignKey: "idStatus", targetKey: "idStatus" });
EmailVerification.belongsTo(User, { foreignKey: "idUser", targetKey: "idUser" });

/********** REQUEST SCHEMA *********/
//DiscrepancyType
DiscrepancyType.hasMany(Discrepancy, { foreignKey: "idDiscrepancyType", sourceKey: "idDiscrepancyType" });

//Request
Request.belongsTo(StudentCareer, { foreignKey: "idStudentCareer", targetKey: "idStudentCareer" });
Request.belongsTo(Employee, { foreignKey: "idEmployeeReviewer", targetKey: "idEmployee" });
Request.belongsTo(Status, {foreignKey:"idStatus", targetKey:"idStatus"});
Request.hasMany(Discrepancy, { foreignKey: "idRequest", sourceKey: "idRequest" });
Request.hasOne(ScoreCalculation, { foreignKey: "idRequest", sourceKey: "idRequest" });
Request.hasMany(RequestImage, { foreignKey: "idRequest", sourceKey: "idRequest" });
Request.hasOne(RequestReport, { foreignKey: "idRequest", sourceKey: "idRequest" });
Request.hasOne(RequestAcademicHistory, { foreignKey: "idRequest", sourceKey: "idRequest" });

//RequestImage
RequestImage.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });

//RequestReport
RequestReport.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });

//RequestAcademicHistory
RequestAcademicHistory.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });

//Discrepancy
Discrepancy.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });
Discrepancy.belongsTo(DiscrepancyType, { foreignKey: "idDiscrepancyType", targetKey: "idDiscrepancyType" });
Discrepancy.hasMany(JustificationDiscrepancy, {foreignKey:"idDiscrepancy", sourceKey:"idDiscrepancy"});
Discrepancy.belongsToMany(Justification, {through:JustificationDiscrepancy, foreignKey:"idDiscrepancy", otherKey:"idJustification", uniqueKey:"ukJustification_Discrepancy"});

//Justification
Justification.hasMany(JustificationDiscrepancy, { foreignKey:"idJustification", sourceKey:"idJustification"});
Justification.belongsToMany(Discrepancy, {through:JustificationDiscrepancy, foreignKey:"idJustification", otherKey:"idDiscrepancy", uniqueKey:"ukJustification_Discrepancy"});

//JustificationDiscrepancy
JustificationDiscrepancy.belongsTo(Discrepancy, {foreignKey:"idDiscrepancy", targetKey:"idDiscrepancy"});
JustificationDiscrepancy.belongsTo(Justification, {foreignKey:"idJustification", targetKey:"idJustification"});

//ScoreCalculation
ScoreCalculation.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });


/******* SYNCS ******/
User.sync();
Role.sync();
Student.sync();
Employee.sync();
Career.sync();
Subject.sync();
SubjectPrerequisite.sync();
StudentCareer.sync();
Request.sync();
Discrepancy.sync();
Justification.sync();
ScoreCalculation.sync();
RequestImage.sync();
RequestReport.sync();
ScoringParameter.sync();
Status.sync();
StatusType.sync();
RequestImage.sync();
RequestAcademicHistory.sync();
