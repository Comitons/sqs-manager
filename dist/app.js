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
const manager_1 = require("./manager");
const manager = new manager_1.Manager();
// const consumer = new Consumer({
//   nameTopic: "test2",
//   handleMessage: async (message: any) => {
//     console.log(message);
//   },
// });
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield manager.create("test2");
    yield manager.sendMessage("test2");
    //await consumer.start();
}))();
//@ts-ignore
const { Consumer } = require("sqs-consumer");
const app = Consumer.create({
    queueUrl: "http://localhost:9324/queue/test2",
    handleMessage: (message) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(message);
        // do some work with `message`
    }),
});
app.start();
