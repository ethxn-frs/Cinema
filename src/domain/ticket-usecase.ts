import { DataSource } from "typeorm";
import { Ticket } from "../database/entities/ticket";

export interface ListTicketFilter {
    page: number
    limit: number
    priceMax?: number
}


export class TicketUseCase {
    constructor(private readonly db: DataSource) { }

    async listTicket(listTicketFilter: ListTicketFilter): Promise<{ tickets: Ticket[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Ticket, 'ticket');

        if (listTicketFilter.priceMax) {
            query.andWhere('ticket.price <= :priceMax', { priceMax: listTicketFilter.priceMax })
        }

        query.skip((listTicketFilter.page - 1) * listTicketFilter.limit);
        query.take(listTicketFilter.limit);

        const [tickets, totalCount] = await query.getManyAndCount();
        return { tickets, totalCount };
    }
}