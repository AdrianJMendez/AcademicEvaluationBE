import { BelongsToGetAssociationMixin, DataTypes, HasManyGetAssociationsMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Career from './careerModel';
import SubjectPrerequisite from './subjectPrerequisiteModel';
import CareerSubject from './careerSubjectModel.ts';

class Subject extends Model {

  declare Prerequisites?: Subject[];

  declare Dependents?: Subject[];

  declare SubjectPrerequisite?: SubjectPrerequisite;

  declare CareerSubjects?: CareerSubject[];

  get idSubject(): number {
    return this.getDataValue("idSubject");
  }

  get subjectCode(): string {
    return this.getDataValue("subjectCode");
  }

  get subjectName(): string {
    return this.getDataValue("subjectName");
  }

  get idealPeriod(): number {
    return this.getDataValue("idealPeriod");
  }

  get credits(): number {
    return this.getDataValue("credits");
  }

  get hours(): number {
    return this.getDataValue("hours");
  }

  get subjectType(): string {
    return this.getDataValue("subjectType");
  }

  get description(): string {
    return this.getDataValue("description");
  }

  get isOptative(): boolean {
    return this.getDataValue("isOptative");
  }

}

Subject.init(
  {
    idSubject: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subjectCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    subjectName: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    idealPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subjectType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    isOptative: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Subject',
    tableName: 'tblSubjects',
    schema: 'academy',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukSubject_SubjectCode",
      fields: ['subjectCode']
    }]
  }
);

export default Subject;