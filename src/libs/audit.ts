import { auditLogControllerCreateLog } from '@/api/auditLogs'
import { logger } from '@/utils/logger'

interface AuditEntry {
  action: string
  resourceType: string
  resourceId: string
  metadata?: Record<string, unknown>
}

/**
 * Fire-and-forget audit logger.
 * Logs locally and sends to the backend audit API when applicable.
 * Never blocks the UI -- errors are swallowed and logged as warnings.
 */
export async function auditLog({ action, resourceType, resourceId, metadata }: AuditEntry): Promise<void> {
  logger.audit(`${action} ${resourceType}:${resourceId}`, 'system', {
    action,
    resourceType,
    resourceId,
    ...metadata
  })

  if (resourceType === 'video') {
    auditLogControllerCreateLog({ videoId: resourceId }).catch(err =>
      logger.warn('Audit log API call failed', { err: String(err), action, resourceType, resourceId })
    )
  }
}
