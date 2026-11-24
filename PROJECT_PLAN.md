# Glacier Water Solutions — Project Plan

GOAL: Responsive website for packaged-water billing, stock, production and accounts, with role-based audit login and JSON/PDF/Excel backups.

Art direction (chosen by zyvo, no preview round — Shan asked for autonomous complete build): **cold, precise, dependable** — glacier cyan on deep slate + white surfaces, Space Grotesk (display/numbers) + Work Sans (body), Lucide-style 2px inline SVG icons, data-dense but calm dashboard with mixed-size bento tiles.

- [x] 1. Idea Discovery — replace scattered Excel with one system (RDP supplied)
- [x] 2. User Research — owner/admin/accountant/staff; daily billing + stock + auditor month-end
- [x] 3. Requirements — must/should/future captured from 6-page RDP
- [x] 4. PRD.md — full blueprint written
- [x] 5. PRD Review — self-checked; Shan gave direct build order, no further validation round
- [x] 6. User Flow — login → dashboard → entry → confirm stock effect → report/backup
- [x] 7. UX — sidebar/ drawer navigation, table+form patterns, empty/loading/error states
- [x] 8. UI Design System — tokens, type scale, components defined in TRD.md
- [x] 9. Technical Spec — TRD.md: local-first static PWA, trade-off documented
- [x] 10. Build Plan — TASK.md checklist is the build plan
- [ ] 11. Implementation — foundation + data engine + all modules
- [ ] 12. Testing — jsdom smoke suite + calculation assertions
- [ ] 13. Responsive — 375px and 1440px sanity
- [ ] 14. Security — role gates, audit trail, password hashing, no secrets in code
- [ ] 15. Performance — self-hosted fonts/vendor, lazy assets, small bundles
- [ ] 16. Accessibility — labels, focus rings, aria on icon buttons, contrast
- [ ] 17. SEO — meta/OG/theme-color/favicon, robots
- [ ] 18. User Acceptance — live URL handed to Shan for real task testing
- [ ] 19. Iterate — fix round from Shan feedback
- [ ] 19b. Customization round — skipped per Shan's explicit "complete build" order
- [ ] 20. Pre-Launch checklist
- [ ] 21. Deploy — GitHub `smartbooksbasha-svg/glacier-water-solutions`, Pages
- [ ] 22. Post-Launch — verify live assets, monitor, release notes

STATUS: foundation in progress (2026-11-24).
