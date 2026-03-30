import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';

class DiscrepancyType extends Model {

  get idDiscrepancyType(): number {
    return this.getDataValue("idDiscrepancyType");
  }

  get typeName(): string {
    return this.getDataValue("typeName");
  }

}

DiscrepancyType.init(
  {
    idDiscrepancyType: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'DiscrepancyType',
    tableName: 'tblDiscrepancyTypes',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "ukDiscrepancyType_TypeName",
      fields: ['typeName']
    }]
  }
);

export default DiscrepancyType;