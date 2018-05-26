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
class Repository {
    constructor(options, mongoClient) {
        this.increments = true;
        this.collectionName = options.collectionName;
        this.modelRef = options.modelRef;
        this.increments = options.increments;
        this.connectionUri = options.mongoDBConnectionURI;
        this.dbName = options.mongoDBDatabase;
        this.mongoClient = mongoClient;
    }
    getByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            return db.collection(this.collectionName).findOne({ _id: id });
        });
    }
    getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mongoClient) {
                this.mongoClient = yield mongodb_1.MongoClient.connect(this.connectionUri);
            }
            return this.mongoClient.db(this.dbName);
            ;
        });
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            return db.collection(this.collectionName).find(query || {}).toArray();
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
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
            const db = yield this.getDb();
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
            const di = new document_incrementer_1.default(yield this.getDb());
            return di.for(this.modelRef);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
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
exports.Repository = Repository;
