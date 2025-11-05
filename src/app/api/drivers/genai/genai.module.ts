import { container } from "tsyringe";
import { GenkitService } from "./genkit/genkit.service";

export class GenAIModule {
  static register(): void {
    container.register("GenAIService", {
      useClass: GenkitService,
    });
  }
}
