import express, { Request, Response } from "express";
import { LoginUserValidation, showUserSoldValidatort, userValidation } from "../validators/user-validator";
import { AppDataSource } from "../../database/database";
import { User } from "../../database/entities/user";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { hash, compare } from "bcrypt";
import { UserUseCase } from "../../domain/user-usecase";

export const userRoutes = (app: express.Express) => {

    app.get("/users", (req: Request, res: Response) => {
        const uservalidation = userValidation.validate(req.query)
        if (uservalidation.error) {
            res.status(400).send(generateValidationErrorMessage(uservalidation.error.details))
            return
        }
        return res.json(userValidation);
    })

    // inscription  utilisateur
    app.post('/auth/signup', async (req: Request, res: Response) => {

        const validation = userValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const userRequested = validation.value // récupère les données
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
            const userRepository = AppDataSource.getRepository(User)

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

    app.get('/users/:id/solde', async (req, res) => {
        try {
            const showusersoldvalidatort = showUserSoldValidatort.validate(req.body)
            if (showusersoldvalidatort.error) {
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
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    });
}