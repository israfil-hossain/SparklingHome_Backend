import { ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { ObjectId } from "mongodb";
import {
  Document,
  FilterQuery,
  FlattenMaps,
  Model,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from "mongoose";

export class GenericRepository<T extends Document> {
  private readonly internalLogger: Logger;
  private readonly internalModel: Model<T>;

  constructor(model: Model<T>, logger?: Logger) {
    this.internalModel = model;
    this.internalLogger = logger || new Logger(this.constructor.name);
  }

  async create(doc: Partial<T>, saveOptions: SaveOptions = {}): Promise<T> {
    try {
      const createdEntity = new this.internalModel(doc);
      const savedResult = await createdEntity.save(saveOptions);

      return savedResult;
    } catch (error) {
      if (error?.name === "MongoServerError" && error?.code === 11000) {
        this.internalLogger.error("Duplicate key error while creating:", error);
        throw new ConflictException(
          "Document already exists with provided inputs",
        );
      }

      throw error;
    }
  }

  async getAll(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
  ): Promise<FlattenMaps<T>[]> {
    try {
      const result = await this.internalModel
        .find(filter, null, options)
        .lean()
        .exec();
      return result;
    } catch (error) {
      this.internalLogger.error("Error finding entities:", error);
      return [];
    }
  }

  async getOneWhere(
    filter: FilterQuery<T>,
    options: QueryOptions = {},
  ): Promise<T | null> {
    try {
      const result = await this.internalModel
        .findOne(filter, null, options)
        .exec();
      return result;
    } catch (error) {
      this.internalLogger.error("Error finding entity by ID:", error);
      return null;
    }
  }

  async getOneById(id: string, options: QueryOptions = {}): Promise<T | null> {
    try {
      const result = await this.internalModel
        .findOne({ _id: id }, null, options)
        .exec();
      return result;
    } catch (error) {
      this.internalLogger.error("Error finding entity by ID:", error);
      return null;
    }
  }

  async updateOneById(
    documentId: string,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options: QueryOptions = {},
  ): Promise<T> {
    try {
      const result = await this.internalModel
        .findOneAndUpdate(
          { _id: documentId },
          { ...updated, updatedAt: new Date() },
          { ...options, new: true },
        )
        .exec();

      if (!result) {
        throw new NotFoundException("Document not found with provided ID");
      }

      return result;
    } catch (error) {
      if (error?.name === "MongoServerError" && error?.code === 11000) {
        this.internalLogger.error("Duplicate key error while updating:", error);
        throw new ConflictException(
          "Document already exists with provided inputs",
        );
      }

      this.internalLogger.error("Error updating one entity:", error);
      throw error;
    }
  }

  async removeOneById(id: string): Promise<boolean> {
    try {
      const { acknowledged } = await this.internalModel
        .deleteOne({ _id: id })
        .exec();
      return acknowledged;
    } catch (error) {
      this.internalLogger.error("Error removing entities:", error);
      throw error;
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      const count = await this.internalModel.countDocuments(filter).exec();
      return count;
    } catch (error) {
      this.internalLogger.error("Error counting documents:", error);
      throw error;
    }
  }

  async validateObjectIds(listOfIds: string[] = []): Promise<boolean> {
    try {
      if (!Array.isArray(listOfIds) || !listOfIds?.length) {
        return false;
      }

      const objectIdStrings = listOfIds.map(String);
      const objectIds = objectIdStrings.map((id) => new ObjectId(id));

      // Query the database
      const result = await this.internalModel
        .find({ _id: { $in: objectIds } })
        .select("_id")
        .lean()
        .exec();

      return listOfIds.length === result?.length;
    } catch (error) {
      this.internalLogger.error("Error during validation:", error);
      return false;
    }
  }
}
