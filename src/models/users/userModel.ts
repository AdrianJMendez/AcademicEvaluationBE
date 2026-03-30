import { BelongsToGetAssociationMixin, DataTypes, HasManyGetAssociationsMixin, HasOneGetAssociationMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Role from './roleModel';
import Student from './studentModel';
import Employee from './employeeModel';

class User extends Model {

  declare getRole: BelongsToGetAssociationMixin<Role>;
  declare Role: Role;

  declare getStudent : HasOneGetAssociationMixin<Student>;
  declare Student?: Student;

  declare getEmployee: HasOneGetAssociationMixin<Employee>;
  declare Employee?: Employee;

  get idUser(): number {
    return this.getDataValue("idUser");
  }

  get email(): string {
    return this.getDataValue("email");
  }

  get password(): string {
    return this.getDataValue("password");
  }

  get name(): string {
    return this.getDataValue("name");
  }

  get idRole(): number {
    return this.getDataValue("idRole");
  } 

  get isActive(): boolean {
    return this.getDataValue("isActive");
  }

}

User.init(
  {
    idUser: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    idRole: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Role",
        key: 'idRole',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'tblUsers',
    schema: 'users',
    timestamps: false,
    indexes: [{
        unique: true, 
        name:"ukUser_Email", 
        fields:['email']
      }]
  }
);


export default User;
