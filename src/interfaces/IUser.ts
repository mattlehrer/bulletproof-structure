export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  // lastLogin: any;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
}
