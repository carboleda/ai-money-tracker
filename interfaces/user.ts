export interface UserEntity {
  fcmToken: string;
}

export interface User extends UserEntity {
  id?: string;
}
