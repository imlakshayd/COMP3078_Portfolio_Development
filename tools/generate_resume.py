#!/usr/bin/env python3
"""Regenerate assets/Lakshay_Dhawan_Resume.pdf from canonical data below.

Single source of truth: this file. The site's resume section (index.html)
should stay consistent with RESUME_DATA. Run from repo root:
    python tools/generate_resume.py
"""
import datetime
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle,
                                HRFlowable, KeepTogether)

HERE = __file__.replace("\\", "/").rsplit("/", 1)[0]
OUT = HERE + "/../assets/Lakshay_Dhawan_Resume.pdf"

INK = HexColor("#121212")
GREEN = HexColor("#1DB954")
MUTED = HexColor("#6b6b6b")
LINE = HexColor("#d9d9d9")

pdfmetrics.registerFont(TTFont("Grotesk", HERE + "/fonts/SpaceGrotesk-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Mono", HERE + "/fonts/JetBrainsMono-Regular.ttf"))

S_NAME = ParagraphStyle("name", fontName="Grotesk", fontSize=21, leading=24,
                        textColor=INK, spaceAfter=2)
S_CONTACT = ParagraphStyle("contact", fontName="Mono", fontSize=8.2, leading=11.5,
                           textColor=MUTED)
S_H2 = ParagraphStyle("h2", fontName="Mono", fontSize=9.5, leading=12,
                      textColor=GREEN, spaceBefore=12, spaceAfter=4)
S_ROLE = ParagraphStyle("role", fontName="Grotesk", fontSize=11, leading=13.5,
                        textColor=INK)
S_META = ParagraphStyle("meta", fontName="Mono", fontSize=8, leading=10,
                        textColor=MUTED, alignment=2)
S_ORG = ParagraphStyle("org", fontName="Grotesk", fontSize=9.3, leading=12,
                       textColor=MUTED, spaceAfter=2)
S_SUM = ParagraphStyle("sum", fontName="Grotesk", fontSize=9.5, leading=13.2,
                       textColor=INK, spaceAfter=4)
S_LI = ParagraphStyle("li", fontName="Grotesk", fontSize=9.3, leading=12.6,
                      textColor=HexColor("#2a2a2a"), leftIndent=10, bulletIndent=0,
                      spaceAfter=1.2)
S_SK = ParagraphStyle("sk", fontName="Grotesk", fontSize=9.2, leading=12.8,
                      textColor=HexColor("#2a2a2a"))
S_SKC = ParagraphStyle("skc", fontName="Mono", fontSize=8.3, leading=11,
                       textColor=INK, spaceBefore=3)

LINK = '<link href="%s" color="#1DB954"><u>%s</u></link>'


