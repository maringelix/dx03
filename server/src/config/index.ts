import 'dotenv/config';

export interface AppConfig {
  env: 'development' | 'test' | 'staging' | 'production';
  port: number;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  cors: {
    origin: string;
  };
  logging: {
    level: string;
  };
  metrics: {
    token: string | null;
  };
}

const REQUIRED_ENVS = [
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'CORS_ORIGIN',
] as const;

function assertEnv(): void {
  const missing = REQUIRED_ENVS.filter((k) => {
    const v = process.env[k];
    return v === undefined || v === null || v === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const placeholders = REQUIRED_ENVS.filter((k) =>
      /<\s*change[_-]?me\s*>/i.test(process.env[k] ?? ''),
    );
    if (placeholders.length > 0) {
      throw new Error(
        `Refusing to start: placeholder values in env (${placeholders.join(', ')})`,
      );
    }
    if (!process.env.METRICS_TOKEN || process.env.METRICS_TOKEN.length < 32) {
      throw new Error('METRICS_TOKEN is required in production (min 32 chars)');
    }
  }
}

assertEnv();

const validEnvs = ['development', 'test', 'staging', 'production'] as const;
type EnvName = (typeof validEnvs)[number];
const nodeEnv = process.env.NODE_ENV as EnvName;
if (!validEnvs.includes(nodeEnv)) {
  throw new Error(
    `Invalid NODE_ENV "${process.env.NODE_ENV}" (expected one of ${validEnvs.join(', ')})`,
  );
}

const config: AppConfig = {
  env: nodeEnv,
  port: parseInt(process.env.PORT ?? '3000', 10),
  db: {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string, 10),
    name: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
  },
  cors: {
    origin: process.env.CORS_ORIGIN as string,
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  metrics: {
    token: process.env.METRICS_TOKEN ?? null,
  },
};

export default config;
