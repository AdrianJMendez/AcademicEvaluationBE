import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';

class EmailTemplate extends Model {
    get idEmailTemplate(): number {
        return this.getDataValue("idEmailTemplate");
    }
    
    get templateName(): string {
        return this.getDataValue("templateName");
    }

    get content(): string {
        return this.getDataValue("content");
    }
}

EmailTemplate.init(
  {
    idEmailTemplate: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    templateName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
    }
  },
  {
    sequelize, 
    timestamps: false,
    modelName: 'EmailTemplate', 
    tableName: 'tblEmailTemplates',
    schema : 'asset'
  },
);


export default EmailTemplate;