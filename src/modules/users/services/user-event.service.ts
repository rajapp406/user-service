import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../../../core/kafka/services/kafka-consumer.service';
import { KafkaTopics } from '../../../core/kafka/interfaces/kafka-message.interface';
import { IUserService } from '../interfaces/user-service.interface';

@Injectable()
export class UserEventService implements OnModuleInit {
  private readonly logger = new Logger(UserEventService.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly userService: IUserService,
  ) {}

  async onModuleInit() {
    await this.subscribeToUserEvents();
  }

  private async subscribeToUserEvents() {
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
  }

  private async handleAuthAttempt(message: any) {
    try {
      const { email, timestamp, metadata } = message.payload;
      this.logger.log(`Auth attempt detected for user: ${email} at ${timestamp}`);
      
      // Here you can implement additional logic when an auth attempt is detected
      // For example, update user's last activity timestamp
      await this.userService.updateLastActivity(email);
      
      this.logger.debug(`Processed auth attempt for user: ${email}`, { metadata });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        const errorStack = error.stack;
        this.logger.error(
          `Error processing auth attempt event: ${errorMessage}`,
          errorStack,
        );
      } else {
        this.logger.error('Unknown error occurred');
      }
    }
  }

  private async handleAuthSuccess(message: any) {
    try {
      const { userId, email, timestamp, metadata } = message.payload;
      this.logger.log(`Auth success for user: ${email} at ${timestamp}`);
      
      // Update user's last login time
      await this.userService.updateLastLogin(userId);
      
      // You can add more logic here, like sending welcome emails, notifications, etc.
      this.logger.debug(`Processed auth success for user: ${email}`, { userId, metadata });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        const errorStack = error.stack;
        this.logger.error(
          `Error processing auth success event: ${errorMessage}`,
          errorStack,
        );
      } else {
        this.logger.error('Unknown error occurred while processing auth success event');
      }
    }
  }

  private async handleAuthFailed(message: any) {
    try {
      const { email, reason, timestamp, metadata } = message.payload;
      this.logger.warn(
        `Auth failed for user: ${email} at ${timestamp}. Reason: ${reason}`,
      );
      
      // Here you can implement failed login attempts tracking
      // For example, increment failed login attempts counter
      await this.userService.incrementFailedLoginAttempts(email);
      
      this.logger.debug(`Processed auth failed for user: ${email}`, { reason, metadata });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        const errorStack = error.stack;
        this.logger.error(
          `Error processing auth failed event: ${errorMessage}`,
          errorStack,
        );
      } else {
        this.logger.error('Unknown error occurred while processing auth failed event');
      }
    }
  }
}
