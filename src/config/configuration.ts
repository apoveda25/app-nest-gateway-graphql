import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'development'
    ? `config.${process.env.NODE_ENV}.yaml`
    : 'config.development.yaml';

export default () => {
  const config = yaml.load(
    readFileSync(join(`${__dirname}/../../`, YAML_CONFIG_FILENAME), 'utf8'),
  );

  if (config.apollo_key) process.env.APOLLO_KEY = config.apollo_key;

  return config;
};
