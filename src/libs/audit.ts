import { auditLogControllerCreateLog } from '@/api/auditLogs'
import request from '@/libs/request'
import { logger } from '@/utils/logger'

interface AuditEntry {
  action: string
  resourceType: string
  resourceId: string
  metadata?: Record<string, unknown>
}

type ResourceSender = (entry: AuditEntry) => Promise<unknown>

/**
 * Resource-specific senders. Falls back to the generic endpoint when no
 * dedicated backend route exists for the resource type.
 */
const RESOURCE_SENDERS: Record<string, ResourceSender> = {
  video: ({ resourceId }) => auditLogControllerCreateLog({ videoId: resourceId })
}

function sendGenericAudit(entry: AuditEntry): Promise<unknown> {
  return request('/api/v1/audit-logs', {
    method: 'POST',
    data: {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      metadata: entry.metadata
    }
  })
}

/**
 * Fire-and-forget audit logger.
 * Logs locally and sends to the backend audit API.
 * Never blocks the UI -- errors are swallowed and logged as warnings.
 */
export async function auditLog(entry: AuditEntry): Promise<void> {
  const { action, resourceType, resourceId, metadata } = entry

  logger.audit(`${action} ${resourceType}:${resourceId}`, 'system', {
    action,
    resourceType,
    resourceId,
    ...metadata
  })

  const send = RESOURCE_SENDERS[resourceType] ?? sendGenericAudit

  send(entry).catch(err =>
    logger.warn('Audit log API call failed', { err: String(err), action, resourceType, resourceId })
  )
}
