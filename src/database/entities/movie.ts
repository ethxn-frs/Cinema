import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Image } from "./image"
import { Show } from "./show";

@Entity()
export class Movie {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @OneToOne(() => Image, (image) => image.movie)
    image: Image

    @OneToOne(() => Show, (show) => show.room)
    show: Show;

    constructor(id: number, name: string, description: string, image: Image, show: Show) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.show = show;
    }
}