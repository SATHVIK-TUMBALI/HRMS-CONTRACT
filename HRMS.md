
HR OPERATIONS & PAYROLL MVP
UI / UX & Front-End Design Documentation
Role-Based Portals: Admin · HR · Manager · Employee · Security
Version 1.0
Prepared for: Project Stakeholders & Engineering Team
Document Status: Draft for Review


Table of Contents


1. Introduction & Purpose
This document defines the user interface (UI), user experience (UX), and front-end technical approach for the HR Operations & Payroll MVP. It translates the functional requirements and database design already agreed for the system (Employee Master, Time Management, Leave Management, Overtime & Comp-Off, Shift Management, Payroll, Cost Center, and Workflow & Notifications) into concrete screens, navigation, components, and interaction patterns.
The goal is to give designers and front-end engineers a single reference for how each of the five portals should look, behave, and communicate state, so that development can proceed consistently without repeated clarification.
1.1 Audience
UI/UX designers producing high-fidelity mockups and prototypes.
Front-end engineers implementing the portals in a component framework.
Product owners and HR stakeholders reviewing screen behaviour against business rules.
QA engineers writing test cases against defined states and flows.
1.2 Scope
In scope: five web portals (Admin, HR, Manager, Employee, Security), shared component library, navigation and information architecture, workflow/approval UI patterns, responsive and accessibility guidelines, and the recommended front-end technical stack.
Out of scope: visual branding/logo design, native mobile app screens, and detailed API contracts (covered separately in the backend/database documentation).
2. Design Principles


| Element | Description |
| --- | --- |
| Role Clarity | Every screen makes it obvious which portal and role the user is in. Navigation, colour accents, and available actions change by role, not by module, so users never see actions they cannot perform. |
| Consistency Over Novelty | The same table, form, filter, and approval patterns are reused across all modules (Leave, OT, Comp-Off, Shift Swap) so a user who learns one workflow already understands the others. |
| Status at a Glance | Every request-driven record (leave, OT, comp-off, shift swap, payroll run) uses a single shared status-badge system: Draft, Pending, Approved, Rejected, Cancelled, Processed. |
| Progressive Disclosure | List views stay compact; detail and edit views reveal full data only when opened, keeping dashboards fast to scan. |
| Guardrails, Not Roadblocks | Business rules (12-hour OT cap, 24-day leave carry-forward cap, sandwich-leave conversion) are enforced with inline warnings before submission, not silent rejection after. |
| Accessible by Default | Colour is never the only signal of status; icons and text labels always accompany colour coding. |


3. User Roles & Portal Overview
The application is organised by role, not by module. All five portals read and write the same underlying database, differing only in the navigation items, data scope, and actions exposed.


| Element | Description |
| --- | --- |
| Admin Portal | System configuration: companies, branches, departments, roles & permissions, holiday calendars, salary components, workflow rules. No day-to-day transactional work. |
| HR Portal | Employee lifecycle (create, import, promote, transfer), leave & holiday policy configuration, payroll processing, cost centers, and all reports. |
| Manager Portal | Team-scoped views: approve leave, OT, comp-off, and shift swap requests; push OT requirements; view team attendance and reports. |
| Employee Portal | Self-service: profile, attendance, leave balance and requests, OT/comp-off requests, shift view/swap requests, payslips, reimbursement claims, notifications. |
| Security Portal | Read-only operational view: approved OT schedules, approved comp-off work schedules, approved shift changes, and entry/exit confirmation. |


Table 3.1 — Portal-to-responsibility mapping
3.1 Access Model
A single login screen routes the authenticated user into their default portal based on assigned role. Users holding more than one role (e.g., an HR user who is also a people manager) get a portal switcher in the top navigation bar rather than a separate login.
4. Information Architecture & Navigation
Each portal uses the same shell: a fixed left-hand sidebar for primary navigation, a top bar for search, notifications, and account menu, and a main content area with breadcrumbs. This shell is shared across portals so the codebase reuses one layout component with a role-driven navigation configuration.
4.1 Global Shell Elements


