import { StrictnessLevel } from '../../../../../generated/prisma/client';
import { PlatformRulesRepository } from '../platform-rules.repository';

export async function applyStrictnessPreset(
  repository: PlatformRulesRepository,
  platformId: string,
  strictnessLevel: StrictnessLevel,
): Promise<void> {
  // Clear existing rules for this platform
  const existingRules = await repository.findByPlatform({ platformId });
  await Promise.all(existingRules.map((rule) => repository.delete(rule.id)));

  // Apply preset rules based on strictness level
  const presetRules = getPresetRules(strictnessLevel);

  await Promise.all(
    presetRules.map((rule) =>
      repository.insert({
        platformId,
        ruleTrigger: rule.ruleTrigger,
        conditionJson: rule.conditionJson,
        action: rule.action,
      }),
    ),
  );
}

function getPresetRules(level: StrictnessLevel): Array<{
  ruleTrigger: 'registration' | 'login' | 'api_call';
  conditionJson: object;
  action: 'block' | 'flag' | 'throttle' | 'require_reverification';
}> {
  switch (level) {
    case 'low':
      return [
        {
          ruleTrigger: 'registration',
          conditionJson: { ipIsBlacklisted: true },
          action: 'block',
        },
      ];
    case 'medium':
      return [
        {
          ruleTrigger: 'registration',
          conditionJson: { ipIsBlacklisted: true },
          action: 'block',
        },
        {
          ruleTrigger: 'registration',
          conditionJson: { ipType: 'vpn' },
          action: 'flag',
        },
        {
          ruleTrigger: 'api_call',
          conditionJson: { rateLimitExceeded: true },
          action: 'throttle',
        },
      ];
    case 'high':
      return [
        {
          ruleTrigger: 'registration',
          conditionJson: { ipIsBlacklisted: true },
          action: 'block',
        },
        {
          ruleTrigger: 'registration',
          conditionJson: {},
          action: 'require_reverification',
        },
        {
          ruleTrigger: 'registration',
          conditionJson: { ipType: 'datacenter' },
          action: 'block',
        },
        {
          ruleTrigger: 'login',
          conditionJson: { ipType: 'vpn' },
          action: 'require_reverification',
        },
      ];
    default:
      return [];
  }
}
