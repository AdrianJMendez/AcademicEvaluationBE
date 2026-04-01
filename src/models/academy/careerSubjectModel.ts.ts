import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Career from './careerModel';
import Subject from './subjectModel';

class CareerSubject extends Model {

  declare Subject : Subject;

  declare Career : Career;

  get idCareerSubject(): number {
    return this.getDataValue("idStudentPlan");
  }

  get idCareer(): number {
    return this.getDataValue("idCareer");
  }

  get idSubject(): number {
    return this.getDataValue("idSubject");
  }

  get isElective(): boolean {
    return this.getDataValue("isElective");
  }

}

CareerSubject.init(
  {
    idCareerSubject: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idCareer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Career",
        key: 'idCareer',
      },
    },
    idSubject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Subject",
        key: 'idSubject',
      },
    },
    isElective: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'CareerSubject',
    tableName: 'tblCareerSubjects',
    schema: 'academy',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukCareer_Subject",
      fields: ['idCareer', 'idSubject']
    }]
  }
);

export default CareerSubject;