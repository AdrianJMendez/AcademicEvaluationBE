import { Sequelize } from 'sequelize';
import { config } from '../config';
import { DataTypes } from 'sequelize';

//Para arreglar los datos tipo DATE
DataTypes.DATE.prototype._stringify = function _stringify(date: Date, options: any) {return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');};

const sequelize = new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASSWORD,
    {
        host: config.DB_SERVER,
        port: 1433,
        dialect : 'mssql',
        pool: {
        max: 5,
        min: 0,
        idle: 10000
        },
        dialectOptions: {
            options: { 
                encrypt: false, 
                trustServerCertificate: true,
                instanceName : config.DB_INSTANCE
            }
        }
    }
);

try {
    sequelize.authenticate();
    console.log('Conexión establecida exitósamente.');
} catch (error) {
    console.error('Error al conectar a la base:', error);
}

export default sequelize;
