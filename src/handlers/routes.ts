import express, { Request, Response, request } from "express";
import { compare, hash} from "bcrypt";
import { userValidation as userValidation,creatUser,LoginUserValidation,UserTransationListValidatort,showUserSoldValidatort,UserTicketListValidatort} from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { AppDataSource } from "../database/database";
import { User } from "../database/entities/user";
//import { ProductUsecase } from "../domain/product-usecase";

export const initRoutes = (app: express.Express) => {
    
    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })

    
    app.get("/users",(req: Request,res: Response)=>{
        const uservalidation = userValidation.validate(req.query)
        if (uservalidation.error) {
            res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
            return
        }
        return res.json(userValidation);
    })

    // A revoir
   /* app.post("/users",(req: Request, res: Response)=>{

        const uservalidation = userValidation.validate(req.query)
        if (uservalidation.error) {
            res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
            return
        }
        return res.json(userValidation);
    })*/

    // inscription  utilisateur
    app.post('/auth/signup', async (req: Request, res: Response) => {
        try {
            const createuserRequest = creatUser.validate(req.body)

            if (createuserRequest.error) {
                res.status(400).send(generateValidationErrorMessage(createuserRequest.error.details))
                return
            }
            const createUserRequest = createuserRequest.value // récupère les données
            const hashedPassword = await hash(createUserRequest.password, 10); //hash le mot de passe
            const userRepository = AppDataSource.getRepository(User)

            const newUser = userRepository.save({
                login: createUserRequest.login,
                password : hashedPassword,
                solde: 0
            });

            res.status(201).send({newUser})
            return
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })

    app.post('/auth/login', async (req: Request, res: Response) => {
        try {
            const LoginUser = LoginUserValidation.validate(req.body)

            if (LoginUser.error) {
                res.status(400).send(generateValidationErrorMessage(LoginUser.error.details))
                return
            }

            const loginuser = LoginUser.value // récupère les données
            const hashedPassword = await hash(loginuser.password, 10); //hash le mot de passe
            const userRepository = AppDataSource.getRepository(User)

            const match = await compare(hashedPassword, loginuser.password);

            if(match){
                res.send({ message: 'Connexion réussie'});
                res.send({
                    message: 'Connexion réussie',
                    login : loginuser.login
                })
            }
            else {
                res.status(401).send({ error: 'Mot de passe incorrect' });
            }
 
            res.status(201).send({loginuser})
            return
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
    
    app.post('/auth/logout', (req, res) => {
        res.status(200).send({ message: 'Déconnexion réussie. Veuillez supprimer votre jeton.' });
    })

    //
    app.get('/users/:id/solde', async (req, res) => {
        try{
            const showusersoldvalidatort = showUserSoldValidatort.validate(req.body)
            if(showusersoldvalidatort.error){
                res.status(400).send(generateValidationErrorMessage(showusersoldvalidatort.error.details))
                return
            }
            const usersolde = AppDataSource.getRepository(User)
            const solde = await usersolde.findOneBy({ id: showusersoldvalidatort.value.id })
            if (solde === null) {
                res.status(404).send({ "error": `product ${showusersoldvalidatort.value.id} not found` })
                return
            }
            res.status(200).send(solde.sold)
        }catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });
    
    app.get('/users/:id/transactions', async (req, res) => {
        try{
            const showuserTransationvalidatort = UserTransationListValidatort.validate(req.body)
            if(showuserTransationvalidatort.error){
                res.status(400).send(generateValidationErrorMessage(showuserTransationvalidatort.error.details))
                return
            }

            if(showuserTransationvalidatort.value.roles ==='Admin'){
                res.status(200).send(showuserTransationvalidatort.value.transactions)
            }
            else if(showuserTransationvalidatort.value.roles ==='Client'){
                const usertransation = AppDataSource.getRepository(User)
                const transation = await usertransation.findOneBy({ id: showuserTransationvalidatort.value.id })
                if (transation === null) {
                    res.status(404).send({ "error": `product ${showuserTransationvalidatort.value.id} not found` })
                    return
                }
                res.status(200).send(transation.transactions)
            }
            else{
                res.status(401).send({ error: 'error' });
            }
   
        }catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });

    app.get('/users/:id/tickets', async (req, res) => {
        try{
            const UserTicketList = UserTicketListValidatort.validate(req.body)
            if(UserTicketList.error){
                res.status(400).send(generateValidationErrorMessage(UserTicketList.error.details))
                return
            }
            const userticket = AppDataSource.getRepository(User)

            if(UserTicketList.value.roles ==='Admin'){
                res.status(200).send(UserTicketList.value.tickets)
            }
            else if(UserTicketList.value.roles ==='Client'){
                const ticket= await userticket.findOneBy({ id: UserTicketList.value.id })
                if (ticket === null) {
                    res.status(404).send({ "error": `product ${UserTicketList.value.id} not found` })
                    return
                }
                res.status(200).send(ticket.tickets)
            }
            else {
                res.status(401).send({ error: 'error' });
            }
            
        }catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });
    
    app.get('/users/:id/role', async (req, res) => {
        // Logique pour vérifier et retourner le rôle de l'utilisateur
    });
      
      
}

