import User from "./users/userModel";
import Role from "./users/roleModel";
import Student from "./users/studentModel";
import Employee from "./users/employeeModel";
import Career from "./academy/careerModel";
import Subject from "./academy/subjectModel";
import SubjectPrerequisite from "./academy/subjectPrerequisiteModel";
import StudentCareer from "./users/studentCareerModel";
import RequestStatus from "./request/requestStatusModel";
import DiscrepancyType from "./request/discrepancyTypeModel";
import Request from "./request/requestModel";
import Discrepancy from "./request/discrepancyModel";
import Justification from "./request/justificationModel";
import ScoreCalculation from "./request/scoreCalculationModel";
import ScoringParameter from "./request/scoringParameterModel";

/********** USERS SCHEMA *********/
//User
User.belongsTo(Role, { foreignKey: "idRole", targetKey: "idRole" });
User.hasOne(Student, { foreignKey: "idUser", sourceKey: "idUser" });
User.hasOne(Employee, { foreignKey: "idUser", sourceKey: "idUser" });

//Role
Role.hasMany(User, { foreignKey: "idRole", sourceKey: "idRole" });

//Student
Student.belongsTo(User, { foreignKey: "idUser", targetKey: "idUser" });
Student.belongsToMany(Career, {through: StudentCareer, foreignKey:"idStudent", otherKey:"idCareer", uniqueKey: "ukStudent_Career"});

//Employee
Employee.belongsTo(User, { foreignKey: "idUser", targetKey: "idUser" });
Employee.hasMany(Request, { foreignKey: "idEmployeeReviewer", sourceKey: "idEmployee" });

//StudentPlan
StudentCareer.hasMany(Request, { foreignKey: "idStudentCareer", sourceKey: "idStudentCareer" });

/********** ACADEMY SCHEMA *********/
//Career
Career.hasMany(Subject, { foreignKey: "idCareer", sourceKey: "idCareer" });
Career.belongsToMany(Student, {through : StudentCareer, foreignKey : "idCareer", otherKey:"idStudent", uniqueKey:"ukStudent_Career"});

//Subject
Subject.belongsTo(Career, { foreignKey: "idCareer", targetKey: "idCareer" });
Subject.hasMany(SubjectPrerequisite, { foreignKey: "idSubject", sourceKey: "idSubject", as: "Prerequisites" });
Subject.hasMany(SubjectPrerequisite, { foreignKey: "idPrerequisiteSubject", sourceKey: "idSubject", as: "Dependents" });
Subject.hasMany(Discrepancy, { foreignKey: "idSubject", sourceKey: "idSubject" });

//SubjectPrerequisite
SubjectPrerequisite.belongsTo(Subject, { foreignKey: "idSubject", targetKey: "idSubject", as: "Subject" });
SubjectPrerequisite.belongsTo(Subject, { foreignKey: "idPrerequisiteSubject", targetKey: "idSubject", as: "PrerequisiteSubject" });

/********** REQUEST SCHEMA *********/
//RequestStatus
RequestStatus.hasMany(Request, {foreignKey:"idRequestStatus", sourceKey:"idRequestStatus"});

//DiscrepancyType
DiscrepancyType.hasMany(Discrepancy, { foreignKey: "idDiscrepancyType", sourceKey: "idDiscrepancyType" });

//Request
Request.belongsTo(StudentCareer, { foreignKey: "idStudentCareer", targetKey: "idStudentCareer" });
Request.belongsTo(Employee, { foreignKey: "idEmployeeReviewer", targetKey: "idEmployee" });
Request.belongsTo(RequestStatus, {foreignKey:"idRequestStatus", targetKey:"idRequestStatus"});
Request.hasMany(Discrepancy, { foreignKey: "idRequest", sourceKey: "idRequest" });
Request.hasOne(ScoreCalculation, { foreignKey: "idRequest", sourceKey: "idRequest" });

//Discrepancy
Discrepancy.belongsTo(Request, { foreignKey: "idRequest", targetKey: "idRequest" });
Discrepancy.belongsTo(Subject, { foreignKey: "idSubject", targetKey: "idSubject" });
Discrepancy.belongsTo(DiscrepancyType, { foreignKey: "idDiscrepancyType", targetKey: "idDiscrepancyType" });
Discrepancy.hasOne(Justification, { foreignKey: "idDiscrepancy", sourceKey: "idDiscrepancy" });

//Justification
Justification.belongsTo(Discrepancy, { foreignKey: "idDiscrepancy", targetKey: "idDiscrepancy" });

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
ScoringParameter.sync();