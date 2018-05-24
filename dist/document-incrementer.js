"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class DocumentIncrementer {
    constructor(db) {
        this.db = db;
    }
    for(objectClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.collection('ids');
            const output = yield collection.findOneAndUpdate({ _id: objectClass }, { $inc: { "seq": 1 } }, { upsert: true });
            return output.value.seq.toString();
        });
    }
}
exports.default = DocumentIncrementer;
