import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord, logLevel, Message, RecordMetadata } from 'kafkajs';
import { KafkaConfigService } from './kafka-config.service';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(
    private readonly configService: KafkaConfigService,
  ) {
    this.logger = new Logger(KafkaProducerService.name);
  }

  async onModuleInit() {
    if (!this.producer) {
      this.initializeKafka();
    }
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private initializeKafka() {
    const config = this.configService.getConfig();
    
    if (!config.brokers || config.brokers.length === 0) {
      this.logger.warn('No Kafka brokers configured. Producer will not be initialized.');
      return;
    }

    const kafkaConfig: any = {
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: logLevel.ERROR,
    };

    // Handle SSL configuration
    if (config.ssl) {
      kafkaConfig.ssl = true;
    }

    // Handle SASL configuration
    if (config.sasl) {
      const { mechanism } = config.sasl;
      
      if (mechanism === 'aws') {
        // AWS MSK IAM authentication
        kafkaConfig.sasl = {
          mechanism: 'aws',
          authorizationIdentity: config.sasl.authorizationIdentity || '',
          accessKeyId: config.sasl.accessKeyId || '',
          secretAccessKey: config.sasl.secretAccessKey || '',
          ...(config.sasl.sessionToken && { sessionToken: config.sasl.sessionToken }),
        };
      } else {
        // Standard SASL authentication (PLAIN, SCRAM)
        kafkaConfig.sasl = {
          mechanism: mechanism as any,
          username: config.sasl.username || '',
          password: config.sasl.password || '',
        };
      }
      
      // If SSL is not explicitly set but using SASL, enable it
      if (kafkaConfig.ssl === undefined) {
        kafkaConfig.ssl = true;
      }
    }

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer();
    this.logger.log('Kafka producer initialized');
  }

  async connect() {
    if (this.isConnected || !this.producer) {
      return;
    }
    
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer connected successfully');
      
      // Log connection details (without sensitive data)
      const config = this.configService.getConfig();
      this.logger.debug(`Connected to brokers: ${config.brokers.join(', ')}`);
      if (config.sasl) {
        this.logger.debug(`Using SASL mechanism: ${config.sasl.mechanism}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Kafka: ${errorMessage}`);
      
      // Add more detailed error information for common issues
      if (errorMessage.includes('SASL')) {
        this.logger.error('SASL authentication failed. Please check your credentials and mechanism.');
      } else if (errorMessage.includes('ECONNREFUSED')) {
        this.logger.error('Connection refused. Please check if the Kafka brokers are running and accessible.');
      } else if (errorMessage.includes('TopicAuthorizationError')) {
        this.logger.error('Topic authorization failed. Please check if the producer has the necessary permissions.');
      }
      
      // Don't throw to allow the application to start without Kafka
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka producer', error);
      throw error;
    }
  }

  async sendMessage(topic: string, message: Message['value'], key?: string): Promise<RecordMetadata[]> {
    if (!this.producer) {
      throw new Error('Kafka producer is not initialized. Check if Kafka brokers are configured.');
    }

    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const kafkaMessage: Message = {
        value: typeof message === 'string' ? message : JSON.stringify(message),
        ...(key && { key }),
        timestamp: Date.now().toString(),
      };

      const record: ProducerRecord = {
        topic,
        messages: [kafkaMessage],
      };

      const result = await this.producer.send(record);
      this.logger.debug(`Message sent to topic ${topic}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}`, error);
      throw error;
    }
  }

  async sendBatch(messages: Array<{ topic: string; message: any; key?: string }>): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    const records: ProducerRecord[] = messages.map(({ topic, message, key }) => ({
      topic,
      messages: [{
        value: typeof message === 'string' ? message : JSON.stringify(message),
        ...(key && { key }),
        timestamp: Date.now().toString(),
      }],
    }));

    try {
      const results = await Promise.all(records.map(record => this.producer.send(record)));
      this.logger.debug(`Sent batch of ${messages.length} messages`);
      return results.flat();
    } catch (error) {
      this.logger.error('Failed to send batch messages', error);
      throw error;
    }
  }
}
