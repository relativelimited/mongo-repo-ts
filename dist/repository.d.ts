import { FilterQuery, MongoClient } from "mongodb";
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
export declare class Repository<T extends RepositoryDocument> implements RepositoryInterface<RepositoryDocument> {
    collectionName: string;
    modelRef: string;
    increments: boolean;
    connectionUri: string;
    dbName: string;
    mongoClient?: MongoClient;
    constructor(options: RepositoryOptions, mongoClient?: MongoClient);
    getByID(id: string): Promise<T>;
    private getDb();
    getAll(query?: FilterQuery<any>): Promise<Array<T>>;
    save(model: T): Promise<T>;
    create(model: T): Promise<T>;
    private getID();
    delete(id: string): Promise<boolean>;
}
