const db = require('../../storage/db');

function matches(record, query = {}) {
  if (query.$or) return query.$or.some((condition) => matches(record, condition));
  return Object.entries(query).every(([key, value]) => String(record[key] ?? record.data?.[key] ?? '') === String(value));
}

function hydrate(type, row) {
  if (!row) return null;
  const document = { _id: row.id, id: row.id, ...row.data, type: row.type, name: row.name, created_at: row.created_at };
  document.toObject = () => ({ ...document });
  document.save = async () => {
    const { _id, id, type: documentType, name, created_at, save, toObject, ...data } = document;
    db.updateEntity(row.id, { type: documentType || type, name: name || data.name || row.name, data });
    return document;
  };
  return document;
}

function createLocalModel(type) {
  return class LocalModel {
    constructor(payload = {}) {
      Object.assign(this, payload);
    }

    async save() {
      const id = this._id || db.createEntity({ type, name: this.name || this.email || this.title || type, data: { ...this } });
      this._id = id;
      this.id = id;
      return this;
    }

    static async create(payload) {
      const id = db.createEntity({ type, name: payload.name || payload.email || payload.title || type, data: payload });
      return hydrate(type, db.getEntity(id));
    }

    static async findOne(query) {
      return db.listEntities(type).map((row) => hydrate(type, row)).find((row) => matches(row, query)) || null;
    }

    static findById(id) {
      const value = Promise.resolve(hydrate(type, db.getEntity(id)));
      value.select = () => value;
      return value;
    }

    static async find(query = {}) {
      return db.listEntities(type).map((row) => hydrate(type, row)).filter((row) => matches(row, query));
    }
  };
}

module.exports = createLocalModel;
