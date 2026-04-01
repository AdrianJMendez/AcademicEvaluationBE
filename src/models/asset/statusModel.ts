import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import StatusType from './statusTypeModel';

class Status extends Model {

    declare getStatusType: BelongsToGetAssociationMixin<StatusType>;

    declare StatusType?: StatusType;

    get idStatus(): number {
        return this.getDataValue("idStatus");
    }
    
    get statusName(): string {
        return this.getDataValue("statusName");
    }

    get idStatusType(): number {
        return this.getDataValue("idStatusType");
    }
}

Status.init(
  {
    idStatus: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    statusName: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    idStatusType:{
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model:"StatusType",
        key:"idStatusType"
      }
    }
  },
  {
    sequelize, 
    timestamps: false,
    modelName: 'Status', 
    tableName: 'tblStatus',
    schema : 'asset'
  },
);

export default Status;