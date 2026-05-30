# Tunai Landing Page References

These images are the visual source of truth for reconstructing the Tunai landing page. All references are 1448 x 1086 PNG screenshots.

## Intended Section Order

The implementation should use this continuous page order unless the project owner corrects it:

1. `01-hero-trust-gateway.png` -> `HeroSection`, `LandingHeader`, `TrustGatewayDiagram`, `TrustedPartnersStrip`
2. `02-three-step-identity-trust.png` -> `ThreeStepTrustSection`, `TrustStepCard`, `DecisionLegend`
3. `03-trust-certificate-network.png` -> `TrustCertificateSection`, `TrustCertificateCard`, `TrustedEcosystemStrip`
4. `04-dashboard-preview.png` -> `DashboardPreviewSection`, `DashboardMockup`
5. `05-use-cases.png` -> `UseCasesSection`, `UseCaseFeatureCard`, `UseCaseCompactCard`, `TrustedPartnersStrip`
6. `06-developer-integration-cta-footer.png` -> `DeveloperIntegrationSection`, `TrustFlowDiagram`, `CodeExamplePanel`, `FinalCTASection`, `LandingFooter`

## Reference Contents

| File | Contents | Approximate viewport | Implementation notes |
|---|---|---:|---|
| `01-hero-trust-gateway.png` | Header, hero copy, dual CTA, incoming entities, central trust gateway, access decisions, partner strip | 1448 x 1086 | Treat diagram as a detailed CSS/SVG recreation, not a static image. |
| `02-three-step-identity-trust.png` | Three-step trust workflow, decision legend, small trust statement | 1448 x 1086 | Preserve card sizing, dashed connectors, trust rings, badges, and five decision cards. |
| `03-trust-certificate-network.png` | Large certificate mockup, certificate benefit list, ecosystem logo rail | 1448 x 1086 | Certificate border ornament, stamp, signature, QR block, and inner verification card must be recreated. |
| `04-dashboard-preview.png` | Dashboard marketing section with feature bullets and full command-center mockup | 1448 x 1086 | Prefer reuse/adaptation of existing admin dashboard components where fidelity allows. |
| `05-use-cases.png` | Use-case headline, featured API Platforms card, four compact use-case cards, partner strip | 1448 x 1086 | Maintain asymmetric two-column layout and badge placement. |
| `06-developer-integration-cta-footer.png` | Developer integration split section, flow diagram, TypeScript code panel, final CTA, footer | 1448 x 1086 | Recreate code block, status bar, CTA radial ornament, footer link columns, and social icon buttons. |

## Ambiguities

- The prompt refers to six numbered references, but the inline image labels and downloaded file suffixes are not in the same visual order. The saved order above follows the logical continuous landing-page sequence.
- No mobile screenshots were provided. Responsive behavior must be inferred from the desktop layout while preserving content hierarchy and readability.
- Partner logos appear to be rendered as text/vector marks. If brand SVG assets are unavailable, recreate close approximations with text and simple inline SVG shapes rather than using unrelated stock assets.
- The certificate stamp, signature, QR code, dashboard map, and decorative guilloche patterns require CSS/SVG approximation unless exact assets are later supplied.

## Comparison Workflow

Save implementation screenshots in `docs/ui-references/tunai-landing-page/comparisons/` with names matching the reference, for example:

- `01-hero-trust-gateway-implementation.png`
- `02-three-step-identity-trust-implementation.png`
- `03-trust-certificate-network-implementation.png`
- `04-dashboard-preview-implementation.png`
- `05-use-cases-implementation.png`
- `06-developer-integration-cta-footer-implementation.png`

Each section should go through multiple visual comparison passes before being considered complete.
