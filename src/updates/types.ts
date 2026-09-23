export type UpdateChannel = 'stable' | 'beta' | 'internal';
export type UpdateType = 'optional' | 'recommended' | 'critical';

export interface ReleaseManifest {
  version: string;
  channel: UpdateChannel;
  releaseDate: string;
  minSupportedVersion: string;
  updateType: UpdateType;
  title: string;
  releaseNotes: string;
  installer: {
    filename: string;
    url: string;
    sha256: string;
    sizeBytes: number;
    signature: {
      algorithm: string;
      signer: string;
      thumbprint: string;
    };
  };
  mandatoryDeadline?: string;
  rollbackTargetVersion?: string;
}

export interface UpdateState {
  isChecking: boolean;
  updateAvailable: boolean;
  isMandatory: boolean;
  channel: UpdateChannel;
  currentVersion: string;
  latestVersion?: string;
  manifest?: ReleaseManifest;
  downloadProgress: number; // 0-100
  downloadStage: 'idle' | 'checking' | 'downloading' | 'verifying_hash' | 'verifying_signature' | 'ready_to_install' | 'installing' | 'error';
  errorMessage?: string;
  lastCheckedAt?: string;
}
