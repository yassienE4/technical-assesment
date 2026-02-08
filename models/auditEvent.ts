export interface AuditEvent {
  id: string;
  at: string; // ISO
  action: string;
  from?: string;
  to?: string;
}