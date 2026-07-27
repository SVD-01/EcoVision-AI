# ECOVISION AI — MASTER PROJECT PROMPT

> **Purpose of this document:** Copy-paste this entire file into any AI chat (ChatGPT, Claude, Gemini, Copilot) when you need to modify, debug, extend, or explain anything about this project. It gives the AI complete context about every file, every route, every schema, every API, and how all three tiers connect.

---

## PROJECT IDENTITY

**Name:** EcoVision AI — AI-Powered Waste Segregation & Circular Economy Platform

**Architecture:** Three-tier monorepo

| Tier | Language | Framework | Port | Folder |
|------|----------|-----------|------|--------|
| Frontend | TypeScript | React 19 + Vite + Tailwind CSS 4 | 5173 (dev) | `src/` |
| Backend | TypeScript | Node.js + Express 5 + MongoDB/Mongoose | 5000 | `server/` |
| AI Engine | Python | FastAPI + YOLOv8 + PyTorch (simulated) | 8000 | `ai-engine/` |

**Design philosophy:** Premium futuristic dark UI inspired by OpenAI, Tesla, Apple Vision Pro, Vercel, Linear, Stripe. Uses glassmorphism, holographic text, animated gradients, glowing borders, particle systems, Three.js 3D Earth, Framer Motion, GSAP, Lenis smooth scrolling.

**Data flow:** Frontend → Backend REST API → AI Engine REST API → returns structured predictions back up the chain. All APIs are mocked/simulated so the entire system works standalone without any external services.

---

## COMPLETE FILE MAP WITH DESCRIPTIONS

### ROOT CONFIGURATION FILES

```
package.json                — Node.js manifest. Scripts: dev, dev:server, dev:all, build, start:prod. Contains all frontend + backend npm dependencies in one file.
tsconfig.json               — TypeScript config. Path alias @/* maps to src/*. Strict mode enabled. Target ES2020.
vite.config.ts              — Vite bundler config. Plugins: react, tailwindcss, viteSingleFile. Alias: @ → src.
index.html                  — HTML entry point. Title "EcoVision AI". Mounts React at #root.
.env                        — Environment variables for backend + frontend. MONGO_URI, JWT_SECRET, PORT, VITE_API_URL, VITE_AI_ENGINE_URL, etc.
.env.example                — Template showing all available env vars with descriptions.
.gitignore                  — Ignores node_modules, __pycache__, .env, dist, uploads, venv.
Dockerfile                  — Multi-stage Docker image. Stage 1 builds frontend with Vite. Stage 2 runs Node.js backend serving dist/ and API.
docker-compose.yml          — Orchestrates 5 services: ecovision-api (port 5000), ecovision-ai-engine (port 8000), mongodb (27017), mongo-express (8081), redis (6379).
scripts/init-mongo.js       — MongoDB initialization script for Docker. Creates collections, indexes, seeds recycling centers and waste categories.
SETUP_GUIDE.md              — Detailed setup instructions with 4 run modes.
FOLLOW_UP_INSTRUCTIONS.txt  — Step-by-step post-download guide covering Node.js install, MongoDB Atlas setup, Python venv, Docker, troubleshooting.
```

---

### FRONTEND — `src/`

#### Entry & Routing

```
src/main.tsx                — React DOM entry. Wraps App in StrictMode.
src/App.tsx                 — Root component. Sets up BrowserRouter, QueryClientProvider (TanStack Query), MotionConfig (Framer Motion), Toaster (Sonner), SmoothScrollProvider (Lenis), CursorGlow, and AppShell. Lazy-loads all 13 page components. Routes:
                               /                    → LandingPage
                               /scanner             → ScannerPage
                               /map                 → RecyclingMapPage
                               /circular-economy    → CircularEducationPage
                               /analytics           → AnalyticsDashboard
                               /ai-ops              → AIOpsPage
                               /gamification        → GamificationPage
                               /profile             → ProfilePage
                               /smart-bin            → SmartBinPage
                               /reports             → ReportsPage
                               /login               → AuthPage mode="login"
                               /register            → AuthPage mode="register"
                               /verify-otp          → AuthPage mode="otp"
                               /forgot-password     → AuthPage mode="forgot"
                               /reset-password      → AuthPage mode="reset"
                               /dashboard           → Redirect to /analytics
                               *                    → NotFoundPage
src/index.css               — Global CSS. Tailwind import. CSS variables for dark/light theme (--background, --foreground, --eco, --cyan, --violet). Custom classes: .glass-panel (glassmorphism), .glow-border, .holographic-text (animated gradient text), .mesh-gradient, .scanner-line (scanning animation), .aurora-ring (rotating conic gradient), .qr-grid, .noise-layer. Keyframes: shimmer, scan, rotate-slow, float, pulse-glow. Prefers-reduced-motion support.
src/vite-env.d.ts           — Vite TypeScript environment declaration (enables import.meta.env).
```

#### Shared Modules — `src/shared/`

