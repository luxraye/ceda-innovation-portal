-- Demo seed data for CEDA Innovation Portal
-- All demo accounts use password: Demo@2026

INSERT OR IGNORE INTO users (id, email, password_hash, salt, name, role, organisation, district, expertise) VALUES
  (1, 'admin@ceda.co.bw',      'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Naledi Moagi',   'admin',       'CEDA Innovation Strategy Office', 'Gaborone', 'Programme Management'),
  (2, 'adjudicator@ceda.co.bw','e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Dr. Kago Sebina','adjudicator', 'CEDA Investment Committee',       'Gaborone', 'Venture Finance'),
  (3, 'evaluator1@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Tumelo Rakgomo', 'evaluator',   'CEDA Business Advisory',          'Francistown', 'Agribusiness, Operations'),
  (4, 'evaluator2@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Lesego Phiri',   'evaluator',   'Botswana Digital & Innovation Hub','Gaborone', 'Software, Fintech'),
  (5, 'evaluator3@ceda.co.bw', 'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Mpho Dintwe',    'evaluator',   'CEDA Credit Risk',                'Maun', 'Finance, Risk, Tourism'),
  (6, 'thabo@youthventures.bw','e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Thabo Kgosi',    'submitter',   'Youth Ventures (Pty) Ltd',        'Palapye', NULL),
  (7, 'amantle@agritech.bw',   'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Amantle Seretse','submitter',   'Pula AgriTech',                   'Serowe', NULL),
  (8, 'kabelo@solarpay.bw',    'e394b6add720b702881b44c0bc541db0979d63fa3fcc99b306c6ffa6d165c3b4', 'cedasalt01', 'Kabelo Motswana','submitter',   'SolarPay Botswana',               'Maun', NULL);

INSERT OR IGNORE INTO categories (id, name, description, strategic_priority, icon) VALUES
  (1, 'Agribusiness & Food Security', 'Value chains, climate-smart farming, agro-processing', 'Economic diversification', 'fa-seedling'),
  (2, 'Digital & Fintech', 'Payments, SME digitisation, inclusive finance', 'Digital transformation', 'fa-microchip'),
  (3, 'Green Energy & Climate', 'Renewables, water, circular economy', 'Sustainable development', 'fa-solar-panel'),
  (4, 'Tourism & Creative Economy', 'Experiences, crafts, media and heritage', 'Tourism diversification', 'fa-camera-retro'),
  (5, 'Health & Social Innovation', 'Access to care, education, community services', 'Inclusive growth', 'fa-heart-pulse'),
  (6, 'Manufacturing & Mining Services', 'Local beneficiation, supply chain, industrial services', 'Citizen economic empowerment', 'fa-industry');

INSERT OR IGNORE INTO rounds (id, name, slug, stage_order, description, min_evaluators, pass_threshold, blind_review, status) VALUES
  (1, 'Eligibility Screening', 'screening', 1, 'Confirms completeness, citizen ownership and strategic fit.', 1, 60, 1, 'open'),
  (2, 'Technical & Business Review', 'technical', 2, 'Deep-dive scoring by sector experts on feasibility, impact and scalability.', 2, 65, 1, 'open'),
  (3, 'Investment Committee Pitch', 'pitch', 3, 'Final adjudication after live pitch and due diligence.', 2, 70, 0, 'open');

INSERT OR IGNORE INTO criteria (id, round_id, name, description, weight, max_score, sort_order) VALUES
  (1, 1, 'Completeness', 'All mandatory fields answered with sufficient detail', 1, 10, 1),
  (2, 1, 'Eligibility', 'Citizen-owned (>50%), youth-led, Botswana-based', 2, 10, 2),
  (3, 1, 'Strategic Alignment', 'Fit with CEDA mandate and national development priorities', 2, 10, 3),
  (4, 2, 'Innovation & Originality', 'Novelty of the solution relative to existing alternatives', 2, 10, 1),
  (5, 2, 'Market Viability', 'Evidence of demand, customers and revenue model', 3, 10, 2),
  (6, 2, 'Technical Feasibility', 'Realism of the technical approach and delivery plan', 2, 10, 3),
  (7, 2, 'Socio-economic Impact', 'Jobs, inclusion and community benefit', 2, 10, 4),
  (8, 2, 'Scalability', 'Potential to grow nationally and regionally', 1, 10, 5),
  (9, 3, 'Team Capability', 'Skills, commitment and track record of the founding team', 3, 10, 1),
  (10, 3, 'Financial Sustainability', 'Unit economics, funding ask and path to profitability', 3, 10, 2),
  (11, 3, 'Pitch Quality & Clarity', 'Ability to communicate and defend the proposition', 1, 10, 3),
  (12, 3, 'Risk Management', 'Awareness of risks and mitigation strategies', 2, 10, 4);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('programme_name', 'CEDA Innovation Portal Hackathon 2026'),
  ('submission_open', '1'),
  ('submission_deadline', '2026-11-10T23:59:00'),
  ('contact_email', 'hackathon@bih.co.bw'),
  ('max_resubmissions', '2');

