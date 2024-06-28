import type { HttpSchema, HttpSearchParams, HttpSearchParamsSerialized } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users-with-literal-component-search-params-in-path': {
    /** List of users with literal component search params */
    GET: {
      request: {
        searchParams: HttpSearchParamsSerialized<{
          /** The search text */
          search?: MyServiceComponents['parameters']['literalSearch'];
          /** The sort order */
          order?: MyServiceComponents['parameters']['literalOrder'];
          /** How many items to return */
          limit: MyServiceComponents['parameters']['literalLimit'];
          /** Whether to include archived pets */
          archived?: MyServiceComponents['parameters']['literalArchived'];
        }>;
      };
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'][];
        };
      };
    };
  };
  '/users-with-literal-component-search-params': {
    /** List of users with literal component search params */
    GET: {
      request: {
        searchParams: HttpSearchParamsSerialized<{
          /** The search text */
          search?: MyServiceComponents['parameters']['literalSearch'];
          /** The sort order */
          order?: MyServiceComponents['parameters']['literalOrder'];
          /** How many items to return */
          limit: MyServiceComponents['parameters']['literalLimit'];
          /** Whether to include archived pets */
          archived?: MyServiceComponents['parameters']['literalArchived'];
        }>;
      };
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'][];
        };
      };
    };
  };
  '/users-with-reference-component-search-params': {
    /** List of users with reference component search params */
    GET: {
      request: {
        searchParams: HttpSearchParamsSerialized<{
          /** The search text */
          search?: MyServiceComponents['parameters']['referenceSearch'];
          /** The sort order */
          order?: MyServiceComponents['parameters']['referenceOrder'];
          /** How many items to return */
          limit: MyServiceComponents['parameters']['referenceLimit'];
          /** Whether to include archived pets */
          archived?: MyServiceComponents['parameters']['referenceArchived'];
        }>;
      };
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'][];
        };
      };
    };
  };
  '/users-with-reference-search-params': {
    /** List of users with reference search params */
    GET: {
      request: {
        searchParams: HttpSearchParamsSerialized<{
          /** The search text */
          search?: MyServiceComponents['schemas']['search'];
          /** The sort order */
          order?: MyServiceComponents['schemas']['order'];
          /** How many items to return */
          limit: MyServiceComponents['schemas']['limit'];
          /** Whether to include archived pets */
          archived?: MyServiceComponents['schemas']['archived'];
        }>;
      };
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'][];
        };
      };
    };
  };
  '/users-with-literal-search-params': {
    /** List of users with literal search params */
    GET: {
      request: {
        searchParams: HttpSearchParamsSerialized<{
          /** The search text */
          search?: (string | null) | string[];
          /** The sort order */
          order?: 'asc' | 'desc';
          /** How many items to return */
          limit: number;
          /** Whether to include archived pets */
          archived?: boolean;
        }>;
      };
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'][];
        };
      };
    };
  };
  '/users-with-reference-search-params-in-body': {
    /** List of users with reference search params */
    GET: {
      response: {
        /** Success */
        200: {
          body: HttpSearchParams<
            HttpSearchParamsSerialized<{
              search: MyServiceComponents['schemas']['search'];
              order: MyServiceComponents['schemas']['order'];
              limit: MyServiceComponents['schemas']['limit'];
              archived: MyServiceComponents['schemas']['archived'];
            }>
          >;
        };
      };
    };
  };
  '/users-with-literal-search-params-in-body': {
    /** List of users with literal search params */
    GET: {
      response: {
        /** Success */
        200: {
          body: HttpSearchParams<
            HttpSearchParamsSerialized<{
              search?: (string | null) | string[];
              /** @enum {string} */
              order?: 'asc' | 'desc';
              /** Format: int32 */
              limit?: number | null;
              /** @default false */
              archived: boolean;
            }>
          >;
        };
      };
    };
  };
}>;
export interface MyServiceComponents {
  schemas: {
    User: {
      /** Format: int64 */
      id: number;
      name: string;
    };
    search: (string | null) | string[];
    /**
     * The sort order
     *
     * @enum {string}
     */
    order: 'asc' | 'desc';
    /**
     * Format: int32
     *
     * How many items to return
     */
    limit: number | null;
    /**
     * Whether to include archived pets
     *
     * @default false
     */
    archived: boolean;
  };
  parameters: {
    /** The search text */
    literalSearch: (string | null) | string[];
    /** The sort order */
    literalOrder: MyServiceComponents['schemas']['order'];
    /** How many items to return */
    literalLimit: number | null;
    /** Whether to include archived pets */
    literalArchived: boolean;
    /** The search text */
    referenceSearch: MyServiceComponents['schemas']['search'];
    /** The sort order */
    referenceOrder: MyServiceComponents['schemas']['order'];
    /** How many items to return */
    referenceLimit: MyServiceComponents['schemas']['limit'];
    /** Whether to include archived pets */
    referenceArchived: MyServiceComponents['schemas']['archived'];
  };
}