| Element | Description |
| --- | --- |
| Top Bar | Company/portal switcher (left), global search (center), notification bell with unread count, quick-add button (role-dependent), user avatar menu with profile/settings/logout. |
| Left Sidebar | Collapsible primary navigation grouped by module; active item highlighted with accent bar; badge counts for pending approvals where relevant (Manager, HR). |
| Breadcrumb Bar | Shows Portal > Module > Screen path; last segment is the current page title, styled as H1 on the page itself. |
| Footer | Minimal: build/version tag and support link only, no navigation duplication. |


4.2 Navigation Map by Portal
Admin Portal Navigation
Dashboard
Organization (Companies, Branches, Departments, Designations, Locations)
Roles & Permissions
Holiday Calendars
Leave Policy Rules
OT & Comp-Off Rules
Salary Components
Workflow Configuration
Audit Logs
HR Portal Navigation
Dashboard
Employees (Directory, Create, Bulk Import, Promotions/Transfers)
Attendance & Time
Leave Administration
Overtime & Comp-Off Administration
Shift Administration
Payroll (Run, Payslips, Full & Final Settlement)
Cost Centers
Reports
Manager Portal Navigation
Dashboard
My Team (Directory & Attendance)
Approvals (Leave / OT / Comp-Off / Shift Swap)
Push OT Requirement
Team Reports
Employee Portal Navigation
Dashboard
My Profile
Attendance & Working Hours
Leave (Apply, Balance, History)
Overtime & Comp-Off
Shift & Swap Requests
Payslips & Reimbursements
Notifications
Security Portal Navigation
Dashboard
Approved OT Schedule
Approved Comp-Off Schedule
Approved Shift Changes
Entry/Exit Confirmation
5. Screen Specifications
This section defines the primary screens for each portal: their purpose, who can access them, key UI elements, and the states they must support. Wireframe-level detail is given; visual styling follows the design system in Section 6.
5.1 Admin Portal Screens
Organization Setup
Allows Admin to define the company hierarchy that every other module depends on: companies, branches, departments, designations, and locations.
Role Access: Admin only


| Element | Description |
| --- | --- |
| Entity Tree/List | Left panel shows Company > Branch > Department hierarchy as an expandable tree; selecting a node loads its detail on the right. |
| Detail Form | Right panel: editable form for the selected entity (name, code, parent, status). |
| Add Button | Top-right 'Add New' opens a modal scoped to the currently selected tree level. |
| Status Toggle | Active/Inactive switch per entity, with confirmation dialog before deactivation. |


Key States: 
Empty state (no branches yet) with a call-to-action to add the first branch
Validation errors inline under each field
Save success toast

Holiday Calendar Builder
Lets Admin build state-wise holiday calendars and assign them to locations, reflecting that holiday count and dates vary by state (e.g., Vinayaka Chavithi, Diwali, Sankranthi).
Role Access: Admin (build/edit), HR (view/assign)


| Element | Description |
| --- | --- |
| Calendar Selector | Dropdown to choose an existing state calendar or create a new one, tagged by state/location. |
| Holiday List Table | Date, Holiday Name, Type (National/Regional/Festival/Company/Restricted), editable inline. |
| Calendar Preview | Month-grid mini-calendar highlighting holidays and weekly offs for quick visual check. |
| Assign to Location | Multi-select control to map this calendar to one or more branches/locations. |


Key States: 
Draft (unpublished) vs Published calendar
Conflict warning if a date is added twice

Leave & OT Policy Rules
Configuration screen for accrual, proration, carry-forward caps, sandwich-leave logic, and OT multipliers, so these business rules are data-driven rather than hard-coded.
Role Access: Admin only


| Element | Description |
| --- | --- |
| Rule Group Tabs | Tabs: Accrual, Proration, Carry-Forward, Sandwich Leave, OT Multipliers, Extended Sick Leave Slabs. |
| Parameter Form | Numeric/percentage inputs per rule (e.g., carry-forward cap = 24 days, weekly-off OT = 1.5x). |
| Slab Builder | Repeatable row builder for extended sick leave payment slabs (e.g., first 50 days @100%, next 25 @75%). |
| Effective Date | Each rule set carries an effective-from date so historical payroll runs remain reproducible. |



5.2 HR Portal Screens
Employee Directory
Primary landing screen for HR to search, filter, and manage all employees.
Role Access: HR (full), Admin (view)


