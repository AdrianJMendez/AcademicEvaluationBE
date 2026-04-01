import { BelongsToGetAssociationMixin, BelongsToManyGetAssociationsMixin, DataTypes, HasManyGetAssociationsMixin, HasOneGetAssociationMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Subject from './subjectModel';

class Career extends Model {

  declare getSubjects : BelongsToManyGetAssociationsMixin<Subject>;
  declare Subjects: Subject[];

  get idCareer(): number {
    return this.getDataValue("idCareer");
  }

  get careerCode(): string {
    return this.getDataValue("careerCode");
  }

  get careerName(): string {
    return this.getDataValue("careerName");
  }

  get description(): string {
    return this.getDataValue("description");
  }

  get facultyName(): string {
    return this.getDataValue("facultyName");
  }

  get totalPeriods(): number {
    return this.getDataValue("totalPeriods");
  }

  get yearLength(): number {
    return this.getDataValue("yearLength");
  }

  get isActive(): boolean {
    return this.getDataValue("isActive");
  }

}

Career.init(
  {
    idCareer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    careerCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    careerName: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    facultyName: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    totalPeriods: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    yearLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive :{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Career',
    tableName: 'tblCareers',
    schema: 'academy',
    timestamps: false,
    indexes: [{
        unique: true, 
        name:"ukCareer_CareerCode", 
        fields:['careerCode']
      }]
  }
);

export default Career;
