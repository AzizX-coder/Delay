import { useProfile } from "./useProfile";

export const PLAN_LIMITS = {
  free: {
    maxNotes: 50,
    maxBoards: 3,
    maxFlows: 10,
    maxVaultMB: 0,
    canShare: false,
    canCloudSync: false,
    canUseCloudVault: false,
    aiCreditsPerMonth: 20,
  },
  pro: {
    maxNotes: Infinity,
    maxBoards: Infinity,
    maxFlows: Infinity,
    maxVaultMB: 5000,
    canShare: true,
    canCloudSync: true,
    canUseCloudVault: true,
    aiCreditsPerMonth: 500,
  },
  max: {
    maxNotes: Infinity,
    maxBoards: Infinity,
    maxFlows: Infinity,
    maxVaultMB: 20000,
    canShare: true,
    canCloudSync: true,
    canUseCloudVault: true,
    aiCreditsPerMonth: Infinity,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export function usePlanLimits() {
  const { profile } = useProfile();
  const plan = (profile?.plan ?? "free") as PlanKey;
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const isProOrAbove = plan === "pro" || plan === "max";

  return {
    plan,
    limits,
    isProOrAbove,
    isFree: plan === "free",
  };
}
