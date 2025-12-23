import { FilterQuery, PipelineStage } from "mongoose";
import { BaseRepository } from "./base.repository";
import Movement, { IMovement } from "../models/Movement";
import Request, { IRequest } from "../models/Request";
import { RequestStatus } from "@/lib/constants";
import { ExtendedModel } from "@/lib/db/types/model.types";
import dbConnect from "../connection";

export interface ConsumptionByService {
  serviceType: string;
  count: number;
  tokens: number;
}

export interface ConsumptionDataPoint {
  date: string;
  services: Record<string, number>;
  total: number;
}

export interface ConsumptionAggregation {
  data: ConsumptionDataPoint[];
  totals: ConsumptionByService[];
  grandTotal: number;
}

class MovementRepository extends BaseRepository<IMovement> {
  constructor() {
    super(Movement as ExtendedModel<IMovement>);
  }

  /**
   * Get consumption data aggregated by date and service type
   * Searches in the requests collection instead of movements
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @param groupBy - 'day' or 'month'
   */
  async getConsumptionByDateAndService(
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "month" = "day"
  ): Promise<ConsumptionAggregation> {
    await dbConnect();

    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    // Valid statuses that count as completed requests
    const completedStatuses = [
      RequestStatus.COMPLETED,
      RequestStatus.PARTIAL,
    ];

    const pipeline: PipelineStage[] = [
      // Filter by date range, completed status and not deleted
      {
        $match: {
          status: { $in: completedStatuses },
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          // Ensure type exists
          type: { $exists: true, $ne: null },
          // Not deleted
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        },
      },
      // Group by date and service type
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            serviceType: "$type",
          },
          count: { $sum: 1 },
        },
      },
      // Sort by date ascending
      {
        $sort: { "_id.date": 1 } as Record<string, 1 | -1>,
      },
    ];

    const results = await Request.aggregate(pipeline);

    // Transform results into the desired format
    const dataMap = new Map<string, ConsumptionDataPoint>();
    const totalsMap = new Map<string, ConsumptionByService>();
    let grandTotal = 0;

    for (const item of results) {
      const date = item._id?.date;
      const serviceType = item._id?.serviceType;
      const count = item.count || 0;

      // Skip if no valid date or serviceType
      if (!date || !serviceType) continue;

      // Build data points by date
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          services: {},
          total: 0,
        });
      }

      const dataPoint = dataMap.get(date)!;
      dataPoint.services[serviceType] =
        (dataPoint.services[serviceType] || 0) + count;
      dataPoint.total += count;

      // Build totals by service
      if (!totalsMap.has(serviceType)) {
        totalsMap.set(serviceType, {
          serviceType,
          count: 0,
          tokens: 0,
        });
      }

      const serviceTotal = totalsMap.get(serviceType)!;
      serviceTotal.count += count;
      grandTotal += count;
    }

    // Sort data by date and totals by count
    const sortedData = Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const sortedTotals = Array.from(totalsMap.values()).sort(
      (a, b) => b.count - a.count
    );

    return {
      data: sortedData,
      totals: sortedTotals,
      grandTotal,
    };
  }

  /**
   * Get total consumption count by service type from requests collection
   */
  async getConsumptionByService(
    startDate?: Date,
    endDate?: Date
  ): Promise<ConsumptionByService[]> {
    await dbConnect();

    const completedStatuses = [
      RequestStatus.COMPLETED,
      RequestStatus.PARTIAL,
    ];

    const matchStage: FilterQuery<IRequest> = {
      status: { $in: completedStatuses },
      type: { $exists: true, $ne: null },
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } as Record<string, 1 | -1> },
    ];

    const results = await Request.aggregate(pipeline);

    return results
      .filter((item) => item._id) // Filter out null types
      .map((item) => ({
        serviceType: item._id,
        count: item.count || 0,
        tokens: 0, // Requests don't track tokens directly
      }));
  }
}

export const movementRepository = new MovementRepository();
