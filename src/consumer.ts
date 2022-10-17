import { Manager } from "./manager";
import { ReceiveMessageResponse } from "./types";
function hasMessages(response: ReceiveMessageResponse): boolean {
  return Boolean(response.Messages) && response.Messages!.length > 0;
}
export interface ConsumerOptions {
  nameTopic: string;
  handleMessage?(message: any): Promise<void>;
}

export class Consumer {
  private nameTopic: string;
  private manager: Manager;
  private handleMessage?: (message: any) => Promise<void>;

  constructor(options: ConsumerOptions) {
    this.manager = new Manager();
    this.nameTopic = options.nameTopic;
    this.handleMessage = options.handleMessage;
  }

  async receiveMessage(): Promise<ReceiveMessageResponse> {
    return this.manager.receivedMessage(this.nameTopic);
  }

  async poll() {
    console.log("t");
    await this.receiveMessage()
      .then((r) => {
        console.log(r);
      })
      .then(() => {
        setTimeout(this.poll, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async handleSqsResponse(response: ReceiveMessageResponse) {
    if (response) {
      if (hasMessages(response)) {
      }
    }
  }

  async start() {
    await this.poll();
  }
}
