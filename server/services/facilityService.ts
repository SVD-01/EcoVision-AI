import { RecyclingCenterModel, SmartBinModel, QRCodeModel } from "../models";
import { centerRepo, smartBinRepo } from "../repositories";
import { WasteTypeEnum, SocketEvent } from "../constants";
import { socketServer } from "../sockets";

export class FacilityService {
  async getRecyclingCenters(lat?: number, lng?: number, maxDistanceKm = 15) {
    if (lat && lng) {
      try {
        const centers = await centerRepo.findNearby(lng, lat, maxDistanceKm);
        if (centers.length > 0) return centers;
      } catch {
        // Fallback if 2dsphere index is not yet built in clean db
      }
    }

    const all = await centerRepo.find({});
    if (all.length > 0) return all;

    return [
      {
        id: "rc-1",
        name: "CircularWorks Recovery Hub",
        lat: 37.7749,
        lng: -122.4194,
        address: "120 Mission Loop, San Francisco, CA",
        distanceKm: 1.2,
        rating: 4.9,
        openNow: true,
        accepted: ["plastic", "paper", "metal", "glass"],
      },
      {
        id: "rc-2",
        name: "GreenGrid E-Waste Studio",
        lat: 37.7854,
        lng: -122.4011,
        address: "44 Howard Street, San Francisco, CA",
        distanceKm: 2.7,
        rating: 4.8,
        openNow: true,
        accepted: ["e-waste", "metal", "plastic"],
      },
      {
        id: "rc-3",
        name: "Bay Organics Compost Lab",
        lat: 37.7631,
        lng: -122.4312,
        address: "9 Castro Garden Way, San Francisco, CA",
        distanceKm: 3.1,
        rating: 4.7,
        openNow: false,
        accepted: ["organic", "paper"],
      },
      {
        id: "rc-4",
        name: "ZeroWaste Exchange",
        lat: 37.7926,
        lng: -122.393,
        address: "210 Embarcadero North, San Francisco, CA",
        distanceKm: 4.4,
        rating: 4.6,
        openNow: true,
        accepted: ["plastic", "paper", "organic", "metal", "glass", "e-waste"],
      },
    ];
  }

  async getSmartBins(building?: string) {
    const filter = building ? { building } : {};
    const bins = await smartBinRepo.find(filter);
    if (bins.length > 0) return bins;

    return [
      { binCode: "BIN-ORG-01", name: "Organics", fillLevel: 64, acceptedStream: "organic", status: "Compost stream healthy", batteryPercentage: 92 },
      { binCode: "BIN-REC-02", name: "Recycling", fillLevel: 42, acceptedStream: "plastic", status: "2 contamination alerts", batteryPercentage: 88 },
      { binCode: "BIN-EW-03", name: "E-Waste", fillLevel: 18, acceptedStream: "e-waste", status: "Pickup due Friday", batteryPercentage: 95 },
    ];
  }

  async updateBinTelemetry(binCode: string, fillLevel: number, batteryPercentage?: number) {
    let bin = await SmartBinModel.findOne({ binCode }).exec();
    if (bin) {
      bin.fillLevel = fillLevel;
      if (batteryPercentage !== undefined) bin.batteryPercentage = batteryPercentage;
      bin.status = fillLevel > 85 ? "full" : fillLevel > 70 ? "alert" : "healthy";
      await bin.save();
    }

    socketServer.emitToAll(SocketEvent.BIN_TELEMETRY_UPDATE, {
      binCode,
      fillLevel,
      status: fillLevel > 85 ? "full" : "healthy",
      timestamp: new Date().toISOString(),
    });

    return { success: true, binCode, fillLevel };
  }
}

export const facilityService = new FacilityService();
