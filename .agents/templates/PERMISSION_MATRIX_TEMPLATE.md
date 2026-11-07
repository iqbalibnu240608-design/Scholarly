# Permission Matrix Template

Use only when the product has authenticated actors or differentiated access. A role name is not a permission model.

| Capability / resource | Public/Guest | Role A | Role B | Owner | Admin |
|---|---:|---:|---:|---:|---:|
| View | | | | | |
| Create | | | | | |
| Update own | | | | | |
| Update any | | | | | |
| Delete | | | | | |
| Manage access | | | | | |

## Rules
- Define resource ownership and scope (self, assigned, organization-wide, global).
- Deny by default; grant the minimum required permission.
- Enforce authorization server-side for every protected operation and file.
- Treat frontend navigation/route guards as convenience only.
- Specify role changes, suspended/deleted accounts, session revocation, and last-admin protections where relevant.
- Include positive and negative authorization tests for each sensitive capability.
