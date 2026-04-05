export interface ScoringConfig {
  baseScore: number;
  delayPenaltyPerPeriod: number;
  maxDelayPenalty: number;
  noImpactAdjustment: number;
  lowImpactAdjustment: number;
  highImpactAdjustment: number;
  discrepancyPenaltyPerItem: number;
  maxDiscrepancyPenalty: number;
  missingJustificationPenalty: number;
  positiveImpactCap: number;
  lowImpactFactor: number;
  highImpactFactor: number;
}

export interface ScoreImpactBuckets {
  missing: number;
  noImpact: number;
  lowImpact: number;
  highImpact: number;
}

export interface ScoreCalculationResult {
  baseScore: number;
  totalDelay: number;
  delayPenalty: number;
  impactAdjustment: number;
  finalScore: number;
  discrepanciesCount: number;
  delayPenaltyOnly: number;
  discrepancyPenalty: number;
  positiveImpactAdjustment: number;
  negativeImpactAdjustment: number;
  impactBuckets: ScoreImpactBuckets;
}

export const DEFAULT_SCORING: ScoringConfig = {
  baseScore: 100,
  delayPenaltyPerPeriod: 2,
  maxDelayPenalty: 30,
  noImpactAdjustment: -5,
  lowImpactAdjustment: -3,
  highImpactAdjustment: 5,
  discrepancyPenaltyPerItem: 1.5,
  maxDiscrepancyPenalty: 35,
  missingJustificationPenalty: 6,
  positiveImpactCap: 25,
  lowImpactFactor: 0.5,
  highImpactFactor: 0.5
};

type ImpactLevel = 'missing' | 'no-impact' | 'low-impact' | 'high-impact';

function normalizeImpactLevel(value: unknown): ImpactLevel {
  if (value === 'high-impact' || value === 'low-impact' || value === 'no-impact') {
    return value;
  }

  return 'missing';
}

function getStrongestImpactLevel(justifications: any[]): ImpactLevel {
  if (!Array.isArray(justifications) || justifications.length === 0) {
    return 'missing';
  }

  const impactLevels = justifications.map((justification) => normalizeImpactLevel(justification?.impactLevel));

  if (impactLevels.includes('high-impact')) {
    return 'high-impact';
  }

  if (impactLevels.includes('low-impact')) {
    return 'low-impact';
  }

  if (impactLevels.includes('no-impact')) {
    return 'no-impact';
  }

  return 'missing';
}

export function calculateRequestScore(discrepancies: any[], scoringConfig: ScoringConfig): ScoreCalculationResult {
  const safeDiscrepancies = Array.isArray(discrepancies) ? discrepancies : [];

  const totalDelay = safeDiscrepancies.reduce((total, discrepancy) => {
    const expectedPeriod = Number(discrepancy?.expectedPeriod ?? 0);
    const actualPeriod = Number(discrepancy?.actualPeriod ?? 0);
    return total + Math.max(0, actualPeriod - expectedPeriod);
  }, 0);

  const delayPenaltyOnly = Math.min(
    totalDelay * scoringConfig.delayPenaltyPerPeriod,
    scoringConfig.maxDelayPenalty
  );

  const discrepancyPenalty = Math.min(
    safeDiscrepancies.length * scoringConfig.discrepancyPenaltyPerItem,
    scoringConfig.maxDiscrepancyPenalty
  );

  const impactBuckets: ScoreImpactBuckets = {
    missing: 0,
    noImpact: 0,
    lowImpact: 0,
    highImpact: 0
  };

  let positiveImpactAdjustment = 0;
  let negativeImpactAdjustment = 0;

  for (const discrepancy of safeDiscrepancies) {
    const impactLevel = getStrongestImpactLevel(discrepancy?.Justifications ?? discrepancy?.justifications ?? []);

    switch (impactLevel) {
      case 'high-impact':
        impactBuckets.highImpact += 1;
        positiveImpactAdjustment += scoringConfig.highImpactAdjustment * scoringConfig.highImpactFactor;
        break;
      case 'low-impact':
        impactBuckets.lowImpact += 1;
        negativeImpactAdjustment += scoringConfig.lowImpactAdjustment * scoringConfig.lowImpactFactor;
        break;
      case 'no-impact':
        impactBuckets.noImpact += 1;
        negativeImpactAdjustment += scoringConfig.noImpactAdjustment;
        break;
      default:
        impactBuckets.missing += 1;
        negativeImpactAdjustment -= scoringConfig.missingJustificationPenalty;
        break;
    }
  }

  const cappedPositiveImpactAdjustment = Math.min(
    positiveImpactAdjustment,
    scoringConfig.positiveImpactCap
  );

  const impactAdjustment = cappedPositiveImpactAdjustment + negativeImpactAdjustment;
  const structuralPenalty = delayPenaltyOnly + discrepancyPenalty;

  const finalScore = Math.max(
    0,
    Math.min(100, scoringConfig.baseScore - structuralPenalty + impactAdjustment)
  );

  return {
    baseScore: scoringConfig.baseScore,
    totalDelay,
    delayPenalty: Number(structuralPenalty.toFixed(2)),
    impactAdjustment: Number(impactAdjustment.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
    discrepanciesCount: safeDiscrepancies.length,
    delayPenaltyOnly: Number(delayPenaltyOnly.toFixed(2)),
    discrepancyPenalty: Number(discrepancyPenalty.toFixed(2)),
    positiveImpactAdjustment: Number(cappedPositiveImpactAdjustment.toFixed(2)),
    negativeImpactAdjustment: Number(negativeImpactAdjustment.toFixed(2)),
    impactBuckets
  };
}
