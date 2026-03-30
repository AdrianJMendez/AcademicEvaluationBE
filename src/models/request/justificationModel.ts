import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Discrepancy from './discrepancyModel';

class Justification extends Model {

  declare getDiscrepancy: BelongsToGetAssociationMixin<Discrepancy>;
  declare Discrepancy: Discrepancy;

  get idJustification(): number {
    return this.getDataValue("idJustification");
  }

  get idDiscrepancy(): number {
    return this.getDataValue("idDiscrepancy");
  }

  get title(): string {
    return this.getDataValue("title");
  }

  get description(): string {
    return this.getDataValue("description");
  }

  get impactLevel(): string {
    return this.getDataValue("impactLevel");
  }

  get employeeComments(): string {
    return this.getDataValue("employeeComments");
  }

  get submittedAt(): Date {
    return this.getDataValue("submittedAt");
  }

  get reviewedAt(): Date {
    return this.getDataValue("reviewedAt");
  }

}

Justification.init(
  {
    idJustification: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idDiscrepancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Discrepancy",
        key: 'idDiscrepancy',
      },
    },
    title: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    impactLevel: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    employeeComments: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Justification',
    tableName: 'tblJustifications',
    schema: 'request',
    timestamps: false,
  }
);

export default Justification;