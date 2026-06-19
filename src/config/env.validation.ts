import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(1).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().min(1).required(),
  JWT_REFRESH_SECRET: Joi.string().min(1).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().min(1).required(),
  CORS_ORIGIN: Joi.string().optional(),
  THROTTLE_TTL: Joi.number().optional().default(60000),
  THROTTLE_LIMIT: Joi.number().optional().default(100),
  ENABLE_SWAGGER: Joi.boolean().optional().default(false),
});
