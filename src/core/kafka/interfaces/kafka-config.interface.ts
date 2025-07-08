import { SASLOptions } from 'kafkajs';

export type SASLConfig = 
  | { 
      mechanism: 'plain';
      username: string;
      password: string;
      authorizationIdentity?: string;
    }
  | { 
      mechanism: 'scram-sha-256' | 'scram-sha-512';
      username: string;
      password: string;
      authorizationIdentity?: string;
    }
  | { 
      mechanism: 'aws';
      authorizationIdentity: string;
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken?: string;
    };

export interface KafkaModuleConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
  ssl?: boolean;
  sasl?: SASLConfig;
  connectionTimeout?: number;
  authenticationTimeout?: number;
  reauthenticationThreshold?: number;
  sessionToken?: string;
}

// This interface is compatible with kafkajs KafkaConfig
export type KafkaClientConfig = Omit<KafkaModuleConfig, 'sessionToken'> & {
  sasl?: SASLOptions;
};
