import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SASLOptions } from 'kafkajs';

export type SaslMechanism = 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'aws';

export interface KafkaSaslConfig {
  mechanism: SaslMechanism;
  username?: string;
  password?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  authorizationIdentity?: string;
  sessionToken?: string;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  ssl?: boolean;
  sasl?: KafkaSaslConfig;
}

@Injectable()
export class KafkaConfigService {
  private readonly logger = new Logger(KafkaConfigService.name);
  private config: KafkaConfig;

  constructor(private readonly configService: ConfigService) {
    this.initializeConfig();
  }

  private initializeConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Default configuration
    this.config = {
      brokers: [],
      clientId: 'user-service',
      groupId: 'user-service-group',
      ssl: false,
    };

    // Load configuration from environment variables
    try {
      const brokers = this.configService.get<string>('KAFKA_BROKERS');
      
      if (brokers) {
        this.config.brokers = brokers.split(',').map(b => b.trim());
        
        // Only load other config if brokers are configured
        this.config.clientId = this.configService.get<string>('KAFKA_CLIENT_ID') || this.config.clientId;
        this.config.groupId = this.configService.get<string>('KAFKA_GROUP_ID') || this.config.groupId;
        
        // Handle SSL configuration
        const sslConfig = this.configService.get<string>('KAFKA_SSL');
        if (sslConfig) {
          this.config.ssl = sslConfig === 'true' || sslConfig === '1';
        }
        
        // Handle SASL configuration
        const saslMechanism = this.configService.get<SaslMechanism>('KAFKA_SASL_MECHANISM');
        
        if (saslMechanism) {
          this.config.sasl = { mechanism: saslMechanism };
          
          if (saslMechanism === 'aws') {
            // AWS MSK IAM authentication
            const accessKeyId = this.configService.get<string>('KAFKA_SASL_ACCESS_KEY_ID');
            const secretAccessKey = this.configService.get<string>('KAFKA_SASL_SECRET_ACCESS_KEY');
            const sessionToken = this.configService.get<string>('KAFKA_SASL_SESSION_TOKEN');
            const authorizationIdentity = this.configService.get<string>('KAFKA_SASL_AUTHORIZATION_IDENTITY');
            
            if (accessKeyId && secretAccessKey) {
              this.config.sasl.accessKeyId = accessKeyId;
              this.config.sasl.secretAccessKey = secretAccessKey;
              
              if (sessionToken) {
                this.config.sasl.sessionToken = sessionToken;
              }
              
              if (authorizationIdentity) {
                this.config.sasl.authorizationIdentity = authorizationIdentity;
              }
            }
          } else {
            // Username/Password authentication
            const username = this.configService.get<string>('KAFKA_SASL_USERNAME');
            const password = this.configService.get<string>('KAFKA_SASL_PASSWORD');
            
            if (username && password) {
              this.config.sasl.username = username;
              this.config.sasl.password = password;
            }
          }
          
          // If we have a SASL config but no credentials, log a warning
          if (!this.config.sasl.username && !this.config.sasl.accessKeyId) {
            this.logger.warn('SASL mechanism specified but no credentials provided');
            this.config.sasl = undefined;
          }
        }
      } else if (!isDevelopment) {
        this.logger.warn('No KAFKA_BROKERS environment variable set. Kafka functionality will be disabled.');
      }
      
      this.logger.debug('Kafka configuration loaded', {
        brokers: this.config.brokers,
        clientId: this.config.clientId,
        groupId: this.config.groupId,
        hasSasl: !!this.config.sasl,
        saslMechanism: this.config.sasl?.mechanism,
      });
      
    } catch (error) {
      this.logger.error('Failed to load Kafka configuration', error);
      throw error;
    }
  }

  getConfig(): KafkaConfig {
    return { ...this.config };
  }
  
  updateConfig(updates: Partial<KafkaConfig>) {
    this.config = { ...this.config, ...updates };
  }
}
