/**
 * Akshigo PC Toolkit Pro — Update Authority Types & Manifest Specification
 */

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

export interface UpdateCheckRequest {
  currentVersion: string;
  channel: UpdateChannel;
  architecture: 'x64' | 'arm64';
  osBuild: string;
  deviceId?: string;
  licenseTier?: string;
}

export interface UpdateCheckResponse {
  updateAvailable: boolean;
  isMandatory: boolean;
  currentVersion: string;
  latestVersion?: string;
  manifest?: ReleaseManifest;
  message: string;
}
