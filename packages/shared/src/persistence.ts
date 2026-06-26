import type { IocOrderIntent, OrderFill, PerpetualPosition } from "./adapter";
import type { MarketFreshness } from "./market-data";
import type { ArbitrageOpportunity, OpportunityResult } from "./opportunity";

export type AuditEventType =
  | "opportunity_snapshot"
  | "order_intent"
  | "fill"
  | "position_snapshot"
  | "risk_event"
  | "rescue_action"
  | "user_action"
  | "kill_switch_event";

export interface AuditEventBase {
  id: string;
  correlationId: string;
  type: AuditEventType;
  occurredAt: Date;
}

export interface OpportunitySnapshotRecordInput {
  id: string;
  correlationId: string;
  resultStatus: OpportunityResult["status"];
  opportunity?: ArbitrageOpportunity;
  rejectionReason?: string;
  rejectionDetails?: {
    longCandidate: MarketFreshness;
    shortCandidate: MarketFreshness;
  };
}

export interface OpportunitySnapshotRecord extends AuditEventBase, OpportunitySnapshotRecordInput {
  type: "opportunity_snapshot";
}

export interface OrderIntentRecordInput {
  id: string;
  correlationId: string;
  intent: IocOrderIntent;
}

export interface OrderIntentRecord extends AuditEventBase, OrderIntentRecordInput {
  type: "order_intent";
}

export interface FillRecordInput {
  id: string;
  correlationId: string;
  orderIntentId: string;
  fill: OrderFill;
}

export interface FillRecord extends AuditEventBase, FillRecordInput {
  type: "fill";
}

export interface PositionSnapshotRecordInput {
  id: string;
  correlationId: string;
  positions: PerpetualPosition[];
}

export interface PositionSnapshotRecord extends AuditEventBase, PositionSnapshotRecordInput {
  type: "position_snapshot";
}

export interface RiskEventRecordInput {
  id: string;
  correlationId: string;
  severity: "info" | "warning" | "critical";
  code: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface RiskEventRecord extends AuditEventBase, RiskEventRecordInput {
  type: "risk_event";
}

export interface RescueActionRecordInput {
  id: string;
  correlationId: string;
  action: "hedge" | "close" | "lock-and-alert";
  costBps?: number;
  metadata?: Record<string, unknown>;
}

export interface RescueActionRecord extends AuditEventBase, RescueActionRecordInput {
  type: "rescue_action";
}

export interface UserActionRecordInput {
  id: string;
  correlationId: string;
  actor: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface UserActionRecord extends AuditEventBase, UserActionRecordInput {
  type: "user_action";
}

export interface KillSwitchEventRecordInput {
  id: string;
  correlationId: string;
  scope: "global" | "exchange";
  enabled: boolean;
  exchange?: string;
  reason: string;
}

export interface KillSwitchEventRecord extends AuditEventBase, KillSwitchEventRecordInput {
  type: "kill_switch_event";
}

export type AuditEvent =
  | OpportunitySnapshotRecord
  | OrderIntentRecord
  | FillRecord
  | PositionSnapshotRecord
  | RiskEventRecord
  | RescueActionRecord
  | UserActionRecord
  | KillSwitchEventRecord;

export interface AuditRepository {
  recordOpportunitySnapshot(input: OpportunitySnapshotRecordInput): Promise<OpportunitySnapshotRecord>;
  recordOrderIntent(input: OrderIntentRecordInput): Promise<OrderIntentRecord>;
  recordFill(input: FillRecordInput): Promise<FillRecord>;
  recordPositionSnapshot(input: PositionSnapshotRecordInput): Promise<PositionSnapshotRecord>;
  recordRiskEvent(input: RiskEventRecordInput): Promise<RiskEventRecord>;
  recordRescueAction(input: RescueActionRecordInput): Promise<RescueActionRecord>;
  recordUserAction(input: UserActionRecordInput): Promise<UserActionRecord>;
  recordKillSwitchEvent(input: KillSwitchEventRecordInput): Promise<KillSwitchEventRecord>;
  getAuditTimeline(correlationId: string): Promise<AuditEvent[]>;
}

export class InMemoryAuditRepository implements AuditRepository {
  private readonly events: AuditEvent[] = [];

  constructor(private readonly now: () => Date = () => new Date()) {}

  async recordOpportunitySnapshot(input: OpportunitySnapshotRecordInput): Promise<OpportunitySnapshotRecord> {
    return this.record({ ...input, type: "opportunity_snapshot" });
  }

  async recordOrderIntent(input: OrderIntentRecordInput): Promise<OrderIntentRecord> {
    return this.record({ ...input, type: "order_intent" });
  }

  async recordFill(input: FillRecordInput): Promise<FillRecord> {
    return this.record({ ...input, type: "fill" });
  }

  async recordPositionSnapshot(input: PositionSnapshotRecordInput): Promise<PositionSnapshotRecord> {
    return this.record({ ...input, type: "position_snapshot" });
  }

  async recordRiskEvent(input: RiskEventRecordInput): Promise<RiskEventRecord> {
    return this.record({ ...input, type: "risk_event" });
  }

  async recordRescueAction(input: RescueActionRecordInput): Promise<RescueActionRecord> {
    return this.record({ ...input, type: "rescue_action" });
  }

  async recordUserAction(input: UserActionRecordInput): Promise<UserActionRecord> {
    return this.record({ ...input, type: "user_action" });
  }

  async recordKillSwitchEvent(input: KillSwitchEventRecordInput): Promise<KillSwitchEventRecord> {
    return this.record({ ...input, type: "kill_switch_event" });
  }

  async getAuditTimeline(correlationId: string): Promise<AuditEvent[]> {
    return this.events
      .filter((event) => event.correlationId === correlationId)
      .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
  }

  private async record<T extends AuditEvent>(event: Omit<T, "occurredAt">): Promise<T> {
    const record = {
      ...event,
      occurredAt: this.now(),
    } as T;

    this.events.push(record);
    return record;
  }
}
