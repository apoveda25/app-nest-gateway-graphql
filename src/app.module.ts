import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLGatewayModule } from '@nestjs/graphql';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { GatewayConfigService } from './gateway/gateway-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration],
      encoding: 'UTF-8',
      validate,
    }),
    GraphQLGatewayModule.forRootAsync({
      useClass: GatewayConfigService,
    }),
  ],
})
export class AppModule {}
