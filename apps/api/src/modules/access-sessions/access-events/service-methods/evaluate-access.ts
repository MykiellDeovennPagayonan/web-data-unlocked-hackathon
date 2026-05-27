import { AccessVerdict, AccessEventType } from '../../../../generated/client';
import { IpRecord } from '../../../device-intelligence/ip-records/entities/ip-record.entity';
import { Device } from '../../../device-intelligence/devices/entities/device.entity';

export interface AccessContext {
  platformId: string;
  identityId?: string;
  ipRecord: IpRecord;
  device: Device;
  eventType: AccessEventType;
  trustScore: number;
  platformRules: PlatformRule[];
}

export interface PlatformRule {
  id: string;
  ruleTrigger: string;
  conditionJson: Record<string, unknown>;
  action: string;
  isActive: boolean;
}

export interface EvaluationResult {
  verdict: AccessVerdict;
  scoreAtEvent: number;
  triggeredRules: string[];
}

function evaluateCondition(
  condition: Record<string, unknown>,
  ctx: AccessContext,
): boolean {
  const checks: boolean[] = [];

  if ('ip_type' in condition) {
    checks.push(ctx.ipRecord.ipType === condition['ip_type']);
  }
  if ('ip_type_in' in condition && Array.isArray(condition['ip_type_in'])) {
    checks.push(
      (condition['ip_type_in'] as string[]).includes(ctx.ipRecord.ipType),
    );
  }
  if ('ip_blacklisted' in condition) {
    checks.push(ctx.ipRecord.isBlacklisted === condition['ip_blacklisted']);
  }
  if ('ip_risk_score_gte' in condition) {
    checks.push(
      Number(ctx.ipRecord.riskScore) >= Number(condition['ip_risk_score_gte']),
    );
  }
  if ('device_flagged' in condition) {
    checks.push(ctx.device.isFlagged === condition['device_flagged']);
  }
  if ('device_risk_score_gte' in condition) {
    checks.push(
      Number(ctx.device.riskScore) >=
        Number(condition['device_risk_score_gte']),
    );
  }
  if ('trust_score_lte' in condition) {
    checks.push(ctx.trustScore <= Number(condition['trust_score_lte']));
  }
  if ('trust_score_gte' in condition) {
    checks.push(ctx.trustScore >= Number(condition['trust_score_gte']));
  }

  return checks.length > 0 && checks.every(Boolean);
}

const VERDICT_PRIORITY: Record<AccessVerdict, number> = {
  [AccessVerdict.blocked]: 3,
  [AccessVerdict.flagged]: 2,
  [AccessVerdict.throttled]: 1,
  [AccessVerdict.allowed]: 0,
};

function applyAction(current: AccessVerdict, action: string): AccessVerdict {
  const actionMap: Record<string, AccessVerdict> = {
    block: AccessVerdict.blocked,
    flag: AccessVerdict.flagged,
    throttle: AccessVerdict.throttled,
    require_reverification: AccessVerdict.flagged,
  };
  const next = actionMap[action];
  if (!next) return current;
  return VERDICT_PRIORITY[next] > VERDICT_PRIORITY[current] ? next : current;
}

export function evaluateAccess(ctx: AccessContext): EvaluationResult {
  const triggeredRules: string[] = [];
  let verdict: AccessVerdict = AccessVerdict.allowed;

  for (const rule of ctx.platformRules) {
    if (!rule.isActive) continue;

    const triggerMatches =
      rule.ruleTrigger === ctx.eventType || rule.ruleTrigger === 'api_call';
    if (!triggerMatches) continue;

    const conditionMet =
      Object.keys(rule.conditionJson).length === 0 ||
      evaluateCondition(rule.conditionJson, ctx);

    if (!conditionMet) continue;

    triggeredRules.push(rule.id);
    verdict = applyAction(verdict, rule.action);
  }

  return {
    verdict,
    scoreAtEvent: ctx.trustScore,
    triggeredRules,
  };
}
