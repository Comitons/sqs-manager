import * as AWS from "aws-sdk";
import { SQS } from "aws-sdk";
import * as Logger from "pino";
import { Consumer } from "sqs-consumer";
import { ReceiveMessageResponse } from "./types";

export class ManagerSQS {
  private sqs: SQS;
  private logger: Logger.Logger;

  constructor(private readonly topics: string[]) {
    // Set the region
    AWS.config.update({ region: "REGION" });

    // Create an SQS service object
    this.sqs = new AWS.SQS({
      apiVersion: "2012-11-05",
      endpoint: "http://localhost:9324",
    });

    this.logger = Logger.pino();
  }

  async connect() {
    for (const topic of this.topics) {
      await this.create(topic);
    }
    this.logger.info("connected");
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

  private create(name: string) {
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

  async sendMessage(topic: string, body: any) {
    var params = {
      // Remove DelaySeconds parameter and value for FIFO queues
      DelaySeconds: 0,
      MessageBody: JSON.stringify(body),
      // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
      // MessageGroupId: "Group1",  // Required for FIFO queues
      QueueUrl: await this.getQueryUrl(topic),
    };

    console.log(await this.getQueryUrl(topic));

    this.sqs.sendMessage(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.MessageId);
      }
    });
  }

  async addConsumerListener(topic: string, handleMessage: (message: any) => Promise<void>) {
    const app = Consumer.create({
      queueUrl: await this.getQueryUrl(topic),
      handleMessage: handleMessage,
    });
    app.start();
  }

  async receivedMessage(topic: string): Promise<ReceiveMessageResponse> {
    var params = {
      AttributeNames: ["SentTimestamp"],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: await this.getQueryUrl(topic),
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0,
    };

    return new Promise((res, rej) => {
      this.sqs.receiveMessage(params, async (err, data) => {
        if (err) {
          console.log("Receive Error", err);
        } else if (data.Messages) {
          const deleteParams = {
            QueueUrl: await this.getQueryUrl(topic),
            ReceiptHandle: data.Messages[0].ReceiptHandle!,
          };

          this.sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
              rej(err);
            } else {
              console.log("Message Deleted", data);
              res(data);
            }
          });
        }
      });
    });
  }
}
