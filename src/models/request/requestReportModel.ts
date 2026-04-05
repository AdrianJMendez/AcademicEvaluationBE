import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Request from './requestModel';

class RequestReport extends Model {

  declare getRequest: BelongsToGetAssociationMixin<Request>;
  declare Request: Request;

  get idRequestReport(): number {
    return this.getDataValue('idRequestReport');
  }

  get idRequest(): number {
    return this.getDataValue('idRequest');
  }

  get fileName(): string {
    return this.getDataValue('fileName');
  }

  get mimeType(): string {
    return this.getDataValue('mimeType');
  }

  get reportData(): Buffer {
    return this.getDataValue('reportData');
  }

  get generatedAt(): Date {
    return this.getDataValue('generatedAt');
  }
}

RequestReport.init(
  {
    idRequestReport: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Request',
        key: 'idRequest',
      },
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'application/pdf',
    },
    reportData: {
      type: DataTypes.BLOB('long'),
      allowNull: false,
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RequestReport',
    tableName: 'tblRequestReports',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: 'ukRequestReport_Request',
      fields: ['idRequest']
    }]
  }
);

export default RequestReport;