```
src/shared/api/types.ts     — TypeScript type definitions for the entire app. Types: WasteType (union of 6 categories), WasteCategory, BoundingBox, ScanResult, RecyclingCenter, AnalyticsPoint, DistributionPoint, AnalyticsSummary, Achievement, Challenge, LeaderboardEntry, GamificationSummary, AssistantMessage.

src/shared/api/mockApi.ts   — Complete mock API layer (no server needed). Exports:
                               wasteCategories (6 items with id, label, tone, description, recommendation, impact)
                               recyclingCenters (4 San Francisco locations with lat/lng, rating, accepted waste types)
                               fetchScanHistory() → returns 3 demo scans
                               scanWaste(fileName) → simulates AI prediction with 1200-1900ms latency, returns ScanResult with bounding boxes, confidence, impact
                               fetchRecyclingCenters() → returns 4 centers
                               fetchAnalytics() → returns AnalyticsSummary with ecoScore, sustainabilityScore, carbonSaved, waterConserved, treesProtected, weekly (7 days), monthly (6 months), distribution (6 categories), timeline (4 activities)
                               fetchGamification() → returns GamificationSummary with points, xp, level, streak, 4 achievements, 3 daily challenges, 2 weekly missions, 4 leaderboard entries
                               askAssistant(messages, language) → returns context-aware AI response based on keywords (battery/compost/default)
                               generateReportText(scan) → returns formatted plain-text report string
                               analyticsSummary (static data object)
                               gamificationSummary (static data object)

src/shared/api/client.ts    — Axios instance configured with baseURL from VITE_API_URL or /mock-api. Request interceptor adds Bearer token from localStorage("ecovision-token").

src/shared/api/aiEngineApi.ts — AI Engine API client. Tries to fetch from VITE_AI_ENGINE_URL (FastAPI on port 8000). Falls back to local simulation that generates: SystemHealth (GPU/CPU/memory/storage telemetry), TrainingEpoch (100 epochs of loss/accuracy/mAP), ConfusionMatrixData (6x6 matrix), ModelVersion (4 versions), DeploymentRecord, AIAlert, InferenceAnalytics (24h throughput, confidence distribution, drift detection). Exports fetchAIOpsDashboard().

src/shared/components/ui.tsx — Reusable UI component library:
                               Button (variants: primary/secondary/ghost/danger, loading state with Loader2 spinner)
                               GlassPanel (glassmorphism container with backdrop-blur)
                               Section (content section with optional eyebrow/title/description, Framer Motion reveal animation)
                               PageHeader (page-level header with label/title/description/actions)
                               MetricTile (KPI card with icon/label/value/detail inside GlassPanel)
                               ProgressRing (SVG circular progress indicator with gradient stroke)
                               ConfidenceMeter (horizontal progress bar with label and percentage)
                               Skeleton (pulse animation placeholder)
                               EmptyState (dashed border container with title/description/action)
                               TextInput (forwardRef input with glass styling, focus ring, accessible)

src/shared/components/layout.tsx — App shell and navigation:
                               Navigation — Fixed top header with logo, 7 nav links (Scanner, Centers, Analytics, AI Ops, Circularity, Rewards, Smart Bin), theme toggle (Moon/Sun), profile link, Launch button. Mobile hamburger menu with slide-down panel.
                               Footer — 3-column footer with logo, Platform links, Enterprise links, copyright.
                               AppShell — Wraps Navigation + main + Footer. noise-layer background.

src/shared/components/effects.tsx — Visual effects and animations:
                               SmoothScrollProvider — Initializes Lenis smooth scrolling on mount.
                               CursorGlow — Follows mouse pointer with a 256px blurred emerald circle (desktop only).
                               ParticleField — Renders N floating cyan dots with randomized positions and float animation.
                               ThreeEarth — Three.js Canvas with: RotatingEarth (teal sphere + wireframe + two orbital torus rings), StarPoints (900 random points), ambient + point lights. Uses @react-three/fiber.
                               FloatingWasteIcons — 6 Lucide icons (Recycle, Leaf, Cpu, BottleWine, BatteryCharging, Trees) floating at fixed positions with Framer Motion animation.
                               LottieOrb — Loads lottie-web animation of a pulsing ring. Fallback: CSS aurora ring with nested circles.
                               HolographicGrid — CSS perspective-transformed grid lines at bottom of sections.
                               useGsapReveal(selector) — GSAP hook that fades in elements matching selector with blur and stagger.
                               ConfettiBurst — react-confetti wrapper, renders 180 pieces when active=true.

src/shared/components/charts.tsx — Recharts wrapper components:
                               ChartFrame — GlassPanel container with title and optional action slot, fixed 288px height.
                               AreaTrend — Area chart with emerald gradient fill. Configurable dataKey. Grid, tooltip, axes.
                               BarTrend — Bar chart with cyan fill and rounded tops.
                               LineTrend — Line chart with violet stroke and dot markers.
                               WastePie — Donut pie chart with category colors, inner/outer radius, padding angle.
                               All share consistent tooltip styling (dark glass background).

src/shared/stores/themeStore.ts — Zustand store with persist middleware. State: dark (boolean), toggleTheme(), setDark(). Persisted to localStorage key "ecovision-theme".

src/shared/stores/authStore.ts — Zustand store with persist middleware. State: token (string|null), user (EcoUser: name, email, role, avatar, city). Actions: login(email, name), logout(), updateUser(partial). Default user: Alex Rivera, alex@ecovision.ai, Sustainability Lead, San Francisco. Persisted to "ecovision-auth".

src/shared/stores/ecoStore.ts — Zustand store with persist middleware. State: scanHistory (ScanResult[]), completedChallenges (string[]). Actions: addScan(scan), completeChallenge(id), clearHistory(). Keeps max 20 scans. Persisted to "ecovision-activity".

src/shared/hooks/useCountUp.ts — Custom hook. Animates a number from 0 to target over duration (default 1400ms) using requestAnimationFrame with cubic ease-out.

src/utils/cn.ts             — Utility function combining clsx and tailwind-merge for conditional className composition.
```

#### Feature Pages — `src/features/`

