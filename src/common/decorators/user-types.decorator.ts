import { SetMetadata } from '@nestjs/common';

export const USER_TYPES_KEY = 'userTypes';
export const UserTypes = (...userTypes: ('EMPLOYEE' | 'TOURIST')[]) =>
  SetMetadata(USER_TYPES_KEY, userTypes);
