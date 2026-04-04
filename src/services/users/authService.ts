import UserService from '../users/userService';
import User from '../../models/users/userModel';
import JsonResponse from '../../utils/jsonResponse';
import Role from '../../models/users/roleModel';
import sequelize from '../../utils/connection';
import { RegisterUserProp } from '../../utils/interfaces/authInterfaces';
import { Op, Transaction } from 'sequelize';
import EmailVerification from '../../models/asset/emailVerificationModel';
import EmailTemplate from '../../models/asset/emailTemplateModel';
import GmailEmailService from '../../utils/gmailService';
import Student from '../../models/users/studentModel';
import Employee from '../../models/users/employeeModel';
import StudentCareer from '../../models/users/studentCareerModel';

class AuthService {
    constructor(){};

    static async loginUser(email: string, password: string) {
        
        const user = await User.findOne({
            include: [
                {model:Student},
                {model:Employee}
            ],
            where: {
                email: email,
                password: password
            }
        });

        if(!user)
            return JsonResponse.error(401,"Credenciales inválidas.");

        if(!(user.isActive))
            return JsonResponse.error(401,"El usuario no está habilitado.");

        if(!(user.isVerified))
            return JsonResponse.error(405,"Por favor verifique su correo.");

        const data = {
            idUser : user.idUser,
            idRole: user.idRole,
            idStudent: user.Student?.idStudent,
            idEmployee: user.Employee?.idEmployee,
            email : user.email,
            name: user.name,
            isActive : user.isActive,
            isVerified : user.isVerified,
            role : user.idRole == 1 ? 'student' : user.idRole == 2 ? 'employee' : 'admin',
            accountNumber : user.Student?.accountNumber,
            employeeCode : user.Employee?.employeeCode
        }
        
        return JsonResponse.success(data,"La petición se ha realizado con éxito.");
    }

    static async registerUser(form: RegisterUserProp) {

        const user = await User.findOne({
            where : {
                email : form.email
            }
        });

        if(user)
            return JsonResponse.error(500,"Ya existe un usuario con las credenciales ingresadas.");

        const role = await Role.findByPk(form.idRole);

        if(!role?.isPublic)
            return JsonResponse.error(500,"Rol ingresado inválido.");

        if(form.idRole == 1){
            if( !(form.studentData) )
                return JsonResponse.error(500,"Falta información de estudiante.");

            const student = await Student.findOne({
                where: {
                    accountNumber : form.studentData.accountNumber
                }
            });

            if(student)
                return JsonResponse.error(500,"Ya existe un estudiante con el numero de cuenta ingresado.");
        } else if(form.idRole == 2){
            if( !(form.employeeData) )
                return JsonResponse.error(500,"Falta información de empleado.");

            const employee = await Employee.findOne({
                where: {
                    employeeCode : form.employeeData.employeeCode
                }
            });

            if(employee)
                return JsonResponse.error(500,"Ya existe un empleado con el código de empleado ingresado.");
        }
            

        if(form.idRole == 2 && !(form.employeeData))
            return JsonResponse.error(500,"Falta información de empleado.");

        

        const t = await sequelize.transaction();
        try {

            const newUser = await User.create({
                email: form.email,
                password: form.password,
                name: form.name,
                idRole: form.idRole
            }, {
                transaction: t
            });

            if(form.idRole == 1){   //Estudiante
                const newStudent = await Student.create({
                    idUser: newUser.idUser,
                    enrollmentDate : form.studentData?.enrollmentDate,
                    accountNumber : form.studentData?.accountNumber,
                    currentPeriod : form.studentData?.currentPeriod
                },{
                    transaction: t
                });

                await StudentCareer.bulkCreate(
                    form.studentData!.careers.map((id)=>{
                        return {
                            idStudent: newStudent.idStudent,
                            idCareer: id
                        }
                    }),{
                    transaction: t
                });

            }else if(form.idRole == 2){ //Empleado
                await Employee.create({
                    idUser: newUser.idUser,
                    ...form.employeeData
                },{
                    transaction: t
                });
            }

            ////Enviar correo de verificación
            const emailSuccess = await this.sendEmailVerification(newUser,t);
            
            if (!emailSuccess) {
                await t.rollback();
                return JsonResponse.error(500, "Error al enviar correo de verificación.");
            }

            await t.commit();

            return JsonResponse.success({newUser},"Usuario registrado con éxito.");
        } catch (err) {
            await t.rollback();
            console.log(err);
            return JsonResponse.error(500, "Error al registrar usuario.");
        }
    }

