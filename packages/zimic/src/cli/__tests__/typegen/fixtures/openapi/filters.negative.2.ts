// Auto-generated by zimic@0.7.1.
// Note! Manual changes to this file will be overwritten.

import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/notifications': {
    GET: MyServiceOperations['getNotifications'];
    DELETE: MyServiceOperations['deleteNotifications'];
  };
}>;

export interface MyServiceComponents {
  schemas: {
    Notification: {
      id: number;
      message: string;
    };
    Notifications: MyServiceComponents['schemas']['Notification'][];
  };
}

export interface MyServiceOperations {
  getNotifications: HttpSchema.Method<{
    response: {
      200: {
        body: MyServiceComponents['schemas']['Notifications'];
      };
    };
  }>;
  deleteNotifications: HttpSchema.Method<{
    response: {
      204: {};
    };
  }>;
}
