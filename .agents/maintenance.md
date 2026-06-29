# Documentation Maintenance Policy: Angels Consumer Web App

This file defines the documentation maintenance policy for the `angels` repository. Agents MUST follow this policy strictly to prevent documentation rot.

---

## 1. Trigger Events for Documentation Updates

Whenever you make any of the following changes, you MUST update the corresponding `.agents/` documentation files:

| Change Type | Target Documentation File | Items to Update |
| :--- | :--- | :--- |
| **New Customer Page Route** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/architecture.md) | Update the directory layout description and consumer routes. |
| **New API Service or Slice** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/architecture.md) | Update the state management section and register the service. |
| **Three.js Scene changes** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/architecture.md) | Update the 3D assets/visual systems description. |
| **Razorpay, Maps, or external SDK change** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/architecture.md) | Update the Third-party integrations descriptions. |
| **Port Change or Script updates** | [workflows.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/workflows.md) | Update port references and troubleshooting steps. |

---

## 2. Synchronization Checklist

Before completing any task, execute this mental checklist:
- `[ ]` Did I add a new route folder inside `app/`? If yes, update `architecture.md`.
- `[ ]` Did I create a new RTK Query service in `features/`? If yes, update the State Management section in `architecture.md`.
- `[ ]` Did I change 3D scenes or canvas rendering? If yes, update `architecture.md`.
- `[ ]` Did I change the developer ports or startup scripts? If yes, update `workflows.md`.
- `[ ]` Did I verify that all markdown file links in `.agents/` are correct?

> [!IMPORTANT]
> If a PR contains codebase changes without corresponding updates to the `.agents/` documentation (when applicable), it is considered incomplete and must not be finalized.
