import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  credentials: {
    region: process.env.AWS_REGION,
    key: process.env.AWS_ACCESS_KEY_ID,
    secret_key: process.env.AWS_SECRET_ACCESS_KEY,
  },

  s3: {
    buckets: {
      profile_pic: {
        name: process.env.S3_BUCKETS_PROFILE_PIC_NAME,
      },
    },
  },

  sqs: {
    account_number: process.env.SQS_ACCOUNT_NUMBER,
    queues: {
      register_process: {
        url: process.env.SQS_QUEUES_REGISTER_PROCESS_URL,
        name: process.env.SQS_QUEUES_REGISTER_PROCESS_NAME,
      },

      complete_user_registration: {
        url: process.env.SQS_QUEUES_COMPLETE_USER_REGISTRATION_URL,
        name: process.env.SQS_QUEUES_COMPLETE_USER_REGISTRATION_NAME,
      },

      password_process: {
        url: process.env.SQS_QUEUES_PASSWORD_PROCESS_URL,
        name: process.env.SQS_QUEUES_PASSWORD_PROCESS_NAME,
      },

      complete_password_change: {
        url: process.env.SQS_QUEUES_COMPLETE_PASSWORD_CHANGE_URL,
        name: process.env.SQS_QUEUES_COMPLETE_PASSWORD_CHANGE_NAME,
      },

      complete_email_change: {
        url: process.env.SQS_QUEUES_COMPLETE_EMAIL_CHANGE_URL,
        name: process.env.SQS_QUEUES_COMPLETE_EMAIL_CHANGE_NAME,
      },

      new_email_process: {
        url: process.env.SQS_QUEUES_NEW_EMAIL_PROCESS_URL,
        name: process.env.SQS_QUEUES_NEW_EMAIL_PROCESS_NAME,
      },
    },
  },
}));
