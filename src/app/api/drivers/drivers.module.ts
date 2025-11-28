import { FirestoreModule } from "./firestore/firestore.module";
import { GenAIModule } from "./genai/genai.module";
import { MessagingModule } from "./messaging/messaging.module";

export class DriversModule {
  static register(): void {
    FirestoreModule.register();
    GenAIModule.register();
    MessagingModule.register();
  }
}
