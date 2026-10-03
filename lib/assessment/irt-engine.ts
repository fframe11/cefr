/**
 * ==============================================================================
 * GLOVA Psychometric IRT Adaptive Testing Engine (3PL EAP Model)
 * ==============================================================================
 *
 * Implements Item Response Theory (IRT) with 3-Parameter Logistic (3PL) model
 * and Expected A Posteriori (EAP) Bayesian estimation for computer-adaptive
 * CEFR placement testing.
 *
 * Mathematical Foundations:
 * 1. 3PL Item Response Function:
 *    P(u=1 | theta, a, b, c) = c + (1 - c) / (1 + exp(-a * (theta - b)))
 * 2. Fisher Information Function:
 *    I(theta) = a^2 * (1 - P) / P * ((P - c) / (1 - c))^2
 * 3. EAP Ability Estimation:
 *    Numerical integration over 81 quadrature nodes on [-4.0, +4.0]
 *    with standard normal prior N(0, 1).
 * ==============================================================================
 */

export interface IRTItemParameters {
  id: string;
  skill: 'vocabulary' | 'grammar' | 'reading';
  a: number; // Item discrimination (slope) [0.5 - 2.5]
  b: number; // Item difficulty (location) [-3.0 - +3.5]
  c: number; // Pseudo-guessing parameter [typically 0.25 for 4-choice MCQ]
}

