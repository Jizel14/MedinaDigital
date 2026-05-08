import * as Joi from 'joi';

/**
 * Boot-time env validation. Fail fast: if a required var is missing or
 * malformed, NestJS refuses to start. Prevents the class of bugs where
 * production silently runs against dev defaults.
 */
export const envValidationSchema = Joi.object({
  // MySQL
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().allow('').default(''), // XAMPP root has empty password by default
  MYSQL_DATABASE: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('30d'),

  // Server
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),

  // CORS
  FRONTEND_ORIGIN: Joi.string().uri().required(),
});
