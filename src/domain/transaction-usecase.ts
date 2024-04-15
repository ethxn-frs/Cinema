import { DataSource } from "typeorm";
import { Transaction } from "../database/entities/transaction";


export interface ListTransactionFilter {
    limit: number;
    page: number;
}

export class TransactionUseCase {

    constructor(private readonly db: DataSource) { }

    async getTransactionById(showId: number): Promise<Transaction | null> {
        const showRepository = this.db.getRepository(Transaction);
        return await showRepository.findOne({
            where: { id: showId }
        });
    }

}