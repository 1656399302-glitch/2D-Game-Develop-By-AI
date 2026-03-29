import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import {
  Challenge,
  ChallengeRequirement,
  ValidationResult,
  RequirementDetail,
  rarityMeetsRequirement,
} from '../types/challenges';

/**
 * Validate a single requirement against the machine state
 */
function validateSingleRequirement(
  requirement: keyof ChallengeRequirement,
  value: string | number | string[] | undefined,
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes
): RequirementDetail | null {
  if (value === undefined) return null;

  switch (requirement) {
    case 'minModules': {
      const minModules = value as number;
      const met = modules.length >= minModules;
      return {
        requirement: `At least ${minModules} modules`,
        met,
        actualValue: modules.length,
        expectedValue: minModules,
      };
    }

    case 'maxModules': {
      const maxModules = value as number;
      const met = modules.length <= maxModules;
      return {
        requirement: `At most ${maxModules} modules`,
        met,
        actualValue: modules.length,
        expectedValue: maxModules,
      };
    }

    case 'minConnections': {
      const minConn = value as number;
      const met = connections.length >= minConn;
      return {
        requirement: `At least ${minConn} connections`,
        met,
        actualValue: connections.length,
        expectedValue: minConn,
      };
    }

    case 'maxConnections': {
      const maxConn = value as number;
      const met = connections.length <= maxConn;
      return {
        requirement: `At most ${maxConn} connections`,
        met,
        actualValue: connections.length,
        expectedValue: maxConn,
      };
    }

    case 'requiredTags': {
      const tags = value as string[];
      const hasRequiredTag = tags.some((tag) => attributes.tags.includes(tag as any));
      return {
        requirement: `Contains at least one of: ${tags.join(', ')}`,
        met: hasRequiredTag,
        actualValue: attributes.tags.join(', ') || 'none',
        expectedValue: tags.join(' or '),
      };
    }

    case 'requiredRarity': {
      const rarity = value as string;
      const met = rarityMeetsRequirement(attributes.rarity, rarity as any);
      return {
        requirement: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} rarity or higher`,
        met,
        actualValue: attributes.rarity,
        expectedValue: rarity,
      };
    }

    case 'specificModuleTypes': {
      const moduleTypes = value as string[];
      const presentTypes = moduleTypes.filter((type) =>
        modules.some((m) => m.type === type)
      );
      const met = presentTypes.length === moduleTypes.length;
      return {
        requirement: `Contains: ${moduleTypes.join(', ')}`,
        met,
        actualValue: presentTypes.join(', ') || 'none',
        expectedValue: moduleTypes.join(', '),
      };
    }

    case 'allTags': {
      const allTags = value as string[];
      const hasAllTags = allTags.every((tag) => attributes.tags.includes(tag as any));
      return {
        requirement: `All tags required: ${allTags.join(', ')}`,
        met: hasAllTags,
        actualValue: attributes.tags.join(', ') || 'none',
        expectedValue: allTags.join(', '),
      };
    }

    case 'maxFailureRate': {
      const maxRate = value as number;
      const met = attributes.stats.failureRate <= maxRate;
      return {
        requirement: `Failure rate ≤ ${maxRate}%`,
        met,
        actualValue: `${attributes.stats.failureRate}%`,
        expectedValue: `${maxRate}%`,
      };
    }

    case 'minStability': {
      const minStab = value as number;
      const met = attributes.stats.stability >= minStab;
      return {
        requirement: `Stability ≥ ${minStab}%`,
        met,
        actualValue: `${attributes.stats.stability}%`,
        expectedValue: `${minStab}%`,
      };
    }

    default:
      return null;
  }
}

/**
 * Validate a machine against a challenge's requirements
 */
export function validateChallenge(
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes,
  challenge: Challenge
): ValidationResult {
  const { requirements } = challenge;
  const details: RequirementDetail[] = [];

  // Validate each requirement that is defined
  const requirementKeys: (keyof ChallengeRequirement)[] = [
    'minModules',
    'maxModules',
    'minConnections',
    'maxConnections',
    'requiredTags',
    'requiredRarity',
    'specificModuleTypes',
    'allTags',
    'maxFailureRate',
    'minStability',
  ];

  for (const key of requirementKeys) {
    if (requirements[key] !== undefined) {
      const detail = validateSingleRequirement(
        key,
        requirements[key],
        modules,
        connections,
        attributes
      );
      if (detail) {
        details.push(detail);
      }
    }
  }

  // If no requirements were defined, the challenge can't be completed
  if (details.length === 0) {
    return {
      passed: false,
      details: [
        {
          requirement: 'Challenge has no requirements defined',
          met: false,
          actualValue: 'N/A',
          expectedValue: 'N/A',
        },
      ],
    };
  }

  const passed = details.every((d) => d.met);

  return {
    passed,
    details,
  };
}

/**
 * Quick check if a machine might be able to complete a challenge
 * (Doesn't provide full validation, just a quick filter)
 */
export function canAttemptChallenge(
  modules: PlacedModule[],
  challenge: Challenge
): boolean {
  const { requirements } = challenge;

  // If challenge requires modules but machine is empty
  if (modules.length === 0 && requirements.minModules && requirements.minModules > 0) {
    return false;
  }

  // If challenge requires specific modules, check if any are present
  if (requirements.specificModuleTypes && requirements.specificModuleTypes.length > 0) {
    const hasAnySpecificModule = modules.some((m) =>
      requirements.specificModuleTypes!.includes(m.type)
    );
    if (!hasAnySpecificModule) {
      return false;
    }
  }

  return true;
}

export default validateChallenge;
