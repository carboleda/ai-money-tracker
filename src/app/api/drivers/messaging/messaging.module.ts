import { container } from "tsyringe";
import { FcmMessagingService } from "./fcm/fcm-messaging.service";

export class MessagingModule {
  static register(): void {
    // Register MessagingService with FcmMessagingService implementation
    container.register("MessagingService", {
      useClass: FcmMessagingService,
    });
  }
}
