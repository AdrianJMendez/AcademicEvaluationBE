import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Student from './studentModel';
import Career from '../academy/careerModel';

class StudentCareer extends Model {

  declare Student : Student;

  declare Career : Career;

  get idStudentCareer(): number {
    return this.getDataValue("idStudentCareer");
  }

  get idStudent(): number {
    return this.getDataValue("idStudent");
  }

  get idCareer(): number {
    return this.getDataValue("idCareer");
  }

  get isActive(): boolean {
    return this.getDataValue("isActive");
  }

}

StudentCareer.init(
  {
    idStudentCareer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idStudent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Student",
        key: 'idStudent',
      },
    },
    idCareer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Career",
        key: 'idCareer',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'StudentCareer',
    tableName: 'tblStudentCareers',
    schema: 'users',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukStudent_Career",
      fields: ['idStudent', 'idCareer']
    }]
  }
);

export default StudentCareer;