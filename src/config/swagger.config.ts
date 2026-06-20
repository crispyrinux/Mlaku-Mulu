import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Mlaku Mulu API')
  .setDescription('API documentation for the Mlaku Mulu application.')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