-- Sample ideas across the workflow ------------------------------------------
INSERT OR IGNORE INTO ideas (id, ref_code, title, summary, problem, solution, target_beneficiaries, impact, business_model, budget_estimate, timeline, team_description, district, tags, category_id, submitter_id, stage, current_round_id, version, submitted_at) VALUES
  (1, 'CEDA-2026-0001', 'Pula AgriTech Smart Irrigation Network',
   'Low-cost IoT soil sensors and a USSD/WhatsApp advisory service that cut smallholder water use by 40% while increasing yields.',
   'Smallholder farmers in the Central District lose up to 35% of crop value annually to irregular rainfall and inefficient irrigation. Weather advisories are generic and do not reach farmers without smartphones.',
   'Solar-powered soil moisture sensors (BWP 350 each) relay data over GSM to a cloud platform. Farmers receive irrigation instructions via USSD and WhatsApp in Setswana. Cooperatives access dashboards for planning.',
   '1,200 smallholder farmers in Serowe, Palapye and Mahalapye in year one; cooperatives and the Ministry of Agriculture.',
   '40% water saving, 25% yield increase, 60 green jobs for youth technicians, reduced import dependency on vegetables.',
   'Hardware sold at cost; BWP 45/month advisory subscription; cooperative dashboard licences; data partnerships with insurers.',
   850000, '12 months: 3 months pilot (100 farms), 6 months scale-up, 3 months commercialisation.',
   'Amantle Seretse (CEO, agronomist), Oarabile Tau (CTO, embedded systems), Boitumelo Nkwe (community mobilisation). 100% citizen-owned.',
   'Serowe', 'iot,agriculture,climate', 1, 7, 'under_review', 2, 2, '2026-11-06 09:12:00'),
  (2, 'CEDA-2026-0002', 'SolarPay: Pay-as-you-go Solar for Off-grid Villages',
   'Mobile-money-enabled solar home systems with remote lock technology making clean energy affordable for 15,000 off-grid households.',
   'Over 15,000 households in Ngamiland and Kgalagadi remain off-grid, spending BWP 200+/month on paraffin and candles with health and fire risks.',
   'Solar home kits (lighting, phone charging, radio, TV) financed over 18 months through Orange Money / MyZaka micro-payments. GSM-enabled controllers lock units if payments lapse, reducing default risk.',
   'Off-grid rural households, informal traders needing refrigeration, village schools and clinics.',
   'Clean energy access for 15,000 households, 120 youth sales agents, BWP 30m in avoided paraffin spend over 5 years.',
   'Asset-financing margin on kits, carbon credits, agent commissions, after-sales maintenance plans.',
   2400000, '18 months with phased district rollout starting in Maun.',
   'Kabelo Motswana (CEO), Neo Sebego (COO, ex-BPC), Gorata Mokgethi (CFO). 70% citizen-owned, youth founders.',
   'Maun', 'energy,fintech,rural', 3, 8, 'under_review', 2, 1, '2026-11-06 11:40:00'),
  (3, 'CEDA-2026-0003', 'Kgotla Konnect: Digital Village Marketplace',
   'A bilingual marketplace and logistics app connecting village producers directly with urban buyers and tourism lodges.',
   'Rural artisans and food producers lack market access; middlemen capture 50-60% of the retail value.',
   'Progressive web app with Setswana/English UI, WhatsApp ordering, consolidated bus-courier logistics and mobile money escrow.',
   'Rural artisans, horticulture producers, safari lodges and urban consumers.',
   '300 producers onboarded in year one, 35% income increase for producers, 20 youth logistics jobs.',
   '8% transaction commission, premium listings, logistics margin.',
   620000, '9 months to MVP and pilot in the Chobe-Ngamiland corridor.',
   'Thabo Kgosi (founder, product), Refilwe Dube (logistics), Karabo Mothibi (developer). 100% citizen-owned.',
   'Palapye', 'marketplace,tourism,logistics', 4, 6, 'revision_requested', 1, 1, '2026-11-06 14:05:00'),
  (4, 'CEDA-2026-0004', 'MmaBana Mobile Clinic Scheduler',
   'Scheduling and triage system for mobile health clinics serving remote settlements, with SMS reminders for mothers and infants.',
   'Mobile clinics in remote settlements operate on paper schedules; missed immunisation appointments exceed 30%.',
   'Offline-first tablet app for nurses, SMS reminders to caregivers, and dashboards for District Health Management Teams.',
   'Caregivers, infants, mobile clinic teams, DHMTs in Kgalagadi and Ghanzi.',
   'Immunisation coverage up 20 points, reduced travel costs for families, better planning data for MoH.',
   'SaaS licence to district health teams and NGOs; donor grants for rollout.',
   480000, '12 months including MoH integration.',
   'Thabo Kgosi (product lead), Dr. Lorato Sento (clinical advisor), Tshepo Rantsho (developer).',
   'Ghanzi', 'health,mobile,offline', 5, 6, 'submitted', 1, 1, '2026-11-07 08:20:00'),
  (5, 'CEDA-2026-0005', 'Morula Beneficiation Micro-factory',
   'Community-owned micro-factory producing cold-pressed morula oil and cosmetics for export.',
   'Morula fruit is harvested by thousands of rural women but sold raw at low prices; value-addition happens abroad.',
   'Containerised processing unit with solar power, cold-press extraction, quality lab and export-grade packaging.',
   'Women harvesters in Kweneng West, cosmetics retailers, export buyers.',
   '400 harvesters with doubled income, 25 factory jobs, BWP 6m export revenue by year three.',
   'B2B oil sales, retail cosmetics brand, contract processing.',
   1900000, '15 months from procurement to first export shipment.',
   'Amantle Seretse (chair), Dineo Marumo (operations), Onalenna Segwai (chemist). 100% citizen-owned cooperative.',
   'Letlhakeng', 'manufacturing,export,women', 6, 7, 'approved', 3, 1, '2026-11-05 10:00:00'),
  (6, 'CEDA-2026-0006', 'EduBot Setswana Literacy Tutor',
   'AI-powered WhatsApp tutor for early-grade Setswana and English reading with voice feedback.',
   'Early-grade reading outcomes remain low; parents in rural areas lack resources to support literacy at home.',
   'Conversational tutor on WhatsApp using speech recognition for pronunciation feedback and gamified daily lessons.',
   'Learners aged 5-9, parents, primary schools.',
   '10,000 learners reached in year one; measurable reading gains.',
   'Freemium model with school licences and sponsorship.',
   350000, '8 months to pilot in 20 schools.',
   'Kabelo Motswana (founder), Tebogo Mosweu (education specialist).',
   'Gaborone', 'edtech,ai,literacy', 5, 8, 'draft', NULL, 1, NULL);

