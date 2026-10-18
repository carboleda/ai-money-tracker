import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { ParseTransactionDraftService } from "./parse-transaction-draft.service";
import { CreateTransactionService } from "./create-transaction.service";
import { TransactionStatus } from "../model/transaction.model";
import { CreateTransactionFromTextInput } from "../ports/inbound/create-transaction-from-text.port";

@Injectable()
export class CreateTransactionFromWebhookService
  implements Service<CreateTransactionFromTextInput, string>
{
  constructor(
    private readonly parseTransactionDraftService: ParseTransactionDraftService,
    private readonly createTransactionService: CreateTransactionService
  ) {}

  async execute(input: CreateTransactionFromTextInput): Promise<string> {
    const draft = await this.parseTransactionDraftService.execute({
      text: input.text,
    });

    return this.createTransactionService.execute({
      description: draft.description,
      type: draft.type,
      status: TransactionStatus.COMPLETE,
      category: draft.categoryRef,
      sourceAccount: draft.sourceAccountRef,
      destinationAccount: draft.destinationAccountRef,
      amount: draft.amount,
      createdAt: new Date(draft.createdAt),
    });
  }
}
