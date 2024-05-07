import express, {NextFunction, Request, Response} from "express";
import {
    listTransactionValidation,
    transactionIdValidation,
    transactionValidation
} from "../validators/transaction-validator";
import {TransactionUseCase} from "../../domain/transaction-usecase";
import {AppDataSource} from "../../database/database";
import {generateValidationErrorMessage} from "../validators/generate-validation-message";
import {VerifyErrors} from "jsonwebtoken";

const jwt = require('jsonwebtoken');

export const transactionRoutes = (app: express.Express) => {

    const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.JWT_SECRET as string, (err: VerifyErrors | null, user: object | undefined) => {
                if (err) {
                    return res.sendStatus(403); // Forbidden access
                }

                // @ts-ignore
                req.user = user; // Assign the decoded user to the request object
                next();
            });
        } else {
            return res.sendStatus(401); // Unauthorized access
        }
    };

    //get all transactions
    app.get("/transactions", authenticateJWT, async (req: Request, res: Response) => {

        const validation = listTransactionValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
        }
        const listTransactionsRequest = validation.value

        if (listTransactionsRequest.userId) {
            // @ts-ignore
            if (listTransactionsRequest.userId != req.user.userId) {
                return res.status(401).send("UNAUTHORIZED")

            }
        }

        let limit = 50
        if (listTransactionsRequest.limit)
            limit = listTransactionsRequest.limit

        const page = listTransactionsRequest.page ?? 1

        try {
            const transactionUseCase = new TransactionUseCase(AppDataSource)
            const listTransaction = await transactionUseCase.listTransaction({...listTransactionsRequest, page, limit})
            res.status(200).send(listTransaction)
        } catch (error) {
            res.status(500).send({error: "Internal error"})
        }
    })

    //get by id
    app.get("/transactions/:id", async (req: Request, res: Response) => {

        try {
            const validation = transactionIdValidation.validate(req.params)

            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details))
                return
            }

            const transactionId = validation.value.id
            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const result = transactionUseCase.deleteTransaction(transactionId);

            res.status(200).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    //delete by id
    app.delete("/transactions/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = transactionIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const transactionId = validationResult.value.id
            const transactionUseCase = new TransactionUseCase(AppDataSource);
            const result = transactionUseCase.deleteTransaction(transactionId);

            res.status(200).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    //create transaction
    app.post("/transactions", async (req: Request, res: Response) => {

        const validation = transactionValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const transactionRequested = validation.value
        const transactionUseCase = new TransactionUseCase(AppDataSource);

        try {
            const result = await transactionUseCase.createTransaction(transactionRequested);
            return res.status(201).send(result);
        } catch (error) {
            console.log(error)
            res.status(500).send({"error": "internal error retry later"})
            return
        }
    })

}
