import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Request from './requestModel';

class ScoreCalculation extends Model {

  declare getRequest: BelongsToGetAssociationMixin<Request>;
  declare Request: Request;

  get idScoreCalculation(): number {
    return this.getDataValue("idScoreCalculation");
  }

  get idRequest(): number {
    return this.getDataValue("idRequest");
  }

  get baseScore(): number {
    return this.getDataValue("baseScore");
  }

  get totalDelay(): number {
    return this.getDataValue("totalDelay");
  }

  get delayPenalty(): number {
    return this.getDataValue("delayPenalty");
  }

  get impactAdjustment(): number {
    return this.getDataValue("impactAdjustment");
  }

  get finalScore(): number {
    return this.getDataValue("finalScore");
  }

  get discrepanciesCount(): number {
    return this.getDataValue("discrepanciesCount");
  }

  get calculatedAt(): Date {
    return this.getDataValue("calculatedAt");
  }

}

ScoreCalculation.init(
  {
    idScoreCalculation: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idRequest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Request",
        key: 'idRequest',
      },
    },
    baseScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100,
    },
    totalDelay: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    delayPenalty: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    impactAdjustment: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    finalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    discrepanciesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    calculatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ScoreCalculation',
    tableName: 'tblScoreCalculations',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukScoreCalculation_Request",
      fields: ['idRequest']
    }]
  }
);

export default ScoreCalculation;