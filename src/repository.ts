import {Db, FilterQuery, MongoClient} from "mongodb";
import DocumentIncrementer from "./document-incrementer";

export interface RepositoryInterface<T extends RepositoryDocument> {
    getByID(id: string): Promise<T>;

    getAll(query?: FilterQuery<any>): Promise<Array<T>>;

    save(model: T): Promise<T>;

    create(model: T): Promise<T>;

    delete(id: string): Promise<boolean>;
}

export interface RepositoryDocument {
    _id: string;
    created: string;
}

export interface RepositoryOptions {
    collectionName: string;
    modelRef: string;
    mongoDBConnectionURI: string;
    mongoDBDatabase: string;
    increments: boolean;
}

export class Repository<T extends RepositoryDocument> implements RepositoryInterface<RepositoryDocument> {
    collectionName: string;
    modelRef: string;
    increments: boolean = true;
    connectionUri: string;
    dbName: string;
    mongoClient?: MongoClient;

    constructor(options: RepositoryOptions, mongoClient?: MongoClient) {
        this.collectionName = options.collectionName;
        this.modelRef = options.modelRef;
        this.increments = options.increments;
        this.connectionUri = options.mongoDBConnectionURI;
        this.dbName = options.mongoDBDatabase;
        this.mongoClient = mongoClient;
    }

    async getByID(id: string): Promise<T> {
        const db = await this.getDb();
        return db.collection(this.collectionName).findOne({_id: id});
    }

    private async getDb(): Promise<Db> {
        if (!this.mongoClient) {
            this.mongoClient = await MongoClient.connect(this.connectionUri);
        }
        return this.mongoClient.db(this.dbName);
        ;
    }

    async getAll(query?: FilterQuery<any>): Promise<Array<T>> {
        const db = await this.getDb();
        return db.collection(this.collectionName).find(query || {}).toArray();
    }

    async save(model: T): Promise<T> {
        const db = await this.getDb();
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
        const db = await this.getDb();
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
        const di = new DocumentIncrementer(await this.getDb());
        return di.for(this.modelRef);
    }

    async delete(id: string): Promise<boolean> {
        const db = await this.getDb();
        const response = await db.collection(this.collectionName).deleteOne({_id: id});

        if (!response || response.result.n === 0) {
            throw new Error('Request not found');
        } else {
            return true;
        }
    }
}