import { BelongsToGetAssociationMixin, DataTypes, HasManyGetAssociationsMixin, HasOneGetAssociationMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import User from './userModel';

class Employee extends Model {

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare User: User;

  get idEmployee(): number {
    return this.getDataValue("idEmployee");
  }

  get idUser(): number {
    return this.getDataValue("idUser");
  }

  get employeeCode(): string {
    return this.getDataValue("employeeCode");
  }

  get department(): string {
    return this.getDataValue("department");
  }

  get position(): string {
    return this.getDataValue("position");
  }

  get hireDate(): Date {
    return this.getDataValue("hireDate");
  }

}

Employee.init(
  {
    idEmployee: {
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
    employeeCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Employee',
    tableName: 'tblEmployees',
    schema: 'users',
    timestamps: false,
    indexes: [{
        unique: true, 
        name:"ukEmployee_User", 
        fields:['idUser']
      },{
        unique: true, 
        name:"ukEmployee_EmployeeCode", 
        fields:['employeeCode']
      }]
  }
);


export default Employee;
