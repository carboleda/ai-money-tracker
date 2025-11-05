type Data = Record<string, string>;

export class NotificationModel {
  public title: string;
  public body: string;
  public extraData?: Data;

  constructor(params: { title: string; body: string; extraData?: Data }) {
    this.title = params.title;
    this.body = params.body;
    this.extraData = params.extraData;
  }
}
