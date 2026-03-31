import { DataTypes, Model } from 'sequelize';
import sequelize from "../../utils/connection";
class StatusType extends Model{};

StatusType.init(
    {
        idStatusType:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        statusTypeName:{
            type: DataTypes.STRING('MAX'),
            allowNull: false
        },
        description:{
            type: DataTypes.STRING('MAX'),
            allowNull: false
        }
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'StatusType',
        tableName: 'tblStatusTypes',
        schema: 'asset',
    }
)


export default StatusType;