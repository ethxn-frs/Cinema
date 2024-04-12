import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Image } from "./image"
import { Show } from "./show";

@Entity()
export class Movie {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @OneToOne(() => Image, (image) => image.movie)
    image!: Image;

    @OneToOne(() => Show, (show) => show.room)
    @JoinColumn()
    show!: Show;

    constructor(id?: number, name?: string, description?: string, image?: Image, show?: Show) {
        if (id) this.id = id;
        if (name) this.name = name;
        if (description) this.description = description;
        if (image) this.image = image;
        if (show) this.show = show;
    }
}