def role(title, dates, org, bullets=None):
    out = [Spacer(0, 2)]
    t = Table([[Paragraph(title, S_ROLE), Paragraph(dates, S_META)]],
              colWidths=[118 * mm, 52 * mm])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                           ("TOPPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    out.append(t)
    out.append(Paragraph(org, S_ORG))
    for b in bullets or []:
        out.append(Paragraph(b, S_LI, bulletText="&ndash;".replace("&ndash;", "\u2013")))
    return out


def h2(text):
    return [Paragraph(text.upper(), S_H2),
            HRFlowable(width="100%", thickness=0.7, color=LINE, spaceAfter=6)]

NAME = "Lakshay Dhawan"
CONTACT = ('Brampton, ON &nbsp;&middot;&nbsp; '
           + LINK % ("https://lakshay.ca", "lakshay.ca") + ' &nbsp;&middot;&nbsp; '
           + LINK % ("https://ca.linkedin.com/in/lakshay-dhawan", "LinkedIn")
           + ' &nbsp;&middot;&nbsp; '
           + LINK % ("https://github.com/imlakshayd", "GitHub"))

SUMMARY = [
    "Forward Deployed Engineer at tridorian, building agentic AI systems with "
    "Google Cloud customers alongside Solutions Architects. Recent George Brown "
    "grad (Computer Programming &amp; Analysis, Dean's List) with Google Cloud "
    "Professional ML Engineer and Professional Cloud Architect certifications, "
    "plus an Azure administrator background.",
    "Hands-on full-stack and ML work: a 5-person capstone marketplace where I "
    "was the top contributor (Supabase auth, migrations, Docker, integration), "
    "a local RAG pipeline, and production-minded Python/ML projects.",
]

EXPERIENCE = [
    ("Forward Deployed Engineer", "Aug 2026 \u2013 Present",
     '<link href="https://www.tridorian.com" color="#1DB954">tridorian</link> &bull; Toronto / GTA',
     ["Deliver Forward Deployed Engineer work on Google Cloud customer engagements, "
      "working alongside Solutions Architects",
      "Turn solution designs into working implementations on customer cloud environments"]),
    ("Technical Support &amp; Repair Technician", "Jan 2026 \u2013 Present",
     "GeekSquad (Best Buy) &bull; Brampton, ON",
     ["Diagnose and resolve hardware and software issues across laptops, desktops, and peripherals",
      "Execute OS deployments, secure data migrations, and system configurations",
      "Manage 10\u201315 devices per shift across concurrent service requests (Clarify Smarts ticketing)"]),
    ("Computing Advisor", "Mar 2025 \u2013 Dec 2025",
     "Best Buy &bull; Brampton, ON",
     ["Advised customers on laptops, networking, and peripherals, translating needs into solutions",
      "Consistently exceeded KPIs through technical product expertise"]),
    ("Chromebook Sales Specialist", "Oct 2024 \u2013 Feb 2025",
     "Google (via Activation Services Inc.) &bull; Brampton, ON",
     ["#1 national ranking for Chromebook sales across Canada during Q4; "
      "$250k+ generated over the contract",
      "Trained Best Buy staff on Google product features and positioning"]),
    ("Front Desk Manager", "Jan 2024 \u2013 May 2024",
     "Super 8 &bull; Ajax, ON",
     ["Led a 10-person team; guest satisfaction and staff performance up ~20%"]),
    ("Logistics Coordinator", "Dec 2021 \u2013 Dec 2022",
     "Angus Consulting Management Limited &bull; Vancouver, BC",
     ["Planned daily work orders at ~98% on-time completion; mentored two junior staff"]),
    ("IT Intern (CO-OP)", "Sep 2018 \u2013 Sep 2019",
     "Guru Tegh International School &bull; Brampton, ON",
     ["Tier-I support for 125+ onsite and remote end users; assisted network "
      "troubleshooting, cutting system downtime ~15% over four months"]),
]

EDUCATION = [
    ("Advanced Diploma \u2013 Computer Programming &amp; Analysis", "2026",
     "George Brown College &bull; Toronto, ON &bull; <font color='#6b6b6b'>Dean's List, Winter 2026</font>", []),
    ("Construction Maintenance Electrician", "2024",
     "Skilled Trades College of Canada &bull; Mississauga, ON", []),
    ("Bachelor of Civil Engineering (Incomplete)", "2020 \u2013 2022",
     "Queen's University &bull; Kingston, ON", []),
]

CERTS = [
    ("Google Cloud Certified \u2013 Professional Machine Learning Engineer", "2026",
     "Google &bull; " + LINK % ("https://www.credly.com/badges/0763d1ea-59f3-48bd-895d-5c453fd1e153", "verify on Credly"), []),
    ("Google Cloud Certified \u2013 Professional Cloud Architect", "Aug 2026",
     "Google &bull; " + LINK % ("https://www.credly.com/badges/c87a3c93-48be-446d-b3b6-5796a286705c", "verify on Credly"), []),
    ("Microsoft Certified: Azure Administrator Associate (AZ-104)", "Mar 2022",
     "Microsoft &bull; ID 992722909 &bull; "
     + LINK % ("https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", "credential"), []),
    ("Microsoft Certified: Azure AI Fundamentals (AI-900)", "Apr 2024",
     "Microsoft &bull; ID 31305C-869C1A &bull; "
     + LINK % ("https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/", "credential"), []),
    ("Microsoft Certified: Azure Fundamentals (AZ-900)", "Feb 2022",
     "Microsoft &bull; ID I142-2996 &bull; "
     + LINK % ("https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", "credential"), []),
    ("Kaggle ML Coursework", "2024",
     "Intro to ML &bull; Python &bull; Pandas &bull; Intro to Programming &bull; "
     + LINK % ("https://www.kaggle.com/learn/certification/lakshaydhawan", "certifications"), []),
    ("First Aid &amp; Safety Tickets", "\u2014",
     "First Aid &amp; CPR/AED C (Nov 2023\u2013Nov 2026) &bull; WHMIS 2015 &bull; Lockout &amp; Tagout &bull; "
     "Working at Heights &bull; REMIC Mortgage License", []),
]

VOLUNTEER = [
    ("Operations Executive (Volunteer)", "Nov 2023 \u2013 May 2024",
     "Huskies eSports Club &bull; George Brown College",
     ["Schedules, practices, tournaments; club grew to 1,500+ members; sponsor relationships maintained"]),
    ("Student Technician (Volunteer)", "2024",
     "Enactus Canada &bull; GB Byte Club",
     ["Tech-focused initiatives; project ideation, development, and event coordination"]),
]

AWARDS = [
    ("Dean's List", "Winter 2026", "George Brown College &bull; CPA program", []),
    ("#1 National Ranking \u2013 Chromebook Sales", "Q4 2024",
     "Google (via Activation Services Inc.) &bull; Canada-wide", []),
]

PROJECTS = [
    ("Move-In \u2014 Marketplace Capstone", "proof of concept &middot; "
     + LINK % ("https://github.com/imlakshayd/move-in", "repo"),
     "React/Node/Supabase marketplace, 5-person team; top contributor (24/51 commits). "
     "Owned Supabase auth, DB migrations, Dockerized environment, frontend/backend integration."),
    ("Local PDF RAG Pipeline", LINK % ("https://github.com/imlakshayd", "repos"),
     "PDF \u2192 chunking \u2192 embeddings \u2192 ChromaDB \u2192 local LLM Q&amp;A; PyTorch + "
     "sentence-transformers, fully offline."),
    ("Employee Management System",
     LINK % ("https://github.com/imlakshayd/101464867_COMP3123_Assignment2", "repo (coursework)"),
     "React + Node/Express + MongoDB CRUD app with JWT auth; REST API design."),
    ("ML Projects \u2014 Housing Prices &amp; Telco Churn", LINK % ("https://github.com/imlakshayd", "repos"),
     "sklearn regression + classification: feature engineering, cross-validation, error analysis."),
]

SKILLS = [
    ("Cloud / DevOps", "Google Cloud &bull; Azure (AZ-104 level) &bull; Docker &bull; Docker Compose &bull; Git/GitHub &bull; CI basics"),
    ("Languages", "Python &bull; JavaScript &bull; SQL &bull; C# &bull; Java &bull; Swift &bull; HTML/CSS"),
    ("AI / ML", "scikit-learn &bull; PyTorch &bull; embeddings &bull; vector search &bull; RAG &bull; LangChain &bull; pandas/NumPy"),
    ("Web", "React &bull; Node.js &bull; Express &bull; REST APIs &bull; JWT &bull; MongoDB &bull; Supabase"),
]


def header(canv, doc):
    canv.saveState()
    if doc.page > 1:
        canv.setFont("Grotesk", 8)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm, LETTER[1] - 12 * mm, NAME)
        canv.setFont("Mono", 7)
        canv.drawRightString(LETTER[0] - 20 * mm, LETTER[1] - 12 * mm,
                             datetime.date.today().strftime("Updated %b %Y"))
        canv.setStrokeColor(LINE)
        canv.line(20 * mm, LETTER[1] - 14 * mm, LETTER[0] - 20 * mm, LETTER[1] - 14 * mm)
    canv.setStrokeColor(LINE)
    canv.line(20 * mm, 14 * mm, LETTER[0] - 20 * mm, 14 * mm)
    canv.setFont("Mono", 7)
    canv.setFillColor(MUTED)
    canv.drawRightString(LETTER[0] - 20 * mm, 10 * mm, f"{NAME} \u00b7 p{doc.page}")
    canv.restoreState()


