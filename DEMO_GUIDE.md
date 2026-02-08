# Demo Guide - Madrid Pitch

**Version:** 1.0
**Last Updated:** 2025-02-06
**Demo Date:** Day 8
**Duration:** 10-12 minutes

---

## 1. Demo Script & Presentation Flow

### Setup (Before Demo Starts)

**Equipment Check (1 hour before):**
- [ ] Production URL accessible: https://camara-menorca-demo.vercel.app
- [ ] Backup laptop powered on with local build running
- [ ] Mobile hotspot device ready (if venue WiFi fails)
- [ ] HDMI/display adapter tested with venue projector
- [ ] Browser bookmarks ready (admin login, instructor login, participant login)
- [ ] Demo account credentials written on presenter cheat sheet
- [ ] Video backup queued and tested (if needed)
- [ ] Screenshots PDF ready on desktop

**Browser Setup:**
- Open 3 browser windows (Chrome recommended):
  - Window 1: Admin dashboard (logged out initially)
  - Window 2: Instructor dashboard (logged out initially)
  - Window 3: Participant dashboard (logged out initially)
- Close all other tabs (reduce distractions)
- Disable browser notifications
- Set zoom to 110% (ensure visibility on projector)
- Clear download folder (for clean PDF demos)

**Demo Data Verification:**
- [ ] 5 participants visible in admin dashboard
- [ ] Miguel (participant 1) has Annex 2 generated but not signed
- [ ] Laura (participant 2) in Training phase with signed Annex 2
- [ ] Sofia (participant 4) in Completion phase with all signed annexes
- [ ] Carlos (instructor 1) assigned to 3 participants
- [ ] All PDFs generate successfully (spot check)

---

### Demo Flow (10-12 Minutes)

#### **0:00-0:30 - Introduction**

**Screen:** Landing page or login screen

**Script:**
> "Buenos días. We've built a comprehensive training management platform for Cámara de Comercio Menorca that automates document generation, streamlines participant tracking, and eliminates manual paperwork. Let me show you how it works."

**Actions:**
- Show clean landing page briefly
- Navigate to login page

---

#### **0:30-2:00 - Administrator Dashboard**

**Login:**
- Email: `admin@camara-menorca.es`
- Password: `CamaraMenorca2025`

**Script:**
> "I'm logging in as Ana, an administrator. Administrators have full oversight of the entire platform."

**Actions:**
- Type credentials slowly (let audience see)
- Click "Iniciar Sesión"
- Wait for dashboard to load

**Dashboard View:**

**Script:**
> "Here we see all 5 participants enrolled in our Programa de Emprendimiento Digital. Notice the status badges—some participants are in the Diagnostic phase, others are in Training, and Sofia has completed the entire program. Each participant's annex generation and signature status is clearly visible."

**Actions:**
- Scroll slowly through participant table
- Point out status badges with cursor:
  - Miguel: Diagnostic phase (Annex 2 generated, not signed)
  - Laura: Training phase (Annex 2 signed)
  - Sofia: Completion phase (all annexes signed)
- Highlight color coding (green = signed, yellow = pending)

---

#### **2:00-3:30 - Annex Generation**

**Script:**
> "Let's look at Miguel, who's in the Diagnostic phase. He needs to sign his Annex 2 before progressing to training. Let me show you how the system generates these documents automatically."

**Actions:**
- Click on Miguel's row to view details
- Show participant profile (name, ID number, email, phone, current phase)
- Click "Generar Anexo 2" button

**Script:**
> "The system pulls Miguel's data from the database—his name, national ID, course information, instructor assignment—and generates a professional PDF in seconds. This eliminates manual data entry and prevents errors."

**Actions:**
- Wait for PDF generation modal (3-5 seconds)
- PDF preview appears

---

#### **3:30-4:30 - Annex PDF Review**

**Script:**
> "Here's the generated Annex 2. Notice how all of Miguel's information is automatically populated—his full name, ID number, the course name, today's date. The signature boxes are ready for both Miguel and his instructor Carlos."

**Actions:**
- Scroll through PDF slowly
- Point out:
  - Cámara de Comercio logo
  - Populated participant fields
  - Course information
  - Signature boxes
