/**
 * Akshigo PC Toolkit Pro — Legacy Brand Migration Utility
 * 
 * Safely migrates legacy ASHtech storage keys, cached tokens, and preferences
 * to the new Akshigo Tech keys without invalidating active device activations
 * or consuming duplicate device seats.
 */

export interface MigrationResult {
  migrated: boolean;
  keysMigrated: string[];
  legacyTokenFound: boolean;
  preservedDeviceId: string | null;
}

const LEGACY_STORAGE_MAP: Record<string, string> = {
  'ashtech_signed_token': 'akshigo_signed_token',
  'ashtech_device_fp': 'akshigo_device_fp',
  'ashtech_device_name': 'akshigo_device_name',
  'ashtech_last_server_time': 'akshigo_last_server_time',
  'ashtech_last_local_time': 'akshigo_last_local_time',
  'ashtech_active_lic_id': 'akshigo_active_lic_id',
  'ashtech_active_dev_id': 'akshigo_active_dev_id',
  'ashtech_update_channel': 'akshigo_update_channel'
};

export function performLegacyBrandMigration(): MigrationResult {
  const result: MigrationResult = {
    migrated: false,
    keysMigrated: [],
    legacyTokenFound: false,
    preservedDeviceId: null
  };

  try {
    for (const [legacyKey, newKey] of Object.entries(LEGACY_STORAGE_MAP)) {
      const legacyValue = localStorage.getItem(legacyKey);
      const existingNewValue = localStorage.getItem(newKey);

      if (legacyValue && !existingNewValue) {
        localStorage.setItem(newKey, legacyValue);
        result.keysMigrated.push(`${legacyKey} -> ${newKey}`);
        result.migrated = true;

        if (legacyKey === 'ashtech_signed_token') {
          result.legacyTokenFound = true;
        }
        if (legacyKey === 'ashtech_active_dev_id' || legacyKey === 'ashtech_device_fp') {
          result.preservedDeviceId = legacyValue;
        }
      }
    }

    if (result.migrated) {
      console.log('[Brand Migration] Successfully migrated legacy ASHtech state to Akshigo Tech:', result.keysMigrated);
    }
  } catch (err) {
    console.warn('[Brand Migration] Non-critical error during legacy storage check:', err);
  }

  return result;
}
