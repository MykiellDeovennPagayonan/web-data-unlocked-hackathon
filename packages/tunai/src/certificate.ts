import { post } from "./fetch"
import type { TunaiConfig, CertificateVerificationResult } from "./types"

export function verifyCertificate(
  config: TunaiConfig,
  certificateHash: string,
  verifiedByPlatformId: string
): Promise<CertificateVerificationResult> {
  return post<CertificateVerificationResult>(
    config,
    "/v1/trust-certificates/verify",
    { certificateHash, verifiedByPlatformId }
  )
}
