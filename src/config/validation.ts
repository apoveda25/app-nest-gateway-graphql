import { plainToClass } from 'class-transformer';
import {
  IsUrl,
  validateSync,
  IsPort,
  IsString,
  ValidateNested,
} from 'class-validator';

class APP {
  @IsUrl()
  host: string;

  @IsPort()
  port: number;
}

class Service {
  @IsString()
  name: string;

  @IsUrl()
  @IsString()
  url: string;
}

class EnvironmentVariables {
  @ValidateNested()
  app: APP;

  @ValidateNested()
  services: Service[];
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(JSON.stringify(errors));
  }
  return validatedConfig;
}
