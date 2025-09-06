import * as Joi from 'joi';

export const EnvValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  CONTENTFUL_SPACE_ID: Joi.string().required(),
  CONTENTFUL_ACCESS_TOKEN: Joi.string().required(),
  CONTENTFUL_ENVIRONMENT: Joi.string().required(),
  CONTENTFUL_CONTENT_TYPE: Joi.string().required(),
})