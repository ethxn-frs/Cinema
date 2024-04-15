import { DataSource } from "typeorm";
import { Room } from "../database/entities/room";
import { RoomRequest } from "../handlers/validators/room-validator";

export interface ListRoomFilter {
    page: number
    limit: number
}

export class RoomUseCase {
    constructor(private readonly db: DataSource) { }

    async listRoom(listRoomFilter: ListRoomFilter): Promise<{ rooms: Room[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Room, 'room');

        query.skip((listRoomFilter.page - 1) * listRoomFilter.limit);
        query.take(listRoomFilter.limit);

        const [rooms, totalCount] = await query.getManyAndCount();
        return { rooms, totalCount };
    }

    async createRoom(showData: RoomRequest): Promise<Room | Error> {
        const roomRepository = this.db.getRepository(Room);

        const newRoom = new Room();
        newRoom.name = showData.name;
        newRoom.description = showData.description;
        newRoom.capacity = showData.capacity;;
        newRoom.handicapAvailable = showData.handicapAvailable;
        newRoom.state = showData.state;
        newRoom.type = showData.type;

        return await roomRepository.save(newRoom);
    }
}