import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Justification from './justificationModel';
import Discrepancy from './discrepancyModel';

class JustificationDiscrepancy extends Model {

  declare Justification : Justification;

  declare Discrepancy: Discrepancy;

  get idJustificationDiscrepancy(): number {
    return this.getDataValue("idJustificationDiscrepancy");
  }

  get idJustification(): number {
    return this.getDataValue("idJustification");
  }

  get idDiscrepancy(): number {
    return this.getDataValue("idDiscrepancy");
  }

}

JustificationDiscrepancy.init(
  {
    idJustificationDiscrepancy: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idJustification: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Justification",
        key: 'idJustification',
      },
    },
    idDiscrepancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Discrepancy",
        key: 'idDiscrepancy',
      },
    },
  },
  {
    sequelize,
    modelName: 'JustificationDiscrepancy',
    tableName: 'tblJustificationDiscrepancies',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukJustification_Discrepancy",
      fields: ['idDiscrepancy', 'idJustification']
    }]
  }
);

export default JustificationDiscrepancy;