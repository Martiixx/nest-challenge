import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvValidationSchema } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { ProductsModule } from './products/products.module';
import { ExternalSyncModule } from './external-sync/external-sync.module';
import { EnvConfiguration } from './config/evn.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: EnvValidationSchema,
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    ProductsModule,
    ExternalSyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

