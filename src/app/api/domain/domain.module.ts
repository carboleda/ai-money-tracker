import { AccountModule } from "./account/account.module";
import { UserModule } from "./user/user.module";
import { TransactionModule } from "./transaction/transaction.module";
import { SummaryModule } from "./summary/summary.module";
import { NotificationModule } from "./notification/notification.module";
import { RecurrentExpenseModule } from "./recurrent-expense/recurrent-expense.module";

export class DomainModule {
  static register(): void {
    AccountModule.register();
    UserModule.register();
    TransactionModule.register();
    SummaryModule.register();
    RecurrentExpenseModule.register();
    NotificationModule.register();
  }
}
