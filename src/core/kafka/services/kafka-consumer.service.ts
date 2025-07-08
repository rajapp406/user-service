import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { 
  Kafka, 
  Consumer, 
  EachMessagePayload, 
  logLevel, 
  ConsumerSubscribeTopics,
  ConsumerRunConfig,
} from 'kafkajs';
import { KafkaConfigService } from './kafka-config.service';

type MessageHandler = (message: EachMessagePayload) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private isConnected = false;
  private isRunning = false;
  private isInitialized = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private topicSubscriptions: Array<{ topic: string; handler: MessageHandler }> = [];
  private isInitializing = false;

  constructor(
    @Inject(KafkaConfigService)
    private readonly configService: KafkaConfigService,
  ) {}

  async onModuleInit() {
    if (this.isInitializing) {
      return;
    }
    
    this.isInitializing = true;
    this.logger.log('Initializing KafkaConsumerService...');
    
    try {
      // Initialize Kafka client and consumer
      await this.initializeKafka();
      
      if (!this.consumer) {
        throw new Error('Failed to create Kafka consumer instance');
      }
      
      this.logger.log('Kafka consumer instance created');
      
      // Connect to Kafka
      await this.connect();
      this.logger.log('Connected to Kafka broker(s)');
      
      // Subscribe to all registered topics
      if (this.topicSubscriptions.length > 0) {
        const topics = this.topicSubscriptions.map(sub => sub.topic);
        this.logger.log(`Subscribing to topics: ${topics.join(', ')}`);
        
        await this.consumer?.subscribe({ 
          topics,
          fromBeginning: true 
        });
        
        // Start consuming messages
        if (!this.isRunning) {
          this.logger.log('Starting Kafka consumer...');
          await this.consumer?.run({
            eachMessage: this.handleMessage.bind(this)
          });
          this.isRunning = true;
          this.logger.log('Kafka consumer started successfully');
        }
      } else {
        this.logger.warn('No topic subscriptions found. Consumer will not process any messages.');
      }
      
      this.logger.log('KafkaConsumerService initialization completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during Kafka consumer initialization: ${errorMessage}`, error instanceof Error ? error.stack : '');
      this.isInitializing = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async initializeKafka() {
    this.logger.log('Starting Kafka consumer initialization...');
    
    if (this.isInitialized) {
      this.logger.log('Kafka consumer already initialized');
      return;
    }

    const config = this.configService.getConfig();
    this.logger.debug(`Kafka config: ${JSON.stringify({
      brokers: config.brokers ? `[${config.brokers.length} brokers]` : 'none',
      clientId: config.clientId,
      groupId: config.groupId,
      hasSasl: !!config.sasl,
      saslMechanism: config.sasl?.mechanism
    }, null, 2)}`);
    
    if (!config.brokers || config.brokers.length === 0) {
      const error = new Error('No Kafka brokers configured');
      this.logger.error(error.message);
      throw error; // Throw error instead of returning to fail fast
    }

    this.logger.log(`Initializing Kafka consumer with brokers: ${config.brokers.join(', ')}`);

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

    try {
      this.logger.log('Creating new Kafka instance...');
      this.kafka = new Kafka(kafkaConfig);
      
      const consumerConfig = {
        groupId: config.groupId || 'user-service-group',
        sessionTimeout: 30000,
        heartbeatInterval: 10000,
        maxInFlightRequests: 5,
      };
      
      this.logger.log(`Creating Kafka consumer with config: ${JSON.stringify(consumerConfig)}`);
      this.consumer = this.kafka.consumer(consumerConfig);
      
      if (!this.consumer) {
        throw new Error('Failed to create Kafka consumer instance');
      }

      this.isInitialized = true;
      this.logger.log('Kafka consumer instance created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create Kafka consumer instance: ${errorMessage}`);
      this.isInitialized = false;
      this.consumer = null;
      throw error;
    }
  }


  async connect() {
    if (this.isConnected || !this.consumer) {
      return;
    }
    
    try {
      await this.consumer.connect();
      this.isConnected = true;
      this.logger.log('Kafka consumer connected successfully');
      
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
      } else if (errorMessage.includes('GroupAuthorizationError')) {
        this.logger.error('Group authorization failed. Please check if the consumer group has the necessary permissions.');
      }
      
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await this.consumer?.disconnect();
      this.isConnected = false;
      this.logger.log('Kafka consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka consumer', error);
      throw error;
    }
  }

  async subscribe(topic: string, handler: MessageHandler) {
    try {
      this.logger.log(`Registering subscription for topic: ${topic}`);
      
      // Store the handler and topic for later subscription
      this.messageHandlers.set(topic, handler);
      this.topicSubscriptions.push({ topic, handler });
      
      // If we're already running, we need to update the subscription
      if (this.isRunning && this.consumer) {
        this.logger.log(`Adding subscription to running consumer for topic: ${topic}`);
        await this.consumer.subscribe({ 
          topic, 
          fromBeginning: true 
        });
      }
      
      this.logger.log(`Successfully registered handler for topic: ${topic}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to register subscription for topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, partition, message } = payload;
    const messageValue = message.value?.toString();
    
    if (!messageValue) {
      this.logger.warn(`Received empty message on topic ${topic}, partition ${partition}`);
      return;
    }
    
    const handler = this.messageHandlers.get(topic);
    
    if (!handler) {
      this.logger.warn(`No handler found for topic: ${topic}`);
      return;
    }
    
    try {
      const parsedMessage = JSON.parse(messageValue);
      await handler(parsedMessage);
      this.logger.log(`Successfully processed message from topic: ${topic}, partition: ${partition}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing message from topic ${topic}, partition ${partition}: ${errorMessage}`);
    }
  }

  private async commitOffsets(topic: string, partition: number, offset: string) {
    try {
      if (!this.consumer) {
        this.logger.warn('Cannot commit offsets: consumer not available');
        return;
      }
      
      await this.consumer.commitOffsets([
        { topic, partition, offset: (parseInt(offset, 10) + 1).toString() }
      ]);
      
      this.logger.debug(`Committed offset for topic ${topic}, partition ${partition}, offset ${offset}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to commit offsets: ${errorMessage}`);
      throw error;
    }
  }
}
