-- Lead Hunter Knowledge Pack V1
-- 118 verified entries: 12 categories + Policy pack
-- agent_id = 'client-acquisition-agent'
-- Safe to rerun: inserts only when title is not already present for this agent.
-- Uses PostgreSQL dollar-quoted strings to make Supabase SQL Editor paste/run safer.

create extension if not exists pgcrypto;

drop function if exists public.seed_lead_hunter_knowledge(text, text, text, text, text, text, text[]);

create or replace function public.seed_lead_hunter_knowledge(
  p_title text,
  p_category text,
  p_summary text,
  p_content text,
  p_source text,
  p_reliability text,
  p_tags text[] default '{}'::text[]
) returns void language plpgsql as $$
begin
  insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
  select gen_random_uuid(), 'client-acquisition-agent', p_title, p_category, p_summary, p_content, p_source, p_reliability, p_tags, now(), now()
  where not exists (
    select 1 from knowledge_entries
    where agent_id = 'client-acquisition-agent' and title = p_title
  );
end;
$$;

select public.seed_lead_hunter_knowledge(
  $lh$Search Strategy Fundamentals for Commercial Discovery$lh$,
  $lh$Commercial Search$lh$,
  $lh$Core principles for constructing effective commercial search campaigns on the public web.$lh$,
  $lh$Start every search session with a clear commercial goal: find buyers, find partners, find market signals, or find company leads. Match the search mode to the goal before writing queries. Use boolean operators, quote marks and geo-qualifiers from the start. Never begin with generic single-word queries. A query like "yacht" returns millions of useless results; a query like "\"looking for\" \"yacht charter\" \"Mediterranean\" 2026" returns people who need the service now.$lh$,
  $lh$internal search strategy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$search-strategy$lh$, $lh$boolean$lh$, $lh$query$lh$, $lh$commercial$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Boolean Search Operators for Commercial Queries$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to use AND, OR, NOT, quotes and parentheses to construct precise commercial queries.$lh$,
  $lh$AND: both terms must appear. OR: either term. NOT or minus: exclude term. "quotes": exact phrase. (parentheses): group alternatives. site:domain: restrict to domain. -site:domain: exclude domain. filetype:pdf: file type filter. Examples: "looking for" ("yacht charter" OR "motor yacht") "Mediterranean" - finds demand. "family office" "yacht" "acquisition" -jobs - finds company leads excluding job ads. Mastery of these operators is the single most effective way to improve lead quality.$lh$,
  $lh$public search engine documentation$lh$,
  $lh$verified$lh$,
  array[$lh$boolean$lh$, $lh$operators$lh$, $lh$search$lh$, $lh$query$lh$, $lh$AND$lh$, $lh$OR$lh$, $lh$NOT$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Quote Operator Usage in Commercial Search$lh$,
  $lh$Commercial Search$lh$,
  $lh$When and how to use exact-phrase quotes to find genuine commercial signals.$lh$,
  $lh$Wrap phrases in double quotes to require exact matches: "looking for a yacht charter", "need airport transfer", "family office acquisition". Without quotes, search engines may match the words separately across different parts of a page, producing irrelevant results. Always quote demand phrases ("looking for", "need", "searching for"), service type phrases ("yacht charter", "airport transfer", "chauffeur"), and location phrases ("Cote d'Azur", "Monaco", "French Riviera") to maximise signal quality.$lh$,
  $lh$public search engine documentation$lh$,
  $lh$verified$lh$,
  array[$lh$quotes$lh$, $lh$exact-phrase$lh$, $lh$search$lh$, $lh$operators$lh$, $lh$signal$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Multilingual Query Expansion Strategy$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to detect demand signals across French, Italian, German, Spanish and Russian.$lh$,
  $lh$The Cote d'Azur, Monaco and Mediterranean are multilingual markets. English-only searches miss a large volume of genuine demand. Multilingual expansion: French: "recherche", "besoin de", "cherche", "je cherche un". Italian: "cerco", "ho bisogno", "sto cercando". German: "suche", "brauche", "dringend gesucht". Spanish: "busco", "necesito". Russian: "   ", "     ", "     ". Combine with French geography terms: "Cote d'Azur", "Monaco", "Cannes", "Nice", "Antibes". Run separate queries per language rather than combining all languages in one query.$lh$,
  $lh$internal multilingual search baseline$lh$,
  $lh$verified$lh$,
  array[$lh$multilingual$lh$, $lh$french$lh$, $lh$italian$lh$, $lh$german$lh$, $lh$spanish$lh$, $lh$russian$lh$, $lh$expansion$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Search Mode Selection Guide$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to choose the right search mode for the commercial objective.$lh$,
  $lh$Four modes: demand_discovery - use when the goal is to find people actively requesting the service right now. Best for car rental transfers, charter bookings, urgent requests. company_discovery - use when the goal is to find organisations or individuals who are likely buyers or prospects. Best for family offices, HNW individuals, wealth managers. partner_discovery - use when the goal is to find referral or commission partners: concierges, travel advisors, event agencies. market_intelligence - use when the goal is to track competitor activity, fleet changes, new hotels, industry trends. Each mode uses different queries, different scoring weights and different acceptance criteria.$lh$,
  $lh$internal search mode baseline$lh$,
  $lh$verified$lh$,
  array[$lh$search-mode$lh$, $lh$demand$lh$, $lh$company$lh$, $lh$partner$lh$, $lh$market-intelligence$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Public Source Prioritisation for Commercial Search$lh$,
  $lh$Commercial Search$lh$,
  $lh$Which types of public sources yield the highest quality commercial signals.$lh$,
  $lh$Highest quality sources: LinkedIn public posts and company pages (individual demand or company profiles). Reddit and niche forums (genuine peer requests and recommendations). Superyacht industry forums (active demand from principals or crew). Facebook Groups (event planning, transfer requests). Twitter/X (real-time "looking for" posts). Medium quality: Industry news sites (market signals). Press releases (new hotel openings, fleet additions). Google My Business profiles (company discovery). Low quality / reject: Directory sites (yellow pages, Yelp, comparison sites). Job boards. SEO content farms. Wikipedia. Generic travel blogs.$lh$,
  $lh$internal source quality baseline$lh$,
  $lh$verified$lh$,
  array[$lh$source-quality$lh$, $lh$linkedin$lh$, $lh$reddit$lh$, $lh$forum$lh$, $lh$directory$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Negative Keyword Strategy for Lead Precision$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to use exclusion terms to eliminate job ads, directories and provider pages from results.$lh$,
  $lh$Add negative keywords to queries to pre-filter known noise: -jobs -hiring -career -vacancy removes job ads. -directory -"top 10" -"best 10" -compare removes directories. -wikipedia removes encyclopedia results. -"press release" removes PR content. -blog -magazine removes content marketing. Combined example: "looking for" "yacht charter" "Mediterranean" -jobs -hiring -blog -directory. Negative keywords are especially important for demand_discovery mode where false positives (provider pages appearing in results) are common.$lh$,
  $lh$internal search hygiene baseline$lh$,
  $lh$verified$lh$,
  array[$lh$negative-keywords$lh$, $lh$exclusion$lh$, $lh$jobs$lh$, $lh$directory$lh$, $lh$precision$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Query Iteration and Improvement$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to iterate queries when initial results are low quality.$lh$,
  $lh$If a query returns mostly provider pages or directories: add more negative keywords, tighten the demand phrase with quotes, add geography qualifiers, switch to a language-specific variant. If a query returns mostly job ads: add -jobs -hiring -CDI -CDD, switch searchMode from demand to company. If a query returns no results: loosen the geography (Monaco   "Cote d'Azur"), remove one negative qualifier, try a synonym. Track which queries produce accepted leads vs. rejected results across sessions.$lh$,
  $lh$internal query optimisation baseline$lh$,
  $lh$verified$lh$,
  array[$lh$query-iteration$lh$, $lh$improvement$lh$, $lh$optimisation$lh$, $lh$false-positive$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Domain-Specific Commercial Search Tactics$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to target specific high-value domains when conducting commercial discovery.$lh$,
  $lh$Use site: operator to restrict search to known high-value sources: site:reddit.com "looking for" "yacht charter" "Monaco". site:linkedin.com "family office" "yacht acquisition". site:superyachttimes.com fleet changes. site:boatinternational.com market intelligence. Avoid site: restrictions for demand discovery unless you have confirmed that the domain contains genuine demand posts. For car rental demand, target: site:reddit.com, site:tripadvisor.com/forum, travel forum domains.$lh$,
  $lh$public search documentation$lh$,
  $lh$verified$lh$,
  array[$lh$site-search$lh$, $lh$domain-targeting$lh$, $lh$linkedin$lh$, $lh$reddit$lh$, $lh$forum$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Seasonal and Temporal Query Adjustments$lh$,
  $lh$Commercial Search$lh$,
  $lh$How to adjust queries based on season, year and demand patterns.$lh$,
  $lh$Mediterranean yacht charter demand peaks June-September. Monaco Grand Prix (May) creates extreme car rental demand. Cannes Film Festival (May) creates chauffeur demand. Christmas Monaco period creates luxury transfer demand. Add year/season qualifiers: "charter" "Mediterranean" "2026", "summer 2026", "July 2026", "August 2026". For demand_discovery, prioritise results from current month and season. For market_intelligence, use year qualifiers to find season-opening news and fleet additions.$lh$,
  $lh$internal seasonal search baseline$lh$,
  $lh$verified$lh$,
  array[$lh$seasonal$lh$, $lh$temporal$lh$, $lh$summer$lh$, $lh$2026$lh$, $lh$charter$lh$, $lh$demand$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Active Demand Indicator Taxonomy$lh$,
  $lh$Demand Discovery$lh$,
  $lh$The full taxonomy of signals that indicate a person is actively seeking a service right now.$lh$,
  $lh$Level 1 (Strongest): First-person request + specific service + specific location + time frame. Example: "I need a 9-seater van from Nice Airport tomorrow morning, anyone in Cote d'Azur?" Level 2: First-person request + service + location, no time frame. Example: "Looking for a yacht charter in Monaco for 8 guests." Level 3: Group request + service + vague location. Example: "Anyone know a good chauffeur service in the south of France?" Level 4 (Weakest): Third-party mention of someone's need. Example: "My client is looking for a superyacht to buy." Always look for evidence of: demand phrase, service phrase, location phrase, freshness phrase. All four = A-grade. Missing freshness = B-grade. Missing location = C-grade. Missing demand phrase = not demand.$lh$,
  $lh$internal demand taxonomy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$active-demand$lh$, $lh$first-person$lh$, $lh$request$lh$, $lh$evidence$lh$, $lh$taxonomy$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$English Demand Phrases for Commercial Search$lh$,
  $lh$Demand Discovery$lh$,
  $lh$The complete list of English-language demand phrases that indicate buyer intent.$lh$,
  $lh$Core demand phrases: "looking for", "need", "needed", "want", "wanted", "seeking", "in search of", "searching for", "require", "required", "request", "any recommendations", "can anyone recommend", "does anyone know", "where can I find", "who provides", "anyone know a", "I am looking to hire", "we need to book", "looking to rent", "looking to charter". Social/forum variants: "anyone have", "has anyone used", "who do you use for", "where do you go for". Questions indicating immediate need: "is it possible to get", "can we arrange", "could we book", "is there a service for".$lh$,
  $lh$internal demand phrase baseline$lh$,
  $lh$verified$lh$,
  array[$lh$english$lh$, $lh$demand-phrases$lh$, $lh$buyer-intent$lh$, $lh$looking-for$lh$, $lh$need$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$French Demand Phrases for Commercial Search$lh$,
  $lh$Demand Discovery$lh$,
  $lh$French-language demand phrases for the Cote d'Azur, Monaco and French Riviera markets.$lh$,
  $lh$Core French demand phrases: "recherche" (looking for/searching), "je cherche" (I am looking for), "nous cherchons" (we are looking for), "besoin de" (need / in need of), "j'ai besoin" (I need), "nous avons besoin" (we need), "je souhaite" (I would like), "nous souhaitons" (we would like), "quelqu'un peut recommander" (can anyone recommend), "connaissez-vous" (do you know), "o  trouver" (where to find), "qui propose" (who offers/provides). Forum variants: "cherche prestataire", "recherche service", "besoin urgente", "quelqu'un connait". Urgency qualifiers: "urgent", "d s que possible", "d s maintenant", "aujourd'hui", "ce soir".$lh$,
  $lh$internal multilingual demand baseline$lh$,
  $lh$verified$lh$,
  array[$lh$french$lh$, $lh$demand-phrases$lh$, $lh$monaco$lh$, $lh$cote-dazur$lh$, $lh$recherche$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Italian, German and Spanish Demand Phrases$lh$,
  $lh$Demand Discovery$lh$,
  $lh$Multilingual demand phrases for Italian, German and Spanish speakers in Mediterranean markets.$lh$,
  $lh$Italian: "cerco" (I look for), "sto cercando" (I am looking for), "ho bisogno di" (I need), "abbiamo bisogno di" (we need), "qualcuno sa dove" (does anyone know where), "qualcuno pu  consigliare" (can anyone recommend), "urgente" (urgent), "subito" (immediately). German: "suche" (looking for), "ich suche" (I am looking for), "wir suchen" (we are looking for), "brauche" (need), "dringend" (urgently), "sofort" (immediately), "kann jemand empfehlen" (can anyone recommend), "wo finde ich" (where can I find). Spanish: "busco" (I am looking for), "buscamos" (we are looking for), "necesito" (I need), "necesitamos" (we need), "alguien sabe" (does anyone know), "urgente" (urgent), "cuanto antes" (as soon as possible).$lh$,
  $lh$internal multilingual demand baseline$lh$,
  $lh$verified$lh$,
  array[$lh$italian$lh$, $lh$german$lh$, $lh$spanish$lh$, $lh$demand-phrases$lh$, $lh$cerco$lh$, $lh$suche$lh$, $lh$busco$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$RFQ and Quotation Request Detection$lh$,
  $lh$Demand Discovery$lh$,
  $lh$How to detect formal and informal requests for quotation in public web text.$lh$,
  $lh$Formal RFQ signals: "request for quotation", "RFQ", "request for proposal", "RFP", "invitation to tender", "ITT", "quotation required", "devis requis", "demande de devis", "offre de prix demand e". Informal quotation signals: "how much does it cost", "what is the price for", "how much for", "can you quote me", "quote needed", "price enquiry", "get a quote for". For yacht charter: "charter rate enquiry", "week rate request", "APA estimate required". For car rental: "transfer rate", "daily rate request", "cost for airport transfer". Treat all RFQ signals as strong demand evidence, even when no explicit demand phrase is present.$lh$,
  $lh$internal RFQ detection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$rfq$lh$, $lh$quotation$lh$, $lh$tender$lh$, $lh$price-enquiry$lh$, $lh$request-for-proposal$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Booking Request Detection for Luxury Mobility$lh$,
  $lh$Demand Discovery$lh$,
  $lh$Specific signals that indicate an active booking request for yacht or car rental services.$lh$,
  $lh$Booking intent signals: "book", "booking", "reservation", "reserve", "confirm booking", "availability check", "check availability", "is this available", "can we book". Charter-specific: "charter enquiry", "charter booking", "available for charter", "charter period", "available for hire", "APA", "advance provisioning allowance". Car rental specific: "airport pickup", "airport drop-off", "transfer booking", "chauffeur booking", "can you arrange a car", "need a driver". Time-bound booking signals (strongest): "book for tonight", "available this weekend", "reserve for tomorrow morning", "confirm for July 15". These are highest priority for contact_immediately recommendation.$lh$,
  $lh$internal booking signal baseline$lh$,
  $lh$verified$lh$,
  array[$lh$booking$lh$, $lh$reservation$lh$, $lh$charter-enquiry$lh$, $lh$transfer$lh$, $lh$availability$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Urgency Indicator Classification$lh$,
  $lh$Demand Discovery$lh$,
  $lh$How to classify urgency level from demand signals in result text.$lh$,
  $lh$Urgency levels: IMMEDIATE (contact within 1 hour): "today", "tonight", "right now", "this evening", "last minute", "urgently", "asap", "emergency", "need now", "aujourd'hui", "ce soir", "urgente", "subito", "heute", "sofort", "       ", "      ". HIGH (contact today): "tomorrow", "this weekend", "next few days", "very soon", "as soon as possible", "this week", "demain", "cette semaine", "morgen". MEDIUM (contact within 24 hours): "this month", "next week", "soon", "in the coming weeks", "planning for", "ce mois", "prochaines semaines". LOW (monitor): "thinking of", "planning", "considering for", "possibly in", "maybe next", "envisage".$lh$,
  $lh$internal urgency classification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$urgency$lh$, $lh$immediate$lh$, $lh$today$lh$, $lh$asap$lh$, $lh$contact-priority$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Demand vs. Discussion Distinction$lh$,
  $lh$Demand Discovery$lh$,
  $lh$How to distinguish genuine demand posts from discussion, comparison or information-seeking posts.$lh$,
  $lh$Genuine demand: first-person or organisation stating a specific need with location. "We need a 9-seater from Nice Airport on June 30." Discussion (not demand): "Has anyone compared yacht charter companies in Monaco?" - this is a general opinion request, not a booking request. Information-seeking (not demand): "What is the average cost of a chauffeur in Cannes?" - pricing question, not a booking. Research (not demand): "Best car rental companies in Monaco for 2026." - this produces a directory, not an active buyer. The key distinction: demand states a SPECIFIC need to be FULFILLED. Discussion seeks OPINIONS or INFORMATION. Only specific unfulfilled needs qualify as active demand.$lh$,
  $lh$internal demand classification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$demand$lh$, $lh$discussion$lh$, $lh$distinction$lh$, $lh$information$lh$, $lh$opinion$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Social Platform Demand Signal Recognition$lh$,
  $lh$Demand Discovery$lh$,
  $lh$Where and how genuine demand appears on social platforms accessible via public web search.$lh$,
  $lh$Reddit: /r/france, /r/travel, /r/superyachts, /r/monaco posts asking for service recommendations. Signals: "anyone know", "where to find", "recommend", "used before". Facebook Groups: Travel groups, expat groups in Monaco/Cannes. Signals: posts beginning "Looking for...", "Need a recommendation for...". Twitter/X: Real-time "looking for" posts with location hashtags (#Monaco, #Cannes, #yacht). Forums: Tripadvisor forums, Superyacht World forums, expat community boards. LinkedIn: Posts from company buyers seeking vendor partner links. Warning: do not confuse social media advertising (provider promoting their service) with organic demand posts (person seeking a service). The presence of a phone number or booking link usually indicates a provider ad, not genuine demand.$lh$,
  $lh$internal social platform baseline$lh$,
  $lh$verified$lh$,
  array[$lh$social-platform$lh$, $lh$reddit$lh$, $lh$facebook$lh$, $lh$twitter$lh$, $lh$forum$lh$, $lh$demand$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Seasonal Demand Patterns for Cote d'Azur$lh$,
  $lh$Demand Discovery$lh$,
  $lh$When demand peaks and what types of requests to expect in each season.$lh$,
  $lh$May: Monaco Grand Prix period. Extreme demand for luxury car rental, chauffeur, airport transfers. Short duration, very high value. Teams, VIPs, spectators arrive 2 weeks before. May (late): Cannes Film Festival closing. Celebrity and film industry transfers. High luxury car demand. June-September: Mediterranean yacht charter season. Peak demand for bareboat and crewed charters. Yacht buyer activity increases. Partner concierge demand. July-August: Absolute peak. All three lines (yacht sale, charter, car rental) at maximum demand. Every genuine signal is high priority. September: Season wind-down. Charter demand still active but shortening. October-April: Off-season. Demand drops significantly. Focus on company discovery and partner discovery in off-season rather than demand discovery.$lh$,
  $lh$internal seasonal demand baseline$lh$,
  $lh$verified$lh$,
  array[$lh$seasonal$lh$, $lh$monaco-gp$lh$, $lh$cannes$lh$, $lh$summer$lh$, $lh$mediterranean$lh$, $lh$peak-demand$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Demand Evidence Requirements for Active Demand Classification$lh$,
  $lh$Demand Discovery$lh$,
  $lh$The minimum evidence required before classifying a result as active_demand.$lh$,
  $lh$All four evidence types are ideal. Minimum to classify as active_demand: (1) Demand phrase from human-authored content (not the search query). Required. Without this, not active demand. (2) Service phrase matching the target business line. Required. "yacht", "charter", "car", "transfer", "chauffeur", "van", "minibus". (3) Location phrase or context. Strongly preferred. "Monaco", "Cannes", "Nice", "Cote d'Azur", "French Riviera". Without location: downgrade to unclear unless the service type is highly specific. (4) Freshness phrase. Preferred. Without it, risk classifying as old_expired in demand mode. Evidence strength: 4/4 = A grade. 3/4 (no freshness) = B grade. 2/4 (demand + service) = C grade. 1/4 = do not classify as active_demand.$lh$,
  $lh$internal evidence requirement baseline$lh$,
  $lh$verified$lh$,
  array[$lh$evidence$lh$, $lh$demand-phrase$lh$, $lh$service-phrase$lh$, $lh$location$lh$, $lh$freshness$lh$, $lh$minimum$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Tender and Public Procurement Detection$lh$,
  $lh$Demand Discovery$lh$,
  $lh$How to detect tender notices and formal procurement requests for luxury services.$lh$,
  $lh$Public tender signals: "invitation to tender", "ITT", "appel d'offres", "avis de march ", "call for proposals", "tender notice", "public procurement". Luxury event tender signals: "event planning tender", "hospitality tender", "VIP transfer tender", "luxury fleet tender". Government and institutional: Monaco Government events, Cannes Festival procurement, Grand Prix organisation supply chain. These represent guaranteed, pre-budgeted demand but often require formal submission. Classify as active_demand with evidence. Note that tenders have firm deadlines - check for submission cutoff dates when determining urgency.$lh$,
  $lh$internal tender detection baseline$lh$,
  $lh$medium$lh$,
  array[$lh$tender$lh$, $lh$procurement$lh$, $lh$ITT$lh$, $lh$appel-offres$lh$, $lh$institutional$lh$, $lh$government$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Family Office Identification Signals$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify family office organisations and individuals in public web search results.$lh$,
  $lh$Strong family office signals: "family office", "single family office", "multi-family office", "family wealth management", "private wealth", "UHNW", "ultra-high-net-worth", "principal", "private capital", "family investment office", "MFO", "SFO". Contextual signals: "wealth manager" + yacht or charter or mobility. "Private bank" + client services + luxury. "Alternative investments" + lifestyle assets. "Asset management" + lifestyle or fleet. "Private equity" + lifestyle spending. Geography: family offices in Monaco, Geneva, Zurich, London, Dubai. Look for: Monaco-registered entities (SAM, SAS, SARL), Swiss-registered family vehicles (Foundation, AG, GmbH), Cayman or BVI holding companies in content. These are B2B targets, not individuals.$lh$,
  $lh$internal company discovery baseline$lh$,
  $lh$verified$lh$,
  array[$lh$family-office$lh$, $lh$UHNW$lh$, $lh$wealth-management$lh$, $lh$principal$lh$, $lh$private-wealth$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Yacht Brokerage Company Identification$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify yacht brokerage firms as company leads or referral partners.$lh$,
  $lh$Yacht brokerage signals: "yacht broker", "superyacht broker", "yacht brokerage", "central agent", "brokerage listing", "buyer representation", "exclusive mandate", "off-market yacht", "yacht sales", "sail and power broker". Geographic: Monaco, Antibes, Palma, Fort Lauderdale, Sydney. Company types: established brokerage houses (multiples agents), boutique single-broker practices, owner-managers who also charter yachts. Dual-role alert: some brokers are also charter brokers or managers. Useful as: Company lead (if they represent buyers), partner (if they cross-refer). Do not use provider rejection on yacht brokers in company or partner discovery modes.$lh$,
  $lh$internal brokerage identification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$yacht-broker$lh$, $lh$brokerage$lh$, $lh$central-agent$lh$, $lh$off-market$lh$, $lh$mandate$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Concierge Business Identification$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify concierge services as high-value referral partners or company leads.$lh$,
  $lh$Concierge business signals: "concierge service", "luxury concierge", "lifestyle management", "VIP concierge", "private concierge", "membership concierge", "personal assistant service", "lifestyle advisor", "estate management". Monaco-specific: Monaco-registered concierge firms, often serving HNWI residents. Hotel concierge departments (not usually a company lead, but a contact within a hotel). Key qualifier: does the concierge refer clients to service providers? If yes, they are a partner lead. Do they have HNW clients needing yacht or car services? If yes, they are a company lead whose clients need your services. Look for: websites that say "we connect our members with..." or "partner network including" or "curated access to".$lh$,
  $lh$internal concierge identification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$concierge$lh$, $lh$lifestyle-management$lh$, $lh$VIP$lh$, $lh$personal-assistant$lh$, $lh$partner$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Luxury Hotel Identification for Partnership$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify luxury hotels as referral partners for yacht charter and car rental.$lh$,
  $lh$Hotel partner signals: "5-star hotel" + Monaco or Cannes or Nice. "Palace hotel" + French Riviera. "Luxury hotel" + concierge + yacht or transfer. Specific hotel names as partnership targets: Hotel de Paris (Monaco), Hermitage Hotel (Monaco), Le M ridien (Nice), InterContinental Carlton (Cannes), Hotel du Cap-Eden-Roc (Antibes), H tel Barri re le Majestic (Cannes). Hotel concierge is the decision-maker for referrals. Look for: hotels that already mention yacht or transfer services on their website as "recommended partners". Presence on their partners/activities page signals openness to partnership.$lh$,
  $lh$internal hotel identification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$hotel$lh$, $lh$5-star$lh$, $lh$palace$lh$, $lh$concierge$lh$, $lh$monaco$lh$, $lh$cannes$lh$, $lh$partnership$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Luxury Travel Advisor Identification$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify luxury travel advisors as high-value referral partners.$lh$,
  $lh$Luxury travel advisor signals: "luxury travel advisor", "private travel planner", "bespoke travel", "tailor-made travel", "travel designer", "UHNW travel", "ultra-luxury travel", "private travel management", "exclusive itineraries". Membership/network signals: membership of Virtuoso, Signature Travel Network, ASTA, Traveller Made, Altour, Ensemble. Why they matter: luxury travel advisors regularly book yacht charters and high-end transfers for their clients. A partnership with one advisor can generate multiple bookings per year. Commission expectations: typically 10-15% referral fee. Focus on: advisors who specifically mention Mediterranean, Cote d'Azur, Monaco, superyacht itineraries.$lh$,
  $lh$internal travel advisor baseline$lh$,
  $lh$verified$lh$,
  array[$lh$travel-advisor$lh$, $lh$luxury-travel$lh$, $lh$virtuoso$lh$, $lh$bespoke$lh$, $lh$itinerary$lh$, $lh$referral$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Event Agency Identification for Car Rental and Charter$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify event companies as company leads for VIP transfer and charter services.$lh$,
  $lh$Event agency signals: "event agency", "luxury event company", "corporate event", "incentive travel", "VIP event", "conference organiser", "product launch event", "brand activation", "gala dinner", "awards ceremony", "incentive programme". Event signals that create mobility demand: product launches requiring executive transfers, team-building days requiring charter or minibus, gala dinners requiring luxury arrivals, award ceremonies with celebrity guests. Monaco and Cannes have permanent event infrastructure: convention centres, Grand Prix hospitality, festival organisations. These are ideal company leads for multiple bookings per year.$lh$,
  $lh$internal event agency baseline$lh$,
  $lh$verified$lh$,
  array[$lh$event-agency$lh$, $lh$corporate-event$lh$, $lh$incentive$lh$, $lh$VIP-event$lh$, $lh$product-launch$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Villa and Estate Management Company Identification$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify villa management companies as company leads for car rental and charter services.$lh$,
  $lh$Villa management signals: "villa management", "estate management", "property management" + Monaco or Riviera or Cannes. "Luxury villa rental" + concierge. "Villa concierge service". "Villa lifestyle management". Why they matter: villa managers book services for their villa clients: airport transfers, yacht day trips, car rentals, crew transfers. High repeat business potential. They usually have multiple properties and multiple clients simultaneously. Look for: management companies that list transport or charter in their "services" or "partnerships". Target villa management firms in Cap Ferrat, Cap d'Antibes, Eze, Mougins, Saint-Jean-Cap-Ferrat.$lh$,
  $lh$internal villa management baseline$lh$,
  $lh$verified$lh$,
  array[$lh$villa-management$lh$, $lh$estate-management$lh$, $lh$property$lh$, $lh$concierge$lh$, $lh$cap-ferrat$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Private Aviation Company Identification for Cross-Referral$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify private aviation operators as high-value referral partners.$lh$,
  $lh$Private aviation signals: "private jet", "charter aircraft", "business aviation", "VIP aviation", "air charter", "private aviation operator", "FBO", "fixed base operator", "VVIP transport". Cross-referral logic: clients who charter private jets also charter superyachts and use luxury ground transport. Aviation clients typically have the budget and lifestyle profile for all three business lines. Aviation to yacht: "clients looking for a seamless Monaco arrival with yacht meet-and-greet". Aviation to car rental: "luxury transfers from Nice private terminal". Look for: private aviation operators based at Nice Cote d'Azur Airport (NCE), Cannes Mandelieu Airport (CEQ), Monaco Heliport. Partnership value: aviation partners are among the highest-value referral sources.$lh$,
  $lh$internal aviation cross-referral baseline$lh$,
  $lh$verified$lh$,
  array[$lh$private-aviation$lh$, $lh$private-jet$lh$, $lh$FBO$lh$, $lh$NCE$lh$, $lh$aviation-referral$lh$, $lh$cross-referral$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$UHNW Individual Identification for Yacht Sale$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify ultra-high-net-worth individuals as yacht acquisition prospects.$lh$,
  $lh$UHNW individual signals: Forbes or Bloomberg rich list mentions + leisure or yacht. "Billionaire" + leisure assets. "Art collector" + Mediterranean villa (lifestyle asset buyer profile). "Tech founder" + superyacht. "Private equity principal" + property + Monaco. Ownership signals: Reported yacht ownership. Yacht media coverage mentioning the individual by name. Marina registrations (where public). Buyer intent signals: "seeking yacht", "considering acquisition", "investing in lifestyle assets", "expanding superyacht portfolio". Privacy caution: UHNW individuals often use holding companies, foundations or trusts. A name alone is rarely enough to confirm decision authority. Always note the source reliability.$lh$,
  $lh$internal UHNW identification baseline$lh$,
  $lh$medium$lh$,
  array[$lh$UHNW$lh$, $lh$billionaire$lh$, $lh$individual$lh$, $lh$yacht-buyer$lh$, $lh$acquisition$lh$, $lh$wealth$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Charter Company Identification as Company Lead$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify yacht charter companies that may need fleet additions or partnerships.$lh$,
  $lh$Charter company signals: "yacht charter company", "charter fleet", "charter management", "yacht management company", "charter programme". Why they are company leads: charter companies sometimes acquire additional yachts for their fleet (yacht sale lead). They may need ground transport for crew and clients (car rental lead). They are potential referral partners for car rental. Fleet expansion signals: "expanding our fleet", "new addition to our charter programme", "seeking yachts for our fleet", "accepting central agency listings". Qualification questions: fleet size, whether they accept new yachts, whether they refer ground transport to clients.$lh$,
  $lh$internal charter company baseline$lh$,
  $lh$verified$lh$,
  array[$lh$charter-company$lh$, $lh$fleet-expansion$lh$, $lh$management$lh$, $lh$charter-programme$lh$, $lh$company-lead$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Wealth Manager and Private Bank Identification$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to identify wealth management firms and private banks as lead sources for yacht sale.$lh$,
  $lh$Wealth manager signals: "wealth manager", "private bank", "family wealth advisor", "asset management" + Monaco or Switzerland. "Investment advisor" + UHNW. "Fiduciary" + lifestyle. "Family governance" + assets. Private banks operating in Monaco: BNP Paribas Wealth Management, Credit Suisse International (now UBS), Societe Generale Private Banking, CFM Indosuez (Monaco). Why they matter: wealth managers advise clients on lifestyle asset purchases. A partnership with a wealth manager can generate multiple yacht sale referrals per year. These are B2B leads, not direct buyer contacts. Commission sensitivity: wealth managers may have strict referral fee regulations.$lh$,
  $lh$internal wealth management baseline$lh$,
  $lh$verified$lh$,
  array[$lh$wealth-manager$lh$, $lh$private-bank$lh$, $lh$fiduciary$lh$, $lh$asset-management$lh$, $lh$monaco$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Company Lead vs Individual Buyer Distinction$lh$,
  $lh$Company Discovery$lh$,
  $lh$How to distinguish between a company lead and an individual buyer lead.$lh$,
  $lh$Company lead characteristics: legal entity (Ltd, SA, SAS, LLC, Foundation, Trust), multiple contact points, institutional procurement, referral or commission arrangement possible, B2B engagement, procurement cycle may be longer. Individual buyer characteristics: single decision-maker, personal purchase, emotional as well as rational decision, urgent when ready, faster transaction cycle. Why it matters: company leads go into long-term nurturing. Individual leads may need immediate contact. Lead Hunter's primary output is company leads (to research) and demand leads (to contact). Individual buyer outreach requires higher qualification before routing.$lh$,
  $lh$internal company vs individual baseline$lh$,
  $lh$verified$lh$,
  array[$lh$company-lead$lh$, $lh$individual$lh$, $lh$B2B$lh$, $lh$decision-maker$lh$, $lh$procurement$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Partner Discovery Taxonomy$lh$,
  $lh$Partner Discovery$lh$,
  $lh$The complete taxonomy of referral and commission partners for luxury mobility and yacht services.$lh$,
  $lh$Tier 1 partners (highest referral value): Private aviation operators. Hotel concierge departments (Palace/5-star). Luxury concierge membership services. Private wealth managers and family offices. Tier 2 partners (medium referral value): Luxury travel advisors and bespoke travel agencies. Villa and estate management companies. Event agencies and incentive travel planners. Yacht club managers and marina managers. Tier 3 partners (niche but valuable): VIP security firms and close-protection companies. Art advisors and art logistics companies. Luxury real estate agents in Monaco and Cote d'Azur. Wedding planners for luxury destination weddings. Partners are identified through: referral language ("we partner with", "our preferred", "we recommend"), their client type (UHNW clients with matching profile), and their geographic overlap with our markets.$lh$,
  $lh$internal partner taxonomy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$partner$lh$, $lh$referral$lh$, $lh$tier$lh$, $lh$concierge$lh$, $lh$aviation$lh$, $lh$hotel$lh$, $lh$taxonomy$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Referral Partner Detection Signals$lh$,
  $lh$Partner Discovery$lh$,
  $lh$How to detect that a website or company is open to referral partnerships.$lh$,
  $lh$Explicit partner signals: "partner with us", "referral programme", "affiliate programme", "become a partner", "referral fee", "commission structure", "preferred supplier programme", "partner network". Implicit partner signals: "we work with leading..." (they already partner with peers). "Our clients often need..." (they recognise demand their clients have). "Exclusively available through our partners" (they are already in a partnership model). Language patterns on About or Services pages: "we connect our members with exclusive providers", "curated access to the finest", "our network of trusted specialists". Geographic partner signals: Monaco, Cannes or Cote d'Azur service providers who mention transport, yacht or mobility as client needs.$lh$,
  $lh$internal partner detection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$referral-signals$lh$, $lh$partnership$lh$, $lh$commission$lh$, $lh$affiliate$lh$, $lh$preferred-supplier$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Aviation-Yacht Cross-Referral Opportunity$lh$,
  $lh$Partner Discovery$lh$,
  $lh$Why private aviation partners are the single highest-value referral source for yacht and car rental.$lh$,
  $lh$Client overlap is near-perfect: clients who charter private jets for Mediterranean trips also charter yachts or need luxury ground transport. The referral sequence: client books Nice arrival by private jet   needs luxury ground transfer from NCE to Monaco   also needs superyacht for a day trip or week charter. Aviation companies who serve this segment regularly: Netjets, VistaJet, Air Charter Service, Flexjet. FBOs (Fixed Base Operators) at NCE and Cannes Mandelieu are ideal partnership targets. Referral proposition: "your clients arrive by private jet - we make the Monaco or Cannes ground experience seamless." Average referral value: 1 aviation referral can generate EUR3,000-EUR50,000+ in charter or transfer bookings.$lh$,
  $lh$internal aviation partnership baseline$lh$,
  $lh$verified$lh$,
  array[$lh$aviation$lh$, $lh$cross-referral$lh$, $lh$FBO$lh$, $lh$NCE$lh$, $lh$private-jet$lh$, $lh$vistajet$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Monaco Grand Prix Hospitality Partner Discovery$lh$,
  $lh$Partner Discovery$lh$,
  $lh$How to identify F1 Grand Prix hospitality companies as partners for peak-season demand.$lh$,
  $lh$Monaco Grand Prix hospitality signals: "Grand Prix hospitality", "Formula 1 packages", "F1 Monaco packages", "hospitality tent", "race day experiences", "VIP race packages". Companies operating in this space: hospitality agencies that sell race packages, F1 corporate entertainment companies, team partner hospitality programmes. Why they matter: Grand Prix hospitality buyers need: luxury car rentals for the week, superyacht berths or day charters for viewing, airport transfers for arriving VIPs. Partner proposition: "We provide the ground transport and yacht access for your Grand Prix packages." Timing: begin partner outreach January-February for May Grand Prix. This is the single highest-revenue period for Monaco luxury mobility.$lh$,
  $lh$internal grand-prix partnership baseline$lh$,
  $lh$verified$lh$,
  array[$lh$grand-prix$lh$, $lh$F1$lh$, $lh$monaco$lh$, $lh$hospitality$lh$, $lh$race$lh$, $lh$peak-season$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Commission Arrangement Awareness for Partner Leads$lh$,
  $lh$Partner Discovery$lh$,
  $lh$What Lead Hunter should know about commission expectations when identifying partner leads.$lh$,
  $lh$Commission is the commercial mechanism for referral partnerships. Typical ranges: Luxury travel advisors: 10-15% of booking value. Hotel concierge: 5-10% per referral. Aviation FBOs: 5-10% per referral. Event agencies: 10-15% of contract value. Independent concierge services: 10-20%. Important boundaries: Lead Hunter must not negotiate, confirm or agree to commission arrangements. Commission discussions require human operator or management approval. Lead Hunter's role: identify that a commission arrangement may be appropriate, flag it in the candidate summary, route to operator. Never state specific commission rates in outreach drafts without operator instruction.$lh$,
  $lh$internal commission awareness baseline$lh$,
  $lh$verified$lh$,
  array[$lh$commission$lh$, $lh$referral-fee$lh$, $lh$partner$lh$, $lh$arrangement$lh$, $lh$operator-approval$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Strategic vs. Transactional Partner Distinction$lh$,
  $lh$Partner Discovery$lh$,
  $lh$How to distinguish between high-value strategic partners and one-off transactional referrers.$lh$,
  $lh$Strategic partners: organisations whose core business creates repeated, recurring referral opportunities for yacht and luxury mobility. Examples: private aviation operators, luxury hotels, concierge membership services, wealth managers. One referral from a strategic partner can lead to a long-term partnership generating multiple bookings per year. Transactional referrers: individuals or one-off contacts who have a single client need. Examples: a friend of a client who mentions "my colleague needs a transfer". Value: one booking only. Lead Hunter should identify and flag strategic partner opportunities for dedicated partnership conversations. Transactional referrers should be treated as demand leads, not partner leads.$lh$,
  $lh$internal partner classification baseline$lh$,
  $lh$verified$lh$,
  array[$lh$strategic-partner$lh$, $lh$transactional$lh$, $lh$recurring$lh$, $lh$referral$lh$, $lh$long-term$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Wedding Industry Partners for Luxury Transport$lh$,
  $lh$Partner Discovery$lh$,
  $lh$How to identify luxury wedding planners as car rental and transfer referral partners.$lh$,
  $lh$Luxury wedding planner signals: "luxury wedding planner", "destination wedding" + Monaco or Cote d'Azur, "wedding coordination" + chateau or villa or Monaco. Why they matter: destination weddings in Monaco and Cote d'Azur require: guest transfers from Nice Airport, wedding party transport (Rolls-Royce, Bentley), flower car and venue-to-venue movements. A single luxury wedding can generate EUR5,000-EUR30,000 in car rental business. Seasonal: March-October for Cote d'Azur weddings. Partner proposition: "We provide the dedicated luxury fleet for your Monaco and Riviera weddings." Identify planners who regularly work in the region and already have venue partner links.$lh$,
  $lh$internal wedding partner baseline$lh$,
  $lh$verified$lh$,
  array[$lh$wedding$lh$, $lh$destination-wedding$lh$, $lh$wedding-planner$lh$, $lh$rolls-royce$lh$, $lh$bentley$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Luxury Real Estate Partner Discovery$lh$,
  $lh$Partner Discovery$lh$,
  $lh$How to identify luxury real estate agents in Monaco and Cote d'Azur as referral partners.$lh$,
  $lh$Luxury real estate signals: "luxury property Monaco", "villa Cote d'Azur", "real estate Monaco", "prestige immobilier", "exclusive property agent", "villa sales Cap Ferrat". Why they matter: clients buying luxury properties in Monaco or Cap Ferrat need: charter yachts for due-diligence tours, luxury transfers for property viewings, car rental during relocation. A Monaco property sale can generate multiple service referrals. Referral proposition: "your property clients will need mobility services during their relocation and beyond." Major agencies: Savills Monaco, Knight Frank Monaco, Cote d'Azur Sotheby's International Realty, Monaco Christie's. Partner fit: luxury real estate agents are trusted advisors to their UHNW clients.$lh$,
  $lh$internal real-estate partner baseline$lh$,
  $lh$verified$lh$,
  array[$lh$real-estate$lh$, $lh$property$lh$, $lh$monaco$lh$, $lh$villa$lh$, $lh$sothebys$lh$, $lh$referral$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Charter Fleet Movement and New Availability Signals$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect when yachts enter or leave the charter market.$lh$,
  $lh$Fleet movement signals: "new addition to charter fleet", "now available for charter", "joins charter programme", "exclusive management", "newly available for charter bookings", "joins our fleet", "sold and now available", "refit complete and available". Refit completion signals: "back in service", "refit completed", "relaunched", "new season ready", "following extensive refit, available for charter". Removal signals: "sold", "off charter", "withdrawn from programme", "transferred to private use". Sources: Superyacht Times, Boat International, YachtCharterFleet.com, brokerage newsletters. Market intelligence value: knowing which yachts are newly available for charter helps identify gaps in the market and potential company leads (new management companies).$lh$,
  $lh$internal fleet intelligence baseline$lh$,
  $lh$verified$lh$,
  array[$lh$fleet-movement$lh$, $lh$charter$lh$, $lh$new-availability$lh$, $lh$refit$lh$, $lh$management$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Yacht Builder and Delivery News$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to track new yacht deliveries as market intelligence signals.$lh$,
  $lh$Delivery signals: "yacht launched", "hull launched", "sea trials completed", "delivery confirmed", "delivered to owner", "new build", "first delivery". Builder names to monitor: Feadship, L rssen, Benetti, Heesen, Sanlorenzo, Azimut, Princess, Sunseeker, Ferretti Group, Nobiskrug, Abeking & Rasmussen. Why deliveries matter: new yacht delivery = potential charter programme entry (yacht sale / charter management lead). Owner of a new superyacht is a potential charter management client. Multiple deliveries = fleet growth market signal. Builder order books indicate future supply. Sources: Superyacht Times launches, Boat International, Yachting World, Triton magazine.$lh$,
  $lh$internal yacht builder baseline$lh$,
  $lh$medium$lh$,
  array[$lh$yacht-builder$lh$, $lh$delivery$lh$, $lh$new-build$lh$, $lh$feadship$lh$, $lh$benetti$lh$, $lh$heesen$lh$, $lh$launch$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$New Luxury Hotel Openings as Market Signals$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect new hotel openings as market intelligence and partnership opportunity signals.$lh$,
  $lh$Hotel opening signals: "new hotel opening", "grand opening", "soft opening", "opening 2026", "new 5-star hotel", "new palace hotel", "opening Spring 2026". Geographic targets: Monaco, Cannes, Nice, Antibes, Saint-Tropez, Menton, Beaulieu. Why it matters: a new 5-star hotel in Monaco creates: immediate concierge partnership opportunity, new referral source for transfers and charter, potential client of our services for events. Sources: Hospitality Net, Travel + Leisure, Cond  Nast Traveller, local Cote d'Azur news. Action on detection: classify as market_intelligence. Add to partnership outreach list. Flag for operator: "new hotel opening in Cannes - potential partner opportunity."$lh$,
  $lh$internal hotel market intelligence baseline$lh$,
  $lh$verified$lh$,
  array[$lh$hotel-opening$lh$, $lh$new-hotel$lh$, $lh$market-intelligence$lh$, $lh$partnership$lh$, $lh$cannes$lh$, $lh$monaco$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Marina Expansion and New Berth Capacity$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect marina developments as market intelligence for yacht operations.$lh$,
  $lh$Marina expansion signals: "marina expansion", "new berths", "new pontoons", "increased capacity", "marina development", "superyacht berths available", "new marina opening". Monaco: Port Hercules expansion updates. Antibes: Port Vauban. Cannes: Port Pierre Canto and Old Port. Nice: Port of Nice. Saint-Tropez: Port de Saint-Tropez new pontoons. Why it matters: new berth capacity = more charter bases = more potential charter management clients. Marina authority announcements often precede fleet growth. Sources: Marina.com, Marina World, Refit International, local coastal authority press releases.$lh$,
  $lh$internal marina intelligence baseline$lh$,
  $lh$medium$lh$,
  array[$lh$marina$lh$, $lh$berths$lh$, $lh$expansion$lh$, $lh$Port-Hercules$lh$, $lh$Antibes$lh$, $lh$capacity$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Competitor Activity Detection$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect competitor fleet changes, pricing shifts and service expansions.$lh$,
  $lh$Competitor monitoring signals: "new fleet addition" + competitor name. "Now offering" + competitor brand. "Expanding to Monaco" or "Expanding to Cannes". Press releases from car rental or charter competitors. Social media activity from competitors. New review platform appearances. Why it matters: competitor expansion signals demand growth in that market segment. Competitor fleet additions indicate which vehicle types are in demand. Competitor pricing drops may indicate market pressure. Lead Hunter's role: collect and classify competitor activity as market_intelligence. Never contact competitors' clients directly. Note: provider detection should NOT classify competitor activity as a rejection in market_intelligence mode.$lh$,
  $lh$internal competitor intelligence baseline$lh$,
  $lh$medium$lh$,
  array[$lh$competitor$lh$, $lh$fleet-expansion$lh$, $lh$pricing$lh$, $lh$market-shift$lh$, $lh$intelligence$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Industry Conference and Show Signals$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to use yacht show and industry conference information as market intelligence.$lh$,
  $lh$Major shows: Monaco Yacht Show (September). Cannes Yachting Festival (September). Fort Lauderdale International Boat Show (October). Boot D sseldorf (January). Singapore Yacht Show. Conference signals: "attending", "exhibiting at", "new launch at Monaco Yacht Show", "world premiere", "debut". Why it matters: yacht show presence signals: active sellers (seeking buyers), active buyers (attending to purchase), new fleet additions (launches), market trend announcements. Car rental intelligence: yacht show creates peak transfer demand in September in Monaco and Cannes. Conference season overlap in October creates demand for airport transfers across major European cities.$lh$,
  $lh$internal yacht-show intelligence baseline$lh$,
  $lh$medium$lh$,
  array[$lh$yacht-show$lh$, $lh$monaco-yacht-show$lh$, $lh$cannes-festival$lh$, $lh$conference$lh$, $lh$exhibit$lh$, $lh$trade$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Season Opening and Season Closing Intelligence$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect Mediterranean charter season opening and closing signals.$lh$,
  $lh$Season opening signals (April-June): "open for charter", "season bookings now open", "new season schedule", "accepting bookings for summer 2026", "now departing from Monaco". Season closing signals (September-October): "last charters of the season", "returning to shipyard", "winter berth", "refit period". Season intelligence value: operators can time marketing campaigns to charter season opening demand spikes. Understanding which bases are opening earlier or later than usual provides advantage. Summer peak confirmation: when most fleet announces "no availability from June 15-September 1", that signals the market is full and demand is highest.$lh$,
  $lh$internal season intelligence baseline$lh$,
  $lh$verified$lh$,
  array[$lh$season-opening$lh$, $lh$charter-season$lh$, $lh$booking$lh$, $lh$summer$lh$, $lh$mediterranean$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Industry Expansion Signals for New Market Entry$lh$,
  $lh$Market Intelligence$lh$,
  $lh$How to detect expansion of the luxury mobility market into new geographies or segments.$lh$,
  $lh$Market expansion signals: new charter bases (superyacht companies opening operations in new marinas). New ground transport operators entering Monaco or Cote d'Azur (competitive threat). New private aviation routes to NCE or Cannes Mandelieu (demand expansion). New hotel openings in adjacent geographies. International clientele expansion signals: Russian, Middle Eastern, Asian buyer emergence in Mediterranean market (post-sanction or seasonal). Why it matters: market expansion = new demand, new potential partners, new competitive pressure. All expansion signals should be classified as market_intelligence and routed to operator awareness.$lh$,
  $lh$internal market expansion baseline$lh$,
  $lh$medium$lh$,
  array[$lh$market-expansion$lh$, $lh$new-geography$lh$, $lh$competitive$lh$, $lh$new-operator$lh$, $lh$international$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Classification Decision Tree Overview$lh$,
  $lh$Classification$lh$,
  $lh$The step-by-step decision tree for classifying every search result.$lh$,
  $lh$Step 1: Is it a job ad? Check for hiring, vacancy, CDI, CDD, "chauffeur wanted", "looking for driver", "offre d'emploi". If yes   job_ad. End. Step 2: Is it a generic directory? Check for "top 10", "best 10", "compare", "comparison", "directory", "Tripadvisor", "Yelp" (2+ signals). If yes   generic_directory. End. Step 3 (demand_discovery only): Is it a provider/competitor page? Check for self-promotional language (2+ signals: "our fleet", "we offer", "book with us", "notre flotte"). If yes AND no demand phrase   provider_page. End. Step 4 (demand_discovery only): Is the content stale without freshness? If stale year (2020-2023) AND no current signals   old_expired. End. Step 5 (demand_discovery): Is there sufficient demand evidence? demandPhrase + 1 more piece   active_demand. Only demandPhrase   unclear. Step 6 (other modes): Does content have relevant business terms? If yes   company_lead OR partner_lead OR market_intelligence by mode. If no   irrelevant.$lh$,
  $lh$internal classification decision tree$lh$,
  $lh$verified$lh$,
  array[$lh$classification$lh$, $lh$decision-tree$lh$, $lh$pipeline$lh$, $lh$job-ad$lh$, $lh$provider$lh$, $lh$demand$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Company Lead Classification Rules$lh$,
  $lh$Classification$lh$,
  $lh$Specific rules for classifying a result as a company_lead.$lh$,
  $lh$Classify as company_lead when ALL are true: (1) search mode is company_discovery. (2) result text contains business line-relevant terms (yacht, superyacht, acquisition, broker, family office, charter, car rental, concierge, transfer). (3) result is not a job ad, not a directory, not clearly a provider page advertising its own service. (4) the entity appears to be an organisation or individual with commercial decision-making authority. Do not classify as company_lead if the result is a news article about the company (classify as market_intelligence instead), or if it is a directory listing of multiple companies (classify as generic_directory).$lh$,
  $lh$internal company lead classification rules$lh$,
  $lh$verified$lh$,
  array[$lh$company-lead$lh$, $lh$classification$lh$, $lh$business-terms$lh$, $lh$decision-authority$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Partner Lead Classification Rules$lh$,
  $lh$Classification$lh$,
  $lh$Specific rules for classifying a result as a partner_lead.$lh$,
  $lh$Classify as partner_lead when ALL are true: (1) search mode is partner_discovery. (2) result text contains referral-compatible business signals (concierge, travel advisor, hotel, aviation, event agency, villa management, wedding planner). (3) result is not a job ad. (4) the entity appears to refer or connect clients to service providers. Company type signals for partner_lead: membership services, lifestyle management companies, access-based services, curated experience providers, travel agency with specialist portfolio. Note: in partner_discovery mode, do not apply provider rejection - concierge and hotel websites may look like providers but they are potential partners.$lh$,
  $lh$internal partner lead classification rules$lh$,
  $lh$verified$lh$,
  array[$lh$partner-lead$lh$, $lh$classification$lh$, $lh$concierge$lh$, $lh$travel-advisor$lh$, $lh$referral-partner$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Provider Page Detection Rules$lh$,
  $lh$Classification$lh$,
  $lh$Detailed rules for detecting and rejecting competitor and provider pages in demand discovery.$lh$,
  $lh$Provider page signals (apply to demand_discovery mode only): "we offer", "our fleet", "rent our", "hire our", "book with us", "notre flotte", "nos v hicules", "louez notre", "book now", "request a quote from us", "starting from EURX per day", "our chauffeur service", "our transfer service". Decision rule: if 2 or more provider signals are present AND the page contains no genuine human demand phrase ("looking for", "I need", "seeking")   classify as provider_page. If only 1 provider signal is present   do not reject on this basis alone (many informational pages mention services descriptively). If provider signals are present AND a demand phrase is also present   demand phrase takes precedence; classify as active_demand or unclear based on evidence strength.$lh$,
  $lh$internal provider detection rules$lh$,
  $lh$verified$lh$,
  array[$lh$provider-page$lh$, $lh$competitor$lh$, $lh$demand-discovery$lh$, $lh$rejection$lh$, $lh$our-fleet$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Job Advertisement Detection Rules$lh$,
  $lh$Classification$lh$,
  $lh$Complete rules for detecting and rejecting job advertisements across all search modes.$lh$,
  $lh$Job ad detection applies to ALL search modes. Even in market_intelligence mode, a job ad for a fleet manager is not useful market intelligence. Primary signals (one is sufficient): "hiring", "we are hiring", "now hiring", "job opening", "CDI", "CDD", "salaire", "employment", "vacancy", "offre d'emploi", "conducteur recherch ", "chauffeur wanted", "looking for a driver", "apply now", "send your CV", "postuler". Secondary signals (confirm if ambiguous): "full-time", "part-time", "shift hours", "driving licence required", "experience required", "job description", "salary range". Title patterns: "Chauffeur Wanted - Monaco", "Driver Needed - Cannes", "Fleet Manager Vacancy". Immediate rejection: a result with any one of the primary signals should be classified as job_ad without further evidence required.$lh$,
  $lh$internal job ad detection rules$lh$,
  $lh$verified$lh$,
  array[$lh$job-ad$lh$, $lh$hiring$lh$, $lh$CDI$lh$, $lh$offre-emploi$lh$, $lh$chauffeur-wanted$lh$, $lh$driver-vacancy$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Generic Directory and Comparison Page Rules$lh$,
  $lh$Classification$lh$,
  $lh$Rules for detecting and rejecting directory, comparison and aggregator pages.$lh$,
  $lh$Generic directory signals (two or more = generic_directory): "top 10", "best 10", "top 5", "best 5", "top 20", "list of companies", "compare services", "comparison", "directory", "yellow pages", "annuaire", "les meilleures", "meilleurs services", "rated", "review aggregator", "Tripadvisor", "Yelp", "Google My Business listing", "Trustpilot collection page". The key identifier: the page lists MULTIPLE providers rather than representing one entity. Single provider comparison widgets embedded in a legitimate company page should NOT trigger directory rejection. A TripAdvisor review page for a single company is not a directory. A TripAdvisor page listing "Top 10 Transfer Services in Monaco" is a directory.$lh$,
  $lh$internal directory rejection rules$lh$,
  $lh$verified$lh$,
  array[$lh$directory$lh$, $lh$comparison$lh$, $lh$top-10$lh$, $lh$aggregator$lh$, $lh$tripadvisor$lh$, $lh$rejection$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Old and Expired Content Detection Rules$lh$,
  $lh$Classification$lh$,
  $lh$Rules for detecting stale content in demand discovery mode.$lh$,
  $lh$Old/expired content applies primarily to demand_discovery mode. A 2021 post asking for a yacht charter is worthless as a demand signal. Detection: explicit year signals in title or snippet: "2020", "2021", "2022", "2023" combined with no current-year signals. URL patterns: /2021/, /archive/2021, dated blog post URLs. Snippet language: "last year", "in 2022", "back in 2021". Combined with no freshness signal (no "today", "this week", "2025", "2026"). Exception: old content that is still relevant (evergreen business profile of a family office). Old content rule applies to: demand posts, event requests, tender notices. It does NOT apply to: company profiles, marina information, partner directories.$lh$,
  $lh$internal freshness rejection rules$lh$,
  $lh$verified$lh$,
  array[$lh$old-content$lh$, $lh$stale$lh$, $lh$expired$lh$, $lh$2021$lh$, $lh$date-detection$lh$, $lh$demand-discovery$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$SEO Content and Content Farm Detection$lh$,
  $lh$Classification$lh$,
  $lh$How to detect search engine optimised content that is not genuine commercial information.$lh$,
  $lh$SEO content signals: articles written to rank for keywords with no genuine commercial purpose. Patterns: "best X for Y" lists without actual specifics. Thin content: less than 300 words. Keyword stuffing: same term repeated many times. No author, no date, no specific location. Generic advice: "to find a luxury transfer in Monaco, simply search online." Content farm signals: multiple unrelated topics on the same domain. No contact information. Generic stock images. Auto-generated paragraph structures. For Lead Hunter, SEO content is a common source of confusion. A blog post titled "How to Find a Yacht Charter in Monaco" appears relevant but contains no demand signal and no commercial lead opportunity. Classify as irrelevant, not as market_intelligence.$lh$,
  $lh$internal SEO detection rules$lh$,
  $lh$verified$lh$,
  array[$lh$SEO$lh$, $lh$content-farm$lh$, $lh$thin-content$lh$, $lh$keyword-stuffing$lh$, $lh$irrelevant$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Duplicate Result Detection Rules$lh$,
  $lh$Classification$lh$,
  $lh$How to detect and handle duplicate results within a search session.$lh$,
  $lh$URL-based duplicates: same URL appearing in results for multiple different queries. Detection: normalise URL (remove protocol, www, trailing slash, query string, fragment). If normalised URL already seen in this session   duplicate. Skip without scoring. Title-based near-duplicates: same title appearing from slightly different URLs (e.g., the same article syndicated to multiple sites). Detection: normalise title (lowercase, remove punctuation). If title already seen   likely duplicate. Skip or flag. Content-based duplicates: same snippet with minor variations (common in news aggregation). De-prioritise rather than reject. Cross-session duplicates: a URL that was already approved in a previous campaign should not generate a new approval. This is Memory system responsibility (not V1 engine).$lh$,
  $lh$internal deduplication rules$lh$,
  $lh$verified$lh$,
  array[$lh$duplicate$lh$, $lh$URL-dedup$lh$, $lh$title-dedup$lh$, $lh$normalisation$lh$, $lh$session$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Unclear Classification Rules and Handling$lh$,
  $lh$Classification$lh$,
  $lh$When to classify as unclear and how to handle it.$lh$,
  $lh$Classify as unclear when: (1) demand_discovery mode AND demand phrase found in title/snippet BUT insufficient other evidence (no location, no service, no freshness). (2) The result could be demand OR provider but signals are ambiguous. (3) The result contains relevant terms but no clear intent signal either way. Handling: do not create approval from unclear results. Do not reject as garbage - the opportunity may be real. Flag for operator review if the snippet suggests meaningful content. Generate a low-confidence summary: "This result may contain demand evidence but lacks sufficient context to classify reliably. Requires operator review." In practice: if unclear results represent more than 30% of a session, the search queries need refinement.$lh$,
  $lh$internal unclear classification rules$lh$,
  $lh$verified$lh$,
  array[$lh$unclear$lh$, $lh$ambiguous$lh$, $lh$insufficient-evidence$lh$, $lh$operator-review$lh$, $lh$low-confidence$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Irrelevant Result Detection and Handling$lh$,
  $lh$Classification$lh$,
  $lh$When to classify a result as irrelevant and skip it.$lh$,
  $lh$Classify as irrelevant when: (1) company_discovery mode AND the result contains none of the business line-relevant terms. (2) The result is about an entirely unrelated topic that happens to contain a query keyword in an unrelated context. Example: a query for "\"yacht\" \"Monaco\"" returns an article about Monaco's tax laws with no yacht content. (3) The domain appears to be a non-commercial, non-relevant source (academic paper, government statistics, NGO). (4) The page is clearly about a different geographic market with no connection to the target geography. Irrelevant results require no further processing, no scoring, no approval. They are silently rejected and counted in session statistics.$lh$,
  $lh$internal irrelevant classification rules$lh$,
  $lh$verified$lh$,
  array[$lh$irrelevant$lh$, $lh$classification$lh$, $lh$rejection$lh$, $lh$off-topic$lh$, $lh$unrelated$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Classification Confidence and Grade Assignment$lh$,
  $lh$Classification$lh$,
  $lh$How to assign classification confidence when evidence is mixed or partial.$lh$,
  $lh$High confidence classification: 3+ strong signals all pointing to the same classification. Example: "we are looking for a yacht charter" (demand) + "Monaco next week" (location + freshness) = active_demand at high confidence. Medium confidence: 2 signals with one ambiguous. Example: "looking for" (demand) + "Monaco" (location) but no service or freshness = active_demand at medium confidence. Low confidence: 1 signal only, or signals conflict. Example: page mentions "looking for" once in a general context surrounded by provider language. Confidence affects: opportunity score (high conf   higher grade), approval creation (low conf   no approval, return as unclear), recommendation (low conf   monitor, not contact).$lh$,
  $lh$internal classification confidence rules$lh$,
  $lh$verified$lh$,
  array[$lh$confidence$lh$, $lh$classification$lh$, $lh$signals$lh$, $lh$evidence-quality$lh$, $lh$grade$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Freshness Signal Taxonomy$lh$,
  $lh$Freshness$lh$,
  $lh$Complete taxonomy of freshness signals from strongest to weakest.$lh$,
  $lh$Level 1 - Immediate freshness (today/tonight): "today", "tonight", "right now", "immediately", "asap", "urgently", "last minute", "aujourd'hui", "ce soir", "urgente", "subito", "heute", "sofort", "hoy", "ahora mismo", "       ". Level 2 - Near-term freshness (tomorrow/this week): "tomorrow", "this weekend", "next week", "this week", "demain", "ce week-end", "cette semaine", "morgen", "diese woche", "ma ana". Level 3 - Month-level freshness (this month/season): "this month", "this summer", "July 2026", "August 2026", "ce mois", " t  2026", "juillet 2026". Level 4 - Year-level freshness (current year): "2026", "2025", "2026 season". Level 5 - No explicit freshness (neutral): No date or time signal at all. Level 6 - Stale content: "2020", "2021", "2022", "2023" without current-year counterbalance.$lh$,
  $lh$internal freshness taxonomy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$freshness$lh$, $lh$taxonomy$lh$, $lh$today$lh$, $lh$tomorrow$lh$, $lh$urgency$lh$, $lh$stale$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Freshness Requirement by Search Mode$lh$,
  $lh$Freshness$lh$,
  $lh$How freshness requirements differ between demand discovery and other search modes.$lh$,
  $lh$Demand discovery: freshness is required for A or B grade classification. A demand post from 2021 asking for a yacht charter is worthless - the need has long since been met. If no freshness signal exists in a demand discovery result, classify as old_expired (if stale year found) or unclear (if no date at all). The absence of freshness should never produce active_demand classification. Company discovery: freshness is NOT required. A family office profile or wealth management company website does not need to have been published recently. The business still exists. Partner discovery: freshness is optional. A concierge company website does not expire. Market intelligence: freshness PREFERRED. A 2021 market report is historical context, not current intelligence. Prefer current-year market signals.$lh$,
  $lh$internal freshness requirements by mode$lh$,
  $lh$verified$lh$,
  array[$lh$freshness$lh$, $lh$demand-discovery$lh$, $lh$company-discovery$lh$, $lh$mode-specific$lh$, $lh$requirement$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Stale Content Indicators$lh$,
  $lh$Freshness$lh$,
  $lh$How to detect that a result is outdated and should be treated as old content.$lh$,
  $lh$Stale content indicators: explicit old year in title: "Top Transfer Services Monaco 2021". Old year in URL: /2021/, /archive/2020, dated slug like /news/2019/. Old year in snippet without current-year counterbalance: "In 2022, the French Riviera saw..." Archived page indicators: "web archive", "cached page", "this content was last updated". Platform age indicators: forum posts with timestamps clearly in 2020 or earlier. Combined signal: stale year + no current freshness signal = stale result. Exception: if a page has a stale publication date but contains current information embedded ("Updated July 2026, the service is..."), treat as fresh based on the update date, not the original publication.$lh$,
  $lh$internal stale content baseline$lh$,
  $lh$verified$lh$,
  array[$lh$stale$lh$, $lh$old-content$lh$, $lh$archive$lh$, $lh$2021$lh$, $lh$outdated$lh$, $lh$expiry$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Seasonal Freshness Context for Mediterranean Markets$lh$,
  $lh$Freshness$lh$,
  $lh$How to interpret freshness signals in the context of Mediterranean charter seasons.$lh$,
  $lh$Mediterranean context: "this season" without a year is ambiguous. Could mean current season or last season. Prefer results that specify year. Season-specific freshness: "summer 2026" = fresh. "summer 2025" + current date after October 2025 = potentially historical. "Summer season" without year = ambiguous. Charter advance booking context: a charter enquiry for August 2026 submitted in March 2026 is time-relevant even though August has not arrived yet. Treat advance bookings as fresh demand. Monaco Grand Prix freshness: anything mentioning Monaco GP 2026 is fresh and urgent during April-May period. Season-end context: a "looking for" post for "this summer" submitted in September when summer is ending should still be treated as current but downgraded from A to B priority.$lh$,
  $lh$internal seasonal freshness baseline$lh$,
  $lh$verified$lh$,
  array[$lh$seasonal$lh$, $lh$freshness$lh$, $lh$summer-2026$lh$, $lh$mediterranean$lh$, $lh$advance-booking$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Date Extraction Rules for Search Results$lh$,
  $lh$Freshness$lh$,
  $lh$How to extract and interpret date information from search result titles, snippets and URLs.$lh$,
  $lh$Date extraction sources (in priority order): explicit date in snippet text ("posted June 2026", "updated May 2026"), month+year pattern in title ("July 2026 Transfer Requests"), year in title ("Best Monaco Transfers 2026"), year in URL (/2026/05/), platform publication date (Reddit/LinkedIn post date if visible in snippet). Important: the search query may contain year qualifiers - do not use the query date as freshness evidence for the result. The result itself must contain the date signal. Missing date: when no date can be extracted from a result, treat as "unknown freshness" and apply mode-specific handling (reject in demand_discovery, allow in company_discovery).$lh$,
  $lh$internal date extraction baseline$lh$,
  $lh$verified$lh$,
  array[$lh$date-extraction$lh$, $lh$publication-date$lh$, $lh$URL-date$lh$, $lh$snippet-date$lh$, $lh$year$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Historical vs Archive vs Expired Content Distinction$lh$,
  $lh$Freshness$lh$,
  $lh$The difference between historical, archived and expired content and how to handle each.$lh$,
  $lh$Historical content: content about past events that provides context but is not actionable. Example: "In the 2022 charter season, demand for minibuses increased." Classification: market_intelligence (historical) if the insight is relevant; irrelevant if not. Archive content: web pages that were once live and are now preserved. Example: Wayback Machine snapshots, Google cached pages. Classification: always check if a more current version exists before classifying. Expired content: content that was once actionable but the action date has passed. Example: "Looking for a transfer for tomorrow, September 15 2022". Classification: old_expired in demand_discovery mode. The key question: is this content actionable today? If yes: classify normally. If no: old_expired or historical.$lh$,
  $lh$internal historical archive baseline$lh$,
  $lh$verified$lh$,
  array[$lh$historical$lh$, $lh$archive$lh$, $lh$expired$lh$, $lh$wayback$lh$, $lh$context$lh$, $lh$actionable$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$French Riviera / Cote d'Azur Territory Map$lh$,
  $lh$Geography$lh$,
  $lh$Complete geographic territory for the French Riviera / Cote d'Azur commercial zone.$lh$,
  $lh$The Cote d'Azur (French Riviera) commercial zone includes: Main cities: Nice, Cannes, Antibes, Monaco (Principality, separate country but fully integrated), Menton, Beaulieu-sur-Mer. Sub-areas within Antibes area: Juan-les-Pins, Golfe-Juan, Cap d'Antibes. Eastern Riviera: Roquebrune-Cap-Martin, Eze, Cap Ferrat, Saint-Jean-Cap-Ferrat, Villefranche-sur-Mer. Western Riviera: Saint-Tropez (seasonal), Sainte-Maxime, Fr jus, Saint-Rapha l. Inland: Mougins, Valbonne, Sophia Antipolis, Biot. Airport: Nice Cote d'Azur International Airport (IATA: NCE). Secondary airport: Cannes Mandelieu (IATA: CEQ). Heliport: Monaco Heliport. Department: Alpes-Maritimes (06).$lh$,
  $lh$internal geography baseline$lh$,
  $lh$verified$lh$,
  array[$lh$cote-dazur$lh$, $lh$french-riviera$lh$, $lh$nice$lh$, $lh$cannes$lh$, $lh$antibes$lh$, $lh$monaco$lh$, $lh$geography$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Monaco Commercial Zone and Terminology$lh$,
  $lh$Geography$lh$,
  $lh$Specific Monaco geographic identifiers and commercial context.$lh$,
  $lh$Monaco identifiers: "Monaco", "Monte-Carlo", "Monte Carlo", "Principaut  de Monaco", "Principality of Monaco", "MC", postal code 98000. Port identifiers: "Port Hercules" (main commercial port), "Port de Fontvieille" (western port), "Port de la Condamine". Key areas: Casino area (Place du Casino, Hotel de Paris area), Fontvieille (business area), La Condamine, Larvotto (beaches), Monte-Carlo (entertainment district). Monaco is 2km  - all addresses within Monaco are within 5 minutes of each other. Helicopter connection to Nice: 7 minutes. Monaco Grand Prix circuit: the entire Principality becomes the race venue in May. ISD code: +377. Language: French primarily, many English and Italian speakers.$lh$,
  $lh$internal monaco geography baseline$lh$,
  $lh$verified$lh$,
  array[$lh$monaco$lh$, $lh$monte-carlo$lh$, $lh$port-hercules$lh$, $lh$fontvieille$lh$, $lh$principality$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Airport to Destination Mapping for Transfer Demand$lh$,
  $lh$Geography$lh$,
  $lh$Key airport-to-destination travel information relevant to transfer demand detection.$lh$,
  $lh$Nice Cote d'Azur (NCE): Main gateway for French Riviera and Monaco. To Monaco: 22km by road (30-45 min by luxury car). To Cannes: 25km (30-40 min). To Antibes: 18km (25-35 min). To Monaco by helicopter: 7 min. To Saint-Tropez: 90-120km (1.5-2 hours). Cannes Mandelieu (CEQ): Private aviation only. To Cannes: 5km (10 min). To Monaco: 40km (50 min). Monaco Heliport: Helicopter connections to NCE, Italian coast, French Alps. Search demand signals for airports: "airport transfer", "NCE to Monaco", "Nice Airport pickup", "arriving Nice Airport", "flight landing Nice", "collect from NCE", "a roport de Nice", "a roport Nice Cote d'Azur". Van/minibus demand signals: "crew pickup NCE", "team arriving Nice", "group transfer airport".$lh$,
  $lh$internal airport geography baseline$lh$,
  $lh$verified$lh$,
  array[$lh$airport$lh$, $lh$NCE$lh$, $lh$Nice$lh$, $lh$transfer$lh$, $lh$Monaco$lh$, $lh$Cannes$lh$, $lh$helicopter$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Mediterranean Charter Geography$lh$,
  $lh$Geography$lh$,
  $lh$Key Mediterranean charter geography and hotspots for yacht charter demand and intelligence.$lh$,
  $lh$Western Mediterranean: Cote d'Azur, Corsica, Sardinia (Porto Cervo, Porto Rotondo, Costa Smeralda), Ibiza, Mallorca (Palma), Costa Brava, Barcelona. Central Mediterranean: Italy (Portofino, Cinque Terre, Amalfi, Capri, Sicily, Tremiti Islands). Eastern Mediterranean: Croatia (Dubrovnik, Split, Hvar), Montenegro, Greece (Athens, Santorini, Mykonos, Ionian Islands, Dodecanese), Turkey (Bodrum, G cek, Marmaris). Monaco is the most common Western Mediterranean base. Antibes (Port Vauban) is the largest superyacht port in the world and a major charter base. Charter demand signals include geography: "Mediterranean itinerary", "French Riviera charter", "Cote d'Azur yacht trip", "Monaco to Portofino", "Western Med cruise".$lh$,
  $lh$internal mediterranean geography baseline$lh$,
  $lh$verified$lh$,
  array[$lh$mediterranean$lh$, $lh$croatia$lh$, $lh$greece$lh$, $lh$sardinia$lh$, $lh$corsica$lh$, $lh$ibiza$lh$, $lh$charter$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Marina Terminology for Commercial Identification$lh$,
  $lh$Geography$lh$,
  $lh$Marina-specific terminology relevant to search and classification.$lh$,
  $lh$Marina terminology: "berth", "berths available", "pontoon", "superyacht berth", "megayacht berth", "superyacht quay", "dock", "docking", "marina booking". Key marina identifiers: Port Vauban (Antibes) - largest superyacht port in world. Port Hercules (Monaco) - most prestigious address in Mediterranean. Port Pierre Canto (Cannes). Port de la Napoule (Mandelieu). Old Port Cannes. Port Grimaud. Port de Saint-Tropez. Marina demand signals: "berth available Monaco", "looking for berth Antibes", "any availability Port Hercules". Marina intelligence signals: "new pontoon", "expanded capacity", "superyacht infrastructure". Marina-context company leads: marina operators, berthing agents, port captains.$lh$,
  $lh$internal marina terminology baseline$lh$,
  $lh$verified$lh$,
  array[$lh$marina$lh$, $lh$berth$lh$, $lh$Port-Vauban$lh$, $lh$Port-Hercules$lh$, $lh$Antibes$lh$, $lh$pontoon$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Geographic Qualification Priority for Lead Scoring$lh$,
  $lh$Geography$lh$,
  $lh$How geography match strength affects opportunity score and classification confidence.$lh$,
  $lh$Precise geography match (e.g., "Monaco" in result when geography = "Monaco"): +2 to effective score, high geo confidence. Regional match (e.g., "Cote d'Azur" when geography = "Monaco"): +1 to effective score, medium confidence. Expanded match (e.g., "French Riviera" when geography = "Monaco"): +0.5, medium-low confidence. No geography match at all when geography is specified: geography relevant = false, downgrade classification confidence. No geography specified (open search): all results pass geography check. Geography in title (strongest signal): "Monaco airport transfer today" - geography in title is high confidence. Geography only in URL (medium signal): www.monaco-transfers.com - domain name is medium confidence evidence. Geography only in query (invalid): query contained "Monaco" but result text does not - do not use query for geography validation.$lh$,
  $lh$internal geography scoring baseline$lh$,
  $lh$verified$lh$,
  array[$lh$geography$lh$, $lh$score$lh$, $lh$monaco$lh$, $lh$confidence$lh$, $lh$title$lh$, $lh$URL$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Luxury Travel Hotspot Index$lh$,
  $lh$Geography$lh$,
  $lh$Key luxury travel locations that indicate high-value client profiles.$lh$,
  $lh$Tier 1 (ultra-luxury): Monaco, Saint-Tropez (Cap Pampelonne), Cap d'Antibes, Saint-Jean-Cap-Ferrat, Portofino, Capri, Sardinia (Costa Smeralda), Mykonos (Ornos Bay), Santorini (Oia), Dubrovnik (Lapad), Maldives, Bali (Nusa Dua). Tier 2 (luxury): Cannes, Nice, Menton, Beaulieu, Saint-Rapha l, Corsica, Ibiza, Mallorca, Amalfi. High-value transfer hubs: Monte Carlo Casino area, Port Hercules, Port Vauban Antibes, Cannes Film Festival Palais, Hotel du Cap Antibes, Villa Rothschild. Client profile inference: mentions of Tier 1 locations + yacht/transfer = UHNW client profile. Tier 2 + yacht = HNW client profile. This affects commercial potential score.$lh$,
  $lh$internal luxury hotspot baseline$lh$,
  $lh$verified$lh$,
  array[$lh$luxury-hotspot$lh$, $lh$tier-1$lh$, $lh$tier-2$lh$, $lh$UHNW$lh$, $lh$costa-smeralda$lh$, $lh$mykonos$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Cross-Market Geographic Expansion Rules$lh$,
  $lh$Geography$lh$,
  $lh$When and how to expand geographic scope for partner and market intelligence searches.$lh$,
  $lh$Geographic expansion rules: Core zone: Cote d'Azur + Monaco. Expand to Mediterranean for yacht charter: add Italy, Greece, Croatia, Turkey. Expand to France for partner discovery: Paris (UHNW residents who visit Monaco), Lyon, Bordeaux. Expand to Switzerland for company discovery: Geneva and Zurich (family offices that own Monaco properties). Expand to London for company discovery: Mayfair family offices with Mediterranean assets. Expansion triggers: when core zone search returns insufficient results (<3 accepted candidates from 10+ results). When partner discovery needs volume beyond Monaco/Cannes. Never expand geography for demand discovery without operator instruction - demand must be in the actual target territory.$lh$,
  $lh$internal geographic expansion baseline$lh$,
  $lh$verified$lh$,
  array[$lh$geographic-expansion$lh$, $lh$mediterranean$lh$, $lh$switzerland$lh$, $lh$london$lh$, $lh$paris$lh$, $lh$family-office$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Opportunity Grade Definitions A, B, C, D$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$The meaning of each opportunity grade and what actions each triggers.$lh$,
  $lh$Grade A: Highest commercial opportunity. Criteria: active demand with urgency=immediate, full evidence (all 4 pieces), strong geography match. OR: company lead with multiple strong signals, exact geography match, multiple intent signals. Action: Contact Immediately (demand) or Contact Today (company/partner). Grade B: Strong commercial opportunity. Criteria: active demand with urgency=high, 3/4 evidence pieces. OR: company lead with 4+ business term matches, geography match. Action: Contact Today (demand) or Contact Within 24 Hours (company/partner). Grade C: Moderate commercial opportunity. Criteria: active demand with urgency=medium, 2/4 evidence. OR: company lead with 2-3 business term matches. Market intelligence signal. Action: Monitor. Grade D: Low/no commercial opportunity. Criteria: insufficient evidence, unclear classification, low/no term matches. Action: Ignore. Do not create approval.$lh$,
  $lh$internal opportunity grade definitions$lh$,
  $lh$verified$lh$,
  array[$lh$grade$lh$, $lh$A$lh$, $lh$B$lh$, $lh$C$lh$, $lh$D$lh$, $lh$opportunity-score$lh$, $lh$action$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Confidence Level Determination Rules$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$How to determine confidence level from evidence quality.$lh$,
  $lh$High confidence: 4/4 evidence pieces present (demand + service + location + freshness). All signals from authoritative page content (title or first paragraph). No ambiguous or conflicting signals. Medium confidence: 3/4 evidence pieces. OR: 2 evidence pieces but both strong (demand phrase in title + clear location). One signal ambiguous but others clear. Low confidence: 2/4 evidence pieces with one ambiguous. OR: classification is correct but evidence is minimal. OR: 1 signal found, uncertain interpretation. Low confidence does NOT prevent classification but affects: opportunity score (may reduce grade by one step), recommendation (low confidence company_lead   monitor, not contact), approval creation (requires at least medium confidence for B+ grade).$lh$,
  $lh$internal confidence scoring baseline$lh$,
  $lh$verified$lh$,
  array[$lh$confidence$lh$, $lh$high$lh$, $lh$medium$lh$, $lh$low$lh$, $lh$evidence-quality$lh$, $lh$grade$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Urgency Level Classification Table$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$The complete table of urgency signals and their corresponding urgency levels.$lh$,
  $lh$Immediate: "today", "tonight", "right now", "immediately", "ASAP", "last minute", "this evening", "emergency", "urgent + today/tonight", "aujourd'hui", "ce soir", "subito", "aujourd'hui soir", "       ". High: "tomorrow", "this weekend", "this week", "next few days", "very soon", "very urgent", "demain", "ce week-end", "cette semaine", "prochains jours", "morgen". Medium: "this month", "next week", "in the coming weeks", "planning for soon", "within the next 2 weeks", "ce mois", "prochaines semaines". Low: "thinking of", "planning for later in the year", "considering", "possibly", "maybe sometime in", "envisage". Unknown: no time signal found (default to Low). Urgency is derived from page content only, not from the search query.$lh$,
  $lh$internal urgency classification table$lh$,
  $lh$verified$lh$,
  array[$lh$urgency$lh$, $lh$immediate$lh$, $lh$high$lh$, $lh$medium$lh$, $lh$low$lh$, $lh$today$lh$, $lh$tomorrow$lh$, $lh$this-week$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Commercial Potential Assessment by Business Line$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$How to assess commercial potential based on the business line and opportunity type.$lh$,
  $lh$Yacht Sale: commercial potential is always HIGH regardless of urgency because a single yacht sale generates significant revenue. A grade A yacht sale lead is extremely high value. Yacht Charter: commercial potential is HIGH for weekly charters (EUR50,000-EUR500,000+ per week), MEDIUM for day charters, HIGH for season charters. Car Rental: commercial potential is MEDIUM for individual transfers (EUR200-EUR2,000), HIGH for event packages (EUR5,000-EUR50,000+), MEDIUM for wedding packages. Partner Discovery: commercial potential determined by estimated annual referral flow, not individual transaction. A luxury hotel concierge with 50 arriving HNW guests per month = HIGH commercial potential even if individual referral fee is small. Market Intelligence: commercial potential is always LOW (it is information, not a direct commercial action).$lh$,
  $lh$internal commercial potential baseline$lh$,
  $lh$verified$lh$,
  array[$lh$commercial-potential$lh$, $lh$yacht-sale$lh$, $lh$yacht-charter$lh$, $lh$car-rental$lh$, $lh$revenue$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Decision Priority Framework$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$How to prioritise which opportunities to present to the operator first.$lh$,
  $lh$Priority 1: active_demand + urgency=immediate + grade A or B. These are time-critical. Present these first and flag as "Contact Immediately." Priority 2: active_demand + urgency=high + grade B. Present these same session with "Contact Today" recommendation. Priority 3: company_lead or partner_lead + grade A. Present these with "Contact Today" recommendation. Priority 4: company_lead or partner_lead + grade B. Present with "Contact Within 24 Hours". Priority 5: active_demand + urgency=medium + grade C. Present with "Monitor". Priority 6: market_intelligence + grade C. Present as information, no urgency. Priority 7: all grade D or rejected results. Do not present. Report in session statistics only.$lh$,
  $lh$internal priority framework baseline$lh$,
  $lh$verified$lh$,
  array[$lh$priority$lh$, $lh$decision$lh$, $lh$framework$lh$, $lh$immediate$lh$, $lh$contact-today$lh$, $lh$monitor$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Evidence-to-Score Mapping$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$How evidence quality directly maps to opportunity score.$lh$,
  $lh$Evidence strength 4/4 (demand + service + location + freshness): Base grade B. Upgrade to A if urgency=immediate or confidence=high. Evidence strength 3/4 (missing freshness or location): Base grade C. Upgrade to B if urgency=high or confidence=high. Upgrade to A only if all three remaining pieces are very strong. Evidence strength 2/4 (demand + one other): Base grade C. No upgrade possible without additional signals. Evidence strength 1/4 (demand phrase only): Grade D. Classify as unclear, not active_demand. Evidence strength 0/4: Do not create any approval. Grade D or reject. This mapping ensures that the operator never sees a Grade A approval without complete evidence behind it.$lh$,
  $lh$internal evidence-score mapping baseline$lh$,
  $lh$verified$lh$,
  array[$lh$evidence$lh$, $lh$score$lh$, $lh$mapping$lh$, $lh$grade$lh$, $lh$approval-threshold$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Grade Degradation Rules$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$Conditions that cause a grade to be reduced from its initial calculation.$lh$,
  $lh$Grade degradation triggers: Geography mismatch (result does not match target geography when geography specified): reduce grade by 1. Low confidence classification: reduce grade by 1. Stale year signal present even with freshness counterbalance: reduce grade by 1. Provider signal present (in demand mode, when demand phrase also present): reduce grade by 1. Source reliability is low (unverified forum, anonymous posting): reduce grade by 1. Multiple degradation triggers can stack: a result with weak geography match + low confidence + stale year signal could be degraded from B to D. Floor: grade D is the minimum. Never report a negative grade.$lh$,
  $lh$internal grade degradation rules$lh$,
  $lh$verified$lh$,
  array[$lh$grade-degradation$lh$, $lh$reduction$lh$, $lh$geography$lh$, $lh$confidence$lh$, $lh$stale$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Score Calibration Guidelines$lh$,
  $lh$Commercial Scoring$lh$,
  $lh$How to ensure scoring is calibrated against real-world commercial value.$lh$,
  $lh$Calibration principles: Grade A should not be awarded to more than 10% of accepted results in a typical session. If more than 10% of results score A, the scoring is too generous. Grade D results should not typically need human review. If the operator frequently retrieves Grade D results, the scoring is too strict. The ratio of accepted to rejected results should be between 1:3 and 1:8 for demand_discovery (finding genuine demand is difficult). For company_discovery, 1:2 to 1:5 is expected. If acceptance rate exceeds 50%, either the queries are too specific or the classification is too loose. If acceptance rate is below 5%, the queries need refinement or the classification is too strict.$lh$,
  $lh$internal score calibration guidelines$lh$,
  $lh$verified$lh$,
  array[$lh$calibration$lh$, $lh$acceptance-rate$lh$, $lh$grade-A$lh$, $lh$grade-D$lh$, $lh$session-quality$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Two-Signal Minimum Rule for Provider Rejection$lh$,
  $lh$Rejection Rules$lh$,
  $lh$Why provider rejection requires two or more provider signals.$lh$,
  $lh$The two-signal minimum rule prevents false positives in provider rejection. A single occurrence of "our fleet" in a forum post discussing a provider is not evidence that the page itself is a provider. The page may contain: a user referring to a company's fleet, a comparison article describing what providers offer, a news article about a provider that also contains demand content. Requiring two or more provider signals ensures that only pages that are clearly self-promotional service advertisements are rejected. Examples that PASS (one signal): "We recommend checking their fleet" - this is discussing a third party. "The fleet of luxury vehicles includes..." - informational. Examples that FAIL (two+ signals, rejected): "Our fleet includes the finest vehicles. Book with us now." "Notre flotte: X v hicules. Louez notre service." Two provider signals in the same page text = safe to reject.$lh$,
  $lh$internal provider rejection two-signal rule$lh$,
  $lh$verified$lh$,
  array[$lh$two-signal$lh$, $lh$provider-rejection$lh$, $lh$false-positive$lh$, $lh$minimum-rule$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$False Positive Prevention Strategy$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How to prevent incorrectly rejecting legitimate leads.$lh$,
  $lh$False positive prevention rules: (1) Provider rejection only in demand_discovery mode. Do not apply to company or partner discovery. (2) Demand phrase beats provider signals. A page with "looking for" in the first paragraph is demand, not provider, even if it also mentions "our fleet" once. (3) Luxury service providers are company leads in company_discovery mode. Reject them in demand mode but accept them as company leads in company mode. (4) Job ads are universal (all modes), but not every mention of "hiring" is a job ad. "We are hiring at Monaco Yacht Show" is a company news item, not a job ad posting. (5) Geography mismatch is not a hard rejection - it reduces confidence and score but does not categorically reject. (6) When in doubt, classify as unclear, not as rejected.$lh$,
  $lh$internal false-positive prevention baseline$lh$,
  $lh$verified$lh$,
  array[$lh$false-positive$lh$, $lh$prevention$lh$, $lh$provider$lh$, $lh$demand-phrase$lh$, $lh$unclear$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Spam Signal Taxonomy$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How to detect and reject spam content in search results.$lh$,
  $lh$Spam signals: excessive exclamation marks or all-caps in title. Unrealistic claims: "Find clients instantly!", "Generate 1000 leads in 24 hours!". Generic SEO spam: no specific content, just keyword-stuffed fragments. Domain signals: random character domain names. Domains with multiple hyphens or numbers. Domains ending in uncommon TLDs combined with low content quality. Duplicate content: same snippet appearing from 10+ different domains (syndication spam). Affiliate link spam: "Click here for the best Monaco transfers!" Redirected pages: URL suggests one destination but snippet shows different content. Action: classify as irrelevant and skip. No approval, no operator notification. Log domain for potential rejection list addition.$lh$,
  $lh$internal spam detection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$spam$lh$, $lh$SEO-spam$lh$, $lh$content-farm$lh$, $lh$affiliate$lh$, $lh$redirect$lh$, $lh$detection$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Low Commercial Value Detection$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How to identify results that are technically legitimate but commercially irrelevant.$lh$,
  $lh$Low commercial value signals: The company or individual is too small to be a qualified prospect. Signals: micro-business website with no contact information. No employees or team listed. Social media presence with fewer than 100 followers. No operational history. Budget mismatch: the context suggests a client who cannot afford the services. Signals: "cheapest transfer", "budget option", "most affordable", "on a budget". Geographic mismatch: the need is real but outside the target market. A transfer request for Paris when we only service Monaco and Cote d'Azur. Out-of-scope service: request for services we do not provide. Signals: "looking for a jet ski rental", "need a bicycle rental", "looking for a bus". Classification: irrelevant (not a company lead or active demand for our services).$lh$,
  $lh$internal low-value detection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$low-value$lh$, $lh$commercial$lh$, $lh$budget$lh$, $lh$geographic-mismatch$lh$, $lh$irrelevant$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Known Job Board Domain Rejection$lh$,
  $lh$Rejection Rules$lh$,
  $lh$Job boards and recruitment domains that should always be rejected.$lh$,
  $lh$Known job board domains to reject in all commercial search modes: indeed.com, linkedin.com/jobs, reed.co.uk, monster.com, glassdoor.com, jobijoba.fr, hellowork.com, p le-emploi.fr, apec.fr, cadremploi.fr, regionsjob.com, welcome to the jungle (welcometothejungle.com), talent.io, kaliop.com (job ads), viadeo.com. Domain-level indicators: any domain ending in -jobs.com, -jobs.fr, -emploi.fr. Any URL containing /emploi/, /jobs/, /careers/, /recruitment/, /postuler/, /apply/. Note: LinkedIn company profile pages are NOT job boards. Only LinkedIn /jobs/ paths are rejected. A company's About page on LinkedIn is a valid company lead source.$lh$,
  $lh$internal job board rejection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$job-board$lh$, $lh$indeed$lh$, $lh$linkedin-jobs$lh$, $lh$emploi$lh$, $lh$rejection$lh$, $lh$domain$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Known Directory Domain Rejection$lh$,
  $lh$Rejection Rules$lh$,
  $lh$Directory and comparison site domains that should be rejected in demand discovery.$lh$,
  $lh$Known directory domains to reject for demand discovery: tripadvisor.com (directory page, not individual post), yelp.com, pages.jaunes.fr (French yellow pages), pagesjaunes.fr, angi.com, houzz.com, trustpilot.com (aggregated reviews), google.com/maps (map listing), comparateur-vehicule.fr, careforyourvehicle.com, topmot.fr. URL patterns for directory pages: /top-10/, /best-of/, /list-of/, /compare/, /directory/, /annuaire/. Warning: tripadvisor FORUM posts can contain genuine demand. Only reject tripadvisor.com/Restaurants/ or /Hotels/ directory pages, not tripadvisor.com/ShowForum-... pages. Always check if the URL is a forum/community post vs. a directory listing.$lh$,
  $lh$internal directory domain rejection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$directory$lh$, $lh$tripadvisor$lh$, $lh$yelp$lh$, $lh$yellow-pages$lh$, $lh$rejection-domain$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Duplicate Rejection Policy and Handling$lh$,
  $lh$Rejection Rules$lh$,
  $lh$Policy for handling duplicate results across queries and sessions.$lh$,
  $lh$Within-session duplicates: same normalised URL appearing from multiple queries   reject the second occurrence silently. Same title appearing from different domains   flag as likely syndicated content, reject. Across-session duplicates (requires Memory system): if a URL was processed in the last 30 days and created an approval   do not create a new approval. If a URL was processed and rejected as provider_page   reject again without re-scoring. If a URL was processed and rejected as unclear   re-score with updated context (it may have been updated). Cross-campaign: a family office company can legitimately appear in multiple campaigns and should be qualified once, then flagged as "already in pipeline." Duplicate approval creation is a negative quality signal - it creates unnecessary work for the operator.$lh$,
  $lh$internal duplicate rejection policy$lh$,
  $lh$verified$lh$,
  array[$lh$duplicate$lh$, $lh$rejection$lh$, $lh$URL-dedup$lh$, $lh$session$lh$, $lh$cross-session$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Rejection Quality Metrics$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How to measure rejection quality and identify miscalibrated rules.$lh$,
  $lh$Good rejection quality: correctly identified provider pages never requested by operator for review. Correctly identified job ads never sent for operator attention. Rejection rate between 60-85% of total results in demand_discovery (typical for public web). Warning signals of poor rejection quality: Operator frequently retrieves rejected results (false negatives, rejection too strict). Operator frequently rejects approved candidates (false positives, classification too loose). Provider pages appearing in approved candidates list (provider detection failed). Job ads appearing in approved candidates list (job ad detection failed). Calibration triggers: if >20% of approved candidates are subsequently rejected by operator   tighten classification thresholds. If operator retrieves more than 5 rejected results per session   loosen rejection criteria.$lh$,
  $lh$internal rejection quality metrics$lh$,
  $lh$verified$lh$,
  array[$lh$rejection-quality$lh$, $lh$metrics$lh$, $lh$calibration$lh$, $lh$false-negative$lh$, $lh$false-positive$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Appeal and Review Path for Rejected Results$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How rejected results can be reviewed and how the operator can retrieve them.$lh$,
  $lh$Rejected results are not permanently discarded. Every search session returns rejected results in the session response with: classification (why rejected), rejection reason (which signals triggered rejection), opportunity score (D), recommendation (ignore). The operator can review any rejected result and manually reclassify it if the rejection was incorrect. Operator-driven reclassification should feed back into: memory (if a domain was incorrectly rejected, note it as a false positive). Query refinement (if many results from a specific source are incorrectly rejected, the query needs a narrower scope). No automatic re-inclusion: a rejected result cannot automatically become an approved candidate. Only operator intervention can reverse a rejection in V1.$lh$,
  $lh$internal rejection appeal baseline$lh$,
  $lh$verified$lh$,
  array[$lh$appeal$lh$, $lh$review$lh$, $lh$rejection$lh$, $lh$operator-override$lh$, $lh$reclassification$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Content Farm and Thin Content Rejection$lh$,
  $lh$Rejection Rules$lh$,
  $lh$How to detect and reject low-quality SEO content farms.$lh$,
  $lh$Content farm indicators: snippet contains keyword repetition but no specific information. Example: "Monaco transfers Monaco airport Monaco transfer service Monaco luxury transfers Monaco." No author, no date, no specific location details, no contact information in snippet. URL contains excessive hyphens, numbers or keyword-stuffed path segments. Example: best-monaco-transfer-services-luxury-airport-2026.com/best-monaco-transfer. Page appears to be generated automatically (identical structure to many other pages on the same domain). Mixed language fragment: parts appear auto-translated, grammatically incorrect. Thin content: snippet has fewer than 50 words and contains only generic descriptive language. Decision: classify as irrelevant. These pages never produce useful leads but generate high search engine ranking due to keyword optimisation.$lh$,
  $lh$internal content-farm rejection baseline$lh$,
  $lh$verified$lh$,
  array[$lh$content-farm$lh$, $lh$thin-content$lh$, $lh$SEO$lh$, $lh$keyword-stuffing$lh$, $lh$auto-generated$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Minimum Evidence Before Approval Creation$lh$,
  $lh$Evidence Rules$lh$,
  $lh$The absolute minimum evidence required before Lead Hunter may create an approval.$lh$,
  $lh$Minimum requirements for ANY approval creation: (1) Classification must be one of: active_demand, company_lead, partner_lead, market_intelligence. Rejected or unclear results must NEVER generate approvals. (2) Opportunity score must be B or higher (A or B). Grade C = monitor only, no approval. Grade D = no approval. (3) Source must be a public web result (not user-provided, not fabricated). (4) The evidence must be observable in the result text itself - not inferred from the search query, not assumed from context. (5) Confidence must be medium or high. Low confidence results require operator review before approval creation. These are hard rules, not guidelines. No exceptions.$lh$,
  $lh$internal approval evidence requirements$lh$,
  $lh$verified$lh$,
  array[$lh$approval$lh$, $lh$minimum-evidence$lh$, $lh$B-grade$lh$, $lh$classification$lh$, $lh$confidence$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Demand Evidence Requirements$lh$,
  $lh$Evidence Rules$lh$,
  $lh$Specific evidence requirements for active_demand classification and approval.$lh$,
  $lh$Active_demand classification requirements (minimum for B grade approval): (1) Demand phrase present in page content (title or snippet). Not in search query. Examples: "looking for", "need", "recherche", "cerco", "suche", "busco". (2) At least ONE of the following: Service phrase matching target business line, OR location phrase matching target geography, OR freshness phrase. (3) No overriding rejection signals (not a job ad, not a confirmed provider page with 2+ provider signals). For grade A approval: demand phrase + service phrase + location phrase + freshness phrase. For grade B approval: demand phrase + 2 of the 3 remaining pieces. For grade C (monitor only, no approval): demand phrase + 1 of the 3 remaining pieces.$lh$,
  $lh$internal demand evidence requirements$lh$,
  $lh$verified$lh$,
  array[$lh$active-demand$lh$, $lh$evidence$lh$, $lh$demand-phrase$lh$, $lh$service-phrase$lh$, $lh$B-grade$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Company Lead Evidence Standards$lh$,
  $lh$Evidence Rules$lh$,
  $lh$What evidence is required before creating a company_lead approval.$lh$,
  $lh$Company lead evidence requirements: (1) At least 2 business line-relevant terms from the LINE_TERMS vocabulary in the page content. For yacht_sale: yacht, acquisition, broker, family office, wealth. For yacht_charter: charter, concierge, travel advisor, broker, mediterranean. For car_rental: car rental, chauffeur, transfer, airport, hotel. (2) The entity must appear to be a business or organisational unit with decision authority (not an individual tourist blog). (3) No job ad signals present. (4) No evidence that this is a consumer review or comparison page. (5) Geography match: preferred but not mandatory for company discovery (company may be in London but service Monaco clients). Without geography match, reduce confidence. Minimum: 2 business terms + non-rejection status + intent signal   B grade company_lead.$lh$,
  $lh$internal company lead evidence requirements$lh$,
  $lh$verified$lh$,
  array[$lh$company-lead$lh$, $lh$evidence$lh$, $lh$business-terms$lh$, $lh$LINE_TERMS$lh$, $lh$two-terms$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Partner Lead Evidence Standards$lh$,
  $lh$Evidence Rules$lh$,
  $lh$What evidence is required before creating a partner_lead approval.$lh$,
  $lh$Partner lead evidence requirements: (1) The entity must be identifiable as an intermediary or advisor (concierge, travel advisor, hotel, aviation operator, event agency, villa manager), NOT an end-buyer. (2) At least 1 indicator that they refer clients to service providers: "we partner with", "our preferred suppliers", "we connect clients with", "recommended partners", or implicit: their service clearly requires outsourced components. (3) Their client profile must align with the target business line (they serve UHNW or HNW clients who need yacht or mobility services). (4) No job ad signals. (5) Legitimate business: has professional website, contact information, identifiable company structure. For grade A partner: all 3 requirements + geography match + identifiable contact. For grade B: requirements 1-3 + reasonable confidence.$lh$,
  $lh$internal partner lead evidence requirements$lh$,
  $lh$verified$lh$,
  array[$lh$partner-lead$lh$, $lh$evidence$lh$, $lh$intermediary$lh$, $lh$referral$lh$, $lh$concierge$lh$, $lh$hotel$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Evidence Strength Scale$lh$,
  $lh$Evidence Rules$lh$,
  $lh$How to measure and communicate evidence strength in approval payloads.$lh$,
  $lh$Evidence strength is reported on a 4-point scale: Strong evidence (4/4): demand phrase in title or opening sentence + service phrase + explicit geography match + freshness phrase. Confidence = high. Grade A eligible. Solid evidence (3/4): three of four evidence types present, all from page content. Confidence = medium-high. Grade B eligible. Partial evidence (2/4): two evidence types present, at least one being demand phrase. Confidence = medium-low. Grade C (monitor). Weak evidence (1/4 or 0/4): one or no evidence types. Confidence = low. Do not create approval. Classify as unclear. Evidence is always extracted from page title + page snippet + page URL. Never from the search query. Never from campaign context. Never from prior session results.$lh$,
  $lh$internal evidence strength scale$lh$,
  $lh$verified$lh$,
  array[$lh$evidence-strength$lh$, $lh$4/4$lh$, $lh$3/4$lh$, $lh$2/4$lh$, $lh$confidence$lh$, $lh$scale$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Missing Evidence Handling Protocol$lh$,
  $lh$Evidence Rules$lh$,
  $lh$How to handle results where evidence is partially missing.$lh$,
  $lh$When demand phrase is present but service phrase is missing: check if the service is implied by context (e.g., a forum post in /r/monaco asking for transfer help without saying "transfer" explicitly). If service is strongly implied   treat as service phrase present. If service is ambiguous   reduce grade by 1. When location is missing: check if the source URL is geo-specific (monaco-transfers.com   location = Monaco). If URL is geo-specific   treat as location present. If URL is generic   location = absent. When freshness is missing in demand_discovery: do not promote to active_demand grade B or higher. Classify as unclear unless all other evidence is exceptional. When multiple pieces are missing: classify as unclear. Communicate clearly in candidate summary what evidence was found and what was missing.$lh$,
  $lh$internal missing evidence protocol$lh$,
  $lh$verified$lh$,
  array[$lh$missing-evidence$lh$, $lh$handling$lh$, $lh$implied$lh$, $lh$URL-domain$lh$, $lh$unclear$lh$, $lh$protocol$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Commercial Language Recognition Framework$lh$,
  $lh$Communication Awareness$lh$,
  $lh$How to recognise and interpret commercial language patterns in public web content.$lh$,
  $lh$Lead Hunter reads commercial language to understand intent, urgency and opportunity. It does NOT write outreach. Commercial language patterns: Buyer intent: "I am in the market for", "we are considering", "actively looking", "have budget for", "ready to move forward". Decision-maker language: "on behalf of our client", "as the principal", "authorised to proceed", "decision has been made to". Timeline language: "need to confirm by", "decision before", "immediate requirement", "confirmed dates", "contracted dates". Budget language: "budget is set at", "prepared to spend", "investment of up to", "competitive budget". Referral language: "referred by", "recommended by", "my contact at", "our advisor". Each of these patterns adds evidence weight to the opportunity assessment.$lh$,
  $lh$internal commercial language baseline$lh$,
  $lh$verified$lh$,
  array[$lh$commercial-language$lh$, $lh$buyer-intent$lh$, $lh$decision-maker$lh$, $lh$timeline$lh$, $lh$budget$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$RFQ vs General Inquiry Distinction$lh$,
  $lh$Communication Awareness$lh$,
  $lh$How to distinguish a formal request for quotation from a general information enquiry.$lh$,
  $lh$Formal RFQ indicators: specific service requested (type, size, duration). Specific date or period. Specific location or route. Quantity or number of guests/passengers. Request for price or "please quote". Contact information provided. Example: "We need a 9-seat van from Nice Airport to Monaco on July 15, 2026 for 8 passengers. Please quote." General inquiry indicators: vague or unspecified service. No date. No location. Asking for general information rather than a price. Example: "How much does it generally cost to hire a chauffeur in Monaco?" Distinction impact: formal RFQ = grade A or B active_demand, immediate contact recommended. General inquiry = grade C or market intelligence, monitor. Never treat a general informational question as urgent demand.$lh$,
  $lh$internal RFQ distinction baseline$lh$,
  $lh$verified$lh$,
  array[$lh$RFQ$lh$, $lh$general-inquiry$lh$, $lh$formal$lh$, $lh$specific$lh$, $lh$price-request$lh$, $lh$distinction$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Booking Language Recognition Patterns$lh$,
  $lh$Communication Awareness$lh$,
  $lh$Specific booking language patterns that indicate readiness to confirm a reservation.$lh$,
  $lh$Ready-to-book signals: "want to book", "can we confirm", "would like to reserve", "ready to proceed", "can you confirm availability for", "please send contract", "ready to confirm", "send deposit details" (caution: never process payments). Charter booking signals: "we would like to charter", "interested in a charter for these dates", "charter enquiry for July 2026". Transfer booking signals: "need to book a transfer for", "can you arrange pickup at", "please confirm car for". Conditional booking: "subject to availability, we would like to confirm". This is still a booking signal but not yet committed. Booking vs. browsing: "we are thinking of" is browsing. "We would like to book" is booking. Always classify the most specific booking language found.$lh$,
  $lh$internal booking language baseline$lh$,
  $lh$verified$lh$,
  array[$lh$booking$lh$, $lh$reservation$lh$, $lh$confirm$lh$, $lh$charter-booking$lh$, $lh$transfer-booking$lh$, $lh$ready$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Quotation Request Signal Recognition$lh$,
  $lh$Communication Awareness$lh$,
  $lh$How to identify when a public web post is requesting or implying a commercial quotation.$lh$,
  $lh$Explicit quotation signals: "please quote", "send me a quote", "request a quotation", "quotation required", "devis requis", "demande de devis", "preventivo richiesto", "Angebot bitte", "presupuesto solicitado". Implied quotation signals: "what would it cost to", "how much for", "price for a", "cost of hiring", "rates for", "fees for", "what do you charge for", "tarif pour". Context qualifiers that strengthen quotation intent: specific service + specific date + specific number of guests = formal quotation context. Generic "how much" without specifics = inquiry, not a formal quotation request. Urgency qualifiers on quotation: "urgent quotation required", "need quote by today", "quote needed ASAP"   treat as immediate priority.$lh$,
  $lh$internal quotation signal baseline$lh$,
  $lh$verified$lh$,
  array[$lh$quotation$lh$, $lh$devis$lh$, $lh$quote$lh$, $lh$cost-inquiry$lh$, $lh$price-request$lh$, $lh$preventivo$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Intent vs Information Request Distinction$lh$,
  $lh$Communication Awareness$lh$,
  $lh$How to separate actionable buyer intent from general information-seeking.$lh$,
  $lh$Buyer intent: the person wants to DO something (buy, charter, hire, book, arrange). Signals: first person + active verb + specific service. "I want to charter a yacht." "We need to arrange transfers." "Looking to hire a chauffeur." Information request: the person wants to KNOW something. Signals: "how", "what", "which", "where", "why" without a specific need attached. "What is the best yacht charter company?" "How much does a Monaco transfer cost?" "Which is better, chartering vs. owning?" Lead Hunter should classify information requests as: unclear (in demand_discovery) or irrelevant if no commercial opportunity is evident. The distinction matters because: buyer intent   approval candidate. Information request   market intelligence (at most) or irrelevant.$lh$,
  $lh$internal intent vs information baseline$lh$,
  $lh$verified$lh$,
  array[$lh$buyer-intent$lh$, $lh$information-request$lh$, $lh$distinction$lh$, $lh$active-verb$lh$, $lh$first-person$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$Urgency Communication Patterns in Commercial Context$lh$,
  $lh$Communication Awareness$lh$,
  $lh$How urgency is communicated in commercial requests and how to interpret it.$lh$,
  $lh$Hard deadline signals: "by", "before", "no later than", "deadline is", "must confirm before", "time-sensitive". Examples: "Need to confirm transfer by this evening", "Charter required before July 4", "Must book before end of week". Soft urgency signals: "as soon as possible", "fairly urgent", "sooner the better", "would prefer to confirm this week". Emotional urgency signals: "desperate", "really need", "urgently require", "can't wait". Seasonal urgency: "it's peak season and availability is limited", "summer is filling up". Urgency inflation: some posts exaggerate urgency to prioritise their enquiry. Validate with specifics: a post that says "URGENT" but provides no specific date, service or location may not be genuinely urgent. Treat validated urgency (specific date + urgent language) as higher priority than unvalidated urgency (urgent language only).$lh$,
  $lh$internal urgency communication baseline$lh$,
  $lh$verified$lh$,
  array[$lh$urgency$lh$, $lh$deadline$lh$, $lh$asap$lh$, $lh$time-sensitive$lh$, $lh$validation$lh$, $lh$emotional$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-001: Never Invent Leads$lh$,
  $lh$Policy$lh$,
  $lh$Lead Hunter must only report what is observable in public web results. No fabrication.$lh$,
  $lh$Lead Hunter is prohibited from fabricating company names, contact details, opportunity descriptions, demand signals, classification justifications or any other data element. Every field in a candidate report must be derivable from the actual search result text. If a result is ambiguous, the correct action is to classify it as unclear, not to fill in missing information with assumptions. If a result has no demand phrase, the correct action is to note "demand phrase not found" and reduce the grade - not to infer that demand exists because the query was demand-oriented. Violating this policy undermines operator trust and creates worthless approval noise.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$never-invent$lh$, $lh$fabrication$lh$, $lh$evidence-only$lh$, $lh$operator-trust$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-002: Never Classify Without Evidence$lh$,
  $lh$Policy$lh$,
  $lh$Every classification must be backed by observable signals from result text.$lh$,
  $lh$Classification must always cite the evidence that supports it. A result cannot be classified as active_demand without a demand phrase extracted from title or snippet. A result cannot be classified as company_lead without business-relevant terms in the content. Evidence-free classifications are prohibited and will cause approval noise, operator distrust and wasted commercial effort. When evidence is insufficient, the only permitted response is: (1) unclear - insufficient evidence to classify. (2) irrelevant - no relevant signals found at all. Never create a classification to complete the pipeline. The pipeline must only complete when evidence supports it.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$classification-evidence$lh$, $lh$prohibited$lh$, $lh$unclear$lh$, $lh$irrelevant$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-003: Never Create Approval Without Confidence$lh$,
  $lh$Policy$lh$,
  $lh$Approvals must only be created for grade B+ results with medium or higher confidence.$lh$,
  $lh$An approval is a signal to the operator that a commercial opportunity requires their attention. Creating a low-confidence or grade D approval wastes operator time and degrades the quality of the pipeline. Approval creation rules: Grade A or B + confidence medium or high   approval permitted. Grade C   no approval. Add to monitor list only. Grade D   no approval. Discard or log as rejected. Confidence low   no approval regardless of grade. Low confidence means the evidence is insufficient to justify operator attention. If the engine has processed 10 results and found 0 approval-eligible candidates, that is an acceptable session outcome. An empty session is better than a session full of low-quality approvals.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$approval-quality$lh$, $lh$grade-B$lh$, $lh$confidence$lh$, $lh$operator-time$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-004: Never Auto-Contact$lh$,
  $lh$Policy$lh$,
  $lh$Lead Hunter must never transmit any message to any external party without operator approval.$lh$,
  $lh$Lead Hunter is an intelligence and classification agent. It is NOT an outreach agent. It identifies opportunities and prepares drafts. It does not send. This policy applies without exception to: emails, forum posts, LinkedIn messages, WhatsApp messages, SMS, phone call scripts, and any other form of external communication. Even if an outreach draft is prepared, it must sit in the approval queue until the operator explicitly approves and sends it. Auto-contact is prohibited because: it violates platform terms of service, it exposes the business to spam and legal risk, and it can damage commercial trust if an inappropriate or mistimed message is sent.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$auto-contact$lh$, $lh$approval-before-execution$lh$, $lh$no-outreach$lh$, $lh$prohibited$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-005: Never Fabricate Urgency$lh$,
  $lh$Policy$lh$,
  $lh$Urgency must be derived from evidence, not from a desire to increase priority scores.$lh$,
  $lh$Lead Hunter must not describe a result as urgent unless the source text contains genuine freshness and urgency signals. Urgency is not a tool for prioritisation gaming. A search result for "yacht charter Monaco" from a 2022 blog post must not be classified as urgent simply because charter demand is generally high in Monaco. Urgency signals must be present in the result text: "today", "tonight", "urgent", "ASAP" or equivalent in French/Italian/German/Spanish/Russian. Inflating urgency creates false operator pressure, causes real urgent opportunities to be diluted by noise, and destroys trust in the Lead Hunter system.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$urgency-fabrication$lh$, $lh$evidence-urgency$lh$, $lh$prohibited$lh$, $lh$trust$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-006: Never Expose Private Information$lh$,
  $lh$Policy$lh$,
  $lh$Personal data and confidential information found in search results must not be stored or transmitted.$lh$,
  $lh$Search results occasionally contain personal data: email addresses, phone numbers, private residential addresses, private yacht berth locations, owner names, financial details. Lead Hunter must not: store these in approval payloads without operator awareness. Transmit these to external systems. Include these in outreach drafts without operator review. When personal data is found incidentally in a result, Lead Hunter should: note that the result may contain personal data, redact or omit the specific data from automated processing, and flag for operator review. GDPR and data protection considerations apply. Operator is responsible for compliant use of any personal data surfaced.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$personal-data$lh$, $lh$privacy$lh$, $lh$GDPR$lh$, $lh$redaction$lh$, $lh$confidential$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-007: Never Invent Demand$lh$,
  $lh$Policy$lh$,
  $lh$A demand phrase must be present in page content before classifying as active demand.$lh$,
  $lh$The search query is not demand evidence. If Lead Hunter searches for "\"need\" \"yacht charter\" Monaco" and returns 10 results, that does not mean 10 demand results were found. It means 10 results were returned by the search engine for those keywords. The demand evidence must exist within the actual page title or snippet - a human on that page must have expressed a need. Common error to avoid: classifying as active_demand because the query was demand-oriented and the result appeared in the results. The result must independently contain a demand phrase. This policy prevents a systematic false positive rate where every result in a demand-mode search is incorrectly labelled as demand.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$demand-fabrication$lh$, $lh$query-not-evidence$lh$, $lh$page-content$lh$, $lh$active-demand$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-008: Public Sources Only$lh$,
  $lh$Policy$lh$,
  $lh$Lead Hunter must only process public web sources returned by the configured search provider.$lh$,
  $lh$Lead Hunter is authorised to process: public web pages indexed by search engines, public social media posts accessible without login, public forum posts accessible without membership, public news articles and press releases. Lead Hunter is NOT authorised to: access login-gated content (LinkedIn private profiles, Facebook private groups, Instagram private accounts). Access paid-content sources (financial databases, private industry reports). Scrape or crawl sites systematically. Bypass rate limits or CAPTCHA. Access data that was obtained through third-party data brokers or purchased lists. If a result URL requires authentication to access, it must be skipped. The search snippet must contain sufficient evidence - Lead Hunter must not attempt to fetch the full page to supplement the snippet.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$public-sources$lh$, $lh$no-scraping$lh$, $lh$no-login$lh$, $lh$authorised-sources$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-009: Provider Rejection in Demand Mode Only$lh$,
  $lh$Policy$lh$,
  $lh$Provider rejection rules apply only to demand_discovery mode.$lh$,
  $lh$Provider signals ("we offer", "our fleet", "book with us") indicate self-promotional service provider content. In demand_discovery mode, provider pages are correctly rejected - they are competitors, not buyers. However, in company_discovery and partner_discovery modes, a luxury car rental company or yacht charter company IS a legitimate company lead or partner lead. Applying provider rejection logic to all search modes would incorrectly reject brokers, concierges, travel advisors and hotel services in modes where they are precisely the targets. This policy must be enforced at the engine level. Provider rejection = demand_discovery only.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$provider-rejection$lh$, $lh$demand-discovery-only$lh$, $lh$mode-specific$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-010: Rejection is Correct Behaviour$lh$,
  $lh$Policy$lh$,
  $lh$High rejection rates are expected and desirable in demand discovery sessions.$lh$,
  $lh$Lead Hunter should not optimise for accepted lead count. It should optimise for accepted lead QUALITY. In demand_discovery mode, a session that processes 30 results and accepts 3 is a high-quality session if the 3 are genuine active demand with strong evidence. A session that accepts 20 is suspicious - either the queries are too specific, the classification is too loose, or the results are being inflated. Typical rejection rate targets: demand_discovery: 75-90% rejection. company_discovery: 40-70% rejection. partner_discovery: 30-60% rejection. market_intelligence: 20-50% rejection. If rejection rate consistently falls below these ranges, review classification thresholds. If rejection rate consistently exceeds these ranges, review query construction.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$rejection-rate$lh$, $lh$quality$lh$, $lh$demand-discovery$lh$, $lh$calibration$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-011: Minimum Evidence Before Routing$lh$,
  $lh$Policy$lh$,
  $lh$Before routing a result to any agent, Lead Hunter must have classification + B+ score + approval.$lh$,
  $lh$Routing a result means passing it to another agent (Yacht Broker Agent, Charter Agent, Car Rental Agent) for follow-up action. This is a significant action that triggers downstream workflow. Lead Hunter must not route before: (a) confirmed classification (active_demand, company_lead, or partner_lead - market intelligence is NOT routed), (b) opportunity score B or higher, (c) operator approval of the routing action. Automatic routing (without operator approval) is prohibited. An opportunity discovered at 3am should sit in the approval queue until the operator reviews it in the morning - not automatically route to the Yacht Broker at 3am.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$routing$lh$, $lh$agent-routing$lh$, $lh$approval-required$lh$, $lh$prohibited$lh$]::text[]
);

select public.seed_lead_hunter_knowledge(
  $lh$POLICY-012: Geography Without Assumption$lh$,
  $lh$Policy$lh$,
  $lh$If geography is specified, result text must contain the geography signal - not just the query.$lh$,
  $lh$When an operator specifies geography ("Monaco", "Cote d'Azur"), Lead Hunter must only accept results where the result text itself - title, snippet or URL - contains a verified geography match. A result that appears in a Monaco-geography search but contains no Monaco-related terms in its text must receive geography_relevant = false and have its confidence reduced. Common violation to avoid: the search query contains "Monaco" and the result ranks highly, so Lead Hunter assumes it is geographically relevant. Wrong. The result must independently confirm geography. URL exception: a Monaco-specific domain (monacotransfers.com) can serve as geography evidence. Generic domains cannot.$lh$,
  $lh$internal policy baseline$lh$,
  $lh$verified$lh$,
  array[$lh$policy$lh$, $lh$geography-assumption$lh$, $lh$text-evidence$lh$, $lh$query-not-evidence$lh$, $lh$monaco$lh$]::text[]
);

-- Cleanup helper function
drop function if exists public.seed_lead_hunter_knowledge(text, text, text, text, text, text, text[]);