def build():
    doc = BaseDocTemplate(OUT, pagesize=LETTER,
                          leftMargin=20 * mm, rightMargin=20 * mm,
                          topMargin=18 * mm, bottomMargin=18 * mm,
                          title="Lakshay Dhawan \u2013 Resume",
                          author="Lakshay Dhawan")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=header)])

    story = [Paragraph(NAME, S_NAME), Paragraph(CONTACT, S_CONTACT)]
    story += h2("Summary")
    story += [Paragraph(p, S_SUM) for p in SUMMARY]
    story += h2("Experience")
    for t, d, o, b in EXPERIENCE:
        story.append(KeepTogether(role(t, d, o, b)))
    story.append(KeepTogether(h2("Projects") +
                              sum((role(t, link, "", [d]) for t, link, d in PROJECTS[:1]), [])))
    story += [KeepTogether(role(t, link, "", [d])) for t, link, d in PROJECTS[1:]]
    story += h2("Skills")
    for cat, vals in SKILLS:
        story.append(Paragraph(f"<b>{cat}</b> \u2014 {vals}", S_SK))
    story += h2("Education")
    for t, d, o, b in EDUCATION:
        story.append(KeepTogether(role(t, d, o, b)))
    story.append(KeepTogether(h2("Certifications") +
                              sum((role(t, d, o, b) for t, d, o, b in CERTS[:2]), [])))
    story += sum((role(t, d, o, b) for t, d, o, b in CERTS[2:]), [])
    story.append(KeepTogether(h2("Volunteering") +
                              sum((role(t, d, o, b) for t, d, o, b in VOLUNTEER), [])))
    story.append(KeepTogether(h2("Awards") +
                              sum((role(t, d, o, b) for t, d, o, b in AWARDS), [])))

    doc.build(story)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
