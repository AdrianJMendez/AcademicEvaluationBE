import { DataTypes, Model, BelongsToGetAssociationMixin } from 'sequelize';
import sequelize from '../../utils/connection';
import Status from './statusModel';
import User from '../users/userModel';

class EmailVerification extends Model {

    declare getStatus: BelongsToGetAssociationMixin<Status>;

    declare getUser: BelongsToGetAssociationMixin<User>;

    declare Status?: Status;

    declare User?: User;

    get idEmailVerification(): number {
        return this.getDataValue("idEmailVerification");
    }

    get idUser(): number {
        return this.getDataValue("idUser");
    }

    get code(): string {
        return this.getDataValue("code");
    }

    get failedAttempts(): number {
        return this.getDataValue("failedAttempts");
    }

    get createAt(): Date {
        return this.getDataValue("createAt");
    }

    get expiresAt(): Date {
        return this.getDataValue("expiresAt");
    }

    get verifiedAt(): Date {
        return this.getDataValue("verifiedAt");
    }

    get idStatus(): number {
        return this.getDataValue("idStatus");
    }

    get originIP(): string {
        return this.getDataValue("originIP");
    }

    get userAgent(): string {
        return this.getDataValue("userAgent");
    }

}

EmailVerification.init(
  {
    idEmailVerification: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idUser:{
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model:"User",
        key:"idUser"
      }
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    failedAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    verifiedAt: {
        type: DataTypes.DATE,
    },
    idStatus:{
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model:"Status",
        key:"idStatus"
      }
    },
    originIP: {
      type: DataTypes.STRING(45)
    },
    userAgent: {
      type: DataTypes.STRING(500)
    }
  },
  {
    sequelize, 
    timestamps: false,
    modelName: 'EmailVerification', 
    tableName: 'tblEmailVerifications',
    schema : 'asset'
  },
);

export default EmailVerification;