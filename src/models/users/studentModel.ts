import { BelongsToGetAssociationMixin, BelongsToManyGetAssociationsMixin, DataTypes, HasManyGetAssociationsMixin, HasOneGetAssociationMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import User from './userModel';
import Career from '../academy/careerModel';

class Student extends Model {

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare User: User;

  declare getCareers: BelongsToManyGetAssociationsMixin<Career>;
  declare Careers: Career[];

  get idStudent(): number {
    return this.getDataValue("idStudent");
  }

  get idUser(): number {
    return this.getDataValue("idUser");
  }

  get accountNumber(): string {
    return this.getDataValue("accountNumber");
  }

  get enrollmentDate(): Date {
    return this.getDataValue("enrollmentDate");
  }

  get currentPeriod(): number {
    return this.getDataValue("currentPeriod");
  }

}

Student.init(
  {
    idStudent: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: 'idUser',
      },
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    currentPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'tblStudents',
    schema: 'users',
    timestamps: false,
    indexes: [{
        unique: true, 
        name:"ukStudent_User", 
        fields:['idUser']
      },{
        unique: true, 
        name:"ukStudent_AccountNumber", 
        fields:['accountNumber']
      }]
  }
);


export default Student;
