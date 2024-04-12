import express, { Request, Response} from "express";
import { compare, hash} from "bcrypt";
import { userValidation as userValidation,listUserValidation,UserValidationRequest,LoginUserValidation,
    showUserSoldValidatort,UserIdValidator,creatUser,userUpDateSolde} from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { AppDataSource } from "../database/database";
import { User } from "../database/entities/user";
import { ListUsecase} from "../domain/user-usecase";

import { ticketValidation, listTicketValidation, updateTicketValidation, ticketIdValidation } from './validators/ticket-validator'; // Ajustez le chemin d'importation

export const initRoutes = (app: express.Express) => {
    
    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })

//  récupère la liste des utlisateurs 
    app.get("/users", async (req: Request, res: Response) => {
        const validation = listUserValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listuserRequest = validation.value
        let limit = 50
        if (listuserRequest.limit) {
            limit = listuserRequest.limit
        }
        const page = listuserRequest.page ?? 1

        try {
            const list = new ListUsecase(AppDataSource);

            const listShows = await list.listUser({ ...listuserRequest, page, limit })
            res.status(200).send(listShows)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    // créer un utlisateur 
   app.post("/users",async (req: Request, res: Response)=>{
        try {
            const uservalidation = UserValidationRequest.validate(req.body)

            if (uservalidation.error) {
                res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
                return
            }

            const uservalue = uservalidation.value
            const hashedPassword = await hash(uservalue.password, 10);
            uservalue.password = hashedPassword;
            const creatuser = AppDataSource.getRepository(User)
            await creatuser.save(
                uservalue
            );
            res.status(201).json({ message: "User created successfully"});
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })

    app.get('/users/:id', async (req, res) => {
        try{
            const showuser = UserIdValidator.validate(req.params)
            if(showuser.error){
                res.status(400).send(generateValidationErrorMessage(showuser.error.details))
                return
            }
            const useridvalidation = AppDataSource.getRepository(User)
            const userinfo = showuser.value;
            const user = await useridvalidation.findOneBy({ id:userinfo.id});

            if (user === null) {
                res.status(404).send({ "error": `product ${userinfo.id} not found` })
                return
            }
            res.status(200).send(user)
        }catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });

    // delete a ticket by id
    app.delete("/users/:id", async (req: Request, res: Response) => {
        try {
            const deleteuser = UserIdValidator.validate(req.params)

            if (deleteuser.error) {
                res.status(400).send(generateValidationErrorMessage(deleteuser.error.details))
                return
            }
            const userid = deleteuser.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userid.id })
            if (user === null) {
                res.status(404).send({ "error": `ticket ${userid.id} not found` })
                return
            }

            const userDeleted = await userRepository.remove(user)
            res.status(200).send(userDeleted)
            res.status(200).send({"message":`user ${userid.id} is delete`})
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    // obtenir le solde
    app.get('/users/:id/solde', async (req, res) => {
        try{
            const showusersoldvalidatort = showUserSoldValidatort.validate(req.params)
            if(showusersoldvalidatort.error){
                res.status(400).send(generateValidationErrorMessage(showusersoldvalidatort.error.details))
                return
            }
            const usersolde = AppDataSource.getRepository(User)
            const usersoldevalue = showusersoldvalidatort.value;
            const solde = await usersolde.findOneBy({ id:usersoldevalue.id, sold:usersoldevalue.sold});

            if (solde === null) {
                res.status(404).send({ "error": `product ${usersoldevalue.id} not found` })
                return
            }
            res.status(200).send({sold: solde.sold})
        }catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });

    app.patch('/users/:id/balance', async (req, res) => {
        try {
            const paramValidation = UserIdValidator.validate(req.params);
            if (paramValidation.error) {
                return res.status(400).send(generateValidationErrorMessage(paramValidation.error.details));
            }
    
            const bodyValidation = userUpDateSolde.validate(req.body);
            if (bodyValidation.error) {
                return res.status(400).send(generateValidationErrorMessage(bodyValidation.error.details));
            }
    
            const { id } = paramValidation.value;
            const { sold } = bodyValidation.value;
    
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: id });
    
            // Check if the user exists
            if (!user) {
                return res.status(404).send({ "error": `User with ID ${id} not found` });
            }
    
            // Update the user's balance
            user.sold = sold;
            await userRepository.save(user);
    
            // Send the updated user info or just a success message
            res.status(200).send({ message: "User balance updated successfully", sold: user.sold });
        } catch (error) {
            console.error('Error updating user balance:', error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    

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
            const userRepository = AppDataSource.getRepository(User);
            createUserRequest.password = hashedPassword;
            const newUser = userRepository.save(createUserRequest);

            res.status(201).send({message:"compte avec succès"})
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

            const { login, password } = LoginUser.value;
            const user = await AppDataSource.getRepository(User).findOneBy({login: login})

            if(!user){
                res.status(400).send({error:"username or password not valid"})
                return
            }
            
            const match = await compare(password, user.password);

            if(!match){
                res.status(401).send({ error: ' password not valid' });
            }
            
            // Login successful
            return res.status(200).send({
                message: 'Connexion réussie',
                login: user.login
            });
        } catch (error) {
            console.log(error)
            res.status(500).send({ "error": "internal error retry later" })
            return
        }
    })
    
    app.get('/auth/logout', (req, res) => {
        res.status(200).send({ message: 'Déconnexion réussie. Veuillez supprimer votre jeton.' });
    })

 /*     
    // voir la liste de transaction
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

    // liste des tickets
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
     
    
    // Créer un nouveau ticket
    app.post('/tickets', (req, res) => {
        const ticketvalidation = ticketValidation.validate(req.body);

        if(ticketvalidation.error){
            res.status(400).send(generateValidationErrorMessage(ticketvalidation.error.details))
            return
        }
        // Logique pour créer un ticket avec les données validées `value`
        res.status(201).send({ message: "Ticket créé", ticket: ticketvalidation.value });
    });

    // Lister les tickets avec pagination et filtre optionnel par prix max
    app.get('/tickets', (req, res) => {
        const listticket = listTicketValidation.validate(req.body);

        if(listticket.error){
            return res.status(400).send(generateValidationErrorMessage(listticket.error.details))   
        }

        // Logique pour lister les tickets selon les critères validés `value`
        res.send({ message: "Liste des tickets", criteria: listticket.value, tickets: [] });
    });

    // Mettre à jour un ticket par ID
    app.patch('/tickets/:id', (req, res) => {

        const ticketIdError = ticketIdValidation.validate({ id: req.params.id });

        const updateError = updateTicketValidation.validate(req.body);

        if (ticketIdError.error || updateError.error){
            return res.status(400).json({ ...ticketIdError.error?.details, ...updateError.error?.details });
        }

        // Logique pour mettre à jour un ticket avec les données validées
        res.send({ message: "Ticket mis à jour", ticketId: req.params.id, updateData: updateError.value });
    });

    // Supprimer un ticket par ID
    app.delete('/tickets/:id', (req, res) => {
        const { error } = ticketIdValidation.validate({ id: req.params.id });
        if (error) {
            return res.status(400).json(error.details);
        }
        // Logique pour supprimer un ticket avec l'ID validé
        res.send({ message: "Ticket supprimé", ticketId: req.params.id });
    });*/

      
}
