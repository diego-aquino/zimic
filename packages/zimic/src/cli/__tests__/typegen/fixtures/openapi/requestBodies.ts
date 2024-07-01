// Auto-generated by zimic@0.7.1.
// Note! Changes to this file will be overwritten.

import type { HttpHeadersSerialized, HttpSchema, HttpSearchParamsSerialized } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users-with-request-body-component': {
    POST: {
      request: MyServiceComponents['requests']['requiredCreateUser'];
      response: {
        200: {};
      };
    };
  };
  '/users-with-request-body-component-having-multiple-contents': {
    POST: {
      request: MyServiceComponents['requests']['requiredCreateUserMultiple'];
      response: {
        200: {};
      };
    };
  };
  '/users-with-request-body-component-having-multiple-contents-and-parameters': {
    POST: {
      request: MyServiceComponents['requests']['requiredCreateUserMultiple'] & {
        searchParams: HttpSearchParamsSerialized<{
          name?: string;
        }>;
        headers: HttpHeadersSerialized<{
          'x-value'?: string;
        }>;
      };
      response: {
        200: {};
      };
    };
  };
  '/users-with-optional-request-body-component': {
    POST: {
      request: MyServiceComponents['requests']['optionalCreateUser'];
      response: {
        200: {};
      };
    };
  };
  '/users-with-optional-by-default-request-body-component': {
    POST: {
      request: MyServiceComponents['requests']['createUser'];
      response: {
        200: {};
      };
    };
  };
  '/users-with-request-body-component-and-parameters': {
    POST: {
      request: MyServiceComponents['requests']['optionalCreateUser'] & {
        searchParams: HttpSearchParamsSerialized<{
          name?: string;
        }>;
        headers: HttpHeadersSerialized<{
          'x-value'?: string;
        }>;
      };
      response: {
        200: {};
      };
    };
  };
  '/users-with-schema-component-in-request-body': {
    POST: {
      request: {
        body: MyServiceComponents['schemas']['CreateUserBody'];
      };
    };
  };
  '/users-with-schema-component-in-multiple-contents': {
    POST: {
      request:
        | {
            headers: HttpHeadersSerialized<{
              'content-type': 'application/json';
            }>;
            body: MyServiceComponents['schemas']['CreateUserBody'];
          }
        | {
            headers: HttpHeadersSerialized<{
              'content-type': 'application/xml';
            }>;
            body: MyServiceComponents['schemas']['CreateUserBody'];
          };
    };
  };
  '/users-with-schema-component-in-multiple-contents-having-parameters': {
    POST: {
      request:
        | {
            searchParams: HttpSearchParamsSerialized<{
              name?: string;
            }>;
            headers: HttpHeadersSerialized<{
              'content-type': 'application/json';
              'x-value'?: string;
            }>;
            body: MyServiceComponents['schemas']['CreateUserBody'];
          }
        | {
            searchParams: HttpSearchParamsSerialized<{
              name?: string;
            }>;
            headers: HttpHeadersSerialized<{
              'content-type': 'application/xml';
              'x-value'?: string;
            }>;
            body: MyServiceComponents['schemas']['CreateUserBody'];
          };
    };
  };
  '/users-with-optional-schema-request-body': {
    POST: {
      request: {
        body?: MyServiceComponents['schemas']['CreateUserBody'];
      };
    };
  };
  '/users-with-optional-by-default-schema-request-body': {
    POST: {
      request: {
        body?: MyServiceComponents['schemas']['CreateUserBody'];
      };
    };
  };
  '/users-with-literal-request-body': {
    POST: {
      request: {
        body: {
          email: string;
          password: string;
        };
      };
    };
  };
  '/users-with-literal-multiple-contents': {
    POST: {
      request:
        | {
            headers: HttpHeadersSerialized<{
              'content-type': 'application/json';
            }>;
            body: {
              email: string;
              password: string;
            };
          }
        | {
            headers: HttpHeadersSerialized<{
              'content-type': 'application/xml';
            }>;
            body: {
              name: string;
              password: string;
            };
          };
    };
  };
  '/users-with-literal-multiple-contents-having-parameters': {
    POST: {
      request:
        | {
            searchParams: HttpSearchParamsSerialized<{
              name?: string;
            }>;
            headers: HttpHeadersSerialized<{
              'content-type': 'application/json';
              'x-value'?: string;
            }>;
            body: {
              email: string;
              password: string;
            };
          }
        | {
            searchParams: HttpSearchParamsSerialized<{
              name?: string;
            }>;
            headers: HttpHeadersSerialized<{
              'content-type': 'application/xml';
              'x-value'?: string;
            }>;
            body: {
              name: string;
              password: string;
            };
          };
    };
  };
  '/users-with-optional-literal-request-body': {
    POST: {
      request: {
        body?: {
          email: string;
          password: string;
        };
      };
    };
  };
  '/users-with-optional-by-default-literal-request-body': {
    POST: {
      request: {
        body?: {
          email: string;
          password: string;
        };
      };
    };
  };
}>;

export interface MyServiceComponents {
  schemas: {
    CreateUserBody: {
      name?: string;
      email: string;
      password: string;
    };
  };
  requests: {
    createUser: HttpSchema.Request<{
      body?: {
        name?: string;
        email: string;
        password: string;
      };
    }>;
    requiredCreateUser: HttpSchema.Request<{
      body: {
        name?: string;
        email: string;
        password: string;
      };
    }>;
    requiredCreateUserMultiple: HttpSchema.Request<
      | {
          headers: HttpHeadersSerialized<{
            'content-type': 'application/json';
          }>;
          body: {
            email: string;
            password: string;
          };
        }
      | {
          headers: HttpHeadersSerialized<{
            'content-type': 'application/xml';
          }>;
          body: {
            name: string;
            password: string;
          };
        }
    >;
    optionalCreateUser: HttpSchema.Request<{
      body?: {
        name?: string;
        email: string;
        password: string;
      };
    }>;
  };
}
