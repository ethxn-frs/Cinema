import { DataSource } from "typeorm/data-source/DataSource";
import { Image } from "../database/entities/image";
import { Repository } from "typeorm/repository/Repository";

export interface ListMovieFilter {
    limit: number;
    page: number;
}

export class ImageUseCase {
    private imageRepository: Repository<Image>;

    constructor(private readonly db: DataSource) {
        this.imageRepository = this.db.getRepository(Image);
    }

    async findByMovieId(movieId: number): Promise<Image | Error> {
        try {
            const image = await this.imageRepository.findOne({
                where: { movie: { id: movieId } }
            });

            if (!image) {
                return new Error('Image not found for the provided movie ID');
            }

            return image;
        } catch (error) {
            console.error("Error finding image by movie ID:", error);
            return new Error('Internal server error');
        }
    }
}