export interface IRTUserResponse {
  item: IRTItemParameters;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface IRTState {
  theta: number; // Latent ability estimate (-4.0 to +4.0)
  se: number; // Standard Error of measurement
  responses: IRTUserResponse[];
  itemsAnswered: number;
}

// 81 quadrature nodes spanning -4.0 to +4.0 with step 0.1
const QUADRATURE_NODES: number[] = [];
const QUADRATURE_WEIGHTS: number[] = [];

(function initQuadrature() {
  const step = 0.1;
  let totalWeight = 0;
  for (let t = -4.0; t <= 4.001; t += step) {
    const node = Math.round(t * 100) / 100;
    QUADRATURE_NODES.push(node);
    // Standard normal prior: phi(t) = exp(-0.5 * t^2) / sqrt(2 * pi)
    const weight = Math.exp(-0.5 * node * node) / Math.sqrt(2 * Math.PI);
    QUADRATURE_WEIGHTS.push(weight);
    totalWeight += weight;
  }
  // Normalize prior weights to sum to 1
  for (let i = 0; i < QUADRATURE_WEIGHTS.length; i++) {
    QUADRATURE_WEIGHTS[i] /= totalWeight;
  }
})();

/**
 * 3PL Probability of a correct response given theta and item parameters.
 */
export function calculateProbability3PL(theta: number, item: IRTItemParameters): number {
  const c = Math.max(0, Math.min(0.5, item.c ?? 0.25));
  const a = Math.max(0.1, item.a ?? 1.0);
  const b = item.b ?? 0.0;

  const exponent = -a * (theta - b);
  // Prevent numerical overflow
  if (exponent > 35) return c;
  if (exponent < -35) return 1.0;

  const logit = 1 / (1 + Math.exp(exponent));
  return c + (1 - c) * logit;
}

/**
 * Fisher Information of an item at a given ability level theta.
 * Used for optimal adaptive item selection.
 */
export function calculateItemInformation(theta: number, item: IRTItemParameters): number {
  const P = calculateProbability3PL(theta, item);
  const c = Math.max(0, Math.min(0.5, item.c ?? 0.25));
  const a = Math.max(0.1, item.a ?? 1.0);

  if (P <= c || P >= 1.0) return 0.001;

  const numerator = Math.pow(P - c, 2);
  const denominator = P * Math.pow(1 - c, 2);
  return (a * a * (1 - P) * numerator) / denominator;
}

/**
 * Initialize a fresh IRT test state (starting with theta = 0.0, SE = 1.0).
 */
export function initializeIRTState(): IRTState {
  return {
    theta: 0.0,
    se: 1.0,
    responses: [],
    itemsAnswered: 0,
  };
}

/**
 * Update ability estimate theta and standard error (SE) via Bayesian EAP.
 */
export function updateIRTAbilityEAP(state: IRTState, newResponse: IRTUserResponse): IRTState {
  const updatedResponses = [...state.responses, newResponse];
  const nNodes = QUADRATURE_NODES.length;

  // Calculate posterior distribution across nodes
  const posterior: number[] = new Array(nNodes);
  let marginalLikelihood = 0;

  for (let i = 0; i < nNodes; i++) {
    const thetaNode = QUADRATURE_NODES[i];
    let likelihood = 1.0;

    for (const r of updatedResponses) {
      const P = calculateProbability3PL(thetaNode, r.item);
      likelihood *= r.isCorrect ? P : 1 - P;
    }

    const unnormalizedPosterior = likelihood * QUADRATURE_WEIGHTS[i];
    posterior[i] = unnormalizedPosterior;
    marginalLikelihood += unnormalizedPosterior;
  }

  // Prevent degenerate division by zero
  if (marginalLikelihood < 1e-12) {
    return {
      theta: state.theta,
      se: state.se,
      responses: updatedResponses,
      itemsAnswered: updatedResponses.length,
    };
  }

  // Normalize posterior distribution
  for (let i = 0; i < nNodes; i++) {
    posterior[i] /= marginalLikelihood;
  }

  // Expected A Posteriori (EAP) mean = integral(theta * p(theta|u))
  let eapTheta = 0;
  for (let i = 0; i < nNodes; i++) {
    eapTheta += QUADRATURE_NODES[i] * posterior[i];
  }

  // EAP Variance = integral((theta - eapTheta)^2 * p(theta|u))
  let eapVariance = 0;
  for (let i = 0; i < nNodes; i++) {
    const diff = QUADRATURE_NODES[i] - eapTheta;
    eapVariance += diff * diff * posterior[i];
  }

  const eapSE = Math.sqrt(Math.max(0.01, eapVariance));

  return {
    theta: Math.round(eapTheta * 1000) / 1000,
    se: Math.round(eapSE * 1000) / 1000,
    responses: updatedResponses,
    itemsAnswered: updatedResponses.length,
  };
}

/**
 * Select the next optimal test item maximizing Fisher Information at current theta,
 * while maintaining balanced skill domain quotas.
 */
export function selectNextOptimalItem(
  availableItems: IRTItemParameters[],
  state: IRTState,
  excludedItemIds: Set<string>
): IRTItemParameters | null {
  const eligible = availableItems.filter((it) => !excludedItemIds.has(it.id));
  if (eligible.length === 0) return null;

  // Determine skill balance
  const skillCounts = {
    grammar: 0,
    vocabulary: 0,
    reading: 0,
  };
  for (const r of state.responses) {
    if (r.item.skill in skillCounts) {
      skillCounts[r.item.skill as keyof typeof skillCounts]++;
    }
  }

  // Find candidate skill with the lowest relative proportion
  const targetSkills: Array<'grammar' | 'vocabulary' | 'reading'> = ['grammar', 'vocabulary', 'reading'];
  targetSkills.sort((a, b) => skillCounts[a] - skillCounts[b]);

  // First try to pick within the most underrepresented skill
  for (const preferredSkill of targetSkills) {
    const skillCandidates = eligible.filter((it) => it.skill === preferredSkill);
    if (skillCandidates.length > 0) {
      return pickMaxInformationItem(skillCandidates, state.theta);
    }
  }

  // Fallback to all eligible items
  return pickMaxInformationItem(eligible, state.theta);
}

function pickMaxInformationItem(candidates: IRTItemParameters[], theta: number): IRTItemParameters {
  let bestItem = candidates[0];
  let maxInfo = -1;

  for (const item of candidates) {
    const info = calculateItemInformation(theta, item);
    if (info > maxInfo) {
      maxInfo = info;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * Early termination check for the adaptive placement test.
 * Terminates when:
 * 1. Standard Error drops below 0.28 (sufficient confidence for CEFR discrimination)
 * 2. Minimum items threshold (15) has been satisfied
 * 3. Or max items (56) reached (Oxford OOPT limit)
 */
export function shouldTerminateAdaptiveTest(state: IRTState, maxItems = 56, minItems = 15): boolean {
  if (state.itemsAnswered < minItems) return false;
  if (state.itemsAnswered >= maxItems) return true;
  return state.se <= 0.28;
}
