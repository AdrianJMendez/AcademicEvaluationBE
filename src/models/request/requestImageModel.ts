import { BelongsToGetAssociationMixin, DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/connection';
import Request from './requestModel';

class RequestImage extends Model {
  declare getRequest: BelongsToGetAssociationMixin<Request>;
  declare Request?: Request;

  get idRequestImage(): number {
    return this.getDataValue("idRequestImage");
  }

  get idRequest(): number {
    return this.getDataValue("idRequest");
  }

  get imageName(): string {
    return this.getDataValue("imageName");
  }
  get imageUrl(): string {
    return this.getDataValue("imageUrl");
  }

  get thumbnailUrl(): string {
    return this.getDataValue("thumbnailUrl");
  }

}

RequestImage.init(
  {
    idRequestImage: {
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
    imageName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida"
        }
      }
    },
    thumbnailUrl: {
      type: DataTypes.STRING('MAX'),
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida"
        }
      }
    },
  },
  {
    sequelize,
    modelName: 'RequestImage',
    tableName: 'tblRequestImages',
    schema: 'request',
    timestamps: false
  }
);

export default RequestImage;