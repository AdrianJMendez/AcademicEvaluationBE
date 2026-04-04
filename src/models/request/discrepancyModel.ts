import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Request from './requestModel';
import DiscrepancyType from './discrepancyTypeModel';

class Discrepancy extends Model {

  declare getDiscrepancyType: BelongsToGetAssociationMixin<DiscrepancyType>;
  declare DiscrepancyType: DiscrepancyType;

  declare getRequest: BelongsToGetAssociationMixin<Request>;
  declare Request: Request;

  get idDiscrepancy(): number {
    return this.getDataValue("idDiscrepancy");
  }

  get idDiscrepancyType(): number {
    return this.getDataValue("idDiscrepancyType");
  }

  get idRequest(): number {
    return this.getDataValue("idRequest");
  }

  get expectedPeriod(): number {
    return this.getDataValue("expectedPeriod");
  }

  get actualPeriod(): number {
    return this.getDataValue("actualPeriod");
  }

  get description(): string {
    return this.getDataValue("description");
  }

  get periodDifference(): number {
    return this.getDataValue("periodDifference");
  }

  get severity(): string {
    return this.getDataValue("severity");
  }

  get detectedAt(): Date {
    return this.getDataValue("detectedAt");
  }

}

Discrepancy.init(
  {
    idDiscrepancy: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idDiscrepancyType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "DiscrepancyType",
        key: 'idDiscrepancyType',
      },
    },
    idRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Request",
        key: 'idRequest',
      },
    },
    expectedPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actualPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    periodDifference: {
      type: DataTypes.VIRTUAL,
      defaultValue: 0,
    },
    severity: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    detectedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Discrepancy',
    tableName: 'tblDiscrepancies',
    schema: 'request',
    timestamps: false,
  }
);

export default Discrepancy;