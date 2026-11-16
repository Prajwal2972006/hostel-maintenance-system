# ER diagram implementation notes

The supplied ER diagram and relational schema contain these core entities: Hostel, Room, Student, Staff, Issue_Status, Maintenance_Issue and Feedback.

The implementation retains these concepts with these mappings:
- Hostel -> `Hostel`
- Room -> `Room` (room number is the primary key in this version, matching the submitted schema)
- Student and Staff -> role-specific records in shared `User` table, with `role` discriminator
- Issue_Status -> `IssueStatus`
- Maintenance_Issue -> `MaintenanceIssue`
- Feedback -> `Feedback`

Additional implementation entities:
- `User` centralizes authentication and role management. Public registration creates Student accounts only.
- `IssueComment` supports optional comments on issues.
- MongoDB `activity_logs` stores audit-style events (created issue, assigned staff, changed status, feedback submitted).

Design caveat: because `Room_No` is the primary key in the supplied schema, this implementation assumes room numbers are globally unique across all hostels. If two hostels can both have room 204, change Room to use a generated `id` primary key and a composite unique constraint on `(hostelId, roomNo)` before seeding production data.
