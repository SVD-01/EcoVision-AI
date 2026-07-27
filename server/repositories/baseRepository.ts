import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import { cacheClient } from "../config/redis";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;
  protected cachePrefix: string;

  constructor(model: Model<T>, cachePrefix = "repo") {
    this.model = model;
    this.cachePrefix = cachePrefix;
  }

  async findById(id: string, populate?: string | string[]): Promise<T | null> {
    const cacheKey = `${this.cachePrefix}:${id}`;
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Ignore cache parse error
      }
    }

    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate as any);
    }
    const doc = await query.exec();
    if (doc) {
      await cacheClient.set(cacheKey, JSON.stringify(doc), "EX", 300); // 5 min cache
    }
    return doc;
  }

  async findOne(filter: FilterQuery<T>, populate?: string | string[]): Promise<T | null> {
    let query = this.model.findOne(filter);
    if (populate) {
      query = query.populate(populate as any);
    }
    return query.exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    options: { limit?: number; skip?: number; sort?: any; populate?: string | string[] } = {}
  ): Promise<T[]> {
    let query = this.model.find(filter);
    if (options.sort) query = query.sort(options.sort);
    if (options.skip !== undefined) query = query.skip(options.skip);
    if (options.limit !== undefined) query = query.limit(options.limit);
    if (options.populate) query = query.populate(options.populate as any);
    return query.exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc;
  }

  async updateById(id: string, update: UpdateQuery<T>, options: QueryOptions = { new: true }): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, update, options).exec();
    if (doc) {
      await cacheClient.del(`${this.cachePrefix}:${id}`);
    }
    return doc;
  }

  async deleteById(id: string): Promise<T | null> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (doc) {
      await cacheClient.del(`${this.cachePrefix}:${id}`);
    }
    return doc;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
