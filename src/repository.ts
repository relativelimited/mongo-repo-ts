import {Db, FilterQuery, MongoClient} from "mongodb";
import DocumentIncrementer from "./document-incrementer";
import {RepositoryDocument, RepositoryInterface} from "./repositoryInterface";

const dbConnectionString = process.env['MONGO_DB_CONNECTION_URI'] || '';
const dbDatabase = process.env['MONGO_DB_DATABASE'] || '';
let dbC: Db;

export default class Repository<T extends RepositoryDocument> implements RepositoryInterface<RepositoryDocument> {
    collectionName: string;
    modelRef: string;
    increments: boolean = true;

    constructor(collectionName: string, modelRef: string) {
        this.collectionName = collectionName;
        this.modelRef = modelRef;
    }

    async getByID(id: string): Promise<T> {
        const db = await Repository.getDb();
        return db.collection(this.collectionName).findOne({_id: id});
    }

    private static async getDb(): Promise<Db> {
        if (!dbC) {
            const client = await MongoClient.connect(dbConnectionString);
            dbC = client.db(dbDatabase);
        }
        return dbC;
    }

    async getAll(query?: FilterQuery<any>): Promise<Array<T>> {
        const db = await Repository.getDb();
        return db.collection(this.collectionName).find(query || {}).toArray();
    }

    async save(model: T): Promise<T> {
        const db = await Repository.getDb();
        if (!model._id || model._id.length === 0) {
            throw new Error('Model ID not set');
        }
        const response = await db.collection(this.collectionName).findOneAndUpdate(
            {_id: model._id},
            model
        );

        if (response.lastErrorObject.n === 1 && response.lastErrorObject.updatedExisting) {
            return this.getByID(model._id);
        } else {
            throw new Error('Request not found');
        }
    }

    async create(model: T): Promise<T> {
        const db = await Repository.getDb();
        if ((!model._id || model._id.length === 0) && this.increments) {
            model._id = await this.getID();
        }
        model.created = new Date().toISOString();
        const response = await db.collection(this.collectionName).insertOne(model);

        if (!response || !response.result.ok) {
            throw new Error('Unable to insert');
        }

        return this.getByID(model._id);
    }

    private async getID(): Promise<string> {
        const di = new DocumentIncrementer(dbC);
        return di.for(this.modelRef);
    }

    async delete(id: string): Promise<boolean> {
        const db = await Repository.getDb();
        const response = await db.collection(this.collectionName).deleteOne({_id: id});

        if (!response || response.result.n === 0) {
            throw new Error('Request not found');
        } else {
            return true;
        }
    }
}