interface KafkaSASLConfig {
  mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'aws';
  username: string;
  password: string;
}

export default () => {
  // Validate required environment variables
  const requiredVars = ['DATABASE_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Parse port with validation
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  // Parse Kafka SASL configuration
  let saslConfig: KafkaSASLConfig | undefined;
  if (process.env.KAFKA_SASL_USERNAME) {
    if (!process.env.KAFKA_SASL_PASSWORD) {
      throw new Error('KAFKA_SASL_PASSWORD is required when KAFKA_SASL_USERNAME is provided');
    }
    
    const mechanism = (process.env.KAFKA_SASL_MECHANISM || 'plain') as 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'aws';
    if (!['plain', 'scram-sha-256', 'scram-sha-512', 'aws'].includes(mechanism)) {
      throw new Error(`Invalid KAFKA_SASL_MECHANISM: ${mechanism}. Must be one of: plain, scram-sha-256, scram-sha-512, aws`);
    }

    saslConfig = {
      mechanism,
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    };
  }

  return {
    port,
    database: {
      url: process.env.DATABASE_URL!,
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
      clientId: process.env.KAFKA_CLIENT_ID || 'user-service',
      groupId: process.env.KAFKA_GROUP_ID || 'user-service-group',
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: saslConfig,
    },
  };
};