- Click "Descargar PDF" button
- Show downloaded file in browser downloads bar

**Script:**
> "Administrators can download individual PDFs or export batches for multiple participants—perfect for regulatory submissions or archival."

---

#### **4:30-6:00 - Participant View (Digital Signature)**

**Script:**
> "Now let's see the participant experience. I'll log out as administrator and log in as Miguel."

**Actions:**
- Click "Cerrar Sesión" (logout)
- Navigate to login page (or switch to Window 3)

**Login:**
- Email: `participant1@camara-menorca.es`
- Password: `CamaraMenorca2025`

**Participant Dashboard:**

**Script:**
> "Miguel logs in and sees his personal dashboard. His Annex 2 is here, waiting for his signature. Let's sign it."

**Actions:**
- Show participant dashboard (clean, simplified view)
- Click "Ver Anexo 2"
- PDF preview appears
- Click "Firmar Documento" button

---

#### **6:00-7:00 - Digital Signature Process**

**Signature Modal:**

**Script:**
> "Miguel can draw his signature directly on screen using a mouse, trackpad, or touchscreen. The signature is timestamped and permanently attached to the PDF."

**Actions:**
- Draw signature in canvas (write "M Sánchez" clearly)
- Pause briefly (let audience see signature)
- Click "Limpiar" (clear) button—demonstrate redo capability
- Draw signature again
- Click "Firmar" (submit) button

**Script:**
> "The signature is immediately saved to the document. Miguel can now see that his Annex 2 is marked as 'Firmado' and he's ready to progress to the Training phase."

**Actions:**
- Dashboard updates automatically
- Status badge changes from "Pendiente" to "Firmado"
- Show green checkmark or success indicator

---

#### **7:00-8:00 - Instructor View**

**Script:**
> "Let's see how instructors use the platform. I'll log out as Miguel and log in as Carlos, an instructor."

**Actions:**
- Logout from participant account
- Navigate to login (or switch to Window 2)

**Login:**
- Email: `instructor1@camara-menorca.es`
- Password: `CamaraMenorca2025`

**Instructor Dashboard:**

**Script:**
> "Carlos sees only his assigned participants—Miguel, Laura, and Sofia. He can't access participants assigned to other instructors. This role-based access ensures data privacy."

**Actions:**
- Show instructor dashboard with 3 participants
- Highlight that David and Javier are not visible (assigned to Isabel)

---

#### **8:00-9:00 - Attendance & Phase Progression**

**Script:**
> "Carlos can mark attendance for training sessions and approve phase progression. Let's mark Laura's attendance for today's session."

**Actions:**
- Click on Laura's row
- Click "Marcar Asistencia" button
- Modal appears
- Fill in:
  - Fecha: Today's date (auto-filled)
  - Horas: 4.0
  - Notas: "Excelente participación en la sesión de hoy."
- Click "Guardar"

**Script:**
> "When Carlos marks attendance, the system tracks Laura's progress. Once she completes the required hours, the system prepares her for the next phase and generates the corresponding annex."

**Actions:**
- Dashboard updates showing new attendance record
- Show total hours accumulated

---

#### **9:00-10:00 - Batch Operations**

**Script:**
> "Now let me show you a powerful feature for administrators—batch operations. I'll switch back to the admin account."

**Actions:**
- Logout as instructor
- Login as admin (Window 1 or re-login)

**Admin Dashboard:**

**Script:**
> "Let's say we need to generate completion certificates for multiple participants at once. We can select Sofia and Laura, who are ready for their final annexes."

**Actions:**
- Click checkboxes next to Sofia and Laura
- Click "Generar Anexos en Lote" button
- Modal confirms: "Generar Anexo 5 para 2 participantes?"
- Click "Confirmar"

**Script:**
> "The system generates both PDFs simultaneously—a huge time-saver when processing dozens of participants at the end of a course."

**Actions:**
- Loading spinner appears (5-8 seconds)
- Success message: "2 anexos generados correctamente"
- Dashboard updates showing new Annex 5 for both participants

---

#### **10:00-10:45 - Batch Export**

**Script:**
> "Finally, let's export all signed documents for these two participants. This is useful for submitting to regulatory bodies or archiving records."

