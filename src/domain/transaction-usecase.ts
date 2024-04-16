import { DataSource, DeleteResult } from "typeorm";
import { Transaction } from "../database/entities/transaction";


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

}