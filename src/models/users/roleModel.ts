import { DataTypes, Model, HasManyGetAssociationsMixin} from 'sequelize';
import sequelize from '../../utils/connection';
import User from './userModel';

class Role extends Model {

  declare getUsers: HasManyGetAssociationsMixin<User>;

  get idRole(): number {
    return this.getDataValue("idRole");
  }

  get roleName(): number {
    return this.getDataValue("roleName");
  }

  get isPublic(): boolean {
    return this.getDataValue("isPublic");
  }
}

Role.init(
  {
    idRole: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleName: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'tblRoles',
    schema: 'users',
    timestamps: false,
    indexes: [{
        unique: true, 
        name:"ukRole_RoleName", 
        fields:['roleName']
      }]
  }
);

export default Role;