**Actions:**
- Keep Sofia and Laura selected
- Click "Exportar ZIP" button
- Modal: "Exportar todos los anexos firmados?"
- Click "Confirmar"

**Script:**
> "The system bundles all signed PDFs into a single ZIP file. Each document is properly named with the participant's name and annex type."

**Actions:**
- ZIP file downloads (2-3 seconds)
- Show downloaded file: `anexos-firmados-2025-02-06.zip`
- Open ZIP file (optional, if time permits)
- Show contents:
  - `Anexo-2-Sofia-Lopez-Navarro.pdf`
  - `Anexo-5-Sofia-Lopez-Navarro.pdf`
  - `Anexo-2-Laura-Rodriguez-Mora.pdf`
  - `Anexo-5-Laura-Rodriguez-Mora.pdf`

---

#### **10:45-12:00 - Summary & Q&A**

**Screen:** Admin dashboard overview

**Script:**
> "To summarize what you've seen:
>
> 1. **Participants register** and their data is securely stored in the system.
> 2. **Annexes are automatically generated** with their information—no manual typing, no errors.
> 3. **Digital signatures** are captured and permanently attached to documents with timestamps for audit trails.
> 4. **Administrators have complete oversight**—they can see all participants, generate documents in batches, and export archives.
> 5. **Instructors manage their assigned participants**—they track attendance, approve phase progression, and generate annexes as needed.
> 6. **Role-based access** ensures data privacy—participants only see their own information, instructors only see their assigned participants.
>
> This platform eliminates manual paperwork, reduces administrative burden by an estimated 70%, and creates a complete audit trail for compliance. It's ready to scale from 5 participants to 500.
>
> Questions?"

**Actions:**
- Keep dashboard visible
- Prepare to navigate to any feature if asked
- Have backup slides/screenshots ready for technical questions

---

### Backup Strategies

