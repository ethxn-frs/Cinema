import { DataSource } from "typeorm";
import { Room } from "../database/entities/room";

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

    async updateRoom(id: number): Promise<Room | null>{
        const repo = this.db.getRepository(Room)
        const roomFound = await repo.findOneBy({id})
        
        if(roomFound === null) return null;
        
        const roomUpdated = await repo.save(roomFound)
        return roomUpdated;
    }
}