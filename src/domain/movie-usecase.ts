import { DataSource } from "typeorm";
import { Movie } from "../database/entities/movie";

export interface ListMovieFilter {
    limit: number;
    page: number;
}

export class MovieUseCase {
    constructor(private readonly db: DataSource) { }

    async listMovie(listMovieFilter: ListMovieFilter): Promise<{ movies: Movie[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Movie, 'movie');

        query.skip((listMovieFilter.page - 1) * listMovieFilter.limit);
        query.take(listMovieFilter.limit);

        const [movies, totalCount] = await query.getManyAndCount();
        return { movies, totalCount };
    }

    async updateMovie(id: number): Promise<Movie | null>{
        const repo = this.db.getRepository(Movie)
        const movieFound = await repo.findOneBy({id})
        
        if(movieFound === null) return null;
        
        const movieUpdated = await repo.save(movieFound)
        return movieUpdated;
    }

}