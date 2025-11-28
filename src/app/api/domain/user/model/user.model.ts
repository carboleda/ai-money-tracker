export class UserModel {
  public id: string;
  public fcmToken: string;

  constructor(params: { id: string; fcmToken: string }) {
    this.id = params.id;
    this.fcmToken = params.fcmToken;
  }
}
