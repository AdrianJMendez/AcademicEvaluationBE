import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';

class ScoringParameter extends Model {

  get idScoringParameter(): number {
    return this.getDataValue("idScoringParameter");
  }

  get parameterName(): string {
    return this.getDataValue("parameterName");
  }

  get parameterValue(): number {
    return this.getDataValue("parameterValue");
  }

  get description(): string {
    return this.getDataValue("description");
  }

  get isActive(): boolean {
    return this.getDataValue("isActive");
  }

}

ScoringParameter.init(
  {
    idScoringParameter: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parameterName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    parameterValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING('MAX'),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ScoringParameter',
    tableName: 'tblScoringParameters',
    schema: 'request',
    timestamps: false,
    indexes: [{
      unique: true,
      name: "uk_ScoringParameter_ParameterName",
      fields: ['parameterName']
    }]
  }
);

export default ScoringParameter;