```
src/features/landing/pages/LandingPage.tsx
    Sections: Hero (ThreeEarth, ParticleField, FloatingWasteIcons, HolographicGrid, aurora ring, LottieOrb, holographic-text heading, two CTA buttons), Counter strip (4 animated counters: Eco points, CO2 saved, AI confidence, Centers), Workflow (4-step AI pipeline: Capture→Classify→Route→Measure with GSAP reveal), ScannerPreview (mock scanner viewport with scanning animation, bounding box overlay, confidence meter, prediction card, recommendations), CircularVisualization (animated circular diagram with 5 lifecycle nodes + 6 waste category cards), AnalyticsPreview (AreaTrend carbon chart + WastePie distribution), CTA banner (JWT-ready secure workflows badge), TestimonialsFaq (3 testimonials + 3 FAQ items).

src/features/scanner/pages/ScannerPage.tsx
    Uses react-dropzone for drag-and-drop image upload (8MB limit, image/* filter). react-webcam for live camera with environment-facing constraint. useMutation (TanStack Query) calling scanWaste. useQuery for fetchScanHistory. Shows: upload zone with preview image, scanner-line animation during processing, BoundingBoxes overlay on detected image, result card with category/confidence/ConfidenceMeter/MetricTiles (carbon/water/points)/recommendations list/environmental impact. Camera mode with capture button. Scan history list with click-to-view. Download report as .txt file. Empty states and skeleton loaders.

src/features/maps/pages/RecyclingMapPage.tsx
    Two-column layout: left panel with search input (TextInput), waste type filter buttons (6 categories, toggle selection), filtered center list with name/address/distance/rating/accepted types/open status. Right panel: if VITE_GOOGLE_MAPS_API_KEY exists → GoogleMap with MarkerF for user position and centers, InfoWindowF popup with route link. Otherwise → FallbackMap: CSS grid background, animated recycling markers at fixed positions, selected center details with Google Maps navigation link. Uses @react-google-maps/api with useJsApiLoader.

src/features/analytics/pages/AnalyticsDashboard.tsx
    Uses fetchAnalytics via useQuery. Shows: 4 MetricTiles (Eco Score, Sustainability Score, Carbon Saved, Water Conserved), 2 ProgressRings side-by-side (Eco Score behavior quality + Sustainability resource efficiency), Monthly carbon AreaTrend chart, 3 charts row (WastePie distribution, BarTrend weekly scans, LineTrend eco points), Weekly water AreaTrend + Activity timeline (4 events with timeline dots), 3 bottom MetricTiles (Trees Protected, Landfill Diversion, Active Scanners). Skeleton loader grid during loading.

src/features/ai-ops/pages/AIOpsPage.tsx
    Uses fetchAIOpsDashboard via useQuery with 30s refetch. 7 visual sections:
    Row 1: 5 MetricTiles (System Status with uptime, Model Accuracy with mAP, Predictions Today with avg confidence, Avg Latency with API requests, Drift Score with status badge).
    Row 2: Active model card (6 metric boxes: accuracy/precision/recall/F1/mAP50/mAP50-95, parameters/FLOPs/weights) + Hardware telemetry panel (GPU bar with VRAM and temperature, CPU bar, Memory bar with GB, Storage bar).
    Row 3: Training/validation loss or accuracy/mAP toggle LineChart (100 epochs, 2 series per view) + Confusion matrix heatmap table (6x6 grid with color-coded cells, intensity based on value/max).
    Row 4: 24h prediction throughput BarChart + Confidence distribution histogram BarChart.
    Row 5: Category distribution PieChart with legend + Error analysis panel (FP rate, FN rate progress bars, drift score with badge) + API performance panel (per-endpoint latency/p99/requests/error-rate cards).
    Row 6: Model registry (4 versioned models with status badges, accuracy/mAP/F1/weights grid, notes) + Deployment history timeline (deploy/rollback/retire actions with timestamps) + Dataset versions (3 versions with sample counts, verification badges).
    Row 7: System alerts (severity-colored cards with resolution status) + Service health (5 service monitors: api_server, model_server, mongodb, redis, task_worker) + Inference queue metrics + Storage breakdown.

src/features/gamification/pages/GamificationPage.tsx
    Uses fetchGamification via useQuery. Shows: 4 MetricTiles (Eco Points, XP, Level, Streak), Level card with Shield icon and ProgressRing showing XP progress, Achievements grid (4 badges with progress bars, unlocked/locked states), Daily challenges (3 items with ChallengeRow component, progress bar, claim button), Weekly missions (2 items), Global leaderboard (4 entries with rank/name/city/points), Rewards vault (4 items with point costs). ConfettiBurst triggers when claiming a challenge. Uses completeChallenge from ecoStore and toast notifications.

src/features/circular/pages/CircularEducationPage.tsx
    Three sections: Animated lifecycle diagram (5 nodes: Design/Consume/Detect/Recover/Regenerate positioned on a circle with RotateCcw center icon, hover scale animation) + lifecycle detail cards. Recycling guides panel (6 category cards with gradient tone bars, recommendations, impact text). Quiz panel (3 multiple-choice questions with answer validation, CheckCircle2/XCircle feedback, ProgressRing, score counter, reset button, 80 Eco Points reward message).

src/features/profile/pages/ProfilePage.tsx
    Two-column layout. Left: Avatar display (image or UserRound placeholder) with camera upload button (file input), user name/role/email/city. Achievements list (3 badges). Right: 3 MetricTiles (Carbon Saved, Water Conserved, Eco Points computed from scanHistory). Settings form (name/city TextInputs, 4 notification toggle switches with animated pill). Save button calling updateUser from authStore. Scan history list (last 6 scans with category/date/points). Reports section (3 download buttons: Monthly ESG, Contamination, Impact summary). Download generates text file from generateReportText.

src/features/auth/pages/AuthPages.tsx
    Single component handling 5 auth modes via mode prop: login, register, otp, forgot, reset. Each mode has: Zod schema (loginSchema requires email+password 8chars, registerSchema adds name+confirm with refine match, otpSchema requires 6-digit code, forgotSchema requires email, resetSchema requires password+confirm match). React Hook Form with zodResolver. Animated form with ParticleField background, mesh-gradient overlay. Logo + heading + subtitle per mode. Form fields conditionally rendered per mode. Submit handler: login/register calls useAuthStore.login and navigates to /profile. OTP/forgot/reset show success toast and navigate. Links between auth pages. Error messages per field.

src/features/assistant/components/AiAssistant.tsx
    Floating action button (bottom-right, emerald with glow-border). Toggles chat panel (420px wide, 640px tall GlassPanel). Header with Bot icon and title. Language selector (English, Spanish ready, French ready). Message list with user/assistant bubbles (ReactMarkdown rendering). Typing indicator during mutation. Quick prompt buttons ("How do I recycle a battery?", "Create a compost guide", "Explain my Eco Score"). Text input with send button. Voice input via SpeechRecognition API (if browser supports). Uses askAssistant from mockApi via useMutation.

src/features/smart-bin/pages/SmartBinPage.tsx
    Two-column layout. Left: QR pairing panel with QR grid pattern (CSS background-image), simulate pairing toggle button, Radio icon. Right: 3 MetricTiles (Connected Bins 42, Events Today 1284, Alerts 7). Live bin status panel (3 bins: Organics 64%, Recycling 42%, E-Waste 18% with fill bars and ProgressRings). Latest smart-bin events feed (4 items with CheckCircle2 or Trash2 icons for accepted/rejected events).

src/features/reports/pages/ReportsPage.tsx
    PageHeader with download button. 3 MetricTiles (Audit Readiness 96%, Reports Generated 184, Next Export 4 days). Two-column: Report library (3 items: Monthly ESG Summary, Waste Distribution Audit, AI Scanner Activity with download handlers). Scanner-linked reports panel (shows scans from ecoStore or EmptyState). All downloads generate text files from generateReportText or analyticsSummary data.

src/features/errors/NotFoundPage.tsx
    Centered GlassPanel with SearchX icon, "Page not found" heading, description text, "Return home" button linking to /.
```

---

### BACKEND — `server/`

#### Configuration

