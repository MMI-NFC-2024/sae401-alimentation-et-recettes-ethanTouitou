export const PB_URL = 'http://127.0.0.1:8090';
export const AUTH_STORAGE_KEY = 'nutriguide_auth';

export type StoredAuth = {
  token: string;
  model: Record<string, any>;
};

export function getStoredAuth(): StoredAuth | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getUserDisplayName(model?: Record<string, any> | null) {
  if (!model) {
    return 'Profil';
  }

  return model.name || model.email || 'Profil';
}

export function getUserAvatarUrl(model?: Record<string, any> | null) {
  if (!model?.avatar || !model?.collectionName || !model?.id) {
    return null;
  }

  return `${PB_URL}/api/files/${model.collectionName}/${model.id}/${model.avatar}`;
}

export function parsePocketBaseError(payload: any) {
  if (!payload) {
    return 'Une erreur est survenue.';
  }

  if (payload.message) {
    return payload.message;
  }

  if (payload.data && typeof payload.data === 'object') {
    const firstError = Object.values(payload.data)[0] as { message?: string } | undefined;
    if (firstError?.message) {
      return firstError.message;
    }
  }

  return 'Une erreur est survenue.';
}

export function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;

  if (!weightKg || !heightCm || heightM <= 0) {
    return 0;
  }

  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBmiCategory(bmi: number) {
  if (bmi <= 0) return 'Non calcule';
  if (bmi < 18.5) return 'Insuffisance ponderale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obesite';
}

export function getActivityFactor(activityLevel: string) {
  const factors = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    eleve: 1.725,
    'tres-eleve': 1.9,
  };

  return factors[activityLevel as keyof typeof factors] || 1.2;
}

export function calculateCaloriePlan(input: {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  nutritionGoal: string;
}) {
  const { sex, age, heightCm, weightKg, activityLevel, nutritionGoal } = input;
  const bmi = calculateBmi(weightKg, heightCm);
  const bmiCategory = getBmiCategory(bmi);
  const sexOffset = sex === 'femme' ? -161 : 5;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const maintenanceCalories = Math.round(bmr * getActivityFactor(activityLevel));

  let targetCalories = maintenanceCalories;
  if (nutritionGoal === 'perte-de-poids') {
    targetCalories = Math.round(maintenanceCalories * 0.8);
  } else if (nutritionGoal === 'prise-de-masse') {
    targetCalories = Math.round(maintenanceCalories * 1.1);
  }

  return {
    bmi,
    bmiCategory,
    maintenanceCalories,
    targetCalories,
    deltaCalories: targetCalories - maintenanceCalories,
  };
}

export function getGoalLabel(goal?: string) {
  const labels = {
    'perte-de-poids': 'Perte de poids',
    maintien: 'Maintien',
    'prise-de-masse': 'Prise de masse',
  };

  return labels[goal as keyof typeof labels] || 'Non defini';
}

export function getActivityLabel(activity?: string) {
  const labels = {
    sedentaire: 'Sedentaire',
    leger: 'Leger',
    modere: 'Modere',
    eleve: 'Eleve',
    'tres-eleve': 'Tres eleve',
  };

  return labels[activity as keyof typeof labels] || 'Non defini';
}
