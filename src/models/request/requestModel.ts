import { BelongsToGetAssociationMixin, DataTypes, HasManyGetAssociationsMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import StudentCareer from '../users/studentCareerModel';
import Employee from '../users/employeeModel';
import RequestStatus from './requestStatusModel';
import Student from '../users/studentModel';

class Request extends Model {

  declare getStudentCareer: BelongsToGetAssociationMixin<StudentCareer>;
  declare StudentCareer: StudentCareer;

  declare getEmployeeReviewer: BelongsToGetAssociationMixin<Employee>;
  declare EmployeeReviewer: Employee;

  declare getStatus: BelongsToGetAssociationMixin<RequestStatus>;
  declare Status : RequestStatus;

  async getStudent() : Promise<Student | null> {
    const studentCareer = await StudentCareer.findByPk(this.idStudentCareer);
    return studentCareer?.Student || null;
  }

  get idRequest(): number {
    return this.getDataValue("idRequest");
  }

  get idStudentCareer(): number {
    return this.getDataValue("idStudentCareer");
  }

  get idRequestStatus(): number {
    return this.getDataValue("idRequestStatus");
  }

  get submittedAt(): Date {
    return this.getDataValue("submittedAt");
  }

  get reviewedAt(): Date {
    return this.getDataValue("reviewedAt");
  }

  get idEmployeeReviewer(): number {
    return this.getDataValue("idEmployeeReviewer");
  }

  get finalScore(): number {
    return this.getDataValue("finalScore");
  }

  get generatedReportUrl(): string {
    return this.getDataValue("generatedReportUrl");
  }

  get notes(): string {
    return this.getDataValue("notes");
  }

}

Request.init(
  {
    idRequest: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idStudentCareer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "StudentCareer",
        key: 'idStudentCareer',
      },
    },
    idRequestStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "RequestStatus",
        key: 'idRequestStatus',
      },
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idEmployeeReviewer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Employee",
        key: 'idEmployee',
      },
    },
    finalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    generatedReportUrl: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Request',
    tableName: 'tblRequests',
    schema: 'request',
    timestamps: false,
  }
);

export default Request;