import { DataSource } from "typeorm";
import { Movie } from "../database/entities/movie";
import { MovieRequest } from "../handlers/validators/movie-validator";
import { Image } from "../database/entities/image"
import { ImageUseCase } from "./image-usecase";
import { AppDataSource } from "../database/database";

export interface ListMovieFilter {
    limit: number;
    page: number;
}

export class MovieUseCase {
    constructor(private readonly db: DataSource) { }

    async listMovie(listMovieFilter: ListMovieFilter): Promise<{ movies: Movie[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Movie, 'movie');

        query.leftJoinAndSelect('movie.image', 'image');

        query.skip((listMovieFilter.page - 1) * listMovieFilter.limit);
        query.take(listMovieFilter.limit);

        const [movies, totalCount] = await query.getManyAndCount();
        return { movies, totalCount };
    }

    async getMovieById(movieId: number): Promise<Movie | null> {

        const movieRepository = this.db.getRepository(Movie);
        const imageUseCase = new ImageUseCase(AppDataSource);

        let movieWithImages = await imageUseCase.findByMovieId(movieId);

        return await movieRepository.findOne({
            where: { id: movieId },
            relations: {
                image: true,
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
                return new Error(`Room ${movieData.imageId} not found`);
            }
            newMovie.image = image;
        }

        return await movieRepository.save(newMovie);
    }
}