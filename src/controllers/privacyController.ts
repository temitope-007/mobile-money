import { Request, Response } from "express";
import { logAuditEvent } from "../utils/log-audit-event";
import { GDPRService } from "../services/gdprService";
import fs from "node:fs/promises";

const DATA_EXPORT_REQUIRED = "DATA_EXPORT_REQUIRED";
const gdprService = new GDPRService();

const privacyController = {
  exportDataEndpoint: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || (req as any).userId;

      // keep for audit purpose
      await logAuditEvent(userId, DATA_EXPORT_REQUIRED);

      const zipPath = await gdprService.exportUserData(userId);

      res.download(zipPath, `gdpr-export-${userId}.zip`, async (err) => {
        if (err) {
          console.log("Download failed", err);
        }
        await fs.unlink(zipPath).catch(() => {});
      });
    } catch (err) {
      console.error("Export error: ", err);
      res.status(500).json({ error: "Failed to export data." });
    }
  },
};

export default privacyController;
