# Functional Integrity / No Fake Functionality

Every interactive element must have an explicit interaction contract:
- Trigger: what user action starts it?
- Preconditions: when is it enabled?
- State transition: what changes?
- Result: what does the user see?
- Failure behavior: what happens if it fails?
- Accessibility: how is it used with keyboard and assistive technology?

Buttons must perform the stated action. Forms must validate and submit. Search must search. Filters must affect results. Pagination must change the page. Tabs must change content. Modals must open and close. Dropdowns must select and apply a value.

If a backend is unavailable, use an explicitly identified mock/local implementation with realistic behavior. Do not pretend data was persisted remotely. If an action is not yet implemented, make it visibly disabled or label it as unavailable rather than presenting a dead control.

Test happy paths, validation, empty states, loading states, failure states, and relevant boundary conditions.
