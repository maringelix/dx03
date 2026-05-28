import { z } from 'zod';

// /api/metrics has no inputs today; reserved for future filters.
export const apiMetricsQuerySchema = z.object({}).strict();

// /api/health-history (placeholder for future pagination)
export const healthHistoryQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().max(500).optional(),
  })
  .strict();
