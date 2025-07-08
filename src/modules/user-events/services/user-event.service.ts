import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../../../core/kafka/services/kafka-consumer.service';
import { KafkaTopics } from '../../../core/kafka/interfaces/kafka-message.interface';
import { IUserService } from '../../users/interfaces/user-service.interface';
import { USER_SERVICE } from '../../users/users.constants';

@Injectable()
export class UserEventService implements OnModuleInit {
  private readonly logger = new Logger(UserEventService.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  private isSubscribed = false;

  async onModuleInit() {
    try {
      await this.subscribeToUserEvents();
      this.isSubscribed = true;
      this.logger.log('Successfully subscribed to Kafka topics');
    } catch (error) {
      this.logger.error('Failed to subscribe to Kafka topics', error);
      throw error;
    }
  }

  private async subscribeToUserEvents() {
    if (this.isSubscribed) {
      this.logger.log('Already subscribed to Kafka topics');
      return;
    }

    try {
      // Subscribe to auth events
      await this.kafkaConsumer.subscribe(
        KafkaTopics.AUTH_ATTEMPT,
        this.handleAuthAttempt.bind(this),
      );

      await this.kafkaConsumer.subscribe(
        KafkaTopics.AUTH_SUCCESS,
        this.handleAuthSuccess.bind(this),
      );

      await this.kafkaConsumer.subscribe(
        KafkaTopics.AUTH_FAILED,
        this.handleAuthFailed.bind(this),
      );
      
      this.isSubscribed = true;
    } catch (error) {
      this.logger.error('Error subscribing to Kafka topics', error);
      throw error;
    }
  }
  
  async onModuleDestroy() {
    if (this.isSubscribed) {
      try {
        // The KafkaConsumerService handles its own cleanup
        this.isSubscribed = false;
        this.logger.log('Unsubscribed from Kafka topics');
      } catch (error) {
        this.logger.error('Error unsubscribing from Kafka topics', error);
      }
    }
  }

  private async handleAuthAttempt(message: any) {
    try {
      const { email, timestamp, metadata } = message.payload;
      this.logger.log(`Auth attempt detected for user: ${email} at ${timestamp}`);
      
      // Update user's last activity
      await this.userService.updateLastActivity(email);
      
      this.logger.debug(`Processed auth attempt for user: ${email}`, { metadata });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
      const stack = error instanceof Error ? error.stack : '';
      
      this.logger.error(
        `Error processing auth attempt event: ${errorMessage}`,
        stack,
      );
    }
  }

  private async handleAuthSuccess(message: any) {
    try {
      const { userId, email, timestamp, metadata } = message.payload;
      this.logger.log(`Auth success for user: ${email} at ${timestamp}`);
      
      // Here you can implement additional logic for successful authentication
      // For example, update user's last login time
      // Note: We're not implementing auth in this service, but we can still log the event
      
      this.logger.debug(`Processed auth success for user: ${email}`, { userId, metadata });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error processing auth success event: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private async handleAuthFailed(message: any) {
    try {
      const { email, reason, timestamp, metadata } = message.payload;
      this.logger.warn(
        `Auth failed for user: ${email} at ${timestamp}. Reason: ${reason}`,
      );
      
      // Here you can implement additional logic for failed authentication
      // For example, log the failed attempt or update user's failed login count
      
      this.logger.debug(`Processed auth failed for user: ${email}`, { reason, metadata });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error processing auth failed event: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
