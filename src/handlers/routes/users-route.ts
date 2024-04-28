import express, { Request, Response } from "express";
import { LoginUserValidation, listUserValidation, updateUserRequest, userIdValidator, userValidation } from "../validators/user-validator";
import { AppDataSource } from "../../database/database";
import { User } from "../../database/entities/user";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { hash, compare } from "bcrypt";
import { UserUseCase } from "../../domain/user-usecase";
import { createTicketUser } from "../validators/ticket-validator";

export const userRoutes = (app: express.Express) => {

    app.get("/users", async (req: Request, res: Response) => {
        const validation = listUserValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
        }
        const listUsersRequest = validation.value

        let limit = 50
        if (listUsersRequest.limit)
            limit = listUsersRequest.limit

        const page = listUsersRequest.page ?? 1

        try {
            const userUseCase = new UserUseCase(AppDataSource)
            const listUser = await userUseCase.listUser({ ...listUsersRequest, page, limit })
            res.status(200).send(listUser)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.post('/auth/signup', async (req: Request, res: Response) => {

        const validation = userValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const userRequested = validation.value
        const userUseCase = new UserUseCase(AppDataSource);

        try {

            const result = await userUseCase.createUser(userRequested);

            return res.status(201).send(result);
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

            const match = await compare(hashedPassword, loginuser.password);

            if (match) {
                res.send({ message: 'Connexion réussie' });
                res.send({
                    message: 'Connexion réussie',
                    login: loginuser.login
                })
            }
            else {
                res.status(401).send({ error: 'Mot de passe incorrect' });
            }

            res.status(201).send({ loginuser })
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

    app.get('/users/:id/transactions', async (req, res) => {
        try {
            const validation = userIdValidator.validate(req.params);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
            const userId = validation.value.id

            const userUseCase = new UserUseCase(AppDataSource);
            const userTransactions = await userUseCase.getTransactionsFromUserId(userId);
            res.status(200).send(userTransactions);
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    });

    // route pour mettre a jour le solde
    app.put('/users/:id/sold', async (req, res) => {
        const userIdValid = userIdValidator.validate(req.params)

        if (userIdValid.error) {
            res.status(400).send(generateValidationErrorMessage(userIdValid.error.details));
            return;
        }

        const userId = userIdValid.value.id
        const userData = req.body;
        const validation = updateUserRequest.validate(userData);

        if (validation.error) {
            return res.status(400).send(generateValidationErrorMessage(validation.error.details));
        }

        try {
            const userUseCase = new UserUseCase(AppDataSource);
            const user = await userUseCase.updateUser(userId, userData);
            res.status(200).send(user)
        } catch (error: any) {
            res.status(500).send("Error: " + error.message);
        }
    });

    // pour acheter un ticket
    app.put('/users/:id/tickets', async (req, res) => {
        
        const userIdValid = userIdValidator.validate(req.params)

        if (userIdValid.error) {
            res.status(400).send(generateValidationErrorMessage(userIdValid.error.details));
            return;
        }

        const userId = userIdValid.value.id
        const userTicketData = req.body;
        const validation = createTicketUser.validate(userTicketData);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const userUseCase = new UserUseCase(AppDataSource);
            const user = await userUseCase.createUserTicket(userId, userTicketData);
            return res.status(200).send(user)
        } catch (error: any) {
            return res.status(500).send("Error: " + error.message);
        }
    });

    // pour consulter ses tickets
    app.get('/users/:id/tickets', async (req: Request, res: Response) => {
        const userIdValid = userIdValidator.validate(req.params)

        if (userIdValid.error) {
            res.status(400).send(generateValidationErrorMessage(userIdValid.error.details));
        }

        const userId = userIdValid.value.id
        const userUseCase = new UserUseCase(AppDataSource);
        try {
            const userTickets = await userUseCase.getTicketsFromUserId(userId);
            res.status(200).send(userTickets);
        } catch (error: any) {
            res.status(500).send("Error: " + error.message);
        }
    })
}