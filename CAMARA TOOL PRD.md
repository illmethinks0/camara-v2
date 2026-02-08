PRD & Handover Document for Cámara de Comercio Menorca (Madrid Pitch)

Partner: FAR HUB – manages the client relationship with Cámara de Comercio Menorca.

Purpose: Build and improve a digital platform for training program management and annex automation, demonstrating a fully functional, pitch-ready prototype in Madrid. This document contains everything a tech team needs to implement the Madrid pitch demo without further clarification.



1. Project Goals

Primary Goal for Madrid Pitch:

Demonstrate a working, end-to-end participant workflow including registration, phased progression, annex generation, digital signature, and admin oversight.

Keep the system simple, reliable, and visually polished for a live demonstration.

Secondary Goal (Post-Pitch / Full Platform):

Provide a foundation for future expansion including multiple programs, advanced dashboards, certified digital signatures, API integrations, and full compliance tracking.



2. User Roles & Access

Role

Description

Dashboard Views / Capabilities

Administrator

Manages participants, courses, annexes, and system oversight.

Full list of participants, phases, annexes, signature status, progress tracking, batch actions (generate annexes, trigger signatures).

Instructor / Teacher

Manages participants assigned to their courses.

View only assigned participants, mark attendance, approve phase completions, trigger annex generation for their participants.

Participant

Engages with their own course material.

View personal data, generated annexes, signed documents, phase progress. Ability to digitally sign annexes.

Notes:

Dashboards must clearly indicate status per phase (Not Started, In Progress, Completed, Annex Generated, Signed).

Role-based access control ensures participants cannot see others’ data, teachers see only their participants, administrators see all.



3. Participant Data Management

Registration / Data Capture:

Fields: First Name, Last Name, ID Number, Email, Phone, Assigned Course.

Each participant receives a unique system identifier.

Data is stored in a single participant record referenced by all downstream annexes, signatures, and phase tracking.

Optional: pre-fill participant data for demo to reduce time.

Behavior:

Participant submits registration form → system creates record.

System automatically associates participant with assigned course and first phase.

Record is immutable after submission to ensure consistency (except for admin overrides).



4. Course & Phase Structure

Phases (Fases):

Diagnostic Phase – participant information collected, initial annex generated.

Training Phase – tracks attendance, triggers annex generation per session if applicable.

Completion Phase – final annexes generated, signature collected, course marked complete.

Requirements:

Participants cannot advance to next phase until previous phase is complete (mock for pitch if necessary).

Phase status is visually represented in all dashboards.

System can manually trigger phase completion for demo purposes.



5. Annex / Document Generation

Functional Requirements:

Each phase can have one or more annexes (Annex 2, Annex 3, Annex 5, etc.).

Annexes are automatically populated with participant data.

Documents are generated in PDF format, displayed in-app, and downloadable.

Batch generation supported (multiple annexes per participant or multiple participants per course).

Documents must link to participant record and show which phase they correspond to.

Demo Notes:

Only one annex per phase is necessary for the pitch.

Mocked annexes should look fully realistic, even if some data is placeholder.



6. Digital Signature

Requirements:

Annexes must be digitally signed by the participant (or instructor in certain phases).

Signature types for demo: click-to-sign or typed name.

Each signature stores:

Timestamp

Participant ID

Phase associated

Signatures must appear visually on annexes and mark the annex as “Signed” in dashboards.

Demo Notes:

Legal-grade certification not required for pitch.

Signature triggers phase progression visually.



7. Dashboard / Admin Views

Admin View:

Table listing all participants, course, current phase, annex generated status, signature status.

Buttons: Generate Annex, Trigger Signature, Advance Phase (mock if necessary).

Filters: By course, phase, completion status.

Instructor View:

Table of assigned participants only.

Phase progress, annex status, attendance.

Can trigger annex generation or mark session attendance.

Participant View:

Shows personal data, generated annexes, signature status, and phase progress.

Can digitally sign annexes.

Visual Requirements:

Neutral, professional palette suitable for institutional clients.

Clear status indicators (e.g., color-coded badges).

Readable fonts, minimal animations.

All flows should be visible in one coherent workflow for demo.



8. Attendance Tracking (Optional for Demo)

Attendance per class/session can be tracked by instructor.

Attendance marks phase completion for annex triggering.

For pitch, may be mocked via manual click to show functionality.



9. Integration / Export

Export annexes: PDF per participant, or ZIP batch for multiple participants.

Optional: prepare for future integration with Cámara de Comercio Menorca platform.

Security: only authorized roles can export or view annexes.



10. Timeline & Milestones

Milestone

Description

Timing

Prototype Amendments

Add role-based dashboards, phase handling, annex generation, digital signature

Day 1–3

Internal Review (Partner)

Review prototype with FAR HUB to confirm flows and pitch readiness

Day 4

Final Adjustments

Implement feedback, polish UX and annexes for demo

Day 5–6

Madrid Pitch Demo Prep

Test full workflow, ensure all phases, annexes, signatures, dashboards function

Day 7

Madrid Pitch

Present to Cámara de Comercio Menorca

Day 8

Post-Pitch Expansion Planning

Begin roadmap for full system with multiple courses, real digital signatures, advanced dashboards

Day 9+



11. Post-Pitch / Full Platform Vision

Multi-course, multi-participant management.

Full attendance tracking with automatic phase progression.

Certified digital signatures integrated with legal audit logs.

API integration to internal Cámara platform.

Advanced dashboards with analytics by course, phase, instructor, and participant.

Mobile-responsive interfaces for participants and instructors.

Automated reminders and notifications for pending annexes or phase completions.



12. Key Notes for Builder

All flows must be demonstrable for Madrid, even if some features are mocked.

Annexes and signatures must look fully functional.

Phase transitions can be manual or automatic for the demo.

Dashboards must clearly show role-specific access and participant progress.

Keep the system robust and visually polished, as credibility is critical.


13. Supporting Documentation

For implementation details, refer to:

**TECH_SPEC.md** - Technical stack, architecture, database schema, authentication approach

**DEMO_GUIDE.md** - Demo script, testing checklist, deployment strategy, presentation flow

**Quick Reference:**

Language: Spanish (Spain) - All UI text, annexes, error messages

Timeline: Day 1-3 Development → Day 4 Review → Day 5-6 Polish → Day 7 Testing → Day 8 Madrid Pitch

Success Metric: Demo runs flawlessly + Client requests pilot program or follow-up meeting
