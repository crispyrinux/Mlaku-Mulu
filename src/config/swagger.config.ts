import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Tourism Management API')
  .setDescription('Tourism Management API documentation')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