```
server/config/env.ts        — Loads dotenv. Exports env object with 35+ config values: NODE_ENV, PORT, API_PREFIX, CLIENT_URL, MONGO_URI, REDIS_URL, JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN, COOKIE_SECRET, BCRYPT_SALT_ROUNDS, RATE_LIMIT_*, STORAGE_PROVIDER, CLOUDINARY_*, AWS_*, SMTP_*, EMAIL_FROM, OPENAI_API_KEY, GEMINI_API_KEY.

server/config/db.ts         — connectDB() with retry logic (5 retries, 3s delay). Mongoose strictQuery=true (prevents injection). Connection event listeners for disconnected/reconnected. Falls back gracefully if MongoDB unreachable.

server/config/logger.ts     — Winston logger with 5 levels (error/warn/info/http/debug). Colorized console output with timestamp format. Morgan stream integration. Debug level in development, info in production.

server/config/redis.ts      — MemoryCache class simulating Redis. Methods: get(key), set(key, value, mode, durationSeconds), del(key), flushall(). TTL-based expiration. Used as fallback when Redis unavailable.

server/config/swagger.ts    — swagger-jsdoc configuration. OpenAPI 3.0.3 spec. Title "EcoVision AI Enterprise API". Bearer JWT security scheme. API docs served at /api/docs.
```

#### Constants

```
server/constants/index.ts   — Enums: UserRole (SUPER_ADMIN, FACILITY_MANAGER, SUSTAINABILITY_LEAD, OPERATOR, STUDENT, CITIZEN), Permission (MANAGE_USERS, VIEW_ANALYTICS, PERFORM_SCAN, MANAGE_CENTERS, MANAGE_SMART_BINS, EXPORT_REPORTS, MANAGE_AI_MODELS, VIEW_AUDIT_LOGS), ROLE_PERMISSIONS mapping, WasteTypeEnum (plastic, paper, organic, metal, glass, e-waste), SocketEvent (CONNECT, DISCONNECT, JOIN_ROOM, LEAVE_ROOM, SCAN_COMPLETED, BIN_TELEMETRY_UPDATE, LEADERBOARD_UPDATE, CONTAMINATION_ALERT, NOTIFICATION_RECEIVED), ErrorCode (VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, INTERNAL_ERROR, RATE_LIMIT_EXCEEDED, MONGO_ERROR, AI_SERVICE_ERROR).
```

#### Models (25 Mongoose Schemas)

```
server/models/user.model.ts
    RoleModel — name (UserRole enum, unique), description, permissions array.
    PermissionModel — code (Permission enum, unique), module, description.
    SessionModel — userId (ref User, indexed), refreshToken (unique), ipAddress, userAgent, isValid, expiresAt (TTL index).
    UserModel — name, email (unique, lowercase, indexed), password (select:false), role (UserRole, indexed), city, avatar, ecoPoints (indexed descending), xp, level, streak, lastActiveDate, isVerified, otpCode (select:false), otpExpires (select:false), resetPasswordToken (select:false), resetPasswordExpires (select:false), preferences {scans, challenges, reports, voice}.

server/models/waste.model.ts
    WasteCategoryModel — id (WasteTypeEnum, unique), label, tone, description, recommendation, impact, streamColor, recyclable, compostable, hazardous.
    AIPredictionModel — scanId (ref ScanHistory, indexed), modelName, modelVersion, rawResponse (Mixed), predictedCategory (indexed), confidence, boundingBoxes array, processingTimeMs.
    ScanHistoryModel — userId (ref User, indexed), fileName, fileUrl, category {id, label, description, recommendation, impact, tone}, confidence, boundingBoxes array, recommendations array, impact {carbonKg, waterLiters, trees, points}, source (upload/webcam/smart_bin/edge), location {lat, lng, building}. Index: createdAt descending.
    AIModelModel — name (unique), version, framework, accuracy, status (active/staging/archived, indexed), endpointUrl, weightsUrl, parametersCount.
    DatasetVersionModel — versionCode (unique), description, sampleCount, categoriesCount (Mixed), s3BucketPath, isVerified.

server/models/gamification.model.ts
    AchievementModel — id (unique), name, description, icon, goal, category, rewardPoints.
    RewardModel — title, description, pointsCost (indexed), category, stock, isAvailable, codePrefix.
    DailyChallengeModel — id (unique), title, reward, goal, type (daily/weekly, indexed), expiresAt, active.
    LeaderboardModel — period (daily/weekly/monthly/all_time, indexed), rankings array [{rank, userId (ref User), name, city, points}], calculatedAt.

server/models/facility.model.ts
    RecyclingCenterModel — id (unique), name (indexed), lat, lng, location {type: Point, coordinates [lng,lat]} (2dsphere index), address, distanceKm, rating, openNow, accepted array, contactPhone, contactEmail.
    SmartBinModel — binCode (unique), name, building, floor, acceptedStream (WasteTypeEnum), fillLevel (0-100), status, batteryPercentage, lastEmptiedAt, location (2dsphere).
    QRCodeModel — code (unique), binId (ref SmartBin, indexed), targetStream, rewardMultiplier, isActive, scanCount.

server/models/analytics.model.ts
    ReportModel — title, type (Executive/Operations/Model QA/Contamination/Impact Summary, indexed), date, generatedBy (ref User), fileUrl, metrics {totalScans, carbonSavedKg, waterConservedL, treesProtected, ecoScoreAverage}, status (ready/generating/failed).
    EnvironmentalStatModel — periodLabel (indexed), scans, carbonKg, waterLiters, pointsAwarded, distribution (Mixed), date (indexed).
    CarbonRecordModel — userId (ref User, indexed), scanId (ref ScanHistory), materialType, weightGrams, carbonAvoidedKg, calculationMethod.

server/models/content.model.ts
    NotificationModel — userId (ref User, indexed, null for broadcast), title, message, type (alert/reward/challenge/system), isRead, actionUrl.
    ArticleModel — title, slug (unique), content, category, author, published, views.
    FAQModel — question, answer, category, order.
    FeedbackModel — userId (ref User), category, message, rating (1-5), status (open/reviewed/resolved).
    ChatHistoryModel — userId (ref User, indexed), sessionId (indexed), role (user/assistant), content, language, metadata (Mixed).

server/models/system.model.ts
    APILogModel — method, path, statusCode, responseTimeMs, ipAddress, userAgent, userId (ref User). TTL index: 30 days.
    AuditLogModel — action (indexed), module (indexed), performedBy (ref User), targetId, details (Mixed), ipAddress.

server/models/index.ts      — Re-exports all models from all model files.
```

#### Repositories (Data Access Layer)

```
server/repositories/baseRepository.ts
    Generic BaseRepository<T> class. Methods: findById (with Redis cache, 5min TTL), findOne, find (with sort/skip/limit/populate), count, create, updateById (invalidates cache), deleteById (invalidates cache), aggregate. Cache prefix per model.

server/repositories/index.ts
    UserRepository extends BaseRepository — findByEmail (includes +password), getTopScorers (sorted by ecoPoints descending).
    ScanRepository extends BaseRepository — getRecentScans (filtered by userId, sorted by createdAt descending).
    CenterRepository extends BaseRepository — findNearby (MongoDB $near with $geometry Point, $maxDistance in meters).
    Singleton instances exported: userRepo, scanRepo, centerRepo, aiPredictionRepo, smartBinRepo, leaderboardRepo, reportRepo, auditRepo, chatRepo.
```

