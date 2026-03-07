export type DangerousDose = {
  id: number;
  name: string;
  toxicPerKg: number | null;
  lethalPerKg: number | null;
  toxic: number | null;
  lethal: number | null;
  unit: string;
  halfLife: string | null;
  symptoms: string | null;
  treatment: string | null;
};

export type Medication = {
  id: number;
  brandName: string;
  amount: number;
  unit: string;
  drugMasterId: number;
  dangerousDoses?: DangerousDose; // SupabaseのJOIN（リレーション）で取得
};