import "reflect-metadata";
import { container } from "tsyringe";
import { CreateTransactionFromWebhookService } from "../create-transaction-from-webhook.service";
import { ParseTransactionDraftService } from "../parse-transaction-draft.service";
import { CreateTransactionService } from "../create-transaction.service";
import { NotifyPaymentCreatedService } from "@/app/api/domain/notification/service/notify-payment-created.service";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

describe("CreateTransactionFromWebhookService", () => {
  let service: CreateTransactionFromWebhookService;
  let parseTransactionDraftService: jest.Mocked<ParseTransactionDraftService>;
  let createTransactionService: jest.Mocked<CreateTransactionService>;
  let notifyPaymentCreatedService: jest.Mocked<NotifyPaymentCreatedService>;

  const draft = {
    amount: 45,
    type: TransactionType.EXPENSE,
    categoryRef: "category1",
    sourceAccountRef: "account1",
    destinationAccountRef: undefined,
    description: "Netflix",
    createdAt: "2026-10-31T00:00:00.000Z",
    confidence: 0.9,
  };

  beforeEach(() => {
    container.clearInstances();

    const mockParseTransactionDraftService = {
      execute: jest.fn().mockResolvedValue(draft),
    } as unknown as jest.Mocked<ParseTransactionDraftService>;

    const mockCreateTransactionService = {
      execute: jest.fn().mockResolvedValue("transaction1"),
    } as unknown as jest.Mocked<CreateTransactionService>;

    const mockNotifyPaymentCreatedService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotifyPaymentCreatedService>;

    container.register(ParseTransactionDraftService, {
      useValue: mockParseTransactionDraftService,
    });
    container.register(CreateTransactionService, {
      useValue: mockCreateTransactionService,
    });
    container.register(NotifyPaymentCreatedService, {
      useValue: mockNotifyPaymentCreatedService,
    });
    container.register(CreateTransactionFromWebhookService, {
      useClass: CreateTransactionFromWebhookService,
    });

    service = container.resolve(CreateTransactionFromWebhookService);
    parseTransactionDraftService = mockParseTransactionDraftService;
    createTransactionService = mockCreateTransactionService;
    notifyPaymentCreatedService = mockNotifyPaymentCreatedService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("parses the draft, creates the transaction and returns its id", async () => {
    const result = await service.execute({ text: "I paid 45 for Netflix" });

    expect(parseTransactionDraftService.execute).toHaveBeenCalledWith({
      text: "I paid 45 for Netflix",
    });
    expect(createTransactionService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        description: draft.description,
        type: draft.type,
        amount: draft.amount,
      })
    );
    expect(result).toBe("transaction1");
  });

  it("notifies payment created with the new transaction id and draft data", async () => {
    await service.execute({ text: "I paid 45 for Netflix" });

    expect(notifyPaymentCreatedService.execute).toHaveBeenCalledWith({
      transactionId: "transaction1",
      description: draft.description,
      amount: draft.amount,
      type: draft.type,
    });
  });

  it("notifies after the transaction has been created", async () => {
    const callOrder: string[] = [];
    createTransactionService.execute.mockImplementation(async () => {
      callOrder.push("create");
      return "transaction1";
    });
    notifyPaymentCreatedService.execute.mockImplementation(async () => {
      callOrder.push("notify");
    });

    await service.execute({ text: "I paid 45 for Netflix" });

    expect(callOrder).toEqual(["create", "notify"]);
  });
});
