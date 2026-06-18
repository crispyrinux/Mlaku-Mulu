export interface JwtPayload {
  sub: string;
  email: string;
  userType: 'EMPLOYEE' | 'TOURIST';
}
