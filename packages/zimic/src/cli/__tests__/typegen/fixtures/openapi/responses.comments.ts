// Auto-generated by zimic@0.7.1.
// Note! Manual changes to this file will be overwritten.

import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users-with-no-request': {
    POST: {
      response: {
        200: MyServiceComponents['responses']['userCreated'];
        400: MyServiceComponents['responses']['error'];
      };
    };
  };
  '/users-with-multiple-reference-response-contents': {
    POST: {
      response: {
        200: MyServiceComponents['responses']['userCreatedMultipleContents'];
        400: MyServiceComponents['responses']['error'];
      };
    };
  };
  '/users-with-multiple-literal-response-contents': {
    POST: {
      response: {
        /** Success */
        200:
          | {
              headers: {
                'content-type': 'application/json';
              };
              body: {
                /**
                 * The type of the response
                 *
                 * @enum {string}
                 */
                type: 'user-as-json';
                value: MyServiceComponents['schemas']['User'];
              };
            }
          | {
              headers: {
                'content-type': 'application/xml';
              };
              body: {
                /**
                 * The type of the response
                 *
                 * @enum {string}
                 */
                type: 'user-as-xml';
                value: MyServiceComponents['schemas']['User'];
              };
            };
        400: MyServiceComponents['responses']['error'];
      };
    };
  };
  '/users-with-no-response-content': {
    POST: {
      response: {
        /** Success */
        200: {};
      };
    };
  };
  '/users-with-no-request-or-response': {
    /** Empty */
    POST: {};
  };
}>;

export interface MyServiceComponents {
  schemas: {
    /** A user */
    User: {
      /** The user ID */
      id: string;
      /** The user's name */
      name?: string;
      /** The user's email address */
      email: string;
      /** The date and time the user was created */
      createdAt: string;
      /** The date and time the user was last updated */
      updatedAt: string;
    };
  };
  responses: {
    /** Success */
    userCreated: HttpSchema.Response<{
      body: MyServiceComponents['schemas']['User'];
    }>;
    /** Success */
    userCreatedMultipleContents: HttpSchema.Response<
      | {
          headers: {
            'content-type': 'application/json';
          };
          body: {
            /**
             * The type of the response
             *
             * @enum {string}
             */
            type?: 'user-as-json';
            value?: MyServiceComponents['schemas']['User'];
          };
        }
      | {
          headers: {
            'content-type': 'application/xml';
          };
          body: {
            /**
             * The type of the response
             *
             * @enum {string}
             */
            type?: 'user-as-xml';
            value?: MyServiceComponents['schemas']['User'];
          };
        }
    >;
    /** Error */
    error: HttpSchema.Response<{
      body: {
        /** A message describing the error */
        message: string;
      };
    }>;
  };
}