INSERT OR IGNORE INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES
  (1, 1, '{"title":"Pula AgriTech Smart Irrigation Network","summary":"Initial submission"}', 'Initial submission', 7),
  (1, 2, '{"title":"Pula AgriTech Smart Irrigation Network","summary":"Added cooperative dashboard revenue line and pilot data"}', 'Addressed screening feedback on revenue model', 7),
  (2, 1, '{"title":"SolarPay"}', 'Initial submission', 8),
  (3, 1, '{"title":"Kgotla Konnect"}', 'Initial submission', 6),
  (4, 1, '{"title":"MmaBana"}', 'Initial submission', 6),
  (5, 1, '{"title":"Morula Beneficiation Micro-factory"}', 'Initial submission', 7);

INSERT OR IGNORE INTO idea_stage_history (idea_id, from_stage, to_stage, round_id, actor_id, note) VALUES
  (1, 'draft', 'submitted', 1, 7, 'Submitted via portal'),
  (1, 'submitted', 'under_review', 1, 1, 'Assigned for screening'),
  (1, 'under_review', 'revision_requested', 1, 2, 'Clarify revenue model'),
  (1, 'revision_requested', 'submitted', 1, 7, 'Resubmitted v2'),
  (1, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (2, 'draft', 'submitted', 1, 8, 'Submitted via portal'),
  (2, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (3, 'draft', 'submitted', 1, 6, 'Submitted via portal'),
  (3, 'submitted', 'under_review', 1, 1, 'Assigned for screening'),
  (3, 'under_review', 'revision_requested', 1, 2, 'Logistics costs missing'),
  (4, 'draft', 'submitted', 1, 6, 'Submitted via portal'),
  (5, 'draft', 'submitted', 1, 7, 'Submitted via portal'),
  (5, 'submitted', 'under_review', 2, 1, 'Advanced to technical review'),
  (5, 'under_review', 'approved', 3, 2, 'Recommended for investment committee');

-- Assignments & scores
INSERT OR IGNORE INTO assignments (id, idea_id, round_id, evaluator_id, assigned_by, status, recommendation, overall_comment, weighted_score, completed_at) VALUES
  (1, 1, 2, 3, 1, 'completed', 'advance', 'Strong agronomic grounding and credible pilot data. Hardware supply chain needs a second vendor.', 78.0, '2026-11-06 16:00:00'),
  (2, 1, 2, 4, 1, 'in_progress', NULL, NULL, NULL, NULL),
  (3, 2, 2, 4, 1, 'completed', 'advance', 'Proven PAYG model regionally; team has utility experience. Default-risk assumptions should be stress-tested.', 82.0, '2026-11-06 17:30:00'),
  (4, 2, 2, 5, 1, 'pending', NULL, NULL, NULL, NULL),
  (5, 3, 1, 3, 1, 'completed', 'revise', 'Eligible and aligned, but the logistics cost model is incomplete.', 58.0, '2026-11-06 15:00:00'),
  (6, 5, 2, 3, 1, 'completed', 'advance', 'Excellent beneficiation story with export letters of intent.', 86.0, '2026-11-05 15:00:00'),
  (7, 5, 2, 5, 1, 'completed', 'advance', 'Financials are conservative and well-evidenced.', 84.0, '2026-11-05 16:00:00');

INSERT OR IGNORE INTO scores (assignment_id, criterion_id, score, comment) VALUES
  (1, 4, 8, 'Novel USSD delivery for low-smartphone areas'), (1, 5, 7, 'Subscription willingness needs more evidence'), (1, 6, 8, NULL), (1, 7, 9, 'Strong job creation'), (1, 8, 7, NULL),
  (3, 4, 7, NULL), (3, 5, 9, 'Clear demand and payment data'), (3, 6, 8, NULL), (3, 7, 9, NULL), (3, 8, 8, NULL),
  (5, 1, 6, 'Logistics costs missing'), (5, 2, 7, NULL), (5, 3, 5, NULL),
  (6, 4, 8, NULL), (6, 5, 9, NULL), (6, 6, 8, NULL), (6, 7, 9, NULL), (6, 8, 9, NULL),
  (7, 4, 8, NULL), (7, 5, 9, NULL), (7, 6, 8, NULL), (7, 7, 8, NULL), (7, 8, 9, NULL);

INSERT OR IGNORE INTO decisions (idea_id, round_id, decided_by, decision, rationale, aggregate_score) VALUES
  (1, 1, 2, 'revise', 'Revenue model needs clarification before technical review.', 62),
  (1, 1, 2, 'advance', 'Revised submission addresses concerns. Advance to technical review.', 71),
  (3, 1, 2, 'revise', 'Please add a costed logistics model and letters of intent from lodges.', 58),
  (5, 2, 2, 'approve', 'Unanimous recommendation to the Investment Committee.', 85);

INSERT OR IGNORE INTO feedback (idea_id, author_id, body, visibility) VALUES
  (1, 2, 'Thank you for the submission. Please clarify how the BWP 45/month subscription was validated with farmers.', 'submitter'),
  (1, 7, 'We ran a willingness-to-pay survey with 180 farmers in Serowe; 72% indicated they would pay BWP 40-60. Added to v2.', 'submitter'),
  (1, 3, 'Internal note: consider pairing with the Ministry of Agriculture extension officers for distribution.', 'internal'),
  (3, 2, 'Your logistics model is missing cost assumptions for the bus-courier network. Please provide a per-kg cost and partner letters.', 'submitter'),
  (5, 2, 'Congratulations - your idea has been recommended to the Investment Committee. Prepare a 10-minute pitch.', 'submitter');

INSERT OR IGNORE INTO notifications (user_id, type, title, body, link) VALUES
  (7, 'stage', 'Idea advanced to Technical Review', 'CEDA-2026-0001 is now under technical and business review.', '/app#/ideas/1'),
  (6, 'feedback', 'Revision requested', 'An adjudicator has requested changes to CEDA-2026-0003.', '/app#/ideas/3'),
  (4, 'assignment', 'New evaluation assigned', 'You have been assigned CEDA-2026-0001 for Technical Review.', '/app#/evaluate/2'),
  (5, 'assignment', 'New evaluation assigned', 'You have been assigned CEDA-2026-0002 for Technical Review.', '/app#/evaluate/4'),
  (7, 'decision', 'Recommended to Investment Committee', 'CEDA-2026-0005 has been approved for the final pitch round.', '/app#/ideas/5');

INSERT OR IGNORE INTO audit_log (actor_id, action, entity_type, entity_id, meta) VALUES
  (7, 'idea.submit', 'idea', 1, '{"ref":"CEDA-2026-0001"}'),
  (1, 'assignment.create', 'assignment', 1, '{"idea_id":1,"evaluator_id":3}'),
  (2, 'decision.create', 'decision', 1, '{"idea_id":1,"decision":"revise"}'),
  (7, 'idea.resubmit', 'idea', 1, '{"version":2}'),
  (2, 'decision.create', 'decision', 4, '{"idea_id":5,"decision":"approve"}');