#### Services (Business Logic)

```
server/services/authService.ts
    AuthService class. Methods:
    register(data) — checks email uniqueness, bcrypt hash password, creates user with welcome bonus (100 points, 50 XP), generates JWT tokens, stores session.
    login(email, password) — finds user with +password select, bcrypt compare, updates streak (increment if last active yesterday, reset if gap > 1 day), generates tokens.
    verifyOtp(email, otp) — validates 6-digit code (mock accepts "123456"), sets isVerified=true.
    refreshToken(refreshToken, ip) — jwt.verify with REFRESH_TOKEN_SECRET, finds valid session, rotates refresh token.
    logout(refreshToken) — deletes session from SessionModel.
    generateTokens(user, ip) — creates access token (15min, contains userId/email/role) and refresh token (7d, contains userId), stores session in MongoDB.
    sanitizeUser(user) — removes password, otpCode, resetPasswordToken from response.

server/services/aiCommunicationService.ts
    AICommunicationService class. Methods:
    analyzeImage(fileName, mimeType, fileBuffer) — First tries Python AI Engine via axios POST to AI_ENGINE_URL/api/v1/predict/analyze (5s timeout). If AI Engine responds, maps response to VisionPredictionResult. If fails, falls back to OpenAI Vision API readiness check. Final fallback: local neural vision simulation with inferCategoryFromName (keyword matching: plastic/bottle→plastic, paper/cardboard→paper, etc.) and getCategoryMetadata (returns label, recommendations, impact factors per category).
    generateChatResponse(messages, language) — keyword-based response routing (battery→e-waste safety guide, compost→organics guide, plastic→plastic stream guide, default→general assistant capabilities).

server/services/scanService.ts
    ScanService class. processScan(data) — 7-step pipeline:
    1. Calls aiCommunicationService.analyzeImage
    2. Creates ScanHistory document in MongoDB
    3. Creates AIPrediction audit record
    4. Creates CarbonRecord (EPA-WARM method)
    5. Updates user ecoPoints and XP (with level-up check at level*500 threshold)
    6. Upserts EnvironmentalStat for current day (increments scans, carbon, water, points, distribution)
    7. Emits Socket.IO SCAN_COMPLETED event to all clients.
    getHistory(userId, limit) — delegates to scanRepo.getRecentScans.
    getScanById(id) — delegates to scanRepo.findById.

server/services/analyticsService.ts
    AnalyticsService class. getDashboardSummary() — MongoDB aggregate pipeline: groups all ScanHistory for total scans/carbon/water/trees, groups by category.id for distribution, queries EnvironmentalStat for weekly data. Returns complete AnalyticsSummary matching frontend type. Falls back to hardcoded data if no documents exist.

server/services/gamificationService.ts
    GamificationService class.
    getSummary(userId) — queries user for points/xp/level/streak, queries AchievementModel, DailyChallengeModel, top scorers via userRepo.getTopScorers(4). Falls back to mock data if collections empty.
    completeChallenge(userId, challengeId) — finds challenge, adds reward to user.ecoPoints and xp*2, emits LEADERBOARD_UPDATE via Socket.IO.

server/services/facilityService.ts
    FacilityService class.
    getRecyclingCenters(lat, lng, maxDistanceKm) — tries geospatial $near query, falls back to all centers, falls back to hardcoded 4 centers.
    getSmartBins(building) — queries by building filter, falls back to 3 default bins.
    updateBinTelemetry(binCode, fillLevel, batteryPercentage) — updates bin document, sets status (full>85, alert>70, healthy), emits BIN_TELEMETRY_UPDATE via Socket.IO.

server/services/reportService.ts
    ReportService class.
    getReports(limit) — queries ReportModel sorted by createdAt, falls back to 3 mock reports.
    generateESGReport(title, type, userId) — aggregates ScanHistory totals, creates Report document with metrics.

server/services/index.ts     — Re-exports all services.
```

#### Middleware

```
server/middleware/auth.ts
    authenticate — extracts Bearer token from Authorization header. jwt.verify with JWT_SECRET. Accepts "mock-jwt-session" token (returns default user). Attaches user, userId, userRole to request.
    optionalAuthenticate — sets optionalAuth flag, calls authenticate (allows anonymous if no token).
    authorizeRoles(...roles) — checks req.userRole against allowed roles, returns 403 if not included.
    authorizePermissions(...permissions) — checks role's permissions via ROLE_PERMISSIONS mapping, returns 403 if missing.

server/middleware/security.ts
    securityHeaders — Helmet with CSP disabled (for Swagger/Vite compatibility).
    corsMiddleware — CORS allowing all origins, all methods, credentials.
    apiRateLimiter — express-rate-limit: 500 requests per 15 minutes per IP.
    authRateLimiter — 30 auth attempts per 15 minutes.
    sanitizeInput — strips keys starting with $ or containing . (NoSQL injection prevention), strips <script> tags (XSS prevention). Applied to body, query, params.

server/middleware/errorHandler.ts
    OperationalError class — extends Error with status and code properties.
    errorHandler — Express error middleware. Logs 500+ with Winston error, 400+ with warn. Creates APILog document. Returns JSON {success, code, message, stack (dev only)}.
    notFoundHandler — Returns 404 JSON for unmatched routes.

server/middleware/upload.ts
    uploadImage — Multer instance with memoryStorage (buffer available for AI processing). fileFilter accepts jpeg/jpg/png/webp/heic. 10MB size limit. Creates server/uploads/temp/ directory if missing.

server/middleware/audit.ts
    auditLogger(moduleName, actionName) — wraps res.send, creates AuditLog document on successful responses (2xx) with method, url, query, body.
    apiRequestLogger — records response time on res "finish" event, creates APILog document with method, path, statusCode, responseTimeMs, ipAddress, userAgent, userId.

server/middleware/index.ts   — Re-exports all middleware.
```

#### Controllers