| Element | Description |
| --- | --- |
| Filter Bar | Filters for Department, Designation, Location, Status (Active/Notice/Resigned/Suspended), Employment Type. |
| Data Table | Columns: Photo, Name, Employee ID, Department, Designation, Status badge, Manager. Row click opens profile. |
| Bulk Actions | Checkbox selection enables bulk export or bulk status update. |
| Add Employee Button | Opens a choice: Manual Entry / Excel Upload / Database Import. |


Key States: 
Loading skeleton rows
No-results state with reset-filters action

Employee Creation Wizard
Step-by-step manual entry flow replacing a recruitment pipeline, matching the flow: Personal → Employment → Salary → Shift → Holiday Calendar → Department → Manager → Save.
Role Access: HR only


| Element | Description |
| --- | --- |
| Stepper Header | Horizontal step indicator: Personal, Employment, Salary, Shift, Holiday Calendar, Review. |
| Step Forms | Each step is a focused form; 'Next' validates before advancing, 'Back' preserves entered data. |
| Review Step | Read-only summary of all entered data with 'Edit' links back to each step before final Save. |
| Save Confirmation | On save, shows generated Employee ID and offers 'Create Another' or 'View Profile'. |


Key States: 
Partial-save/draft state if the wizard is exited early
Field-level validation errors

Bulk Import (Excel / Database)
Handles Excel upload and database migration import with validation and error reporting.
Role Access: HR only


| Element | Description |
| --- | --- |
| Upload Zone | Drag-and-drop or browse; shows accepted template link and file-size limit. |
| Validation Report | Table listing row number, field, and error after upload — e.g., 'Row 14: Invalid Department code'. |
| Import Summary | Counts: Total rows, Valid, Errors, Imported. Option to import only valid rows or fix-and-retry. |
| Import History Log | List of past import jobs with timestamp, file name, and result counts. |


Key States: 
Processing/progress state for large files
Partial success state (some rows imported, some failed)

Payroll Run Console
HR's control center for simulation and actual payroll runs, mapped to the Cost Center simulation-then-actual-run flow.
Role Access: HR only


| Element | Description |
| --- | --- |
| Period Selector | Choose payroll month/period and payroll area. |
| Run Type Toggle | Simulation Run vs Actual Run, clearly differentiated by colour (simulation = neutral grey banner). |
| Pre-Run Checklist | Checklist of prerequisites: attendance locked, leave finalized, OT approved, reimbursements submitted. |
| Results Table | Employee-wise Gross, Deductions, Net Pay with drill-down to a full payslip preview. |
| Post-Run Actions | Generate Payslips, Export Bank File, Post to GL (Actual Run only). |


Key States: 
In-progress calculation spinner with step-by-step progress text
Simulation results banner clearly marked 'Not Posted'
Locked state after Actual Run is finalized

Full & Final Settlement
Handles exit settlement calculation combining pending salary, leave encashment, recovery, loans, gratuity, and bonus.
Role Access: HR only


| Element | Description |
| --- | --- |
| Employee Exit Summary | Last working day, notice period status, clearance status from other departments. |
| Settlement Breakdown Table | Line items: Pending Salary, Leave Encashment, Gratuity, Loan Recovery, Bonus, Net Settlement. |
| Approval Trail | Shows HR and Finance sign-off status before final release. |



5.3 Manager Portal Screens
Manager Dashboard
At-a-glance view of team status and pending actions.
Role Access: Manager only


| Element | Description |
| --- | --- |
| Pending Approvals Widget | Count and quick-list of Leave/OT/Comp-Off/Shift Swap requests awaiting this manager. |
| Team Attendance Snapshot | Today's present/absent/on-leave counts for the manager's direct reports. |
| Push OT Requirement | Button opening a form to broadcast an OT need to eligible team members for a given date. |



Approval Queue
Unified inbox for all request types requiring manager action, reused across Leave, OT, Comp-Off, and Shift Swap.
Role Access: Manager only


| Element | Description |
| --- | --- |
| Type Filter Tabs | All / Leave / Overtime / Comp-Off / Shift Swap. |
| Request Card List | Each card: employee name, request type, date range, reason, and Approve/Reject buttons. |
| Request Detail Drawer | Slide-over panel with full context (e.g., leave balance impact, OT eligibility, sandwich-leave conversion warning) before the manager decides. |
| Bulk Approve | Checkbox selection for same-type, low-risk requests (e.g., routine shift swaps). |


