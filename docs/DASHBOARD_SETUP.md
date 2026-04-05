# 🚀 VOLTA Dashboard - Setup & Access

## ✅ Server Status

```
Status:   🟢 RUNNING
Service:  VOLTA API v0.1.0
Host:     0.0.0.0
Port:     8000
URL:      http://localhost:8000
```

---

## 🌐 Available Endpoints

### 1. **API Health Check**
```
GET http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "VOLTA API",
  "version": "0.1.0"
}
```

### 2. **API Root / Project Info**
```
GET http://localhost:8000/
```

Response:
```json
{
  "name": "VOLTA",
  "tagline": "CrossFit Performance Intelligence",
  "mission": "Prevent athlete injuries through early detection and dynamic training adjustments",
  "components": {
    "stress_engine": "Real-time workload analysis (ACWR)",
    "vision_processing": "WOD photo understanding with Claude Vision",
    "recommendations": "Dynamic training adjustments based on athlete state",
    "menstrual_periodization": "Automatic hormonal cycle adjustments",
    "prisma": "Optional VO2Max validation (Burpees or 4-test battery)"
  }
}
```

### 3. **Athlete Dashboard (Carlos Simulation)**
```
GET http://localhost:8000/dashboard
```

**Opens**: Beautiful HTML dashboard showing:
- 📊 Weekly training overview (Mon-Fri)
- ⚙️ Stress Engine analysis (ACWR 1.205)
- 💤 Recovery quality tracking
- 🎯 10 Dimensions radar chart
- 🟡 Yellow Day recommendation for next Monday
- 📈 All calculations and data visualization

---

## 📊 Dashboard Features

### Header Section
```
Name:       Carlos Hernández
Age:        28 years old
Weight:     82 kg
Height:     180 cm

Quick Stats:
├─ ACWR: 1.205 (Optimal, approaching caution)
├─ Recovery: 0.51 (Mediocre)
└─ Overall Score: 6.7/10
```

### Weekly Breakdown
```
Monday    | Torque Engine (For Time)     | 7.8k IMR  | 0.55 ⚠️ Fair
Tuesday   | Grip Burner (EMOM)           | 0.7k IMR  | 0.57 ⚠️ Fair
Wednesday | Push Capacity (AMRAP) 🔴     | 11.8k IMR | 0.33 🔴 Poor
Thursday  | Engine Builder (DNF)         | 0.9k IMR  | 0.45 🔴 Poor
Friday    | Full Send Friday             | 3.9k IMR  | 0.65 ✅ Good
```

### Stress Engine Analysis
```
ACWR Calculation:
├─ 7-Day Workload:    25,116 IMR
├─ 28-Day Baseline:   21,500 IMR
├─ ACWR Ratio:        1.205
├─ Status:            ⚠️ OPTIMAL (approaching caution at 1.3)
└─ Injury Risk:       2x normal baseline

Zone Status:
├─ Green (0.8-1.3):   ✅ Optimal
├─ Yellow (1.3-1.5):  ⚠️ Caution (start here)
├─ Red (>1.5):        🔴 Danger (Carlos: 2x risk)
└─ Current:           1.205 (Safe but monitor)
```

### Recovery Analysis
```
Sleep Quality by Day:
├─ Monday:    6.5h  (0.65 score) 🟡 Fair
├─ Tuesday:   7.0h  (0.70 score) 🟡 Fair
├─ Wednesday: 6.0h  (0.60 score) 🔴 Poor
├─ Thursday:  5.5h  (0.55 score) 🔴 Poor
└─ Friday:    7.5h  (0.75 score) ✅ Good

Average: 6.5h sleep / 0.51 recovery (MEDIOCRE)
Problem: Recovery score below 0.6 = high fatigue
```

### 10 Dimensions Profile
```
Strengths:             Weak Areas:
├─ 7.8 Muscular       ├─ 5.2 Flexibility
├─ 7.2 Cardio         ├─ 5.9 Agility
└─ 7.0 Power          └─ 5.8 Balance

Overall: 6.7/10 - Well-rounded athlete
```

### Recommendation Section
```
🟡 YELLOW DAY - NEXT MONDAY (March 10)

✅ You CAN train (not a rest day)
❌ But reduce VOLUME by 20%
💪 Keep INTENSITY same
🛌 CRITICAL: Sleep 8 hours Sunday night

If box programs AMRAP:
Scale from:  5 PC @ 75kg, 10 Thrusters @ 60kg, 15 WB @ 9kg
Scale to:    3 PC @ 60kg, 7 Thrusters @ 50kg, 10 WB @ 6kg

Expected outcome:
└─ ACWR drops to 1.14 by Friday (back to OPTIMAL)
```

---

## 📈 How It Works

### IMR Calculation Example (Wednesday AMRAP)

