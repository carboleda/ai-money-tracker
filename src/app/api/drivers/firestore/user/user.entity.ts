export interface UserEntity extends FirebaseFirestore.DocumentData {
  email?: string;
  fcmToken: string;
}
