// Using a simple string token instead of InjectionToken
export const KAFKA_CONFIG = 'KAFKA_CONFIG';

export type SaslMechanism = 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'aws';

export interface BaseSaslConfig {
  mechanism: SaslMechanism;
  username?: string;
  password?: string;
}

export interface AwsIamSaslConfig extends Omit<BaseSaslConfig, 'username' | 'password'> {
  mechanism: 'aws';
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  authorizationIdentity?: string;
}

export type SaslConfig = BaseSaslConfig | AwsIamSaslConfig;

export interface KafkaModuleConfig {
  clientId: string;
  brokers: string[];
  ssl?: boolean;
  sasl?: SaslConfig;
  logLevel?: number;
  allowAutoTopicCreation?: boolean;
  maxRetryTime?: number;
  initialRetryTime?: number;
  retries?: number;
  connectionTimeout?: number;
  requestTimeout?: number;
  authenticationTimeout?: number;
  reauthenticationThreshold?: number;
  isDevelopment?: boolean;
}
