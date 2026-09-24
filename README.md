# Jang-Jang Bakeshop — Systems & Operations Repository

**Repository:** `jjb-systems`
**Document ID:** JJB-REPO-001
**Owner:** Jang-Jang Bakeshop — Durian St., Tierra Verde Village, Sasa Buhangin District, 8000 Davao City
**FDA LTO No.:** 3000002291335
**Classification:** Internal — Confidential
**Last Updated:** [YYYY-MM-DD]

---

## Purpose

This repository centralizes all operational, regulatory, and systems documentation for Jang-Jang Bakeshop (JJB). It is the single source of truth for:

- Manual of Operations and FDA reaccreditation materials
- Standard Operating Procedures (SOPs), processes, and workflows
- Forms, records templates, and compliance logs
- Transaction file references (ledgers, invoices, delivery receipts)
- Custom-built systems: HTML playbooks, web tools, dashboards, apps

This repo supports the **October 22, 2026 FDA LTO reaccreditation** deadline and ongoing ISO/cGMP-aligned continuous improvement.

---

## Governance

| Role | Name | Authority |
| :---- | :---- | :---- |
| BIR-Registered Proprietor | Crisenta T. Banate | Nominal — BIR & regulatory registration |
| Chief Operating Authority | Angelina Sun, Head of Administration | Final decision-making on operations, personnel, finance, compliance |
| Systems & Operations Advisor | Zaphyr Zur Pomicpic | Advisory, system design, documentation development |
| QA Director | [To Be Appointed] | Independent food safety authority |

---

## Repository Structure
jjb-systems/
├── 01-manual-of-operations/ # Manual drafts, versioned
│ ├── current/ # Active version
│ └── archive/ # Superseded versions
├── 02-sops/ # Standard Operating Procedures
│ ├── active/ # Approved, in-use SOPs
│ └── in-development/ # Draft SOPs awaiting approval
├── 03-forms-and-records/ # Blank templates + completed logs
├── 04-transaction-files/ # Ledgers, invoices, receipts (by year/month)
├── 05-regulatory/ # FDA, LTO, permits, certificates
│ ├── lto-and-cpr/
│ ├── labeling/
│ └── compliance-matrix/
├── 06-systems-and-tools/ # Built web apps, HTML playbooks, scripts
│ ├── html-playbooks/
│ ├── web-tools/
│ └── scripts/
├── 07-training/ # Onboarding, training records, competency
├── 08-audit-and-review/ # Internal audits, management reviews
├── 09-brand-assets/ # Logos, label artwork, packaging specs
└── 10-admin/ # Meeting notes, directives, change log

text

---

## Key Documents (Quick Links)

| Document | Location | Status |
| :---- | :---- | :---- |
| Manual of Operations v7.0 | `01-manual-of-operations/current/` | Pre-Final Working Draft |
| SOP Register | `02-sops/active/SOP-REGISTER.md` | Active |
| Forms Register | `03-forms-and-records/FORMS-REGISTER.md` | Active |
| FDA Reaccreditation Roadmap | `05-regulatory/compliance-matrix/` | In Progress |
| Product Master List v3.0 | `09-brand-assets/` | Active |

---

## Access & Permissions

| Person | Role | Access Level |
| :---- | :---- | :---- |
| Angelina Sun | Head of Administration | Admin |
| Zaphyr Zur Pomicpic | Systems & Operations Advisor | Admin (Maintain) |
| QA Director | Quality Assurance | Write |
| Department Heads | HR, Training, Production, etc. | Write (own folders) |
| General Staff | Read-only | Read |

**Access requests:** Contact the Systems & Operations Advisor.

---

## Workflow — Contributing Changes

1. **Create a branch** for your work — e.g., `sop-hr-001-draft`
2. **Commit with clear messages** — `Add SOP-HR-001 personnel recruitment`
3. **Open a Pull Request** (PR) describing the change
4. **QA Director review** for any food-safety-impacting document
5. **Head of Administration approval** for final merge to `main`

---

## Version Control Rules

- `main` = approved, in-use documents only
- `drafts` = in-progress work
- No direct commits to `main` without review
- Every commit references a Document ID (e.g., `SOP-PRO-002`, `JJB-MAN-001`)

---

## Contact

**Systems & Operations Advisor**
Zaphyr Zur Pomicpic
[email / Slack / contact channel]

---

## Confidentiality Notice

All content in this repository is the property of Jang-Jang Bakeshop. Distribution outside authorized personnel is prohibited. Contains information prepared for submission to the Philippine Food and Drug Administration (FDA).