```
server/controllers/authController.ts
    AuthController: register (calls authService.register, sends welcome email async), login, verifyOtp, refreshToken, logout.
    UserController: getProfile (returns user + gamification summary), updateProfile (updates name/city/avatar/preferences), getLeaderboard.

server/controllers/scanController.ts
    ScanController: uploadScan (accepts Multer file, calls scanService.processScan), liveCameraFrame (scan from webcam source), getHistory, getScanById, downloadReport (generates and sends text file with Content-Disposition header).
    AnalyticsController: getDashboardSummary.

server/controllers/gamificationController.ts
    GamificationController: getSummary, completeChallenge.
    FacilityController: getCenters (with lat/lng/radius query params), getSmartBins (with building filter), updateBinTelemetry.

server/controllers/otherControllers.ts
    ChatController: askAssistant (calls aiCommunicationService.generateChatResponse).
    ReportController: getReports, generateReport.
    AdminController: getSystemMetrics (AI models count, datasets count, recent API logs), getAuditLogs (last 50).

server/controllers/index.ts  — Re-exports all controller instances.
```

#### Routes

```
server/routes/auth.routes.ts
    authRouter: POST /register (authRateLimiter + registerValidation), POST /login (authRateLimiter + loginValidation), POST /verify-otp, POST /refresh-token, POST /logout.
    userRouter: GET /profile (authenticate), PATCH /profile (authenticate), GET /leaderboard (public).

server/routes/scan.routes.ts
    scanRouter: POST /upload (optionalAuthenticate + uploadImage.single("image") + auditLogger), POST /live (optionalAuthenticate + auditLogger), GET /history (optionalAuthenticate), GET /:id, GET /:id/report.
    analyticsRouter: GET /summary.

server/routes/facility.routes.ts
    gamificationRouter: GET /summary (optionalAuthenticate), POST /complete-challenge (optionalAuthenticate).
    facilityRouter: GET /centers, GET /smart-bins, POST /smart-bins/telemetry (telemetryValidation).
    chatRouter: POST / (optionalAuthenticate).
    reportRouter: GET /, POST /generate (optionalAuthenticate).
    adminRouter: uses authenticate + authorizeRoles(SUPER_ADMIN, FACILITY_MANAGER). GET /metrics, GET /audit-logs.

server/routes/index.ts       — Mounts all routers under apiRouter. Health endpoints: GET /health (returns status, DB state, memory), GET /ready (returns "READY").
```

#### Validations

```
server/validations/index.ts  — Express-validator chains:
    validate — middleware that checks validationResult, returns 400 with field errors.
    registerValidation — name (2-100 chars), email (valid, normalized), password (optional, min 8).
    loginValidation — email (valid), password (optional string).
    otpValidation — email (valid), otp (exactly 6 chars).
    scanValidation — fileName (optional string), source (upload/webcam/smart_bin/edge), lat/lng (float ranges).
    centerGeoValidation — lat/lng (query params, float ranges), radius (1-100 km).
    telemetryValidation — binCode (required string), fillLevel (0-100 int), batteryPercentage (optional 0-100).
```

#### Other Backend Files

```
server/sockets/index.ts     — SocketServer class. init(httpServer) creates Socket.IO server with CORS. Auth middleware accepts JWT or "mock-jwt-session". On connect: joins user:{userId} room and "global" room. Handles join_room, leave_room, disconnect events. Methods: emitToAll, emitToUser, emitToRoom.

server/jobs/cron.ts          — CronJobScheduler class. init() schedules 3 cron jobs:
    "0 0 * * *" — Reset daily challenges (set active=true).
    "0 * * * *" — Recalculate leaderboard from top 50 users, emit LEADERBOARD_UPDATE.
    "0 3 * * 0" — Clean expired sessions and API logs older than 30 days.

server/utils/helpers.ts      — EmailService class: sendEmail (Nodemailer transporter, mock mode logs to console), sendWelcomeEmail (HTML template). calculateGeoDistanceKm (Haversine formula).

server/docs/swaggerSpec.ts   — JSDoc comments defining OpenAPI components/schemas for User, ScanResult, SmartBin.

server/app.ts                — createApp() factory: applies security headers, CORS, JSON/URL parsing (10mb limit), sanitizeInput, apiRequestLogger, rate limiter, Swagger UI at /api/docs, mounts apiRouter at API_PREFIX, serves dist/ static files, SPA fallback (sends index.html for non-API routes), notFoundHandler, errorHandler.

server/server.ts             — startServer(): creates HTTP server, initializes Socket.IO, connects MongoDB, starts cron scheduler, listens on PORT. Graceful shutdown on SIGINT/SIGTERM (10s force timeout). Handles unhandledRejection and uncaughtException.

server/index.ts              — Imports and runs server.ts.
```

---

### AI ENGINE — `ai-engine/`

