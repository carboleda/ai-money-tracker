import "reflect-metadata";
import { container } from "tsyringe";
import { ParseTransactionDraftService } from "../parse-transaction-draft.service";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { GetAllCategoriesService } from "@/app/api/domain/category/service/get-all-categories.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import type { GenAIService } from "@/app/api/domain/shared/interfaces/parsed-transaction.interface";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

describe("ParseTransactionDraftService", () => {
  let service: ParseTransactionDraftService;
  let genAIService: GenAIService;
  let getAllCategoriesService: GetAllCategoriesService;
  let getAllAccountsService: GetAllAccountsService;

  const mockCategories: never[] = [];
  const mockAccounts: never[] = [];

  beforeEach(() => {
    container.clearInstances();
    jest.clearAllMocks();

    const mockGenAIService: GenAIService = {
      extractData: jest.fn(),
    };

    const mockGetAllCategoriesService = {
      execute: jest.fn().mockResolvedValue(mockCategories),
    } as unknown as GetAllCategoriesService;

    const mockGetAllAccountsService = {
      execute: jest.fn().mockResolvedValue(mockAccounts),
    } as unknown as GetAllAccountsService;

    container.register("GenAIService", { useValue: mockGenAIService });
    container.register(GetAllCategoriesService, {
      useValue: mockGetAllCategoriesService,
    });
    container.register(GetAllAccountsService, {
      useValue: mockGetAllAccountsService,
    });

    container.register(ParseTransactionDraftService, {
      useClass: ParseTransactionDraftService,
    });

    service = container.resolve(ParseTransactionDraftService);
    genAIService = container.resolve<GenAIService>("GenAIService");
    getAllCategoriesService = container.resolve(GetAllCategoriesService);
    getAllAccountsService = container.resolve(GetAllAccountsService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should throw a 400 DomainError when neither text nor picture is provided", async () => {
    const rejects = expect(service.execute({})).rejects;

    await rejects.toThrow(DomainError);
    await rejects.toThrow(
      "Missing required transaction information. Please provide an amount or description."
    );

    try {
      await service.execute({});
      fail("Expected execute to throw");
    } catch (error) {
      const domainError = error as DomainError<{
        code: string;
        missingFields?: string[];
      }>;
      expect(domainError.statusCode).toBe(400);
      expect(domainError.details).toEqual({
        code: "MISSING_INPUT_FIELDS",
        missingFields: ["amount", "description"],
      });
    }
  });

  it("should throw a 400 DomainError when text is blank", async () => {
    const rejects = expect(service.execute({ text: "   " })).rejects;

    await rejects.toThrow(DomainError);
    await rejects.toThrow(
      "Missing required transaction information. Please provide an amount or description."
    );
  });

  it("should not call the AI service when required input is missing", async () => {
    await expect(service.execute({})).rejects.toThrow(DomainError);

    expect(getAllCategoriesService.execute).not.toHaveBeenCalled();
    expect(getAllAccountsService.execute).not.toHaveBeenCalled();
    expect(genAIService.extractData).not.toHaveBeenCalled();
  });

  it("should fetch categories and accounts in parallel and call genAIService with correct data", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      description: "Whole Foods Groceries",
      amount: 45,
      type: TransactionType.EXPENSE,
      category: "groceries",
      sourceAccount: "chase",
      confidence: 0.92,
    });

    await service.execute({ text: "Spent 45 on groceries at Whole Foods with Chase" });

    expect(getAllCategoriesService.execute).toHaveBeenCalledTimes(1);
    expect(getAllAccountsService.execute).toHaveBeenCalledTimes(1);
    expect(genAIService.extractData).toHaveBeenCalledWith(
      mockCategories,
      mockAccounts,
      expect.any(String),
      "Spent 45 on groceries at Whole Foods with Chase",
      undefined
    );
  });

  it("should map the AI response to a ParseTransactionDraftResponse", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      description: "Whole Foods Groceries",
      amount: 45,
      type: TransactionType.EXPENSE,
      category: "groceries",
      sourceAccount: "chase",
      createdAt: "2026-08-20T10:30:00.000Z",
      confidence: 0.92,
    });

    const result = await service.execute({ text: "Spent 45 on groceries" });

    expect(result).toEqual({
      description: "Whole Foods Groceries",
      amount: 45,
      type: TransactionType.EXPENSE,
      categoryRef: "groceries",
      sourceAccountRef: "chase",
      destinationAccountRef: undefined,
      createdAt: "2026-08-20T10:30:00.000Z",
      confidence: 0.92,
    });
  });

  it("should map destinationAccount for transfer drafts", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      description: "Transfer to savings",
      amount: 150,
      type: TransactionType.TRANSFER,
      category: "transfer",
      sourceAccount: "chase",
      destinationAccount: "savings",
      confidence: 0.88,
    });

    const result = await service.execute({
      text: "Transfer 150 from Chase to Savings",
    });

    expect(result.destinationAccountRef).toBe("savings");
    expect(result.sourceAccountRef).toBe("chase");
    expect(result.type).toBe(TransactionType.TRANSFER);
  });

  it("should default createdAt to the current time when the AI omits it", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      description: "Dinner",
      amount: 30,
      type: TransactionType.EXPENSE,
      category: "food",
      sourceAccount: "chase",
      confidence: 0.9,
    });

    const before = Date.now();
    const result = await service.execute({ text: "Dinner 30" });
    const after = Date.now();

    expect(new Date(result.createdAt).getTime()).toBeGreaterThanOrEqual(
      before
    );
    expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(after);
  });

  it("should throw a 422 DomainError when the AI returns an error object", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      error: "Could not determine the transaction amount",
    });

    const rejects = expect(
      service.execute({ text: "unparseable gibberish" })
    ).rejects;

    await rejects.toThrow(DomainError);
    await rejects.toThrow("Could not determine the transaction amount");

    try {
      await service.execute({ text: "unparseable gibberish" });
      fail("Expected execute to throw");
    } catch (error) {
      const domainError = error as DomainError<{ code: string }>;
      expect(domainError.statusCode).toBe(422);
      expect(domainError.details).toEqual({ code: "UNPARSEABLE_DRAFT" });
    }
  });

  it("should accept a picture-only draft with no text provided", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      description: "Receipt scan",
      amount: 12,
      type: TransactionType.EXPENSE,
      category: "food",
      sourceAccount: "chase",
      confidence: 0.7,
    });

    const result = await service.execute({ picture: "base64-image-data" });

    expect(genAIService.extractData).toHaveBeenCalledWith(
      mockCategories,
      mockAccounts,
      expect.any(String),
      undefined,
      "base64-image-data"
    );
    expect(result.description).toBe("Receipt scan");
  });

  it("should throw a 422 DomainError with a default message when the AI returns null", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce(null);

    const rejects = expect(service.execute({ text: "???" })).rejects;

    await rejects.toThrow(DomainError);
    await rejects.toThrow(
      "AI could not recognize transaction details from the provided input. Please enter values manually."
    );
  });
});
