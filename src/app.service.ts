import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Mlaku-Mulu Travel Management!';
  }
}
