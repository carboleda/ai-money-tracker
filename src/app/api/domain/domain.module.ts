import { AccountModule } from "./account/account.module";
import { UserModule } from "./user/user.module";
import { TransactionModule } from "./transaction/transaction.module";
import { SummaryModule } from "./summary/summary.module";
import { NotificationModule } from "./notification/notification.module";
import { RecurringExpenseModule } from "./recurring-expense/recurring-expense.module";
import { CategoryModule } from "./category/category.module";

export class DomainModule {
  static register(): void {
    AccountModule.register();
    UserModule.register();
    TransactionModule.register();
    SummaryModule.register();
    RecurringExpenseModule.register();
    NotificationModule.register();
    CategoryModule.register();
  }
}
