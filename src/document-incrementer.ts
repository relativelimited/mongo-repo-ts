import {Db} from "mongodb";

export default class DocumentIncrementer {
    db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async for(objectClass: string): Promise<string> {
        const collection = this.db.collection('ids');
        const output = await collection.findOneAndUpdate(
            {_id: objectClass},
            {$inc: {"seq": 1}},
            {upsert: true}
        );
        return output.value.seq.toString();
    }
}