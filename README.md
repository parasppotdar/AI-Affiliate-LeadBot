# AI Affiliate LeadBot — V1

A small Python/FastAPI prototype for an affiliate course recommendation funnel.

Flow:
Instagram → Google Site → Chatbot → 5 questions → recommendation → affiliate CTA → tracking

## Run locally on Windows

```powershell
cd C:\AI-Affiliate-LeadBot
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:
http://127.0.0.1:8000

## Important

1. Put your exact RichInd affiliate URL in `frontend/script.js` where `affiliateUrl = "#"`.
2. The package prices/details in `data/packages.json` come from the uploaded RichInd Package PDF.
3. This V1 does not make income guarantees.
4. `data/leads.db` stores basic local events for testing.
