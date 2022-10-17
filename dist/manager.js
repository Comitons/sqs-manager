"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Manager = void 0;
const AWS = __importStar(require("aws-sdk"));
class Manager {
    constructor() {
        // Set the region
        AWS.config.update({ region: "REGION" });
        // Create an SQS service object
        this.sqs = new AWS.SQS({
            apiVersion: "2012-11-05",
            endpoint: "http://localhost:9324",
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {};
            return new Promise((res, rej) => {
                this.sqs.listQueues(params, function (err, data) {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            });
        });
    }
    create(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                QueueName: name,
                Attributes: {
                    DelaySeconds: "0",
                    MessageRetentionPeriod: "86400",
                },
            };
            return new Promise((res, rej) => {
                this.sqs.createQueue(params, function (err, data) {
                    if (err) {
                        rej(err);
                        console.log("Error", err);
                    }
                    else {
                        res(data);
                        console.log("Success", data.QueueUrl);
                    }
                });
            });
        });
    }
    getQueryUrl(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                QueueName: name,
            };
            return new Promise((res, rej) => {
                this.sqs.getQueueUrl(params, function (err, data) {
                    if (err) {
                        rej(err);
                        console.log("Error", err);
                    }
                    else {
                        res(data.QueueUrl);
                        console.log("Success", data.QueueUrl);
                    }
                });
            });
        });
    }
    delete(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                QueueUrl: name,
            };
            this.sqs.deleteQueue(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                }
                else {
                    console.log("Success", data);
                }
            });
        });
    }
    sendMessage(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                // Remove DelaySeconds parameter and value for FIFO queues
                DelaySeconds: 0,
                MessageAttributes: {
                    Title: {
                        DataType: "String",
                        StringValue: "The Whistler",
                    },
                    Author: {
                        DataType: "String",
                        StringValue: "John Grisham",
                    },
                    WeeksOn: {
                        DataType: "Number",
                        StringValue: "6",
                    },
                },
                MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
                // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
                // MessageGroupId: "Group1",  // Required for FIFO queues
                QueueUrl: yield this.getQueryUrl(name),
            };
            console.log(yield this.getQueryUrl(name));
            this.sqs.sendMessage(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                }
                else {
                    console.log("Success", data.MessageId);
                }
            });
        });
    }
    receivedMessage(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                AttributeNames: ["SentTimestamp"],
                MaxNumberOfMessages: 10,
                MessageAttributeNames: ["All"],
                QueueUrl: yield this.getQueryUrl(name),
                VisibilityTimeout: 20,
                WaitTimeSeconds: 0,
            };
            return new Promise((res, rej) => {
                this.sqs.receiveMessage(params, (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log("Receive Error", err);
                    }
                    else if (data.Messages) {
                        const deleteParams = {
                            QueueUrl: yield this.getQueryUrl(name),
                            ReceiptHandle: data.Messages[0].ReceiptHandle,
                        };
                        this.sqs.deleteMessage(deleteParams, function (err, data) {
                            if (err) {
                                rej(err);
                                console.log("Delete Error", err);
                            }
                            else {
                                res(data);
                                console.log("Message Deleted", data);
                            }
                        });
                    }
                }));
            });
        });
    }
}
exports.Manager = Manager;
