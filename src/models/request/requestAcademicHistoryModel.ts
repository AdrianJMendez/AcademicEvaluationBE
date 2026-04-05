import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Request from './requestModel';

class RequestAcademicHistory extends Model {
  declare getRequest: BelongsToGetAssociationMixin<Request>;
  declare Request?: Request;

  get idRequestAcademicHistory(): number {
    return this.getDataValue("idRequestImage");
  }

  get idRequest(): number {
    return this.getDataValue("idRequest");
  }

  get jsonContent(): string {
    return this.getDataValue("jsonContent");
  }
  get academicAverage(): number {
    return this.getDataValue("academicAverage");
  }

}

RequestAcademicHistory.init(
  {
    idRequestAcademicHistory: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Request",
        key: "idRequest",
      },
    },
    jsonContent: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    },
    academicAverage: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RequestAcademicHistory',
    tableName: 'tblRequestAcademicHistories',
    schema: 'request',
    timestamps: false,
    indexes : [
        {
            name: "ukAcademicHistory_Request",
            unique : true,
            fields: ["idRequest"]
        }
    ]
  }
);

export default RequestAcademicHistory;