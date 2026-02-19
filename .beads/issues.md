# Backend Tasks

## Backend: Extend POST /api/action for public submissions

Add the following to backend API:

- Accept public action submissions (not just admin)
- Validate required fields: title, description, recipientAddress
- Support optional fields: amount, parameters, iconUrl
- Generate unique action IDs (use nanoid or similar)
- Return full action object with generated ID
- Add input validation and error handling
- Test with Postman/curl

Located in: `backend/src/routes/action.ts`

**Acceptance Criteria:**
- POST /api/action accepts public submissions
- Returns 201 with created action object
- Validates BCH address format
- Generates unique action ID
- Returns proper error for invalid inputs

**Labels:** backend,api,priority:high

---

## Backend: Add persistence layer for actions

Implement storage for created actions:

- Start with in-memory Map<string, BlinchAction>
- Add save/load from JSON file for persistence
- Schema for stored actions matches BCH-Action v1.1.0
- Add indexes for creator lookups
- Prepare for future database migration

Create new file: `backend/src/storage/actionStore.ts`

**Acceptance Criteria:**
- Actions persist across server restarts
- In-memory cache for performance
- File-based persistence
- Easy to migrate to database later

**Labels:** backend,storage
**Blocks:** bd-get-creator-endpoint,bd-delete-endpoint

---

## Backend: Add GET /api/actions?creator=<address> endpoint

Add endpoint to query actions by creator:

- GET /api/actions?creator=<bch_address>
- Returns array of actions for that creator
- Supports pagination (limit, offset)
- Add basic filtering/sorting options

Located in: `backend/src/routes/action.ts`

**Acceptance Criteria:**
- Returns array of actions
- Supports creator query parameter
- Returns empty array if no actions found
- Handles invalid address format

**Labels:** backend,api

---

## Backend: Add DELETE /api/action/:id endpoint

Add delete endpoint for actions:

- DELETE /api/action/:id
- Verify ownership before deletion (creator address match)
- Return 204 on success
- Return 403 if not creator
- Return 404 if not found

Located in: `backend/src/routes/action.ts`

**Acceptance Criteria:**
- Deletes action successfully
- Validates ownership
- Returns appropriate status codes
- Handles non-existent actions

**Labels:** backend,api

---

# Frontend Tasks

## Frontend: Add navigation for new routes

Update navigation to include new routes:

- Add Create link to header/navigation
- Add Dashboard link (when user has actions)
- Update mobile menu
- Consider adding user indicator

Edit: `frontend/src/components/Header.tsx` (or navigation component)

**Acceptance Criteria:**
- Create link visible in header
- Dashboard link appears when user has actions
- Mobile menu updated
- Active state shows current page

**Labels:** frontend,ui,priority:high

---

## Frontend: Update home page with Create button

Enhance landing page to promote action creation:

- Add prominent "Create Your Blinch" button next to "Try Example Action"
- Add section explaining benefits of creating actions
- Add quick stats or social proof
- Improve hierarchy and CTAs

Edit: `frontend/src/app/page.tsx`

**Acceptance Criteria:**
- New Create button is prominent
- Links to /create page
- Mobile responsive
- Maintains existing design aesthetic

**Labels:** frontend,ui

---

## Frontend: Create /create route with multi-step form

Build the action creation page at /create:

**Page components:**
- Step 1: Basic Info (title, description, icon selection)
- Step 2: Fund Details (BCH address, amount, custom amount toggle)
- Step 3: Customize (parameters, timeout, action type) - collapsible
- Step 4: Preview & Generate

**UI Requirements:**
- Progress indicator showing current step
- Back/Next navigation buttons
- Form validation before proceeding
- Glassmorphic design matching existing style
- Mobile responsive

Files to create:
- `frontend/src/app/create/page.tsx`

**Acceptance Criteria:**
- Multi-step form works end-to-end
- Validation on each step
- Can navigate back and forth
- Mobile responsive
- Matches existing design system

**Labels:** frontend,feature,priority:high
**Blocks:** frontend-form-components

---

## Frontend: Add form components for action creation

Create reusable form components:

**Components needed:**
- InputField (text, textarea)
- AddressInput (with BCH validation)
- AmountInput (BCH amount with validation)
- ParameterBuilder (add/edit/remove parameters)
- IconSelector (preset icons + upload)
- FormStepper (progress indicator)

Create directory: `frontend/src/components/create/`

**Acceptance Criteria:**
- Reusable form components
- Proper TypeScript types
- BCH address validation
- Form state management
- Error display
- Accessible (ARIA labels)

**Labels:** frontend,components

---

## Frontend: Create success/share page after action creation

Build success page shown after action creation:

**Features:**
- Display generated action URL (blinch.network/action/[id])
- Copy-to-clipboard buttons for:
  - Full URL
  - Action ID only
