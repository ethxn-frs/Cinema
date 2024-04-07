import { DataSource } from "typeorm";
import { Show } from "../database/entities/show";

export interface ListShowFilter {
    limit: number
    page: number
    priceMax?: number
}

export interface UpdateShowParams {
    startAt?: Date,
    endAt?: Date,
}

export class ShowUsecase {
    constructor(private readonly db: DataSource) { }

    async listShow(listShowFilter: ListShowFilter): Promise<{ shows: Show[]; totalCount: number; }> {
        console.log(listShowFilter)
        const query = this.db.createQueryBuilder(Show, 'show')
        if (listShowFilter.priceMax) {
            query.andWhere('show.price <= :priceMax', { priceMax: listShowFilter.priceMax })
        }
        query.skip((listShowFilter.page - 1) * listShowFilter.limit)
        query.take(listShowFilter.limit)

        const [shows, totalCount] = await query.getManyAndCount()
        return {
            shows,
            totalCount
        }
    }

    async updateShow(id: number, { startAt, endAt }: UpdateShowParams): Promise<Show | null> {
        const repo = this.db.getRepository(Show)
        const showfound = await repo.findOneBy({ id })
        if (showfound === null) return null

        if (startAt) {
            showfound.startAt = startAt
        }
        if (endAt) {
            showfound.endAt = endAt
        }

        const showUpdate = await repo.save(showfound)
        return showUpdate
    }
}