```
ai-engine/config/__init__.py    — Package marker.
ai-engine/config/settings.py    — Pydantic BaseSettings (AIEngineSettings) with 50+ fields: SERVICE_NAME, PORT, HOST, API_KEY, JWT_SECRET, BACKEND_URL, MONGO_URI, REDIS_URL, MODEL_REGISTRY_PATH, ACTIVE_MODEL_NAME/VERSION/FRAMEWORK, CONFIDENCE_THRESHOLD, IOU_THRESHOLD, DATASET_PATH/VERSION/SAMPLES_COUNT, GPU settings, IMAGE settings, TRAINING settings, MONITORING settings. Env prefix "AI_". Also defines WASTE_CATEGORIES dict (6 classes with id/label/color/recyclable/hazardous), IMPACT_FACTORS dict (per-category carbon/water/trees/points), DISPOSAL_RECOMMENDATIONS dict (3 recommendations per category).

ai-engine/models/__init__.py    — Package marker.
ai-engine/models/inference_engine.py
    Dataclasses: BoundingBox, ExplainableAI (activation_regions, feature_importance, grad_cam_available, decision_path, model_attention_score), EnvironmentalImpact (carbon_kg, water_liters, trees, points, energy_kwh, landfill_diverted_kg, calculation_method), PredictionResult (27 fields including all above + prediction_id, model info, confidence, timestamp, recyclable, hazardous, segmentation_mask).
    WasteDetectionEngine class:
    __init__ — initializes model metadata, performance metrics (accuracy 0.942, precision 0.938, recall 0.935, f1 0.936, mAP50 0.951, mAP50-95 0.887), generates 100-epoch training history and 6x6 confusion matrix.
    load_model() — placeholder for YOLO/PyTorch/TF model loading. Sets is_loaded=True.
    predict(image_bytes, filename) — full inference pipeline: preprocessing, neural inference (keyword-based class routing with beta-distribution confidence 72-99%), NMS-filtered bounding box generation (primary + occasional secondary detection), EPA-WARM environmental impact calculation with jitter, explainable AI metadata (Grad-CAM regions, feature importance scores, decision path string, attention score). Updates running metrics (total predictions, avg inference, avg confidence).
    predict_batch(items) — iterates predict() up to BATCH_PREDICTION_MAX.
    get_model_info() — returns model metadata, metrics, architecture stats (85.4M params, 28.6 GFLOPs, 163.2MB weights).
    _run_neural_inference — keyword map from filename to class ID. Beta distribution for realistic confidence.
    _generate_detections — primary bounding box + 35% chance secondary detection.
    _generate_explainable_ai — 2 activation regions, 6 feature importance scores, decision path string.
    _generate_training_history — 100 epochs with exponential decay loss, sigmoid accuracy/mAP convergence, cosine LR schedule, Gaussian noise.
    _generate_confusion_matrix — 6x6 with 180-240 true positives, 0-12 misclassifications.
    Singleton: detection_engine.

ai-engine/models/model_registry.py
    ModelVersion dataclass — version_id, model_name, version, framework, accuracy, mAP50, f1_score, parameters_count, weights_size_mb, status (active/staging/archived/training), deployed_at, training_completed_at, dataset_version, notes.
    DeploymentRecord dataclass — deployment_id, model info, action (deploy/rollback/scale/retire), status, timestamp, deployed_by, notes.
    ModelRegistry class:
    __init__ — seeds 4 model versions (YOLOv8 v2.4.0 active, YOLOv8 v2.3.1 archived, EfficientDet-Lite staging, ResNet50 archived), 4 deployment records, 3 dataset versions (v3.2.0/48500 samples, v3.1.0/42000, v2.8.0/35000).
    get_active_model() — finds status="active".
    get_all_models() — returns all as dicts.
    get_deployment_history() — returns all deployments.
    get_datasets() — returns dataset versions.
    rollback_model(version_id) — deactivates current, activates target, creates deployment record.
    Singleton: model_registry.

ai-engine/models/monitoring.py
    AIMonitor class:
    get_system_health() — returns status, uptime, GPU telemetry (NVIDIA A100 40GB simulated: utilization, VRAM, temperature, power), CPU (16 cores, utilization, load avg), memory (64GB, used/available), storage (500GB, model weights 4.2GB, datasets), inference queue (pending/processing/completed/failed/avg_wait), service health map (api_server/model_server/mongodb/redis/task_worker all UP).
    get_inference_analytics() — 24-hour throughput timeline (hourly predictions with day/night pattern), confidence distribution histogram (10 buckets from 50-100%), category distribution (6 categories with counts and colors), false positive/negative rates, total predictions today, avg confidence, drift score with status (stable/warning), retraining status.
    get_api_performance() — per-endpoint metrics for /predict, /predict/batch, /health, /models/info (avg latency, p99 latency, requests today, error rate).
    get_alerts() — returns 3-4 alerts with severity (info/warning), resolution status.
    log_prediction(prediction_id, category, confidence, latency) — appends to internal log (max 1000).
    get_prediction_log(limit) — returns recent predictions.
    Singleton: ai_monitor.

ai-engine/preprocessing/__init__.py — Package marker.
ai-engine/preprocessing/pipeline.py
    PreprocessedImage dataclass — tensor, original_size, processed_size, scale_factor, pad_x/y, filename.
    ImagePreprocessor class:
    process_bytes(image_bytes, filename) — PIL decode → RGB → letterbox resize (preserves aspect ratio with gray padding) → normalize (ImageNet mean/std) → HWC→CHW transpose → batch dimension.
    augment(image_bytes, augmentations) — applies: flip_h (50%), flip_v (50%), rotate (-15°/+15°), brightness (0.7-1.3), contrast (0.8-1.2).
    _letterbox(image, target_size) — calculates scale, resizes with LANCZOS, pastes onto gray canvas.
    DatasetManager class:
    get_statistics() — returns version, total/train/val/test sample counts, 6 categories, COCO+YOLO annotation format, 9 augmentation types.
    create_train_val_split(ratio) — 70/15/15 split.
    Singletons: preprocessor, dataset_manager.

ai-engine/training/__init__.py — Package marker.
ai-engine/training/trainer.py
    TrainingConfig dataclass — model_name, epochs (100), batch_size (16), learning_rate (0.001), weight_decay, optimizer (AdamW), scheduler (CosineAnnealingLR), warmup_epochs, early_stopping_patience (15), input_size, augmentation, mixed_precision, gradient_accumulation, dataset_version, resume_from.
    TrainingResult dataclass — run_id, model_name, final_accuracy/mAP/f1, best_epoch, total_epochs, training_time_seconds, history list, status.
    ModelTrainer class:
    train() — simulates full training loop with realistic convergence curves, early stopping. Returns TrainingResult with epoch history.
    get_status() — returns is_training, current_epoch, progress, config.
    ModelEvaluator class:
    evaluate(model_version) — returns overall metrics (accuracy/precision/recall/f1/mAP), per-class metrics (6 categories with precision/recall/f1/support), dataset info, inference benchmark (avg/p95/p99 latency, FPS throughput).
    Singletons: trainer, evaluator.

ai-engine/utils/__init__.py — Package marker.
ai-engine/utils/visualization.py
    draw_bounding_boxes(image_bytes, detections) — PIL ImageDraw: draws colored rectangles and label backgrounds per detection.
    generate_gradcam_overlay(image_bytes, activation_regions) — creates radial gradient heatmap overlay using RGBA alpha compositing.
    generate_confusion_matrix_image(matrix, labels) — renders 6x6 color-coded cell grid with category labels.

ai-engine/api/__init__.py    — Package marker.
ai-engine/api/routes.py      — FastAPI routers:
    predict_router (prefix /predict):
      POST /image — UploadFile multipart, returns full PredictionResult with bounding boxes, impact, XAI.
      POST /analyze — JSON body {filename}, returns prediction by filename inference.
      POST /batch — JSON body {items: [{filename}]}, batch inference.
      GET /history — prediction log from ai_monitor.
      GET /categories — WASTE_CATEGORIES dict.
    model_router (prefix /models):
      GET /info — active model details with metrics, params, FLOPs.
      GET /versions — all 4 model versions from registry.
      GET /deployments — deployment history.
      POST /rollback — {version_id}, calls model_registry.rollback_model.
      GET /training-history — 100 epoch array.
      GET /confusion-matrix — 6x6 matrix with labels.
      GET /metrics — accuracy/precision/recall/f1/mAP.
    monitoring_router (prefix /monitoring):
      GET /system-health — full telemetry.
      GET /inference-analytics — throughput, confidence dist, drift.
      GET /api-performance — endpoint metrics.
      GET /alerts — system alerts.
      GET /dashboard-summary — aggregated payload for AI Ops frontend (combines all above + model info + training history + confusion matrix + model versions + deployments + datasets).
    dataset_router (prefix /datasets):
      GET / — dataset versions.
    health_router:
      GET /health — status, service name, version, model_loaded.
      GET /ready — "READY" string.

ai-engine/main.py            — FastAPI app factory. CORS allow all. Mounts all routers under /api/v1. Startup event loads detection_engine model. Root endpoint returns service info. Uvicorn runner with host/port from settings.

ai-engine/Dockerfile          — Python 3.11-slim. Installs OpenCV system deps. Pip installs FastAPI core deps. Exposes 8000. Health check via urllib. CMD: uvicorn with 4 workers.

ai-engine/requirements.txt   — Full production deps: fastapi, uvicorn, torch, torchvision, tensorflow, ultralytics, scikit-learn, opencv-python-headless, Pillow, numpy, pandas, httpx, python-jose, boto3, cloudinary, onnxruntime, celery, redis, motor, pymongo, prometheus-client, structlog, apscheduler, pytest.

ai-engine/.env               — AI engine environment variables with defaults.
```

