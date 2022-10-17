import { Consumer } from "./consumer";
import { Manager } from "./manager";

const manager = new Manager();
// const consumer = new Consumer({
//   nameTopic: "test2",
//   handleMessage: async (message: any) => {
//     console.log(message);
//   },
// });

(async () => {
  await manager.create("test2");
  await manager.sendMessage("test2");
  //await consumer.start();
})();

//@ts-ignore
const { Consumer } = require("sqs-consumer");

const app = Consumer.create({
  queueUrl: "http://localhost:9324/queue/test2",
  handleMessage: async (message: any) => {
    console.log(message);
    // do some work with `message`
  },
});

app.start();