Key States: 
Empty state ('No pending approvals')
Rejected request requires a mandatory reason field before submit

5.4 Employee Portal Screens
Employee Dashboard
Personal landing page summarising attendance, leave balance, and pending requests.
Role Access: Employee only


| Element | Description |
| --- | --- |
| Working Hours Card | Expected vs Worked vs Remaining hours for the current month, with an OT hours sub-metric. |
| Leave Balance Cards | One compact card per leave type (Annual, Casual, Sick, Comp-Off) showing Available/Used/Remaining. |
| Upcoming Holidays Strip | Next 3 holidays from the employee's assigned state calendar. |
| My Requests Widget | Status list of the employee's own recent Leave/OT/Comp-Off/Shift Swap requests. |



Apply Leave
Leave application form enforcing balance, proration, and sandwich-leave rules at entry time.
Role Access: Employee only


| Element | Description |
| --- | --- |
| Leave Type Selector | Dropdown restricted to leave types the employee is currently eligible for. |
| Date Range Picker | Calendar picker that visually marks weekends/holidays inside the selected range. |
| Sandwich Leave Warning | Inline banner if the selected range bridges a weekend/holiday, explaining how many days will actually be deducted. |
| Balance Impact Preview | Live 'Balance after this request' figure shown before submission. |
| Attach Document | Optional file upload for supporting documents (e.g., medical certificate for sick leave). |


Key States: 
Insufficient-balance blocking state with suggestion to apply LOP instead
Submitted/Pending confirmation

Request Overtime / Comp-Off
Combined request screen since OT (cash) and Comp-Off are mutually exclusive for the same day.
Role Access: Employee only


| Element | Description |
| --- | --- |
| Date & Hours Input | Select date and expected hours, capped at the 12-hour maximum with a live validation message. |
| Compensation Choice | Radio: 'Cash OT' or 'Comp-Off' — mutually exclusive, cannot select both for the same date. |
| Eligibility Indicator | Shows the applicable multiplier (0.5x / 1x / 1.5x) based on day type (regular/weekly-off/public holiday) and current-month eligibility status. |



Shift & Swap
View assigned shift and request a swap with another employee.
Role Access: Employee only


| Element | Description |
| --- | --- |
| Current Shift Card | Today's and this week's assigned shift with time range. |
| Swap Request Form | Select target date, desired shift, and (optionally) a specific colleague to swap with. |
| Swap Status Tracker | Steps: Requested → Colleague Accepted → Manager Approved → Updated. |



Payslips & Reimbursements
Access to payslip history and submission of reimbursement claims.
Role Access: Employee only


| Element | Description |
| --- | --- |
| Payslip List | Month-wise list with download (PDF) action per payslip. |
| Payslip Detail View | Read-only breakdown: Earnings, Deductions, Reimbursements, Net Pay; gratuity accrual shown only in CTC summary, not in the payslip line items. |
| Reimbursement Claim Form | Category, amount, date, receipt upload; running claim status list below the form. |



5.5 Security Portal Screens
Operational Schedule View
Read-mostly console for coordinating approved OT, comp-off, and shift-change activity that affects site entry/exit.
Role Access: Security only


| Element | Description |
| --- | --- |
| Today's Approved OT List | Employee, time window, approving manager, for quick gate verification. |
| Approved Comp-Off Work List | Employees confirmed to work today under comp-off arrangement. |
| Shift Change Log | Today's approved temporary/permanent shift changes. |
| Entry/Exit Confirmation | Simple check-in/check-out toggle logged against the employee record, visible to HR for audit. |



6. Shared Design System
A single component library is used across all five portals. Components differ in data and permissions, never in visual language, so the front end should be built as one component set consumed by role-specific screens.
6.1 Colour Palette


| Swatch | Name | Hex | Usage |
| --- | --- | --- | --- |
|  | Primary / Navy | #1F3A5F | Headers, primary navigation, key headings |
|  | Accent Blue | #2E75B6 | Links, primary buttons, active nav item, focus states |
|  | Slate | #44546A | Secondary text, labels, subdued headings |
|  | Light Blue Tint | #EAF1F8 | Card backgrounds, hover states, info banners |
|  | Success Green | #2E7D32 | Approved, Active, Paid statuses |
|  | Warning Amber | #B8860B | Pending, Draft, review-needed statuses |
|  | Error Red | #B3261E | Rejected, Terminated, LOP, validation errors |
|  | Neutral Grey | #BFBFBF | Borders, dividers, disabled states |


