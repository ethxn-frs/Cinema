import { DataSource, DeleteResult } from "typeorm";
import { Show } from "../database/entities/show";
import {ShowRequest, UpdateShowRequest} from "../handlers/validators/show-validator";
import { Movie } from "../database/entities/movie";
import { Room } from "../database/entities/room";

export interface ListShowFilter {
    limit: number;
    page: number;
    startAtMin?: Date;
    startAtMax?: Date;
    endAtMin?: Date;
    endAtMax?: Date;
}

export class ShowUsecase {
    constructor(private readonly db: DataSource) { }

    async listShow(listShowFilter: ListShowFilter): Promise<{ shows: Show[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Show, 'show');

        query.leftJoinAndSelect('show.room', 'room');
        query.leftJoinAndSelect('show.movie', 'movie');

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

    async getShowById(showId: number): Promise<Show | null> {
        const showRepository = this.db.getRepository(Show);
        return await showRepository.findOne({
            where: { id: showId },
            relations: {
                room: true,
                movie: true,
            }
        });
    }

    async createShow(showData: ShowRequest): Promise<Show | Error> {
        const roomRepository = this.db.getRepository(Room);
        const movieRepository = this.db.getRepository(Movie);
        const showRepository = this.db.getRepository(Show);

        const room = await roomRepository.findOneBy({ id: showData.roomId });
        const movie = await movieRepository.findOneBy({ id: showData.movieId });

        if (!room) {
            return new Error(`Room ${showData.roomId} not found`);
        }
        if (!movie) {
            return new Error(`Movie ${showData.movieId} not found`);
        }

        const endAt = new Date(showData.startAt.getTime());
        endAt.setMinutes(endAt.getMinutes() + movie.duration + 30);

        const newShow = new Show();
        newShow.room = room;
        newShow.movie = movie;
        newShow.startAt = new Date(showData.startAt);
        newShow.endAt = endAt;
        newShow.state = showData.state;

        return await showRepository.save(newShow);
    }

    async updateShow(id: number, updatedShow: UpdateShowRequest): Promise<Show | null> {
        const repo = this.db.getRepository(Show);
        const showFound = await repo.findOneBy({ id });
        if (showFound === null) return null;

        if (updatedShow.startAt) showFound.startAt = updatedShow.startAt;
        if (updatedShow.endAt) showFound.endAt = updatedShow.endAt;

        return await repo.save(showFound);
    }

    async deleteShow(showId: number): Promise<DeleteResult> {
        const showRepository = this.db.getRepository(Show);

        if (this.getShowById(showId) == null) {
            throw new Error(`Sho ${showId} not found`);
        }

        try {
            return await showRepository.delete(showId);
        } catch (error) {
            console.error("Failed to delete show with ID:", showId, error);
            throw error;
        }
    }
}
