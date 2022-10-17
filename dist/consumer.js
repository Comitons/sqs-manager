"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
const manager_1 = require("./manager");
function hasMessages(response) {
    return Boolean(response.Messages) && response.Messages.length > 0;
}
class Consumer {
    constructor(options) {
        this.manager = new manager_1.Manager();
        this.nameTopic = options.nameTopic;
        this.handleMessage = options.handleMessage;
    }
    receiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.manager.receivedMessage(this.nameTopic);
        });
    }
    poll() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("t");
            yield this.receiveMessage()
                .then((r) => {
                console.log(r);
            })
                .then(() => {
                setTimeout(this.poll, 1000);
            })
                .catch((err) => {
                console.log(err);
            });
        });
    }
    handleSqsResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (response) {
                if (hasMessages(response)) {
                }
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.poll();
        });
    }
}
exports.Consumer = Consumer;
