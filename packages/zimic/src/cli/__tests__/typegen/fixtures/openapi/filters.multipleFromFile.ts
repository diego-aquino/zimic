// Auto-generated by zimic@0.7.1.
// Note! Manual changes to this file will be overwritten.

import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users': {
    POST: {
      request: {
        body: {
          name: string;
        };
      };
      response: {
        200: {
          body: MyServiceComponents['schemas']['User'];
        };
      };
    };
  };
  '/users/:userId': {
    GET: {
      response: {
        200: {
          body: MyServiceComponents['schemas']['User'];
        };
      };
    };
    PUT: {
      request: {
        body: MyServiceComponents['schemas']['User'];
      };
      response: {
        204: {};
      };
    };
  };
  '/users/:userId/friends': {
    GET: {
      response: {
        200: {
          body: MyServiceComponents['schemas']['Users'];
        };
      };
    };
  };
  '/notifications': {
    DELETE: MyServiceOperations['deleteNotifications'];
  };
}>;

export interface MyServiceComponents {
  schemas: {
    User: {
      id: number;
      name: string;
    };
    Users: MyServiceComponents['schemas']['User'][];
  };
}

export interface MyServiceOperations {
  deleteNotifications: HttpSchema.Method<{
    response: {
      204: {};
    };
  }>;
}