    static async verifyEmailCode(code: string, email: string) {

        const user = await User.findOne({
            where : {
                email : email
            }
        });

        if(!user)
            return JsonResponse.error(404, "No existe el correo ingresado.");

        if(user.isVerified)
            return JsonResponse.error(400, "El usuario ya ha verificado su correo.");

        const verification = await EmailVerification.findOne({
            where: {
                idUser: user.idUser,
                idStatus: 3, // Estado pendiente
                expiresAt: {
                    [Op.gt]: new Date() // No expirado
                }
            }
        });

        if(!verification)
            return JsonResponse.error(404, "No se encontró un código de verificación válido. Solicite uno nuevo.");

        if(verification.failedAttempts >= 5)
            return JsonResponse.error(400, "Demasiados intentos fallidos. Solicite un nuevo código.");

        const t = await sequelize.transaction();
        try {
            if(verification.code !== code){
                const newFailedAttempts = verification.failedAttempts + 1;
                const newStatus = newFailedAttempts >= 5 ? 2 : 3; // 2 = expirado/fallido, 3 = pendiente
                
                await EmailVerification.update({
                    failedAttempts: newFailedAttempts,
                    idStatus: newStatus
                }, {
                    where: {
                        idEmailVerification: verification.idEmailVerification
                    },
                    transaction: t
                });

                await t.commit();

                if (newFailedAttempts >= 5) {
                    return JsonResponse.error(400, "Demasiados intentos fallidos. Solicite un nuevo código.");
                }
                
                const remainingAttempts = 5 - newFailedAttempts;
                return JsonResponse.error(400, `Código incorrecto. Le quedan ${remainingAttempts} intentos.`);
            }
            
            await EmailVerification.update({
                idStatus: 1, // 1 = verificado
                verifiedAt: new Date().toISOString()
            }, {
                where: {
                    idEmailVerification: verification.idEmailVerification
                },
                transaction: t
            });

            await User.update({
                isVerified: true
            }, {
                where: {
                    idUser: user.idUser
                },
                transaction: t
            });

            await t.commit();

            return JsonResponse.success({}, "Código verificado exitosamente.");
        } catch (err) {
            await t.rollback();
            console.error('Error en verificación:', err);
            return JsonResponse.error(500, "Error al verificar el código.");
        }
    }

    static async resendVerification(email: string): Promise<JsonResponse> {

        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if(!user) {
            return JsonResponse.error(500, "No existe el usuario.");
        }

        if(user.isVerified) {
           return JsonResponse.error(500, "El usuario ya está verificado.");
        }

        const t = await sequelize.transaction();
        
        try {

            const successEmail = await this.sendEmailVerification(user, t);

            if(!successEmail){
                await t.rollback();
                return JsonResponse.error(500,"Error al enviar correo.");
            }
            
            await t.commit();

            return JsonResponse.success({},"Correo enviado.");
        } catch (err) {

            console.error('Error en sendEmailVerification:', err);
            return JsonResponse.error(500,"Error interno en el servidor.");
        }
    }


    //metodo privado
    private static async sendEmailVerification(user : User, t: Transaction): Promise<Number> {
        
        try {
            await EmailVerification.update({
                idStatus: 2, //expirado/fallido
                expiresAt: new Date().toISOString()
            }, {
                where: {
                    idUser: user.idUser,
                    idStatus: 3
                },
                transaction: t
            });

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            
            const newVerification = await EmailVerification.create({
                idUser: user.idUser,
                code: verificationCode,
                expiresAt: expiresAt.toISOString(),
                idStatus: 3, //pendiente
                failedAttempts: 0,
                createdAt: new Date().toISOString()
            }, {
                transaction: t
            });

            /////////////// Enviar correo electrónico
            const template = await EmailTemplate.findOne({
                where: {
                    templateName: 'VERIFICATION'
                },
                transaction: t
            });

            if(!template){
                return 0;
            }

            const content = {
                name : user.name,
                code: verificationCode,
                expiresAt: expiresAt
            };

            const gmail = await GmailEmailService.sendEmail(
                user.email, 'Verificación', template.content,content
            );

            console.log(gmail);

            if(!gmail.success){
                return 0;
            }


            return 1;
        } catch (err) {
            console.error('Error en sendEmailVerification:', err);
            return 0;
        }
    }


    //Para verificar un usuario manualmente, SOLO PARA HACER PRUEBAS CON CORREOS QUE NO EXISTEN
    static async testVerifyEmail(email:string) : Promise<JsonResponse> {
        
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if(!user)
            return JsonResponse.error(404, "No existe el correo ingresado.");

        if(user.isVerified)
            return JsonResponse.error(400, "El usuario ya ha verificado su correo.");

        const t = await sequelize.transaction();
        try{

            await User.update({
                isVerified: true,
            },{
                where: {
                    idUser: user.idUser
                },
                transaction: t
            });

            await EmailVerification.update({
                idStatus: 1
            },{
                where: {
                    idUser: user.idUser
                },
                transaction: t
            });

            return JsonResponse.success({},"Usuario Verificado con exito.");

        } catch (err) {
            
            console.error('Error en sendEmailVerification:', err);
            return JsonResponse.error(500,"Error Interno del Servidor.");
        }
    }

}

export default AuthService;
