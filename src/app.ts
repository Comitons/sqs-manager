import { ManagerSQS } from "./manager";
const { Consumer } = require("sqs-consumer");

const managerSqs = new ManagerSQS(["test1", "test2"]);

(async () => {
  await managerSqs.connect();
  await managerSqs.sendMessage("test1", {
    test: "test1",
  });
  await managerSqs.sendMessage("test2", {
    test: "test2",
  });

  await managerSqs.addConsumerListener("test2", async (message: any) => {
    console.log('list1');
    console.log(message);
  });

  await managerSqs.addConsumerListener("test1", async (message: any) => {
    console.log('list2');
    console.log(message);
  });
  
  await managerSqs.sendMessage("test1", {
    test: "test5",
  });

  await managerSqs.sendMessage("test2", {
    test: "test3",
  });
})();
