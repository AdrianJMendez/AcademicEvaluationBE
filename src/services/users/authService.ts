import UserService from '../users/userService';
import User from '../../models/users/userModel';
import JsonResponse from '../../utils/jsonResponse';
import Role from '../../models/users/roleModel';
import sequelize from '../../utils/connection';
import { RegisterUserProp } from '../../utils/interfaces/authInterfaces';
import { Op, Transaction } from 'sequelize';

class AuthService {
    constructor(){};

    static async loginUser(email: string, password: string) {
        
        const user = await User.findOne({
            where: {
                email: email,
                password: password
            }
        });

        if(!user)
            return JsonResponse.error(401,"Credenciales inválidas.");

        if(!(user.isActive)  || !(user.isActive))
            return JsonResponse.error(401,"El usuario no está habilitado.");

        
        return JsonResponse.success(user,"La petición se ha realizado con éxito.");
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

            // Enviar correo de verificación
            // const emailSuccess = await this.sendEmailVerification(newUser,t);
            
            // if (!emailSuccess) {
            //     await t.rollback();
            //     return JsonResponse.error(500, "Error al enviar correo de verificación.");
            // }

            await t.commit();

            return JsonResponse.success({newUser},"Usuario registrado con éxito.");
        } catch (err) {
            await t.rollback();
            console.log(err);
            return JsonResponse.error(500, "Usuario no registrado.");
        }
    }

    // static async verifyEmailCode(code: string, email: string) {

    //     const user = await User.findOne({
    //         where : {
    //             email : email
    //         }
    //     });

    //     if(!user)
    //         return JsonResponse.error(404, "No existe el correo ingresado.");

    //     if(user.isVerified)
    //         return JsonResponse.error(400, "El usuario ya ha verificado su correo.");

    //     const verification = await EmailVerification.findOne({
    //         where: {
    //             idUser: user.idUser,
    //             idStatus: 3, // Estado pendiente
    //             expiresAt: {
    //                 [Op.gt]: new Date() // No expirado
    //             }
    //         }
    //     });

    //     if(!verification)
    //         return JsonResponse.error(404, "No se encontró un código de verificación válido. Solicite uno nuevo.");

    //     if(verification.failedAttempts >= 5)
    //         return JsonResponse.error(400, "Demasiados intentos fallidos. Solicite un nuevo código.");

    //     const t = await sequelize.transaction();
    //     try {
    //         if(verification.code !== code){
    //             const newFailedAttempts = verification.failedAttempts + 1;
    //             const newStatus = newFailedAttempts >= 5 ? 2 : 3; // 2 = expirado/fallido, 3 = pendiente
                
    //             await EmailVerification.update({
    //                 failedAttempts: newFailedAttempts,
    //                 idStatus: newStatus
    //             }, {
    //                 where: {
    //                     idEmailVerification: verification.idEmailVerification
    //                 },
    //                 transaction: t
    //             });

    //             await t.commit();

    //             if (newFailedAttempts >= 5) {
    //                 return JsonResponse.error(400, "Demasiados intentos fallidos. Solicite un nuevo código.");
    //             }
                
    //             const remainingAttempts = 5 - newFailedAttempts;
    //             return JsonResponse.error(400, `Código incorrecto. Le quedan ${remainingAttempts} intentos.`);
    //         }
            
    //         await EmailVerification.update({
    //             idStatus: 1, // 1 = verificado
    //             verifiedAt: new Date().toISOString()
    //         }, {
    //             where: {
    //                 idEmailVerification: verification.idEmailVerification
    //             },
    //             transaction: t
    //         });

    //         await User.update({
    //             isVerified: true
    //         }, {
    //             where: {
    //                 idUser: user.idUser
    //             },
    //             transaction: t
    //         });

    //         await t.commit();

    //         return JsonResponse.success({}, "Código verificado exitosamente.");
    //     } catch (err) {
    //         await t.rollback();
    //         console.error('Error en verificación:', err);
    //         return JsonResponse.error(500, "Error al verificar el código.");
    //     }
    // }

    // static async resendVerification(email: string): Promise<JsonResponse> {

    //     const user = await User.findOne({
    //         where: {
    //             email: email
    //         }
    //     });

    //     if(!user) {
    //         return JsonResponse.error(500, "No existe el usuario.");
    //     }

    //     if(user.isVerified) {
    //        return JsonResponse.error(500, "El usuario ya está verificado.");
    //     }

    //     const t = await sequelize.transaction();
        
    //     try {

    //         const successEmail = await this.sendEmailVerification(user, t);

    //         if(!successEmail){
    //             await t.rollback();
    //             return JsonResponse.error(500,"Error al enviar correo.");
    //         }
            
    //         await t.commit();

    //         return JsonResponse.success({},"Correo enviado.");
    //     } catch (err) {

    //         console.error('Error en sendEmailVerification:', err);
    //         return JsonResponse.error(500,"Error interno en el servidor.");
    //     }
    // }


    // //metodo privado
    // private static async sendEmailVerification(user : User, t: Transaction): Promise<Number> {
        
    //     try {
    //         await EmailVerification.update({
    //             idStatus: 2, //expirado/fallido
    //             expiresAt: new Date().toISOString()
    //         }, {
    //             where: {
    //                 idUser: user.idUser,
    //                 idStatus: 3
    //             },
    //             transaction: t
    //         });

    //         const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
    //         const expiresAt = new Date();
    //         expiresAt.setHours(expiresAt.getHours() + 24);
            
    //         const newVerification = await EmailVerification.create({
    //             idUser: user.idUser,
    //             code: verificationCode,
    //             expiresAt: expiresAt.toISOString(),
    //             idStatus: 3, //pendiente
    //             failedAttempts: 0,
    //             createdAt: new Date().toISOString()
    //         }, {
    //             transaction: t
    //         });

    //         /////////////// Enviar correo electrónico
    //         const template = await EmailTemplate.findOne({
    //             where: {
    //                 templateName: 'VERIFICATION'
    //             },
    //             transaction: t
    //         });

    //         if(!template){
    //             return 0;
    //         }

    //         const content = {
    //             userName : user.userName,
    //             code: verificationCode,
    //             expiresAt: expiresAt
    //         };

    //         const gmail = await GmailService.sendEmail(
    //             user.email, 'Verificación', template.content,content
    //         );

    //         console.log(gmail);

    //         if(!gmail.success){
    //             return 0;
    //         }


    //         return 1;
    //     } catch (err) {
    //         console.error('Error en sendEmailVerification:', err);
    //         return 0;
    //     }
    // }


    // //Para verificar un usuario manualmente, SOLO PARA HACER PRUEBAS CON CORREOS QUE NO EXISTEN
    // static async testVerifyEmail(email:string) : Promise<JsonResponse> {
        
    //     const user = await User.findOne({
    //         where: {
    //             email: email
    //         }
    //     });

    //     if(!user)
    //         return JsonResponse.error(404, "No existe el correo ingresado.");

    //     if(user.isVerified)
    //         return JsonResponse.error(400, "El usuario ya ha verificado su correo.");

    //     const t = await sequelize.transaction();
    //     try{

    //         await User.update({
    //             isVerified: true,
    //         },{
    //             where: {
    //                 idUser: user.idUser
    //             },
    //             transaction: t
    //         });

    //         await EmailVerification.update({
    //             idStatus: 1
    //         },{
    //             where: {
    //                 idUser: user.idUser
    //             },
    //             transaction: t
    //         });

    //         return JsonResponse.success({},"Usuario Verificado con exito.");

    //     } catch (err) {
            
    //         console.error('Error en sendEmailVerification:', err);
    //         return JsonResponse.error(500,"Error Interno del Servidor.");
    //     }
    // }

}

export default AuthService;