- QR code generation for mobile wallets
- Embed code snippet for websites
- "Create Another" button
- "View My Action" button

Create: `frontend/src/app/create/success/page.tsx` (or modal/section)

**Acceptance Criteria:**
- Shows generated action ID
- Copy buttons work
- QR code displays correctly
- Embed code is syntax highlighted
- Navigation buttons work

**Labels:** frontend,ui

---

## Frontend: Add localStorage for action persistence

Implement client-side storage for created actions:

**Features:**
- Save created actions to localStorage
- Load actions on dashboard mount
- Update actions after edits
- Remove actions after deletion
- Handle localStorage quota/errors
- Migrate to API storage when backend is ready

Create: `frontend/src/lib/storage/actionStorage.ts`

**Acceptance Criteria:**
- Actions persist across page reloads
- CRUD operations work
- Error handling for quota exceeded
- Clean abstraction for future API migration

**Labels:** frontend,storage

---

## Frontend: Create /dashboard page for managing actions

Build dashboard page for managing created actions:

**Features:**
- List of user's created actions
- Filter/search by title or ID
- Edit action (navigate to edit page)
- Delete action (with confirmation)
- Basic metrics (views, clicks) - placeholder for now
- Quick share buttons
- Empty state with CTA to create first action

Create:
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/components/dashboard/ActionList.tsx`
- `frontend/src/components/dashboard/ActionCard.tsx`

**Acceptance Criteria:**
- Displays list of created actions
- Edit/delete functionality works
- Empty state looks good
- Mobile responsive
- Matches existing design system
- Stores actions in localStorage initially

**Labels:** frontend,feature,priority:high

---

# Integration Tasks

## Integration: Connect frontend creation form to backend API

Wire up the creation form to backend:

- Call POST /api/action on form submission
- Handle loading states during submission
- Display success/error messages
- Navigate to success page on success
- Handle network errors gracefully
- Add retry logic for failed submissions

Edit: `frontend/src/app/create/page.tsx`
Update: `frontend/src/lib/action-proxy.ts` (if needed)

**Acceptance Criteria:**
- Form submits to backend API
- Shows loading state
- Handles errors properly
- Navigates to success page
- Works with both localStorage and API

**Labels:** integration,frontend

---

## Integration: Connect dashboard to backend API

Wire up dashboard to backend for user's actions:

- Call GET /api/actions?creator=<address> on mount
- Merge with localStorage actions
- Handle loading states
- Display errors gracefully
- Refresh after create/edit/delete

Edit: `frontend/src/app/dashboard/page.tsx`

**Acceptance Criteria:**
- Loads actions from API
- Falls back to localStorage
- Shows loading state
- Handles errors
- Auto-refreshes after changes

**Labels:** integration,frontend

---

## Integration: Connect delete functionality to backend

Wire up delete action to backend:

- Call DELETE /api/action/:id
- Show confirmation dialog
- Handle loading states
- Remove from localStorage after successful deletion
- Refresh dashboard
- Handle errors (403, 404, etc.)

Edit: `frontend/src/components/dashboard/ActionCard.tsx`

**Acceptance Criteria:**
- Confirmation dialog shows
- Calls DELETE endpoint
- Removes from UI on success
- Handles permission errors
- Updates localStorage

**Labels:** integration,frontend

---

# Testing & Documentation

## Testing: Add E2E tests for creation flow

Add end-to-end tests for action creation:

**Test cases:**
- Create action with minimum fields
- Create action with all fields
- Form validation works
- Backend API accepts submission
- Success page displays correctly
- Action is accessible after creation
- QR code generates
- Copy buttons work

Use: Playwright or similar

Create: `frontend/e2e/create-action.spec.ts`

**Acceptance Criteria:**
- All test cases pass
- Tests run in CI/CD
- Coverage for critical paths

**Labels:** testing,e2e

---

## Testing: Add E2E tests for dashboard flow

Add end-to-end tests for dashboard functionality:

**Test cases:**
- Dashboard loads with actions
- Empty state displays correctly
- Edit button navigates correctly
- Delete removes action
- Delete confirmation works
- Share buttons work
- Actions persist across reloads

Use: Playwright or similar

Create: `frontend/e2e/dashboard.spec.ts`

**Acceptance Criteria:**
- All test cases pass
- Tests run in CI/CD
- Coverage for dashboard features

**Labels:** testing,e2e

---

## Documentation: Update docs for action creation

Update documentation to cover action creation:

**Add sections:**
- How to create a Blinch action
- Step-by-step guide with screenshots
- Action parameters reference
- Dashboard usage guide
- Sharing and embedding actions
- FAQ for creators

Edit: `frontend/src/app/docs/page.tsx`

**Acceptance Criteria:**
- Clear step-by-step instructions
- Screenshots or diagrams
- Covers all features
- FAQ section
- Links to relevant API docs

**Labels:** documentation
