# VOLTA - Project Structure & MVP Roadmap

## 🎯 Project Overview

**VOLTA**: B (Bolt) + Vector + Cross Training Trainer
- **Mission**: Prevent athlete injuries through early detection and dynamic training adjustments
- **Primary Focus**: Injury prevention (85% protection without PRISMA, 99% with it)
- **Core Technology**: FastAPI + Claude Vision + Telegram Bot + Next.js Dashboard
- **Start Date**: March 2026

---

## 📁 Directory Structure

```
volta/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # Configuration & environment
│   │   ├── models.py               # Database models (SQLAlchemy)
│   │   ├── database.py             # Supabase connection
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── vision_service.py   # Claude Vision integration
│   │   │   ├── stress_engine.py    # ACWR calculations
│   │   │   ├── recommendations.py  # LLM-powered recommendations
│   │   │   ├── menstrual_periodization.py  # Hormonal cycle logic
│   │   │   └── prisma_service.py   # VO2Max validation (Future Phase 2)
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── athletes.py         # Athlete endpoints
│   │   │   ├── training.py         # Training/WOD endpoints
│   │   │   ├── recovery.py         # Recovery data endpoints
│   │   │   └── health.py           # System health
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── athlete.py          # Pydantic models
│   │   │   ├── training.py
│   │   │   └── recovery.py
│   │   │
│   │   ├── data/
│   │   │   ├── movement_mappings.json      # Mayhem scaling + movement coeff
│   │   │   ├── cardio_conversions.json     # Run/Row/Bike equivalences
│   │   │   ├── training_tenets.json        # CompTrain 3 Tenets + 9 Attributes
│   │   │   └── README.md                   # Data sources documentation
│   │   │
│   │   └── bot/
│   │       ├── __init__.py
│   │       ├── telegram_bot.py     # Telegram bot handlers
│   │       └── handlers.py         # Command handlers
│   │
│   ├── migrations/                 # Alembic migrations (Future)
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/                        # Next.js app directory
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── StressEngineChart.tsx
│   │   ├── RadarChart.tsx
│   │   └── RecommendationCard.tsx
│   ├── styles/
│   ├── package.json
│   └── next.config.js
│
├── docs/
│   ├── ARCHITECTURE.md             # System architecture
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md               # Deployment guide
│   ├── Mayhem-Athlete-Scaling-Doc.pdf
│   └── 2025-CompTrain-Methodology.pdf
│
├── migrations/
│   └── 001_initial_schema.sql      # Supabase schema setup
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline
│
├── docker-compose.yml              # Local development
├── .env.example
├── .gitignore
├── PROJECT_STRUCTURE.md            # This file
└── README.md
```

---

## 🚀 MVP Roadmap (8 Weeks)

### **Week 1-2: Foundation & Setup**
- [ ] FastAPI project setup
- [ ] Supabase schema creation
- [ ] Telegram Bot basic structure
- [ ] Authentication flow
- [ ] Environment configuration
- [ ] Database models (Athletes, Sessions, Biometrics)

### **Week 2-3: Data Capture**
- [ ] Recovery data capture (Sueño, Estrés, Dolor)
- [ ] Training session registration (Manual + Photo OCR attempt)
- [ ] Telegram bot commands: `/registrar`, `/entrenar`, `/foto`
- [ ] Data validation and error handling
- [ ] Exercise/movement parsing from text input

### **Week 3-4: Stress Engine**
- [ ] IMR calculation (Intensity Magnitude Rating)
- [ ] ACWR calculation (Acute:Chronic Workload Ratio)
- [ ] Stress zones (Green/Yellow/Red)
- [ ] Menstrual cycle adjustments (automatic multipliers)
- [ ] Historical trend analysis
- [ ] Alert system (when approaching risk zones)

### **Week 4-5: Claude Vision Integration**
- [ ] WOD photo processing with Claude Vision
- [ ] Exercise extraction from whiteboard photos
- [ ] Weight/rep parsing
- [ ] Fallback to manual entry
- [ ] Image quality validation
- [ ] Cost tracking and optimization

### **Week 5-6: Recommendations Engine**
- [ ] Dynamic recommendation generation
- [ ] "Green day" (high intensity) vs "Yellow day" (reduced) logic
- [ ] Movement alternatives for high-risk athletes
- [ ] Explanation generation (why this recommendation)
- [ ] Integration with Stress Engine data

### **Week 6-7: Frontend Dashboard (Next.js)**
- [ ] Basic authentication page
- [ ] Stress Engine visualization (ACWR graph)
- [ ] Personal records tracking
- [ ] 7-day sleep quality chart
- [ ] Recovery status indicator
- [ ] Alert notifications

### **Week 7-8: Polish & Testing**
- [ ] Unit tests for core logic
- [ ] Integration tests (API + Database)
- [ ] Performance optimization
- [ ] Error handling & validation
- [ ] Documentation completion
- [ ] MVP launch with 20 beta users

---

## 📊 Data Sources & Integration

### Extracted from CrossFit Methodology:
- **Mayhem Athlete Scaling Doc**: Movement substitutions + Cardio conversions
- **CompTrain Methodology 2025**: 3 Tenets + 9 Attributes structure
- **Movement Coefficients**: Validated from competitive programming
- **Stress Calculations**: Sport science ACWR standards

### Key JSON Data Files:
1. `movement_mappings.json` - 30+ movements with scaling options
2. `cardio_conversions.json` - Run/Row/Bike/Ski equivalences
3. `training_tenets.json` - CompTrain structure + protocols

---

## 🔌 External Integrations

### Required (MVP):
- **Claude Vision API** - Photo processing ($0.003/image)
- **Telegram Bot API** - User interface
- **Supabase** - Database + Auth
- **Anthropic API** - LLM recommendations

### Optional (Phase 2):
- **Make.com** - Workflow automation (notifications)
- **Stripe** - Payment processing (if monetizing)
- **Sentry** - Error tracking

---

## 💰 Infrastructure Costs (Est. Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| Supabase | $25-50 | Database + Auth |
| Vercel | $0-20 | Frontend hosting |
| Claude Vision | $0-100 | ~2,750 calls/month for 10k users = $0.27/user |
| Telegram | $0 | Free |
| **Total** | **~$50-170** | Scales linearly with users |

---

## 🎯 Success Metrics (MVP Phase)

**Trimestre 1 Goals:**
- ✅ 100 active users (beta athletes)
- ✅ 80% onboarding completion rate
- ✅ NPS > 40
- ✅ 0 system downtime > 5 minutes
- ✅ ACWR detection accuracy > 95%

---

## 📝 Next Immediate Actions

1. **Create requirements.txt** - Python dependencies
2. **Setup Supabase schema** - Tables for athletes, sessions, metrics
3. **Initialize Telegram bot** - Basic command structure
4. **Configure environment variables** - API keys setup
5. **Build first API endpoint** - Health check + basic route

---

## 🤝 Contributing

This MVP is designed for rapid iteration with real athlete feedback. All code changes should:
- Maintain athlete safety as priority
- Include unit tests
- Follow the API schema defined in `/docs/API.md`

---

**Last Updated**: 2026-03-03
**Status**: Ready for Development
