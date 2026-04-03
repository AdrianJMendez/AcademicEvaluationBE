import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Subject from './subjectModel';

class SubjectPrerequisite extends Model {

  declare getSubject: BelongsToGetAssociationMixin<Subject>;
  declare Subject: Subject;

  declare getPrerequisiteSubject: BelongsToGetAssociationMixin<Subject>;
  declare PrerequisiteSubject: Subject;

  get idPrerequisite(): number {
    return this.getDataValue("idPrerequisite");
  }

  get idSubject(): number {
    return this.getDataValue("idSubject");
  }

  get idPrerequisiteSubject(): number {
    return this.getDataValue("idPrerequisiteSubject");
  }

  get isStrict(): boolean {
    return this.getDataValue("isStrict");
  }

}

SubjectPrerequisite.init(
  {
    idPrerequisite: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idSubject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Subject",
        key: 'idSubject',
      },
    },
    idPrerequisiteSubject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Subject",
        key: 'idSubject',
      },
    },
    isStrict: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'SubjectPrerequisite',
    tableName: 'tblSubjectPrerequisites',
    schema: 'academy',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukPrerequisite_Subject",
      fields: ['idSubject', 'idPrerequisiteSubject']
    }]
  }
);

export default SubjectPrerequisite;