---

### DEVOPS & CONFIG FILES

```
Dockerfile                  — Multi-stage: builder (npm ci, vite build) → runner (copies dist, node_modules, server, serves on port 5000). Health check via wget.
docker-compose.yml          — 5 services: ecovision-ai-engine (port 8000, GPU reservation), ecovision-api (port 5000), mongodb (port 27017, volume, init script), mongo-express (port 8081), redis (port 6379, volume). Bridge network.
.env                        — 30+ variables for all three services.
.env.example                — Template with descriptions.
.gitignore                  — node_modules, __pycache__, .env, dist, uploads, venv.
scripts/init-mongo.js       — Creates collections, indexes (email unique, ecoPoints descending, 2dsphere, TTL), seeds 4 recycling centers and 6 waste categories.
```

---

## API ENDPOINTS SUMMARY

### Backend (Express, port 5000, prefix /api/v1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /health | No | System health + DB status |
| GET | /ready | No | K8s readiness probe |
| POST | /auth/register | Rate limited | Create account |
| POST | /auth/login | Rate limited | JWT login |
| POST | /auth/verify-otp | Rate limited | OTP verification |
| POST | /auth/refresh-token | No | Rotate tokens |
| POST | /auth/logout | No | Invalidate session |
| GET | /users/profile | JWT | Get user + gamification |
| PATCH | /users/profile | JWT | Update name/city/avatar/prefs |
| GET | /users/leaderboard | No | Top scorers |
| POST | /scans/upload | Optional JWT | Upload image for AI scan |
| POST | /scans/live | Optional JWT | Webcam frame scan |
| GET | /scans/history | Optional JWT | Scan history |
| GET | /scans/:id | No | Single scan |
| GET | /scans/:id/report | No | Download text report |
| GET | /analytics/summary | No | Full dashboard data |
| GET | /gamification/summary | Optional JWT | Points/XP/achievements |
| POST | /gamification/complete-challenge | Optional JWT | Claim reward |
| GET | /facilities/centers | No | Recycling centers (geo) |
| GET | /facilities/smart-bins | No | Smart bin status |
| POST | /facilities/smart-bins/telemetry | Validated | Update bin fill level |
| POST | /chat | Optional JWT | AI assistant |
| GET | /reports | No | Report library |
| POST | /reports/generate | Optional JWT | Create ESG report |
| GET | /admin/metrics | JWT+Role | System metrics |
| GET | /admin/audit-logs | JWT+Role | Audit trail |

### AI Engine (FastAPI, port 8000, prefix /api/v1)

| Method | Path | Purpose |
|--------|------|---------|
| GET | /health | Health check |
| GET | /ready | Readiness probe |
| POST | /predict/image | Upload image prediction |
| POST | /predict/analyze | Filename prediction |
| POST | /predict/batch | Batch inference |
| GET | /predict/history | Prediction log |
| GET | /predict/categories | Waste categories |
| GET | /models/info | Active model details |
| GET | /models/versions | Model registry |
| GET | /models/deployments | Deployment history |
| POST | /models/rollback | Model rollback |
| GET | /models/training-history | Epoch history |
| GET | /models/confusion-matrix | 6x6 matrix |
| GET | /models/metrics | Performance KPIs |
| GET | /monitoring/system-health | GPU/CPU/Memory |
| GET | /monitoring/inference-analytics | Throughput/drift |
| GET | /monitoring/api-performance | Endpoint metrics |
| GET | /monitoring/alerts | System alerts |
| GET | /monitoring/dashboard-summary | Aggregated AI Ops |
| GET | /datasets | Dataset versions |

---

## DATA FLOW

1. User uploads image on /scanner page
2. Frontend calls POST /api/v1/scans/upload (backend)
3. Backend's scanService calls aiCommunicationService.analyzeImage
4. aiCommunicationService tries AI Engine POST /api/v1/predict/analyze (5s timeout)
5. If AI Engine responds: maps prediction back. If not: uses local simulation.
6. scanService saves ScanHistory + AIPrediction + CarbonRecord to MongoDB
7. Updates user ecoPoints/XP/level
8. Updates EnvironmentalStat aggregation
9. Emits Socket.IO "scan_completed" event
10. Returns full scan result to frontend
11. Frontend displays bounding boxes, confidence meter, recommendations, impact metrics

---

## KEY DESIGN DECISIONS

- All services work independently. Frontend works without backend. Backend works without MongoDB or AI Engine. AI Engine works standalone.
- Mock/simulation data is identical in structure to real data, so swapping to real services requires zero frontend changes.
- JWT token "mock-jwt-session" is accepted by backend for development without real auth flow.
- Zustand stores are persisted to localStorage so user state survives page refreshes.
- AI Ops Dashboard auto-refreshes every 30 seconds via TanStack Query refetchInterval.
- The AI Engine's inference_engine uses keyword-based classification from filenames as a deterministic simulation. In production, replace _run_neural_inference with actual YOLO model.forward() call.
- Environment variables use sensible defaults everywhere so the system runs with zero configuration.

---

## HOW TO USE THIS PROMPT

When you start a new chat and need to modify this project:

1. Paste this entire document
2. Then say: "I have the EcoVision AI project described above. I need to [your request]."

Examples:
- "Add a new waste category called 'textile' across all three tiers"
- "Connect the scanner to a real YOLOv8 model file at ai-engine/models/registry/best.pt"
- "Add Google OAuth login to the auth pages"
- "Create a new admin panel page that shows all users"
- "Deploy this to AWS ECS with Terraform"
- "Add unit tests for the backend auth service"
- "Integrate Stripe payments for premium features"
- "Add real-time bin fill level updates via MQTT"
