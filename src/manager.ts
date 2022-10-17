import * as AWS from "aws-sdk";
import { SQS } from "aws-sdk";
import * as util from "util";
import { ReceiveMessageResponse } from "./types";

export class Manager {
  public sqs: SQS;

  constructor() {
    // Set the region
    AWS.config.update({ region: "REGION" });

    // Create an SQS service object
    this.sqs = new AWS.SQS({
      apiVersion: "2012-11-05",
      endpoint: "http://localhost:9324",
    });
  }

  async list(): Promise<SQS.ListQueuesResult> {
    var params = {};
    return new Promise<SQS.ListQueuesResult>((res, rej) => {
      this.sqs.listQueues(
        params,
        function (err: AWS.AWSError, data: SQS.ListQueuesResult) {
          if (err) {
            rej(err);
          } else {
            res(data);
          }
        }
      );
    });
  }

  async create(name: string) {
    var params = {
      QueueName: name,
      Attributes: {
        DelaySeconds: "0",
        MessageRetentionPeriod: "86400",
      },
    };

    return new Promise<SQS.CreateQueueResult>((res, rej) => {
      this.sqs.createQueue(params, function (err, data) {
        if (err) {
          rej(err);
          console.log("Error", err);
        } else {
          res(data);
          console.log("Success", data.QueueUrl);
        }
      });
    });
  }

  async getQueryUrl(name: string): Promise<string> {
    var params = {
      QueueName: name,
    };

    return new Promise((res, rej) => {
      this.sqs.getQueueUrl(params, function (err, data) {
        if (err) {
          rej(err);
          console.log("Error", err);
        } else {
          res(data.QueueUrl as string);
          console.log("Success", data.QueueUrl);
        }
      });
    });
  }

  async delete(name: string) {
    var params = {
      QueueUrl: name,
    };

    this.sqs.deleteQueue(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
  }

  async sendMessage(name: string) {
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
      MessageBody:
        "Information about current NY Times fiction bestseller for week of 12/11/2016.",
      // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
      // MessageGroupId: "Group1",  // Required for FIFO queues
      QueueUrl: await this.getQueryUrl(name),
    };

    console.log(await this.getQueryUrl(name));

    this.sqs.sendMessage(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.MessageId);
      }
    });
  }

  async receivedMessage(name: string): Promise<ReceiveMessageResponse> {
    var params = {
      AttributeNames: ["SentTimestamp"],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: await this.getQueryUrl(name),
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0,
    };

    return new Promise((res, rej) => {
      this.sqs.receiveMessage(params, async (err, data) => {
        if (err) {
          console.log("Receive Error", err);
        } else if (data.Messages) {
          const deleteParams = {
            QueueUrl: await this.getQueryUrl(name),
            ReceiptHandle: data.Messages[0].ReceiptHandle!,
          };

          this.sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              rej(err);
              console.log("Delete Error", err);
            } else {
              res(data);
              console.log("Message Deleted", data);
            }
          });
        }
      });
    });
  }
}
