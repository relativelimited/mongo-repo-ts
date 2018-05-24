"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const document_incrementer_1 = __importDefault(require("./document-incrementer"));
const dbConnectionString = process.env['MONGO_DB_CONNECTION_URI'] || '';
const dbDatabase = process.env['MONGO_DB_DATABASE'] || '';
let dbC;
class Repository {
    constructor(collectionName, modelRef) {
        this.increments = true;
        this.collectionName = collectionName;
        this.modelRef = modelRef;
    }
    getByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield Repository.getDb();
            return db.collection(this.collectionName).findOne({ _id: id });
        });
    }
    static getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dbC) {
                const client = yield mongodb_1.MongoClient.connect(dbConnectionString);
                dbC = client.db(dbDatabase);
            }
            return dbC;
        });
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield Repository.getDb();
            return db.collection(this.collectionName).find(query || {}).toArray();
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield Repository.getDb();
            if (!model._id || model._id.length === 0) {
                throw new Error('Model ID not set');
            }
            const response = yield db.collection(this.collectionName).findOneAndUpdate({ _id: model._id }, model);
            if (response.lastErrorObject.n === 1 && response.lastErrorObject.updatedExisting) {
                return this.getByID(model._id);
            }
            else {
                throw new Error('Request not found');
            }
        });
    }
    create(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield Repository.getDb();
            if ((!model._id || model._id.length === 0) && this.increments) {
                model._id = yield this.getID();
            }
            model.created = new Date().toISOString();
            const response = yield db.collection(this.collectionName).insertOne(model);
            if (!response || !response.result.ok) {
                throw new Error('Unable to insert');
            }
            return this.getByID(model._id);
        });
    }
    getID() {
        return __awaiter(this, void 0, void 0, function* () {
            const di = new document_incrementer_1.default(dbC);
            return di.for(this.modelRef);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield Repository.getDb();
            const response = yield db.collection(this.collectionName).deleteOne({ _id: id });
            if (!response || response.result.n === 0) {
                throw new Error('Request not found');
            }
            else {
                return true;
            }
        });
    }
}
exports.default = Repository;
