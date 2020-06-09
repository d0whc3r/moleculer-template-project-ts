import moleculer, { Context } from 'moleculer';
import { DbAdapter, DbContextParameters } from 'moleculer-db';

export const listActionConfig = {
  cache: {
    keys: ['populate', 'fields', 'page', 'pageSize', 'sort', 'search', 'searchFields', 'query']
  },
  params: {
    populate: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    fields: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    page: { type: 'number', integer: true, min: 1, optional: true, convert: true },
    pageSize: { type: 'number', integer: true, min: 0, optional: true, convert: true },
    sort: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    search: { type: 'string', optional: true },
    searchFields: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    query: [
      { type: 'object', optional: true },
      { type: 'string', optional: true }
    ]
  }
};

export const getActionConfig = {
  cache: {
    keys: ['id', 'populate', 'fields', 'mapping']
  },
  params: {
    id: [{ type: 'string' }, { type: 'number' }, { type: 'array' }],
    populate: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    fields: [
      { type: 'string', optional: true },
      { type: 'array', optional: true, items: 'string' }
    ],
    mapping: { type: 'boolean', optional: true }
  }
};

export interface DBPagination<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class MoleculerDBService<T, R> extends moleculer.Service<T> {
  metadata!: {
    $category: string;
    $official: boolean;
    $name: string;
    $version: string;
    $repo?: string;
  };
  adapter!: DbAdapter;

  connect!: () => Promise<void>;

  /**
   * Disconnect from database.
   */
  disconnect!: () => Promise<void>;

  /**
   * Sanitize context parameters at `find` action.
   *
   * @param {Context} ctx
   * @param {any} origParams
   * @returns {Promise}
   */
  sanitizeParams!: (ctx: Context, params?: DbContextParameters) => Promise<any>;

  /**
   * Get entity(ies) by ID(s).
   *
   * @methods
   * @param {String|Number|Array} id - ID or IDs.
   * @param {Boolean} decoding - Need to decode IDs.
   * @returns {Object|Array<Object>} Found entity(ies).
   */
  getById!: (id: string | number | string[], decoding?: boolean) => Promise<R>;

  /**
   * Clear the cache & call entity lifecycle events
   *
   * @param {String} type
   * @param {Object|Array|Number} json
   * @param {Context} ctx
   * @returns {Promise}
   */
  entityChanged!: (type: string, json: number | any[] | any, ctx: Context) => Promise<R>;

  /**
   * Clear cached entities
   *
   * @methods
   * @returns {Promise}
   */
  clearCache!: () => Promise<void>;

  /**
   * Transform the fetched documents
   *
   * @param {Array|Object}  docs
   * @param {Object}      Params
   * @returns {Array|Object}
   */
  transformDocuments!: (ctx: Context, params: any, docs: any) => Promise<R | R[]>;

  /**
   * Filter fields in the entity object
   *
   * @param {Object}  doc
   * @param {Array}  fields  Filter properties of model.
   * @returns  {Object}
   */
  filterFields!: (doc: any, fields: Partial<R>[]) => Partial<R>[];

  /**
   * Authorize the required field list. Remove fields which is not exist in the `this.settings.fields`
   *
   * @param {Array} fields
   * @returns {Array}
   */
  authorizeFields!: (fields: Partial<R>[]) => Partial<R>[];

  /**
   * Populate documents.
   *
   * @param {Context}    ctx
   * @param {Array|Object}  docs
   * @param {Array}      populateFields
   * @returns  {Promise}
   */
  populateDocs!: <R>(ctx: Context, docs: any, populateFields: any[]) => Promise<R>;

  /**
   * Validate an entity by validator.
   *
   * @param {T} entity
   * @returns {Promise}
   */
  validateEntity!: <T, R>(entity: T) => Promise<R>;

  /**
   * Encode ID of entity.
   *
   * @methods
   * @param {any} id
   * @returns {R}
   */
  encodeID!: <R>(id: any) => R;

  /**
   * Decode ID of entity.
   *
   * @methods
   * @param {R} id
   * @returns {R}
   */
  decodeID!: <R>(id: any) => R;

  /**
   * Service started lifecycle event handler
   */
  // started!: () => Promise<void>;

  /**
   * Service stopped lifecycle event handler
   */
  // stopped!: () => Promise<void>;

  /**
   * Service created lifecycle event handler
   */
  // created!: () => Promise<void>;

  /**
   * Find entities by query.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Array<Object>} List of found entities.
   */
  _find!: (ctx: Context, params: any) => Promise<R[]>;

  /**
   * Get count of entities by query.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Number} Count of found entities.
   */
  _count!: (ctx: Context, params: any) => Promise<number>;

  /**
   * List entities by filters and pagination results.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Object} List of found entities and count.
   */
  _list!: (ctx: Context, params: any) => Promise<DBPagination<R>>;

  /**
   * Create a new entity.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Object} Saved entity.
   */
  _create!: (ctx: Context, params: any) => Promise<R>;

  /**
   * Create many new entities.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Object|Array.<Object>} Saved entity(ies).
   */
  _insert!: (ctx: Context, params: any) => Promise<R | R[]>;

  /**
   * Get entity by ID.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @returns {Object|Array<Object>} Found entity(ies).
   *
   * @throws {EntityNotFoundError} - 404 Entity not found
   */
  _get!: (ctx: Context, params: any) => Promise<R | R[]>;

  /**
   * Update an entity by ID.
   * > After update, clear the cache & call lifecycle events.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   * @returns {Object} Updated entity.
   *
   * @throws {EntityNotFoundError} - 404 Entity not found
   */
  _update!: (ctx: Context, params: any) => Promise<R>;

  /**
   * Remove an entity by ID.
   *
   * @methods
   *
   * @param {Context} ctx - Context instance.
   * @param {Object?} params - Parameters.
   *
   * @throws {EntityNotFoundError} - 404 Entity not found
   */
  _remove!: (ctx: Context, params: any) => Promise<void>;
}
