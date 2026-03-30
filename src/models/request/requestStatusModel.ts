import { DataTypes, HasManyGetAssociationsMixin, Model } from 'sequelize';
import sequelize from '../../utils/connection';

class RequestStatus extends Model {

  get idRequestStatus(): number {
    return this.getDataValue("idRequestStatus");
  }

  get statusName(): string {
    return this.getDataValue("statusName");
  }

}

RequestStatus.init(
  {
    idRequestStatus: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    statusName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RequestStatus',
    tableName: 'tblRequestStatus',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukStatus_StatusName",
      fields: ['statusName']
    }]
  }
);

export default RequestStatus;