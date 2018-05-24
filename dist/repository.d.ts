import { FilterQuery } from "mongodb";
export interface RepositoryInterface<T extends RepositoryDocument> {
    getByID(id: string): Promise<T>;
    getAll(): Promise<Array<T>>;
    save(model: T): Promise<T>;
    create(model: T): Promise<T>;
    delete(id: string): Promise<boolean>;
}
export interface RepositoryDocument {
    _id: string;
    created: string;
}
export declare class Repository<T extends RepositoryDocument> implements RepositoryInterface<RepositoryDocument> {
    collectionName: string;
    modelRef: string;
    increments: boolean;
    constructor(collectionName: string, modelRef: string);
    getByID(id: string): Promise<T>;
    private static getDb();
    getAll(query?: FilterQuery<any>): Promise<Array<T>>;
    save(model: T): Promise<T>;
    create(model: T): Promise<T>;
    private getID();
    delete(id: string): Promise<boolean>;
}