```
Movement          | Stress Coef | Quantity | Calc          | IMR
─────────────────────────────────────────────────────────────────
Handstand PU      | 1.15        | 38 reps  | 1.15 × 80×38  | 3,496
Push-ups          | 0.90        | 70 reps  | 0.90 × 80×70  | 5,040
Wall Balls (9kg)  | 0.80        | 105 reps | 0.80 × 9×105  | 756
                  |             |          | Subtotal      | 9,292
Density (fast)    | 1.10        |          | 213 reps/10m  | ×1.10
AMRAP multiplier  | 1.15        |          | High intensity| ×1.15
                  |             |          | Final IMR     | 11,799 🔴
```

### ACWR Interpretation

```
ACWR = Acute (7-day) / Chronic (28-day)

Carlos:
├─ Last 7 days:   25,116 IMR (HIGH)
├─ Last 28 days:  21,500 IMR (average)
├─ Ratio:         25,116 ÷ 21,500 = 1.205
└─ Meaning:       He trained 20.5% MORE than his average

Safe Zone:  0.8-1.3 ACWR ✅
Risk Zone:  1.3-1.5 ACWR ⚠️  (2x injury risk)
Danger:     >1.5 ACWR 🔴    (4x injury risk)

Action: Yellow Day keeps him in safe zone
```

---

## 🎨 Dashboard Visual Elements

### Color Coding System

```
🟢 Green / ✅
├─ Recovery > 0.65
├─ Sleep > 7 hours
├─ ACWR < 1.2
└─ Status: Optimal, can push

🟡 Yellow / ⚠️
├─ Recovery 0.5-0.65
├─ Sleep 6-7 hours
├─ ACWR 1.2-1.3
└─ Status: Fair, monitor

🔴 Red / 🔴
├─ Recovery < 0.5
├─ Sleep < 5.5 hours
├─ ACWR > 1.3
└─ Status: Poor, reduce volume
```

### Progress Bars

```
IMR Distribution (as % of max):

Monday:    ████████░░░░░░░░░░░░░░░ 66%
Tuesday:   █░░░░░░░░░░░░░░░░░░░░░░ 6%
Wednesday: ████████████████████████ 100% 🔴 Peak
Thursday:  █░░░░░░░░░░░░░░░░░░░░░░ 8%
Friday:    ███░░░░░░░░░░░░░░░░░░░░ 33%
```

---

## 🔧 Technical Stack

### Backend
```
Framework:  FastAPI 0.104.1
Server:     Uvicorn
Python:     3.10+
Host:       0.0.0.0:8000
```

### Frontend (Current)
```
Format:     HTML5 + CSS3
Features:   Responsive design, mobile-ready
Colors:     Gradient background, card-based layout
Charts:     ASCII + CSS-based progress bars
```

### Data Format
```
All calculations:  JSON format
API responses:     REST endpoints
Database:          PostgreSQL (Supabase, future)
Real-time:         WebSocket ready (future)
```

---

## 📱 Dashboard Responsiveness

The dashboard is fully responsive:

```
Desktop (>1200px):      2-column grid (charts left, metrics right)
Tablet (768-1200px):    1-column layout, stacked cards
Mobile (<768px):        Full width cards, touch-friendly
```

---

## 🔐 Security Notes

Current MVP:
```
❌ No authentication (development only)
❌ All endpoints public (demo mode)
❌ CORS: allow_origins=["*"] (development)
✅ Ready for auth layer (Phase 2)
```

Production ready:
```
✅ Add JWT authentication
✅ Rate limiting per athlete
✅ HTTPS required
✅ Environment-based CORS
✅ API key for Telegram bot
```

---

## 📊 Next Steps

### Phase 2 (Coming Soon)
- [ ] Database integration (Supabase)
- [ ] Telegram bot endpoints
- [ ] Real training session creation (POST /training/sessions)
- [ ] Athlete dashboard queries (GET /athlete/{id}/metrics)
- [ ] Historical data tracking
- [ ] Alerts system

### Frontend (Next.js)
- [ ] Move dashboard to Next.js
- [ ] Real-time ACWR updates
- [ ] Interactive radar chart
- [ ] Personal records tracking
- [ ] Week-over-week comparisons

### Mobile (Telegram Mini App)
- [ ] Embed dashboard in Telegram
- [ ] Quick entry forms
- [ ] Push notifications
- [ ] WOD suggestions

---

## 🚀 Quick Start Commands

### View API Status
```bash
curl http://localhost:8000/health
```

### View Project Info
```bash
curl http://localhost:8000/ | jq
```

### View Dashboard (in browser)
```
http://localhost:8000/dashboard
```

---

## 📞 Support

**Dashboard Issue?**
- Check browser console (F12)
- Verify server running: `curl http://localhost:8000/health`
- Check FastAPI logs

**Need to restart?**
- Stop current server
- Run: `python -m uvicorn backend.app.main:app --reload --port 8000`

---

**Created**: 2026-03-08
**Server Started**: ✅ Active
**Dashboard Status**: 🟢 Live
**Ready for**: Demo, Testing, Development
