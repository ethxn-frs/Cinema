import { DataSource, DeleteResult } from "typeorm";
import { Transaction } from "../database/entities/transaction";
import { TransactionRequest } from "../handlers/validators/transaction-validator";
import { UserUseCase } from "./user-usecase";
import { AppDataSource } from "../database/database";


export interface ListTransactionFilter {
    limit: number;
    page: number;
    userId: number;
}

export class TransactionUseCase {

    constructor(private readonly db: DataSource) { }

    async getTransactionById(transactionId: number): Promise<Transaction | null> {
        const transactionRepository = this.db.getRepository(Transaction);
        return await transactionRepository.findOne({
            where: { id: transactionId }
        });
    }

    async listTransaction(listTransactionFilter: ListTransactionFilter): Promise<{ transactions: Transaction[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Transaction, 'transaction');

        query.skip((listTransactionFilter.page - 1) * listTransactionFilter.limit);
        query.take(listTransactionFilter.limit);

        if (listTransactionFilter.userId != null) {
            query.andWhere('transaction.userId = :userID', { userID: listTransactionFilter.userId })
        }

        const [transactions, totalCount] = await query.getManyAndCount();
        return { transactions, totalCount };
    }

    async deleteTransaction(transactionId: number): Promise<DeleteResult> {
        const transactionRepository = this.db.getRepository(Transaction);

        if (this.getTransactionById(transactionId) == null) {
            console.log("introuvable")
        }

        try {
            return await transactionRepository.delete(transactionId);
        } catch (error) {
            console.error("Failed to delete transaction with ID:", transactionId, error);
            throw error;
        }
    }

    async createTransaction(transactionData: TransactionRequest): Promise<Transaction | Error> {
        const userUseCase = new UserUseCase(AppDataSource);
        const transactionRepository = this.db.getRepository(Transaction);

        console.log("je suis la")
        const user = await userUseCase.getUserById(transactionData.userId);

        if (!user) {
            console.log("bug")
            return new Error(`User ${transactionData.userId} not found`);
        }

        console.log("je suis la")
        const newTransaction = new Transaction();
        console.log("je suis la")
        newTransaction.user = user;
        newTransaction.amount = transactionData.amount;
        newTransaction.createdAt = new Date();
        newTransaction.type = transactionData.type;

        console.log("nt");
        const result = await transactionRepository.save(newTransaction);
        console.log("res");

        return result;

    }

}