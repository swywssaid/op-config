// types.ts
export interface UserPreferences {
  gasSavingWeight: number; // 0~100
  speedWeight: number; // 0~100
  securityWeight: number; // 0~100
}

// configGenerator.ts
import { UserPreferences } from "./types";

// 기본 템플릿: 최소한의 주요 파라미터만 포함한 예시
// 실제로는 필요 파라미터를 모두 포함하거나, 다른 파일에서 불러올 수 있음
function getBaseConfig() {
  return {
    l2BlockTime: 2,
    maxSequencerDrift: 300,
    sequencerWindowSize: 200,
    gasPriceOracleOverhead: 2100,
    gasPriceOracleScalar: 1000000,
    l2OutputOracleSubmissionInterval: 10,
    finalizationPeriodSeconds: 2,
    // ... (실제로 필요한 모든 파라미터 기본값)
  };
}

export function generateOptimismConfig(prefs: UserPreferences) {
  // 가중치 합계 계산 (총합이 100이 아닐 수도 있으므로 보정 가능)
  const totalWeight =
    prefs.gasSavingWeight + prefs.speedWeight + prefs.securityWeight || 1;

  // 각 항목별 비율 (0~1)
  const gasRatio = prefs.gasSavingWeight / totalWeight;
  const speedRatio = prefs.speedWeight / totalWeight;
  const securityRatio = prefs.securityWeight / totalWeight;

  // 기본 설정 불러오기
  const config = getBaseConfig();

  // 간단한 룰 기반 조정 예시
  // 1) 가스 절감이 중요하면, sequencerWindowSize / maxSequencerDrift ↑, gasPriceOracleOverhead ↓ 등
  if (gasRatio > 0.5) {
    config.sequencerWindowSize = 360;
    config.maxSequencerDrift = 600;
    config.gasPriceOracleOverhead = 1500;
    config.l2OutputOracleSubmissionInterval = 60;
    // ...
  }

  // 2) 속도 비중이 높으면, l2BlockTime ↓, sequencerWindowSize ↓ 등
  if (speedRatio > 0.5) {
    config.l2BlockTime = 1;
    config.sequencerWindowSize = 100;
    config.maxSequencerDrift = 300;
    config.gasPriceOracleOverhead = 2000; // 시퀀서 수익을 보전
    config.l2OutputOracleSubmissionInterval = 10;
    // ...
  }

  // 3) 보안/최종성 비중이 높으면, 확정 주기 짧게(혹은 길게) 조정, 일부 안전장치 강화
  //    여기서는 단순 예시로 finalizationPeriodSeconds를 늘린다고 가정
  if (securityRatio > 0.5) {
    config.finalizationPeriodSeconds = 10;
    // ...
  }

  // 여기서는 간단하게 “가장 높은 비중 한 가지”만 조건 체크했지만,
  // 실제로는 gasRatio / speedRatio / securityRatio에 따라
  // 혼합 로직(가중 평균)으로 조정할 수도 있습니다.

  return config;
}

// demo.ts
import { generateOptimismConfig } from "./configGenerator";

// 예시: 가스 절감(60), 속도(30), 보안(10)
const userPrefs = {
  gasSavingWeight: 60,
  speedWeight: 30,
  securityWeight: 10,
};

const newConfig = generateOptimismConfig(userPrefs);
console.log("Generated Config:\n", JSON.stringify(newConfig, null, 2));
