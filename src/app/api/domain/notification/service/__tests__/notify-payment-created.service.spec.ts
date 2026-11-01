import "reflect-metadata";
import { container } from "tsyringe";
import { NotifyPaymentCreatedService } from "../notify-payment-created.service";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "../notification.service";
import { createUserModelFixture } from "@/app/api/domain/user/service/__tests__/fixtures/user.model.fixture";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

describe("NotifyPaymentCreatedService", () => {
  let service: NotifyPaymentCreatedService;
  let getUserService: jest.Mocked<GetUserService>;
  let notificationService: jest.Mocked<NotificationService>;

  const input = {
    transactionId: "txn1",
    description: "Netflix",
    amount: 45,
    type: TransactionType.EXPENSE,
  };

  beforeEach(() => {
    container.clearInstances();

    const mockGetUserService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserService>;

    const mockNotificationService = {
      sendBulkNotifications: jest.fn().mockResolvedValue({
        totalSent: 1,
        successful: 1,
        failed: 0,
        results: [],
      }),
    } as unknown as jest.Mocked<NotificationService>;

    container.register(GetUserService, { useValue: mockGetUserService });
    container.register(NotificationService, {
      useValue: mockNotificationService,
    });
    container.register(NotifyPaymentCreatedService, {
      useClass: NotifyPaymentCreatedService,
    });

    service = container.resolve(NotifyPaymentCreatedService);
    getUserService = mockGetUserService;
    notificationService = mockNotificationService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("does nothing when no user is found", async () => {
    getUserService.execute.mockResolvedValue(null);

    await service.execute(input);

    expect(notificationService.sendBulkNotifications).not.toHaveBeenCalled();
  });

  it("does nothing when the user opted out of payment notifications", async () => {
    getUserService.execute.mockResolvedValue(
      createUserModelFixture({
        settings: { paymentNotificationsEnabled: false },
      })
    );

    await service.execute(input);

    expect(notificationService.sendBulkNotifications).not.toHaveBeenCalled();
  });

  it("does nothing when the user has no devices with an fcmToken", async () => {
    getUserService.execute.mockResolvedValue(
      createUserModelFixture({ devices: [] })
    );

    await service.execute(input);

    expect(notificationService.sendBulkNotifications).not.toHaveBeenCalled();
  });

  it("sends a notification per device with an fcmToken when enabled (default)", async () => {
    const user = createUserModelFixture({
      devices: [
        { deviceId: "dev1", deviceName: "Phone", fcmToken: "token1" },
        { deviceId: "dev2", deviceName: "Tablet" },
      ],
    });
    getUserService.execute.mockResolvedValue(user);

    await service.execute(input);

    expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
      {
        userId: user.id,
        fcmToken: "token1",
        notification: expect.objectContaining({
          title: "Payment recorded",
          body: `You paid ${input.amount} for ${input.description}`,
          extraData: { transactionId: input.transactionId },
        }),
      },
    ]);
  });

  it("swallows errors from sendBulkNotifications instead of throwing", async () => {
    getUserService.execute.mockResolvedValue(createUserModelFixture());
    notificationService.sendBulkNotifications.mockRejectedValue(
      new Error("messaging failure")
    );

    await expect(service.execute(input)).resolves.toBeUndefined();
  });
});