Table 6.1 — Core colour palette. Status colours are always paired with an icon/label, never used alone.
6.2 Typography


| Element | Description |
| --- | --- |
| Font Family | Calibri (or system UI font) for both UI and body text, for readability and fast rendering across devices. |
| H1 / Page Title | 24–28px, bold, Navy. |
| H2 / Section Title | 18–20px, bold, Accent Blue. |
| H3 / Card / Field Group Title | 15–16px, bold, Slate. |
| Body Text | 14px regular, near-black (#262626) for AA contrast on white. |
| Caption / Helper Text | 12px, Slate, used for hints and table captions. |


6.3 Core Components


| Element | Description |
| --- | --- |
| Status Badge | Pill-shaped label with icon + text: Draft, Pending, Approved, Rejected, Cancelled, Processed. Colour follows Section 6.1 status mapping. |
| Data Table | Sticky header, sortable columns, row hover highlight, right-aligned numeric columns, pagination footer (25/50/100 rows). |
| Filter Bar | Horizontal row of dropdowns/date-range pickers above every list screen, with a persistent 'Clear Filters' link. |
| Form Field | Label above input, helper text below, error state shows red border + message beneath the field (never a floating tooltip only). |
| Modal / Dialog | Used for scoped, single-object actions (add holiday, reject with reason); page navigation is never placed inside a modal. |
| Slide-Over Drawer | Used for detail/review of a list item without leaving the list context (e.g., Approval Queue request detail). |
| Stepper | Horizontal numbered steps for multi-stage flows (Employee Creation Wizard, Payroll Run). |
| Toast Notification | Bottom-right transient message for save/submit confirmations; persistent issues use inline banners instead. |
| Empty State | Icon + one-line message + primary action, shown whenever a list/table has zero rows. |


6.4 Status Colour Mapping


| Element | Description |
| --- | --- |
| Draft | Neutral Grey background, Slate text |
| Pending / Awaiting Approval | Amber background, dark amber text |
| Approved / Active / Paid | Green background, dark green text |
| Rejected / Terminated / LOP | Red background, dark red text |
| Cancelled | Grey background, strikethrough text |
| Processed / Posted (Payroll) | Navy background, white text |


7. Workflow & Approval UI Patterns
Leave, Overtime, Comp-Off, and Shift Swap all share the same underlying approval engine, so their UI follows one repeated pattern end to end.
7.1 Standard Request Lifecycle (UI states)
Employee fills the request form; a live rule-check panel shows eligibility and any warnings (e.g., sandwich leave, 12-hour OT cap) before Submit is enabled.
On submit, the request appears in the employee's 'My Requests' list with status Pending, and simultaneously in the manager's Approval Queue.
Manager opens the request detail drawer, reviews balance/eligibility context, and Approves or Rejects (rejection requires a reason).
For flows that also notify HR/Security (OT, Comp-Off), an automatic status change pushes the confirmed record into the HR/Security operational views — no separate manual step for the employee or manager.
Status updates propagate in real time (or on next refresh) to all three portals' relevant screens, and a notification is created for the employee.
7.2 Notification Patterns


| Element | Description |
| --- | --- |
| Bell Icon Badge | Top bar bell shows unread count; opens a dropdown list of the 10 most recent notifications with a 'View All' link. |
| Notification Center Page | Full list, filterable by type (Approval, Reminder, Escalation, System) and read/unread. |
| In-Context Banner | When a manager opens a request affected by a rule change (e.g., OT rate dropped from 1.5x to 1x due to a leave taken), a yellow banner explains why inline. |


8. Responsive Design & Accessibility
8.1 Breakpoints


| Element | Description |
| --- | --- |
| Desktop (≥1200px) | Full sidebar + multi-column dashboards; primary target for HR/Admin/Payroll-heavy screens. |
| Tablet (768–1199px) | Sidebar collapses to icons-only; dashboard cards reflow to 2 columns. |
| Mobile (<768px) | Sidebar becomes a bottom nav or hamburger drawer; tables convert to stacked cards. Primary target for Employee self-service and Manager approvals on the go. |


8.2 Accessibility Requirements
Minimum WCAG 2.1 AA colour contrast for all text and status badges.
All interactive elements reachable and operable via keyboard (Tab/Enter/Escape), with visible focus outlines.
Form errors announced via ARIA live regions for screen readers, not colour alone.
Icons used in status badges always paired with a text label, never icon-only.
Data tables use proper semantic table markup with header associations for assistive technology.
9. Front-End Technical Architecture
9.1 Recommended Stack


| Element | Description |
| --- | --- |
| Framework | React (with a component-driven architecture); shared layout shell described in Section 4.1 implemented as a single reusable component. |
| State Management | A server-state library (e.g., React Query) for API data/caching, plus lightweight local/global state (e.g., Context or a store library) for UI-only state such as sidebar collapse or active filters. |
| Routing | Nested, role-guarded routes: /admin/*, /hr/*, /manager/*, /employee/*, /security/*, each protected by a role-check wrapper. |
| Component Library | A shared internal design-system package (buttons, tables, badges, forms, modals, drawers) consumed by all portal route trees, matching Section 6. |
| Forms & Validation | Schema-based validation (e.g., a form library paired with a schema validator) so business rules such as leave balance and 12-hour OT caps are enforced client-side before hitting the API. |
| Charts/Dashboards | A lightweight charting library for attendance, leave, and cost-center summaries on dashboards. |
| Internationalization-ready | Even if English-only at MVP, text should be pulled from a strings layer to allow future state-language variants. |


9.2 Front-End Module Structure
The front-end codebase mirrors the backend module boundaries so a screen's data needs map cleanly to its API layer:
core/ — shell, auth/role guarding, shared design-system components
employee-master/ — directory, creation wizard, bulk import, profile
time-management/ — attendance, holiday calendars, work schedules
leave/ — apply, balance, policy admin, approvals
overtime-compoff/ — request, approval, eligibility display
shift/ — assignment, swap request/approval
payroll/ — run console, payslips, full & final settlement
cost-center/ — allocations, simulation vs actual run views
workflow-notifications/ — shared approval queue and notification center components reused across modules
reports/ — cross-module reporting screens
9.3 API Interaction Pattern
Each list screen follows the same data-fetching pattern: filter/query state drives a paginated API call; results populate the Data Table component; row selection opens either a detail drawer (in-context) or navigates to a full detail route (for primary records like an Employee Profile or Payroll Run).
Write actions (Approve/Reject, Submit Leave, Run Payroll) use optimistic UI updates where safe (e.g., marking a notification read) and blocking confirmation dialogs where the action is irreversible or financially significant (e.g., Actual Payroll Run, Full & Final Settlement release).
10. Appendix: Screen-to-Module Mapping
Cross-reference between the screens defined in Section 5 and the backend modules/tables from the database design, for traceability.


| Element | Description |
| --- | --- |
| Organization Setup | companies, branches, departments, designations, locations |
| Holiday Calendar Builder | holiday_calendars, holidays, holiday_assignments, weekly_off_patterns |
| Leave & OT Policy Rules | leave_policies, leave_accrual_rules, leave_proration_rules, leave_carry_forward_rules, overtime_rules |
| Employee Directory / Creation Wizard | employees, employee_personal, employee_employment, employee_reporting |
| Bulk Import | employee_import_jobs, employee_import_errors, employee_import_logs |
| Payroll Run Console | payroll_periods, payroll_runs, payroll_calculations, payroll_results, payslips |
| Full & Final Settlement | full_final_settlements, settlement_items, gratuity_records |
| Manager Approval Queue | leave_requests, overtime_requests, compoff_requests, shift_swap_requests, approvals |
| Apply Leave | leave_requests, leave_balances, sandwich_leave_logs, lop_records |
| Request Overtime / Comp-Off | overtime_requests, overtime_calculations, compoff_requests, compoff_balances |
| Shift & Swap | shifts, shift_assignments, shift_swap_requests, shift_swap_history |
| Payslips & Reimbursements | payslips, reimbursements |
| Security Operational Schedule View | overtime_approvals, compoff_approvals, shift_swap_history |


Table 10.1 — Screen to database-module traceability