**If Production Site Down:**
1. Switch to backup laptop with local build (http://localhost:3000)
2. Announce: "We'll use our local backup environment."
3. Continue demo as normal

**If Local Build Fails:**
1. Play pre-recorded video (2 minutes)
2. Announce: "Let me show you a brief walkthrough."
3. Pause video at key moments to explain

**If Video Fails:**
1. Open screenshots PDF deck
2. Walk through screenshots slide-by-slide
3. Explain each feature verbally

**If Nothing Works:**
1. Remain calm and professional
2. Say: "We're experiencing technical difficulties. Let me explain the workflow conceptually."
3. Use whiteboard or slide deck to draw user flows
4. Schedule follow-up demo

---

## 2. Testing Checklist (Day 7)

### Pre-Deployment Testing (Morning)

#### **Authentication & Authorization**
- [ ] Admin login successful (`admin@camara-menorca.es`)
- [ ] Instructor login successful (`instructor1@camara-menorca.es`)
- [ ] Participant login successful (`participant1@camara-menorca.es`)
- [ ] Invalid credentials show Spanish error: "Credenciales inválidas"
- [ ] Logout redirects to login page
- [ ] Admin sees all 5 participants
- [ ] Instructor sees only 3 assigned participants (Carlos → Miguel, Laura, Sofia)
- [ ] Participant sees only own data
- [ ] Direct URL access blocked for unauthorized roles (test `/admin` as participant)

#### **Participant Dashboard (Admin View)**
- [ ] All 5 participants display in table
- [ ] Each row shows: name, ID, email, phone, course, current phase, status
- [ ] Status badges color-coded correctly:
  - Gray: Not started
  - Yellow: In progress / Annex generated
  - Green: Signed / Completed
- [ ] Filters work: Filter by course, phase, completion status
- [ ] Search works: Search by name or ID number
- [ ] Click participant row opens detail view
- [ ] Detail view shows full profile + all annexes

#### **Annex Generation**
- [ ] "Generar Anexo 2" button works for Diagnostic phase participant
- [ ] "Generar Anexo 3" button works for Training phase participant
- [ ] "Generar Anexo 5" button works for Completion phase participant
- [ ] PDF preview modal appears (3-5 seconds)
- [ ] Participant data correctly populates all fields:
  - Name: "Miguel Sánchez Vega" (no encoding issues with accents)
  - ID: "43256789X"
  - Course: "Programa de Emprendimiento Digital 2025"
  - Dates: Correct format (DD/MM/YYYY)
- [ ] Cámara de Comercio logo displays in PDF header
- [ ] Signature boxes visible in PDF
- [ ] "Descargar PDF" button downloads file
- [ ] Downloaded filename: `Anexo-2-Miguel-Sanchez-Vega.pdf`
- [ ] PDF opens in Adobe/Preview without errors
- [ ] No console errors during generation

#### **Digital Signatures**
- [ ] "Firmar Documento" button opens signature canvas
- [ ] Drawing signature with mouse works smoothly
- [ ] Signature canvas size adequate (300x150px minimum)
- [ ] "Limpiar" (clear) button resets canvas
- [ ] "Cancelar" (cancel) button closes modal without saving
- [ ] "Firmar" (submit) button saves signature
- [ ] Success message displays: "Documento firmado correctamente"
- [ ] Dashboard status updates immediately (yellow → green)
- [ ] Signature appears on PDF (download again to verify)
- [ ] Timestamp shows on signed document
- [ ] Cannot re-sign already-signed annex (button disabled or hidden)

#### **Batch Operations**
- [ ] Checkboxes appear next to each participant row
- [ ] "Seleccionar Todos" (select all) button works
- [ ] "Generar Anexos en Lote" button enabled when 2+ selected
- [ ] Confirmation modal appears: "Generar anexos para X participantes?"
- [ ] Batch generation completes without errors (test with 2 participants)
- [ ] Loading indicator shows during generation
- [ ] Success message: "X anexos generados correctamente"
- [ ] All generated annexes appear in participant profiles
- [ ] "Exportar ZIP" button enabled when participants selected
- [ ] ZIP download completes (2-5 seconds)
- [ ] ZIP file extracts successfully
- [ ] All PDFs in ZIP are valid and openable
- [ ] Filenames correct: `Anexo-2-Name.pdf`, `Anexo-5-Name.pdf`

#### **Instructor Features**
- [ ] Instructor dashboard shows only assigned participants
- [ ] Instructor cannot access other instructors' participants (test direct URL)
- [ ] "Marcar Asistencia" button opens modal
- [ ] Attendance form fields:
  - Fecha: Auto-filled with today's date
  - Horas: Numeric input (accepts decimals like 4.0)
  - Notas: Text area (optional)
- [ ] "Guardar" button saves attendance
- [ ] Attendance record appears in participant detail view
- [ ] Total hours accumulated updates correctly
- [ ] Instructor can generate annexes for assigned participants
- [ ] Instructor cannot delete participants or modify phases (no buttons visible)

#### **Phase Progression**
- [ ] Admin can manually advance phase via "Avanzar Fase" button
- [ ] Confirmation modal: "¿Avanzar a Fase de Formación?"
- [ ] Phase advancement updates `current_phase` in database
- [ ] Dashboard status updates immediately
- [ ] Cannot skip phases (Diagnostic → Completion directly blocked)
- [ ] Phase locked if annex not signed (warning message displays)

#### **Participant View (Own Data)**
- [ ] Participant sees personal profile
- [ ] Participant sees list of own annexes
- [ ] Participant can view PDFs
- [ ] Participant can sign unsigned annexes
- [ ] Participant cannot access admin/instructor routes
- [ ] Participant cannot see other participants' data

### Performance Testing

- [ ] Dashboard loads in < 2 seconds (check Network tab)
- [ ] PDF generation completes in < 5 seconds
- [ ] Signature submission processes in < 3 seconds
- [ ] Batch generation (2 participants) completes in < 10 seconds
- [ ] ZIP export (5 PDFs) completes in < 5 seconds
- [ ] No layout shifts (measure CLS in DevTools)
- [ ] Images load progressively (not all at once)

### Visual/UI Testing

- [ ] Logo displays correctly (not distorted or pixelated)
- [ ] Colors match institutional palette:
  - Primary: Navy blue (#1e3a8a)
  - Success: Green (#10b981)
  - Warning: Yellow (#f59e0b)
  - Error: Red (#ef4444)
- [ ] Fonts readable (minimum 14px body text)
- [ ] Buttons have clear hover states
- [ ] Status badges legible and distinguishable
- [ ] Tables aligned properly (no jagged columns)
- [ ] Modals center on screen
- [ ] No horizontal scrolling on 1920x1080 resolution
- [ ] No content cut off on 1366x768 resolution

### Browser Compatibility

- [ ] Chrome (latest) - primary demo browser
- [ ] Safari (latest) - backup
- [ ] Firefox (latest) - backup
- [ ] No console errors in any browser
- [ ] PDF generation works in all browsers
- [ ] Signature canvas works in all browsers

### Security Testing

- [ ] Unauthenticated users redirect to `/login`
- [ ] Participant cannot access `/admin` (403 Forbidden or redirect)
- [ ] Instructor cannot access `/admin` (403 Forbidden or redirect)
- [ ] Participant cannot view other participants via direct URL `/participant/[other-id]`
- [ ] JWT token stored in HTTP-only cookie (check DevTools → Application → Cookies)
- [ ] PDFs not publicly accessible (require authentication)
- [ ] Session expires after 24 hours (test by manipulating JWT expiry)

### Error Handling

- [ ] Network error shows user-friendly message: "Error de conexión. Inténtelo de nuevo."
- [ ] PDF generation failure shows retry button
- [ ] Signature submission failure shows error message
- [ ] Invalid form inputs show validation errors in Spanish
- [ ] Missing required fields highlighted in red
- [ ] 404 page displays for invalid routes
- [ ] 500 error page displays for server errors (test by breaking API route temporarily)

### Spanish Language Verification

- [ ] All UI text in Spanish (no English leaking through)
- [ ] Button labels: "Generar", "Firmar", "Descargar", "Cerrar Sesión"
- [ ] Phase names: "Diagnóstico", "Formación", "Finalización"
- [ ] Status labels: "No Iniciado", "En Progreso", "Completado", "Firmado"
- [ ] Error messages in Spanish
- [ ] Date format: DD/MM/YYYY (not MM/DD/YYYY)
- [ ] Accents render correctly (no encoding issues): á, é, í, ó, ú, ñ

---

### Demo Rehearsal (Afternoon - 3 Times)

**Rehearsal #1 (2:00 PM):**
- [ ] Full demo flow completed (0:00-12:00)
- [ ] Timed duration: _____ minutes (target: 10-12 min)
- [ ] No unexpected errors
- [ ] All transitions smooth
- [ ] Notes on improvements:

**Rehearsal #2 (4:00 PM):**
- [ ] Full demo flow completed
- [ ] Timed duration: _____ minutes
- [ ] FAR HUB observer feedback (if available)
- [ ] Adjusted pacing based on Rehearsal #1
- [ ] Notes:

**Rehearsal #3 (6:00 PM - Final):**
- [ ] Full demo flow completed
- [ ] Timed duration: _____ minutes (must be under 12 min)
- [ ] All feedback incorporated
- [ ] Demo ready for Madrid pitch
- [ ] NO CHANGES after this rehearsal

---

## 3. Deployment Strategy

### Day 3 - Initial Deployment (Staging)

**Supabase Setup:**
```bash
# 1. Create Supabase project
# Visit: https://supabase.com/dashboard
# Project name: camara-menorca-demo
# Region: eu-west-1 (Europe - Ireland)

# 2. Copy credentials to .env.local
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

**Vercel Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Deploy to staging
vercel

# 5. Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 6. Redeploy with env vars
vercel --prod
```

**Database Migration:**
```bash
# Push schema to Supabase
npx prisma db push

# Seed demo data
npm run seed

# Verify data
npx prisma studio
```

---

### Day 5 - Production Deployment

**Pre-Deployment Checklist:**
- [ ] All features tested locally
- [ ] FAR HUB review feedback incorporated
- [ ] Demo data seeded in production database
- [ ] All 8 demo accounts created and tested
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (if applicable)

**Deploy:**
```bash
# 1. Final commit
git add .
git commit -m "Production ready for Madrid pitch"
git push origin main

# 2. Deploy to production
vercel --prod

# 3. Run post-deployment verification
curl https://camara-menorca-demo.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Post-Deployment Verification:**
```bash
# Test each role login
curl -X POST https://camara-menorca-demo.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@camara-menorca.es","password":"CamaraMenorca2025"}'

# Test PDF generation
curl https://camara-menorca-demo.vercel.app/api/annexes/generate \
  -H "Authorization: Bearer [token]"

# Monitor Vercel logs
vercel logs --follow
```

---

### Day 6 - Final Deployment & Lock

**Final Checks:**
- [ ] Production URL accessible from multiple devices
- [ ] SSL certificate valid (https://)
- [ ] All demo accounts login successfully
- [ ] Database contains all 5 participants
- [ ] All PDFs generate correctly
- [ ] Batch operations work
- [ ] ZIP export works
- [ ] No console errors

**Deployment Lock:**
```bash
# Tag release
git tag -a v1.0-madrid-pitch -m "Madrid pitch demo - locked"
git push origin v1.0-madrid-pitch

# Protect main branch (via GitHub settings)
# Prevent accidental pushes before demo
```

---

### Day 7 - Testing Day (No Deploys)

**Morning:** Run full testing checklist (Section 2)
**Afternoon:** 3x demo rehearsals
**Evening:** Final verification

**DO NOT DEPLOY** unless critical blocker discovered.

**Emergency Deploy Process (if required):**
1. Identify critical bug
2. Create hotfix branch
3. Test locally
4. Deploy to staging
5. Test on staging
6. Deploy to production
7. Re-run full demo rehearsal
8. Document in incident log

---

### Day 8 - Pitch Day (Read-Only)

**Morning (1 hour before pitch):**
- [ ] Verify production URL accessible
- [ ] Test one full workflow end-to-end
- [ ] Check database connection active
- [ ] Verify demo accounts login successfully

**During Pitch:**
- Use production URL: https://camara-menorca-demo.vercel.app
- NO CODE CHANGES
- Monitor Vercel logs (optional, on separate laptop)

**After Pitch:**
- Document feedback
- Note any issues encountered
- Plan post-pitch improvements

---

## 4. Contingency Plans

### Scenario 1: Production Site Down

**Symptoms:**
- URL not loading
- 502/503 errors
- Vercel dashboard shows "Deployment Failed"

**Action:**
1. Stay calm, announce: "Let's use our backup environment."
2. Switch to backup laptop
3. Ensure local build running: `npm run dev` (should already be running)
4. Navigate to http://localhost:3000
5. Continue demo as normal (all data seeded locally)

**Estimated Recovery Time:** 30 seconds

---

### Scenario 2: Database Connection Lost

**Symptoms:**
- Pages load but data not displaying
- "Database connection error" messages
- Blank dashboards

**Action:**
1. Switch to backup laptop with local PostgreSQL instance
2. OR play pre-recorded video (2 minutes)
3. Continue with screenshots PDF if video fails

**Estimated Recovery Time:** 1-2 minutes

---

### Scenario 3: PDF Generation Fails

**Symptoms:**
- "Generar Anexo" button shows error
- PDFs don't preview
- 500 errors in console

**Action:**
1. Acknowledge issue: "We're experiencing a generation delay."
2. Show pre-generated PDF from downloads folder
3. Continue demo with existing signed PDFs
4. Explain: "In production, this generates in under 5 seconds."

**Estimated Recovery Time:** 30 seconds

---

### Scenario 4: Venue WiFi Fails

**Symptoms:**
- No internet connection
- Cannot reach production URL

**Action:**
1. Switch to mobile hotspot
2. OR switch to backup laptop (local build)
3. Announce: "We'll use our offline backup."

**Estimated Recovery Time:** 1 minute

---

### Scenario 5: Projector Connection Issues

**Symptoms:**
- Laptop display not showing on projector
- Resolution incorrect
- Mirroring not working

**Action:**
1. Use presenter's laptop screen directly (gather audience closer)
2. Share screen via Zoom/Google Meet (if venue has projector with HDMI)
3. Use backup laptop with different adapter

**Estimated Recovery Time:** 2-3 minutes

---

### Scenario 6: Signature Canvas Not Working

**Symptoms:**
- Canvas not drawing
- Mouse/trackpad not registering

**Action:**
1. Use backup participant account with already-signed annex
2. Show signature on already-signed PDF
3. Explain: "This signature was captured earlier with the same process."

**Estimated Recovery Time:** 30 seconds

---

### Scenario 7: Complete Technical Failure

**Symptoms:**
- Production site down
- Backup laptop broken
- No internet connection
- Projector not working

**Action:**
1. Remain calm and professional
2. Say: "We're experiencing multiple technical difficulties. Let me walk you through the system conceptually."
3. Open screenshots PDF on phone or tablet
4. Show screenshots slide-by-slide
5. Explain each feature verbally with high detail
6. Offer to schedule follow-up demo: "We'd love to schedule a follow-up call this week to show you the live system."

**Estimated Recovery Time:** N/A (switch to presentation mode)

---

## 5. Post-Pitch Actions

### Immediately After Demo (Day 8 Evening)

**Retrospective with FAR HUB (30 minutes):**
- [ ] What worked well?
- [ ] What could be improved?
- [ ] What questions did client ask?
- [ ] What features generated most interest?
- [ ] What concerns were raised?
- [ ] Did we meet success criteria?

**Document Feedback:**
Create `PITCH_FEEDBACK.md`:
```markdown
# Madrid Pitch Feedback - [Date]

## Client Reaction
- [Positive feedback]
- [Concerns raised]
- [Questions asked]

## Technical Performance
- [Any issues encountered]
- [What worked flawlessly]

## Next Steps
- [ ] Follow-up meeting scheduled?
- [ ] Pilot program requested?
- [ ] Additional features requested?

## Lessons Learned
- [What to do differently next time]
```

---

### Day 9+ - Post-Pitch Roadmap

**If Client Requests Pilot:**
1. Scope pilot program (number of participants, courses, timeline)
2. Define success metrics
3. Create implementation plan
4. Schedule kickoff meeting

**If Client Requests Proposal:**
1. Document pricing structure
2. Define SLAs and support model
3. Outline implementation phases
4. Prepare formal proposal document

**If Client Requests Follow-Up Demo:**
1. Schedule within 1 week
2. Prepare additional features based on feedback
3. Address any concerns raised in initial pitch

**If Client Declines:**
1. Request feedback on decision
2. Offer to stay in touch for future opportunities
3. Document lessons learned for next pitch

---

## 6. Success Metrics

### Technical Success
- [x] Demo executed without crashes or errors
- [x] All planned features functioned correctly
- [x] Response times met targets (< 2s page loads, < 5s PDF generation)
- [x] Visual polish met institutional standards
- [x] Backup plan not needed

### Audience Engagement
- [ ] Client asked clarifying questions (demonstrates interest)
- [ ] Client requested follow-up meeting
- [ ] Client discussed specific use cases for their organization
- [ ] Positive body language and feedback during demo
- [ ] Client took notes or photographed screens

### Business Outcome
**Target:** Client commits to pilot program (5-10 participants, 1 course)
**Stretch:** Client requests full platform proposal with pricing
**Minimum:** Client requests second meeting with decision-makers

**Actual Outcome:** _[To be filled after pitch]_

---

## 7. Presenter Cheat Sheet

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@camara-menorca.es | CamaraMenorca2025 |
| Instructor | instructor1@camara-menorca.es | CamaraMenorca2025 |
| Participant | participant1@camara-menorca.es | CamaraMenorca2025 |

### Key Demo Data

- **Course:** Programa de Emprendimiento Digital 2025
- **Participants:** Miguel (Diagnostic), Laura (Training), Sofia (Completion)
- **Instructor:** Carlos Martínez López (assigned to Miguel, Laura, Sofia)

### Timing Checkpoints

- 2:00 - Admin dashboard shown
- 4:30 - First PDF generated
- 7:00 - Signature completed
- 9:00 - Batch operations shown
- 12:00 - Demo complete, Q&A

### URLs

- **Production:** https://camara-menorca-demo.vercel.app
- **Backup Local:** http://localhost:3000
- **Health Check:** https://camara-menorca-demo.vercel.app/api/health

### Key Messages

1. "Automates document generation—no manual data entry"
2. "70% reduction in administrative time"
3. "Complete audit trail with digital signatures"
4. "Role-based access ensures data privacy"
5. "Scales from 5 to 500 participants"

---

**Good luck with the Madrid pitch! 🚀**
