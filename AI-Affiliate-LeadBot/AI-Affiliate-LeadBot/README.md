# AI Affiliate LeadBot — V2 UI

A Python/FastAPI prototype for an affiliate course recommendation funnel.

Flow:
Instagram → Google Site → Course Finder → 5 questions → package recommendation → affiliate CTA → tracking

## Run locally on Windows

```powershell
cd E:\AI-Affiliate-LeadBot-V1\AI-Affiliate-LeadBot
.venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:
http://127.0.0.1:8000

## Important

1. In `frontend/script.js`, replace:
   `const affiliateUrl = "#";`
   with your exact RichInd affiliate URL.
2. Package data is in `data/packages.json`.
3. The UI is animated and mobile responsive; the current recommendation engine is rule-based.
4. `data/leads.db` stores local test events. Do not commit this database to GitHub.
5. No income, employment, or result guarantees are made by the bot.

## Next build stages

V3: real LLM conversation + better recommendation explanation
V4: lead capture + analytics dashboard
V5: deploy + Google Sites embed
V6: WhatsApp/Instagram automation and productized SaaS version
