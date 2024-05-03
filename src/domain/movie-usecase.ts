import { DataSource } from "typeorm";
import { Movie } from "../database/entities/movie";
import { MovieRequest } from "../handlers/validators/movie-validator";
import { Image } from "../database/entities/image"
import { ImageUseCase } from "./image-usecase";
import { AppDataSource } from "../database/database";

export interface ListMovieFilter {
    limit: number;
    page: number;
    ascending: boolean;
    orderBy: string;
    name?: string;
}

export class MovieUseCase {
    constructor(private readonly db: DataSource) { }

    async listMovie(listMovieFilter: ListMovieFilter): Promise<{ movies: Movie[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Movie, 'movie');

        query.leftJoinAndSelect('movie.image', 'image');

        if (listMovieFilter.orderBy) {
            const direction = listMovieFilter.ascending ? 'ASC' : 'DESC';
            query.orderBy(`movie.${listMovieFilter.orderBy}`, direction);
        }

        if (listMovieFilter.name) {
            query.andWhere('movie.name LIKE :name', { name: `%${listMovieFilter.name}%` });
        }

        query.skip((listMovieFilter.page - 1) * listMovieFilter.limit);
        query.take(listMovieFilter.limit);

        const [movies, totalCount] = await query.getManyAndCount();
        return { movies, totalCount };
    }

    async getMovieById(movieId: number): Promise<Movie | null> {

        const movieRepository = this.db.getRepository(Movie);

        return await movieRepository.findOne({
            where: { id: movieId },
            relations: {
                image: true,
                shows: true,
            }
        });
    }

    async createMovie(movieData: MovieRequest): Promise<Movie | Error> {
        const movieRepository = this.db.getRepository(Movie);

        const newMovie = new Movie();
        newMovie.description = movieData.description;
        newMovie.name = movieData.name;
        newMovie.duration = movieData.duration;

        if (movieData.imageId) {
            const imageRepository = this.db.getRepository(Image);
            const image = await imageRepository.findOneBy({ id: movieData.imageId });
            if (!image) {
                return new Error(`Image ${movieData.imageId} not found`);
            }
            newMovie.image = image;
        }

        return await movieRepository.save(newMovie);
    }

    async getMovieShows(movieId: number): Promise<Movie | null> {

        const movieRepository = this.db.getRepository(Movie);

        return await movieRepository.findOne({
            where: { id: movieId },
            relations: {
                image: true,
                shows: true,
            }
        });
    }
}