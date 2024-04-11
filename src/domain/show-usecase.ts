import { DataSource } from "typeorm";
import { Show } from "../database/entities/show";

export interface ListShowFilter {
    limit: number;
    page: number;
    startAtMin?: Date;
    startAtMax?: Date;
    endAtMin?: Date;
    endAtMax?: Date;
}

export interface UpdateShowParams {
    startAt?: Date;
    endAt?: Date;
}

export class ShowUsecase {
    constructor(private readonly db: DataSource) { }

    async listShow(listShowFilter: ListShowFilter): Promise<{ shows: Show[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Show, 'show');

        if (listShowFilter.startAtMin) {
            query.andWhere('show.startAt >= :startAtMin', { startAtMin: listShowFilter.startAtMin });
        }

        if (listShowFilter.startAtMax) {
            query.andWhere('show.startAt <= :startAtMax', { startAtMax: listShowFilter.startAtMax });
        }

        if (listShowFilter.endAtMin) {
            query.andWhere('show.endAt >= :endAtMin', { endAtMin: listShowFilter.endAtMin });
        }

        if (listShowFilter.endAtMax) {
            query.andWhere('show.endAt <= :endAtMax', { endAtMax: listShowFilter.endAtMax });
        }

        query.skip((listShowFilter.page - 1) * listShowFilter.limit);
        query.take(listShowFilter.limit);

        const [shows, totalCount] = await query.getManyAndCount();
        return {
            shows,
            totalCount
        };
    }

    async updateShow(id: number, { startAt, endAt }: UpdateShowParams): Promise<Show | null> {
        const repo = this.db.getRepository(Show);
        const showFound = await repo.findOneBy({ id });
        if (showFound === null) return null;

        if (startAt) showFound.startAt = startAt;
        if (endAt) showFound.endAt = endAt;

        const showUpdated = await repo.save(showFound);
        return showUpdated;
    }
}
