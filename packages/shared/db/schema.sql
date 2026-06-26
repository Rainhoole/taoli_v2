-- Append-friendly audit schema for the arbitrage system.
-- The TypeScript AuditRepository interface is the application boundary; this schema is the Postgres target.

create table if not exists audit_events (
  id text primary key,
  correlation_id text not null,
  type text not null check (
    type in (
      'opportunity_snapshot',
      'order_intent',
      'fill',
      'position_snapshot',
      'risk_event',
      'rescue_action',
      'user_action',
      'kill_switch_event'
    )
  ),
  occurred_at timestamptz not null,
  payload jsonb not null
);

create index if not exists audit_events_correlation_time_idx
  on audit_events (correlation_id, occurred_at);

create index if not exists audit_events_type_time_idx
  on audit_events (type, occurred_at);

create table if not exists current_arbitrage_positions (
  id text primary key,
  correlation_id text not null,
  symbol text not null,
  long_exchange text not null,
  short_exchange text not null,
  state text not null,
  payload jsonb not null,
  updated_at timestamptz not null
);

create index if not exists current_arbitrage_positions_state_idx
  on current_arbitrage_positions (state, updated_at);
