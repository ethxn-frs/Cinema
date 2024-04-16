import express, { Request, Response } from "express";
import { listTransactionValidation, transactionIdValidation } from "../validators/transaction-validator";
import { TransactionUseCase } from "../../domain/transaction-usecase";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { Transaction } from "typeorm";

export const transactionRoutes = (app: express.Express) => {

    //get all transactions
    app.get("/transactions", async (req: Request, res: Response) => {

        const validation = listTransactionValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
        }
        const listTransactionsRequest = validation.value

        let limit = 50
        if (listTransactionsRequest.limit)
            limit = listTransactionsRequest.limit

        const page = listTransactionsRequest.page ?? 1

        try {
            const transactionUseCase = new TransactionUseCase(AppDataSource)
            const listTransaction = await transactionUseCase.listTransaction({ ...listTransactionsRequest, page, limit })
            res.status(200).send(listTransaction)
        } catch (error) {
            res.status(500).send({ error: "Internal error" })
        }
    })

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
            res.status(500).send({ error: "Internal error" })
        }
    })

}
