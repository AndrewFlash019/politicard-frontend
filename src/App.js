import React, { useState, useRef } from 'react';
import './App.css';
import { fetchOfficialsByZip, fetchFeedByZip } from './services/api';
import Login from './Login';

// ─── LOGO COMPONENTS ──────────────────────────────────────────────────────────

function PolitiCardLogo({ height = 32 }) {
  const w = Math.round(height * (420 / 72));
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 72" width={w} height={height}>
      <defs>
        <linearGradient id="nm" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#6b9fdf"/>
          <stop offset="44%"  stopColor="#a8c0ee"/>
          <stop offset="50%"  stopColor="#f0f0f8"/>
          <stop offset="56%"  stopColor="#dfa0a0"/>
          <stop offset="100%" stopColor="#c94040"/>
        </linearGradient>
      </defs>
      <text x="0" y="56" fontFamily="Georgia, 'Times New Roman', serif" fontSize="60" fontWeight="700" fill="url(#nm)" letterSpacing="-2">PolitiCard</text>
      <circle cx="330" cy="12" r="8.5" fill="#6b9fdf" opacity="0.9"/>
      <circle cx="352" cy="7"  r="6.5" fill="#9b6fd4" opacity="0.75"/>
      <circle cx="371" cy="3"  r="4.5" fill="#c94040" opacity="0.7"/>
      <circle cx="386" cy="1"  r="2.5" fill="#c94040" opacity="0.45"/>
    </svg>
  );
}

function PolitiCardIcon({ size = 32 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width={size} height={size}>
      <defs>
        <linearGradient id="ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0b1f4f"/>
          <stop offset="40%"  stopColor="#2d3580"/>
          <stop offset="65%"  stopColor="#6b2040"/>
          <stop offset="100%" stopColor="#5a0a12"/>
        </linearGradient>
        <radialGradient id="sh" cx="25%" cy="20%" r="60%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.13)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#ic)"/>
      <rect width="120" height="120" rx="26" fill="url(#sh)"/>
      <text x="60" y="84" fontFamily="Georgia, 'Times New Roman', serif" fontSize="82" fontWeight="700" fill="rgba(255,255,255,0.96)" textAnchor="middle">P</text>
      <polygon points="60,10 63.2,19.5 73,19.5 65.4,25.3 68.1,34.7 60,29.2 51.9,34.7 54.6,25.3 47,19.5 56.8,19.5" fill="rgba(255,255,255,0.93)"/>
    </svg>
  );
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const OFFICIALS = [
  {
    id: 20,
    name: 'Donald Trump',
    title: 'President of the United States',
    party: 'R',
    level: 'Federal',
    followers: '14.2M',
    approval: 46,
    typologyMatch: 38,
    bio: 'Donald Trump is the 47th President of the United States, inaugurated January 20, 2025. Previously served as the 45th President from 2017-2021. A real estate developer and television personality turned politician, he won the 2024 presidential election defeating Vice President Kamala Harris.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/256px-Donald_Trump_official_portrait.jpg',
    avatar: '🇺🇸',
    color: '#b91c1c',
    posts: [
      { id: 2001, text: 'Just signed an executive order securing our southern border. Illegal crossings are at a historic low. America is safe again.', time: '1d ago', likes: 48200, type: 'announcement' },
      { id: 2002, text: 'The United States will not rest until every American family can afford to live. We are ending inflation — prices are coming down.', time: '3d ago', likes: 31400, type: 'announcement' },
    ]
  },
  {
    id: 21,
    name: 'JD Vance',
    title: 'Vice President of the United States',
    party: 'R',
    level: 'Federal',
    followers: '4.8M',
    approval: 44,
    typologyMatch: 36,
    bio: 'JD Vance is the 50th Vice President of the United States, inaugurated January 20, 2025. Previously served as U.S. Senator from Ohio (2023-2025). Author of "Hillbilly Elegy," a Yale Law graduate, and former venture capitalist. He presides over the Senate and serves as first in the presidential line of succession.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/JD_Vance_official_VP_portrait.jpg/256px-JD_Vance_official_VP_portrait.jpg',
    avatar: '⚡',
    color: '#991b1b',
    posts: [
      { id: 2101, text: 'America is back. Our administration has moved faster in the first months than any administration in modern history. The forgotten Americans are forgotten no more.', time: '2d ago', likes: 18700, type: 'announcement' },
    ]
  },
  {
    id: 1,
    name: 'Ashley Moody',
    title: 'U.S. Senator (Junior)',
    party: 'R',
    level: 'Federal',
    followers: '310K',
    approval: 51,
    typologyMatch: 43,
    bio: 'Ashley Moody is the junior U.S. Senator from Florida, appointed by Gov. Ron DeSantis in January 2025 to fill the seat vacated by Marco Rubio. A former Florida Attorney General and circuit court judge, she is the first woman to represent Florida in the Senate since 1987. Running for election to the seat in November 2026.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ashley_Moody_official_photo.jpg/256px-Ashley_Moody_official_photo.jpg',
    avatar: '⚖️',
    color: '#b91c1c',
    posts: [
      { id: 101, text: 'Introduced the Frost Insurance Research Act to protect Florida farmers from cold weather losses. Florida agriculture feeds the nation — our farmers deserve the same risk tools as any other business.', time: '9d ago', likes: 2140, type: 'legislation' },
      { id: 102, text: "Proud to earn the endorsement of the Florida Farm Bureau Federation and the Florida Fraternal Order of Police in my 2026 Senate campaign. When Florida\'s families and workers succeed, Florida succeeds.", time: '3d ago', likes: 3870, type: 'announcement' },
    ]
  },
  {
    id: 2,
    name: 'Rick Scott',
    title: 'U.S. Senator (Senior)',
    party: 'R',
    level: 'Federal',
    followers: '890K',
    approval: 47,
    typologyMatch: 44,
    bio: 'Rick Scott is the senior U.S. Senator from Florida, serving since 2019. He chairs the Senate Special Committee on Aging and previously served as the 45th Governor of Florida. He is one of the wealthiest members of Congress.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Rick_Scott%2C_Official_Portrait%2C_113th_Congress.jpg/256px-Rick_Scott%2C_Official_Portrait%2C_113th_Congress.jpg',
    avatar: '🏛️',
    color: '#991b1b',
    posts: [
      { id: 201, text: 'Introduced the CLEAR LABELS Act. You know where your clothes are made. You know where your food comes from. You should know where your prescription drugs come from. 90% of generic drugs come from overseas — Americans deserve transparency.', time: '2w ago', likes: 5800, type: 'legislation', videoId: 'WNwMFfOCFnc', videoTitle: 'CLEAR LABELS Act — Senate Aging Committee Hearing', videoOrg: 'U.S. Senate Special Committee on Aging' },
      { id: 202, text: 'Introduced the One Nation, One Visa Policy Act to end the Obama-era program giving Chinese nationals visa-free access to U.S. Pacific territories. No corner of America should be a national security backdoor.', time: '3d ago', likes: 7100, type: 'legislation' },
    ]
  },
  {
    id: 3,
    name: 'Randy Fine',
    title: 'U.S. Representative, FL-6',
    party: 'R',
    level: 'Federal',
    followers: '124K',
    approval: 49,
    typologyMatch: 36,
    bio: "Randy Fine is the U.S. Representative for Florida\'s 6th Congressional District, covering Flagler, Putnam, St. Johns, Volusia, Lake, and Marion counties. He won a special election in April 2025, replacing Mike Waltz who became National Security Advisor. A Harvard-educated businessman, he previously served in the Florida House and Senate.",
    image: 'https://fine.house.gov/sites/evo-subsites/fine.house.gov/files/evo-media-image/fine_randy_-_official_portrait.jpg',
    avatar: '🦅',
    color: '#7c2d12',
    posts: [
      { id: 301, text: "Introduced the TSP Fiduciary Security Act to stop federal retirement funds from being invested in companies that pose a national security risk. American workers\' retirements should not be funding our adversaries.", time: '2w ago', likes: 3200, type: 'legislation' },
      { id: 302, text: "Introduced the Greenland Annexation and Statehood Act to advance President Trump\'s vision of strengthening U.S. Arctic security and putting our adversaries on notice. The time to act is now.", time: '5w ago', likes: 8900, type: 'legislation' },
    ]
  },
  {
    id: 4,
    name: 'Ron DeSantis',
    title: 'Governor of Florida',
    party: 'R',
    level: 'State',
    followers: '3.4M',
    approval: 54,
    typologyMatch: 38,
    bio: 'Ron DeSantis is the 46th Governor of Florida, serving since 2019. He is term-limited and cannot seek a third consecutive term in 2026. Under his administration Florida has ranked #1 in economic growth, net in-migration, and new business formations.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Ron_DeSantis_official_photo.jpg/256px-Ron_DeSantis_official_photo.jpg',
    avatar: '🌴',
    color: '#1e40af',
    posts: [
      { id: 401, text: "Florida welcomed 143.3 MILLION visitors in 2025 — a new all-time record. The Sunshine State\'s economy is the strongest in the nation and it\'s not close. No state does it better than Florida.", time: '1d ago', likes: 22100, type: 'announcement' },
      { id: 402, text: 'Year-end recap: over 200 capital projects completed in Palm Coast and across Florida in 2024. Roads, water, parks — watch the full breakdown.', time: '9d ago', likes: 11300, type: 'announcement', videoId: 'IZTiv_0oqIs', videoTitle: '2024 Palm Coast Progress Report', videoOrg: 'City of Palm Coast — Acting City Manager Lauren Johnston' },
    ]
  },
  {
    id: 5,
    name: 'Tom Wright',
    title: 'State Senator, District 7',
    party: 'R',
    level: 'State',
    followers: '42K',
    approval: 61,
    typologyMatch: 55,
    bio: 'Tom Wright represents Florida Senate District 7, covering Flagler, Putnam, St. Johns, and Volusia counties. He serves during the 2026 Florida Legislative Session and has focused on hurricane preparedness, veterans affairs, and economic development for Northeast Florida.',
    image: '',
    avatar: '📋',
    color: '#1d4ed8',
    posts: [
      { id: 501, text: 'The 2026 Legislative Session is underway in Tallahassee. Working hard to bring resources back to Flagler, Putnam, St. Johns, and Volusia. Constituent needs are my priority — reach out to my office anytime.', time: '4d ago', likes: 620, type: 'announcement' },
    ]
  },
  {
    id: 17,
    name: 'Paul Renner',
    title: 'State Representative, District 24',
    party: 'R',
    level: 'State',
    followers: '38K',
    approval: 59,
    typologyMatch: 40,
    bio: "Paul Renner represents Florida House District 24 covering parts of Flagler and St. Johns counties. He serves as Speaker of the Florida House of Representatives, elected Speaker in 2022. A Palm Coast attorney, he focuses on fiscal conservatism, constitutional law, and Florida\'s long-term growth.",
    image: '',
    avatar: '⚖️',
    color: '#1e3a8a',
    posts: [
      { id: 1701, text: 'Calling a special session to address property insurance costs for Florida homeowners. We will not stop until Floridians have access to affordable, reliable coverage.', time: '6d ago', likes: 4100, type: 'announcement' },
    ]
  },
  {
    id: 6,
    name: 'Andy Dance',
    title: 'County Commissioner, District 1',
    party: 'D',
    level: 'Local',
    followers: '8.2K',
    approval: 68,
    typologyMatch: 72,
    bio: 'Andy Dance serves as Flagler County Commissioner for District 1, covering the E and R sections and parts of Town Center in Palm Coast. A former educator and past Commission Chair, he now serves on both the Florida Association of Counties Board of Directors and the Small County Coalition of Florida executive committee.',
    image: '',
    avatar: '🏙️',
    color: '#0369a1',
    posts: [
      { id: 601, text: 'Flagler County has reached a tentative deal to preserve 153 acres of floodplain around the Bulow Creek headwaters using Florida Forever grant funds. This protects our watershed permanently. Proud of this one.', time: '3w ago', likes: 1840, type: 'announcement' },
      { id: 602, text: 'Local governments across Flagler are exploring a half-cent sales tax referendum for the November 2026 ballot to fund beach protection — dune restoration and lifeguard services. Stay engaged and come to the next public meeting.', time: '2w ago', likes: 923, type: 'event' },
    ]
  },
  {
    id: 13,
    name: "Donald O'Brien",
    title: 'County Commissioner, District 2',
    party: 'R',
    level: 'Local',
    followers: '3.8K',
    approval: 62,
    typologyMatch: 46,
    bio: "Donald O'Brien represents Flagler County Commission District 2. A longtime Flagler County resident, he focuses on responsible growth management, public safety funding, and maintaining the county's rural character while accommodating Palm Coast's expansion.",
    image: '',
    avatar: '🏛️',
    color: '#dc2626',
    posts: [
      { id: 1301, text: 'Voted to approve the updated Flagler County Comprehensive Plan amendments this week. Managed growth is smart growth — we must balance opportunity with quality of life for existing residents.', time: '1w ago', likes: 312, type: 'vote' },
    ]
  },
  {
    id: 14,
    name: 'Rick Staly',
    title: 'Flagler County Sheriff',
    party: 'R',
    level: 'Local',
    followers: '12.1K',
    approval: 74,
    typologyMatch: 48,
    bio: "Rick Staly is the Flagler County Sheriff, serving since 2016. A 35-year law enforcement veteran, he previously served with the Orange County Sheriff\'s Office. Under his leadership, Flagler County has implemented community policing initiatives, expanded mental health response, and maintained low crime rates for a growing county. The FCSO achieved its 5th consecutive state accreditation in 2025.",
    sheriffMetrics: {
      crimeRateTrend: '-8% vs prior year',
      avgResponseTime: '7.2 min',
      caseClearanceRate: '34%',
      useOfForceIncidents: 12,
      complaintsFiledYTD: 8,
      complaintsSustained: 2,
      bodyCamera: '100% deployed',
      jailCapacity: 252,
      jailCurrentPop: 218,
      mentalHealthDiversions: 47,
      deputies: 184,
      budgetFY2026: 37200000,
      lawsuits: [
        {
          year: 2024,
          case: 'Excessive force — deputy shooting review',
          status: "Settled', amount: 285000, category: 'Use of Force",
          caseNote: 'Sample data — case number pending verification',
          docketUrl: 'https://www.flaglerclerk.com/online-services/court-records',
          mediaLinks: [
            { label: 'FlaglerLive: FCSO use of force coverage', url: 'https://flaglerlive.com/?s=sheriff+use+of+force' },
            { label: 'Palm Coast Observer: Sheriff coverage', url: 'https://www.observerlocalnews.com/search?q=flagler+sheriff+lawsuit' },
          ],
        },
        {
          year: 2023,
          case: 'Wrongful arrest — mistaken identity',
          status: "Dismissed', amount: 0, category: 'Wrongful Arrest",
          caseNote: 'Sample data — case number pending verification',
          docketUrl: 'https://www.flaglerclerk.com/online-services/court-records',
          mediaLinks: [
            { label: 'Search FlaglerLive for FCSO arrest coverage', url: 'https://flaglerlive.com/?s=flagler+sheriff+wrongful+arrest' },
          ],
        },
        {
          year: 2023,
          case: 'In-custody medical neglect',
          status: "Pending', amount: null, category: 'Detention",
          caseNote: 'Sample data — case number pending verification',
          docketUrl: 'https://www.flaglerclerk.com/online-services/court-records',
          mediaLinks: [
            { label: 'Search FlaglerLive: Flagler County jail coverage', url: 'https://flaglerlive.com/?s=flagler+county+jail' },
          ],
        },
        {
          year: 2022,
          case: 'Civil rights — unlawful search',
          status: "Settled', amount: 95000, category: 'Civil Rights",
          caseNote: 'Sample data — case number pending verification',
          docketUrl: 'https://www.flaglerclerk.com/online-services/court-records',
          mediaLinks: [
            { label: 'Search FlaglerLive: FCSO civil rights coverage', url: 'https://flaglerlive.com/?s=flagler+sheriff+civil+rights' },
          ],
        },
      ],
    },
    image: '',
    avatar: '🚔',
    color: '#1e293b',
    posts: [
      { id: 1401, text: "The Flagler County Sheriff\'s Office completed its 5th consecutive State accreditation this month — one of only 35 agencies in Florida to hold this distinction. Our deputies hold themselves to the highest standards every single day.", time: '2w ago', likes: 2840, type: 'announcement' },
      { id: 1402, text: 'Reminder: if you see something, say something. Our non-emergency tip line is available 24/7. Community partnership is the foundation of safe neighborhoods.', time: '5d ago', likes: 1120, type: 'announcement' },
    ]
  },
  {
    id: 7,
    name: 'Mike Norris',
    title: 'Mayor, City of Palm Coast',
    party: 'R',
    level: 'Local',
    followers: '5.1K',
    approval: 58,
    typologyMatch: 51,
    bio: "Mike Norris is the Mayor of Palm Coast, elected in November 2024 with 63% of the vote — the highest voter turnout in Flagler County since 1996. A retired Army officer and small business owner, he ran on fiscal responsibility, infrastructure repair, and smart growth for one of Florida\'s fastest-growing cities.",
    image: '',
    avatar: '🌊',
    color: '#0f766e',
    posts: [
      { id: 701, text: 'Watch the 2025 State of the City Address: "Charting the Course — Strength and Stability for Palm Coast." Full remarks on infrastructure investment, public safety, and our vision for the year ahead.', time: '1w ago', likes: 1204, type: 'announcement', videoId: 'Nryi8Mn1KcY', videoTitle: '2025 State of the City Address', videoOrg: 'City of Palm Coast, Florida' },
      { id: 702, text: 'The ethics complaint filed against this office has been dismissed by the Florida Commission on Ethics for lack of legal sufficiency. We remain focused entirely on the work Palm Coast residents sent us here to do.', time: '2w ago', likes: 876, type: 'announcement' },
    ]
  },
  {
    id: 15,
    name: 'Theresa Pontieri',
    title: 'Vice Mayor, District 2',
    party: 'R',
    level: 'Local',
    followers: '3.8K',
    approval: 61,
    typologyMatch: 53,
    bio: 'Theresa Pontieri serves as Vice Mayor of Palm Coast and City Council Member for District 2. Selected as Vice Mayor following the November 2024 council reorganization. She serves as liaison to the Family Life Center and Flagler County Cultural Council, focusing on community development and quality of life.',
    image: '',
    avatar: '🌴',
    color: '#0f766e',
    posts: [
      { id: 1501, text: 'Palm Coast is growing fast — we have a responsibility to grow smart. Investing in parks, roads, and community spaces now prevents far more expensive problems later.', time: '4d ago', likes: 921, type: 'announcement' },
    ]
  },
  {
    id: 30,
    name: 'Ty Miller',
    title: 'City Council Member, District 1',
    party: 'R',
    level: 'Local',
    followers: '2.1K',
    approval: 58,
    typologyMatch: 49,
    bio: 'Ty Miller was elected to the Palm Coast City Council for District 1 in November 2024. He serves as liaison to the Flagler Schools Oversight Committee and the Joint Cities and County Workshop, focusing on infrastructure investment and managed growth.',
    image: '',
    avatar: '🏘️',
    color: '#1d4ed8',
    posts: [
      { id: 3001, text: 'Proud to be sworn in as your District 1 representative. My door is always open — reach out with any concerns about roads, development, or city services in your neighborhood.', time: '1w ago', likes: 634, type: 'announcement' },
    ]
  },
  {
    id: 31,
    name: 'David Sullivan',
    title: 'City Council Member, District 3',
    party: 'R',
    level: 'Local',
    followers: '2.6K',
    approval: 64,
    typologyMatch: 56,
    bio: 'David Sullivan was appointed to Palm Coast City Council District 3 on April 15, 2025, replacing Ray Stevens who resigned for health reasons. A 28-year U.S. Navy Captain and Pentagon veteran, he previously served on the Flagler County Commission 2016-2024 including as Chair. He serves until the November 2026 election.',
    image: '',
    avatar: '\u2693',
    color: '#1e40af',
    posts: [
      { id: 3101, text: "I am in nobody's pocket — never have been, never will be. I will look at the facts and make decisions based on what is best for the residents of Palm Coast.", time: '2w ago', likes: 1840, type: 'announcement' },
    ]
  },
  {
    id: 32,
    name: 'Charles Gambaro',
    title: 'City Council Member, District 4',
    party: 'R',
    level: 'Local',
    followers: '1.9K',
    approval: 57,
    typologyMatch: 47,
    bio: 'Charles A. Gambaro Jr. serves on the Palm Coast City Council for District 4. He is liaison to the Flagler Schools Oversight Committee and St. Johns River Water Management District, focusing on water quality, environmental stewardship, and responsible development.',
    image: '',
    avatar: '\U0001f30a',
    color: '#0891b2',
    posts: [
      { id: 3201, text: 'Water quality in Palm Coast canals and waterways is a top priority. Working with St. Johns River Water Management District on a long-term stormwater improvement plan for District 4.', time: '1w ago', likes: 512, type: 'announcement' },
    ]
  },
  {
    id: 16,
    name: 'Will Furry',
    title: 'School Board Chair, District 2',
    party: 'R',
    level: 'Local',
    followers: '3.1K',
    approval: 58,
    typologyMatch: 42,
    bio: 'Will Furry is Chair of the Flagler County School Board, elected in 2022. A licensed Realtor, he has focused on fiscal accountability, school safety, and parental rights in education. He is currently considering a run for Congress against Randy Fine in the 2026 primary.',
    image: '',
    avatar: '🎓',
    color: '#1d4ed8',
    posts: [
      { id: 1601, text: 'Flagler County Schools have reached a 90% graduation rate for the first time in district history. This is a community achievement — teachers, parents, students, and support staff all made this happen together.', time: '1w ago', likes: 3210, type: 'announcement' },
    ]
  },
  {
    id: 22,
    name: 'Christy Chong',
    title: 'School Board Vice Chair, District 4',
    party: 'R',
    level: 'Local',
    followers: '1.8K',
    approval: 55,
    typologyMatch: 47,
    bio: 'Christy Chong is Vice Chair of the Flagler County School Board, elected in 2022. She has focused on curriculum transparency, school safety infrastructure, and fiscal oversight of the district budget.',
    image: '',
    avatar: '📚',
    color: '#0891b2',
    posts: [
      { id: 2201, text: 'Proud to serve Flagler County families. Our focus this year: literacy results, safe schools, and responsible spending of every education dollar.', time: '2w ago', likes: 892, type: 'announcement' },
    ]
  },
  {
    id: 23,
    name: 'Lauren Ramirez',
    title: 'School Board Member, District 3',
    party: 'R',
    level: 'Local',
    followers: '2.2K',
    approval: 61,
    typologyMatch: 52,
    bio: 'Lauren Ramirez was elected to the Flagler County School Board in August 2024. Named an Emerging Leader by the Florida School Boards Association after completing 48+ hours of professional development in her first year. She focuses on career and technical education pathways and student mental health.',
    image: '',
    avatar: '⭐',
    color: '#7c3aed',
    posts: [
      { id: 2301, text: 'Honored to be named an Emerging Leader by the Florida School Boards Association. Serving Flagler students and families is the privilege of a lifetime.', time: '3w ago', likes: 1240, type: 'announcement' },
    ]
  },
  {
    id: 24,
    name: 'Janie Ruddy',
    title: 'School Board Member, District 5',
    party: 'R',
    level: 'Local',
    followers: '1.5K',
    approval: 57,
    typologyMatch: 49,
    bio: 'Janie Ruddy was elected to the Flagler County School Board in August 2024, winning District 5 by 290 votes over Derek Barrs. She has focused on reading proficiency, special education services, and transparency in curriculum decisions.',
    image: '',
    avatar: '📖',
    color: '#059669',
    posts: [
      { id: 2401, text: 'Every child in Flagler County deserves to read at grade level by 3rd grade. This is my top priority and I will not stop pushing until we get there.', time: '1w ago', likes: 743, type: 'announcement' },
    ]
  },
  {
    id: 25,
    name: 'District 1 — Vacant',
    title: 'School Board, District 1',
    party: '',
    level: 'Local',
    followers: '—',
    approval: 0,
    typologyMatch: 0,
    bio: 'This seat is currently vacant. Derek Barrs resigned effective September 30, 2025 after being nominated by President Trump to lead the Federal Motor Carrier Safety Administration. Gov. DeSantis is responsible for appointing a replacement to serve until the next general election.',
    image: '',
    avatar: '⚠️',
    color: '#64748b',
    posts: []
  },
  {
    id: 26,
    name: 'Dawn Nichols',
    title: 'Circuit Court Judge — 7th Circuit',
    party: '',
    level: 'Local',
    followers: '892',
    approval: 71,
    typologyMatch: 0,
    bio: 'Judge Dawn Nichols is a Circuit Court Judge assigned to Flagler County in the 7th Judicial Circuit, covering Flagler, Volusia, St. Johns, and Putnam counties. Circuit judges handle felonies, civil cases over $30K, family law, and probate. Elected to a 6-year term.',
    image: '',
    avatar: '⚖️',
    color: '#374151',
    posts: []
  },
  {
    id: 27,
    name: 'Chris France',
    title: 'Circuit Court Judge — 7th Circuit',
    party: '',
    level: 'Local',
    followers: '743',
    approval: 68,
    typologyMatch: 0,
    bio: 'Judge Chris France is a Circuit Court Judge assigned to Flagler County in the 7th Judicial Circuit, presiding over the felony criminal division. Circuit judges may be reassigned across the 4-county circuit by the Chief Judge.',
    image: '',
    avatar: '⚖️',
    color: '#374151',
    posts: []
  },
  {
    id: 28,
    name: 'Melissa Distler',
    title: 'County Court Judge — Flagler County',
    party: '',
    level: 'Local',
    followers: '1.1K',
    approval: 74,
    typologyMatch: 0,
    bio: 'Judge Melissa Distler is a Flagler County Court Judge handling misdemeanors, small claims, traffic, and civil cases under $30K. She has sworn in multiple elected officials and school board members.',
    image: '',
    avatar: '🏛️',
    color: '#374151',
    posts: []
  },
  {
    id: 29,
    name: 'Andrea Totten',
    title: 'County Court Judge — Flagler County',
    party: '',
    level: 'Local',
    followers: '678',
    approval: 69,
    typologyMatch: 0,
    bio: 'Judge Andrea Totten is a Flagler County Court Judge appointed by Gov. DeSantis. She handles misdemeanor criminal cases, civil disputes under $30K, and small claims. County judges must win retention elections to remain on the bench.',
    image: '',
    avatar: '🏛️',
    color: '#374151',
    posts: []
  },
];

const LEVEL_ORDER = { 'Local': 0, 'State': 1, 'Federal': 2 };

const buildFeed = () => {
  const posts = [];
  OFFICIALS.forEach(official => {
    official.posts.forEach(post => {
      posts.push({ ...post, official });
    });
  });
  return posts.sort((a, b) => {
    const timeOrder = ['8m ago','1h ago','2h ago','3h ago','4h ago','1d ago','2d ago','3d ago','4d ago','5d ago','6d ago','1w ago','9d ago','2w ago','3w ago','4w ago','5w ago'];
    const levelA = LEVEL_ORDER[a.official.level] ?? 2;
    const levelB = LEVEL_ORDER[b.official.level] ?? 2;
    // Primary sort: level (local first)
    if (levelA !== levelB) return levelA - levelB;
    // Secondary sort: recency
    const ai = timeOrder.indexOf(a.time), bi = timeOrder.indexOf(b.time);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
};



// ─── ELECTION COMPARISON DATA ─────────────────────────────────────────────────

const UPCOMING_RACES = [
  {
    id: 'flagler-commission-2026',
    race: 'Flagler County Commission — District 4',
    electionDate: 'November 3, 2026',
    daysOut: 255,
    type: 'Local',
    color: '#d97706',
    zips: ['32110', '32136', '32137', '32164'],
    importance: 'HIGH',
    importanceReason: 'This seat controls land use, zoning, and the county budget. District 4 covers Palm Coast west and Bunnell. The winner will vote on $248M in annual spending.',
    status: 'Primary: August 2026 · General: November 2026',
    candidates: [
      {
        id: 'c1',
        name: 'Maria Gonzalez',
        party: 'R',
        age: 52,
        background: 'Small business owner, 14 years. Former Flagler County Planning Board member (2018–2022). Palm Coast resident 20 years.',
        avatar: '👩',
        color: '#dc2626',
        topIssues: [
          { issue: 'Growth & Development', position: 'Supports managed growth with impact fee increases to fund infrastructure before approvals', stance: 'moderate' },
          { issue: 'Property Taxes', position: 'Opposes any millage increases. Wants spending cuts in admin before new taxes', stance: 'conservative' },
          { issue: 'Public Safety', position: 'Supports 10% FCSO budget increase and 12 new deputy positions over 4 years', stance: 'supportive' },
          { issue: 'Environment', position: 'Supports dune restoration and canopy road preservation. Opposes wetland development variances', stance: 'supportive' },
        ],
        funding: {
          total: 84200,
          topSources: [
            {
              label: 'Flagler Realty & Development PAC', amount: 18000, type: 'PAC', industry: 'Real Estate',
              pacDetail: {
                registered: 'Florida Division of Elections — PAC #PC-2022-00341',
                formed: '2022', treasurer: 'Robert L. Harmon, Harmon & Associates LLC',
                totalRaised: 284000, totalSpent: 241000,
                topFunders: [
                  { name: 'Palm Coast Land Partners LLC', amount: 95000, industry: 'Real Estate', note: 'Active rezoning applications before Flagler Commission 2023–2025' },
                  { name: 'Flagler Beach Realty Inc.', amount: 62000, industry: 'Real Estate', note: 'Beachfront development interest, sought variance approvals 2024' },
                  { name: 'ITT/Arvida Legacy Holdings', amount: 48000, industry: 'Real Estate', note: 'Legacy landowner, western Flagler County development interests' },
                  { name: 'D&B Construction Group', amount: 38000, industry: 'Construction', note: 'County road and infrastructure contractor, active bids 2024-26' },
                  { name: 'Individual donors', amount: 41000, industry: 'Various', note: 'Bundled from local real estate agents and brokers' },
                ],
                otherCandidates: [
                  { name: "Donald O'Brien", office: "Flagler Commission Dist. 2", amount: 14000, year: 2022 },
                  { name: 'Andy Dance', office: 'Flagler Commission Dist. 4', amount: 12000, year: 2020 },
                  { name: 'Joe Mullins', office: 'Flagler Commission Dist. 4', amount: 22000, year: 2020 },
                ],
                relevantVotes: [
                  { vote: 'Rural Lands Comp Plan Amendment', outcome: 'Passed 3-2', note: 'Approved 4,200 new western county home sites. PAC donors hold majority of affected land.' },
                  { vote: 'Old Kings Road Widening Contract', outcome: 'Passed 5-0', note: 'DRMP awarded $4.2M contract. D&B Construction (PAC donor) was subcontractor.' },
                ],
                source: 'Florida Division of Elections · FEC.gov',
                sourceUrl: 'https://dos.fl.gov/elections/candidates-committees/campaign-finance/',
              }
            },
            { label: 'Local business network', amount: 12000, type: 'Individual bundle', industry: 'Retail / Business', pacDetail: null },
            { label: 'Individual donors', amount: 54000, type: 'Individual', industry: 'Various', pacDetail: null },
          ]
        },
        website: '#',
        priorOffice: 'Planning Board 2018–2022',
        incumbent: true,
        verified: true,
        publicRecord: {
          filingDate: 'December 3, 2025',
          filingSource: 'Flagler County Supervisor of Elections',
          filingUrl: 'https://www.flaglerelections.com',
          endorsements: ['Flagler County Republican Executive Committee', 'FL Association of Realtors PAC', 'Sheriff Rick Staly'],
          priorVotingRecord: [
            { body: 'Flagler Planning Board', date: 'Oct 2021', item: 'Western County Rural Lands Amendment', vote: 'YES', note: 'Approved expanding development zones in western Flagler — later adopted by Commission 3-2' },
            { body: 'Flagler Planning Board', date: 'Mar 2021', item: 'Old Kings Road Commercial Rezoning', vote: 'YES', note: 'Approved strip mall development at Old Kings/Belle Terre intersection' },
            { body: 'Flagler Planning Board', date: 'Sep 2020', item: 'Wetland Buffer Variance — Palm Harbor', vote: 'NO', note: 'Opposed reducing wetland buffer from 100ft to 50ft. Motion failed 3-2.' },
            { body: 'Flagler Planning Board', date: 'Jun 2020', item: 'Town Center Height Increase', vote: 'YES', note: 'Approved raising max building height from 4 to 8 stories in Town Center CRA' },
          ],
          publicStatements: [
            { date: 'Feb 2026', source: 'FlaglerLive', quote: 'Growth is coming whether we like it or not. The question is whether we manage it or it manages us.' },
          ],
        },
      },
      {
        id: 'c2',
        name: 'James Whitfield',
        party: 'R',
        age: 61,
        background: 'Retired FDOT civil engineer, 28 years. HOA board president Palm Harbor. Flagler County since 2008.',
        avatar: '👨',
        color: '#b45309',
        topIssues: [
          { issue: 'Growth & Development', position: 'Wants temporary moratorium on large developments until SR 100 corridor improvements are fully funded', stance: 'restrictive' },
          { issue: 'Property Taxes', position: 'Open to targeted millage increase dedicated solely to road infrastructure', stance: 'moderate' },
          { issue: 'Public Safety', position: 'Supports FCSO funding but wants full audit of overtime spending first', stance: 'cautious' },
          { issue: 'Environment', position: 'Strongly opposes any development within 500ft of wetland buffers. Supports Old Kings canopy preservation', stance: 'supportive' },
        ],
        funding: { total: 61500, topSources: [
          { label: 'Self-funded', amount: 20000, type: 'Self', industry: 'Individual', pacDetail: null },
          { label: 'Retired residents network', amount: 22000, type: 'Individual bundle', industry: 'Individual', pacDetail: null },
          { label: 'Individual donors', amount: 19000, type: 'Individual', industry: 'Various', pacDetail: null },
        ] },
        website: '#',
        priorOffice: 'None — first run for office',
        verified: false,
        publicRecord: {
          filingDate: 'January 14, 2026',
          filingSource: 'Flagler County Supervisor of Elections',
          filingUrl: 'https://www.flaglerelections.com',
          endorsements: ['Flagler County Homeowners Coalition', 'Northeast Florida Sierra Club'],
          priorVotingRecord: null,
          professionalLicense: 'Florida PE License #74821 — Civil Engineering (Active)',
          publicStatements: [
            { date: 'Feb 2026', source: 'Flagler Tribune', quote: 'We cannot keep approving subdivisions faster than we build roads. SR 100 is already at capacity.' },
            { date: 'Jan 2026', source: 'FlaglerLive', quote: 'I am running because 28 years of engineering taught me what happens when you build without planning.' },
          ],
          noRecordNote: 'First-time candidate. No prior elected office, no legislative voting record. Public record limited to campaign filings and public statements.',
        },
      },
    ],
    sharedPositions: [
      'Both support increased impact fees for new development',
      'Both oppose cutting library or senior services budgets',
      'Both support the Flagler Beach dune restoration project',
    ],
    keyDifferences: [
      { issue: 'Development moratorium', c1: 'Managed growth with fees', c2: 'Temporary pause on large projects' },
      { issue: 'Road funding', c1: 'No tax increases', c2: 'Open to targeted millage' },
      { issue: 'FCSO budget', c1: 'Increase now', c2: 'Audit first, then increase' },
    ],
    dataNote: 'Candidate information sourced from campaign filings and public statements. All figures are approximate. This is a demonstration of the election comparison feature.',
  },
];

// ─── MULTI-LOCATION DATABASE ──────────────────────────────────────────────────

const LOCATION_DB = {
  '06850': {
    city: 'Norwalk', state: 'CT', displayName: 'Norwalk, CT',
    officials: [
      { id: 9001, name: 'Harry Rilling', title: 'Mayor of Norwalk', level: 'Local', party: 'D', approval: 62, avatar: '\u{1F454}', color: '#1d4ed8',
        bio: 'Harry Rilling has served as Mayor of Norwalk, CT since 2013. A former police chief, he has focused on economic development, infrastructure, and education.',
        posts: [
          { id: 90011, text: 'Proud to announce Norwalk will receive $4.2M in federal infrastructure funding for the Wall Street corridor. This is exactly the investment our city deserves.', time: '3d ago', likes: 412, type: 'announcement' },
          { id: 90012, text: 'Our Norwalk Promise scholarship program has helped 340 students attend college tuition-free since 2021. Investing in youth is investing in our future.', time: '1w ago', likes: 891, type: 'announcement' },
        ]
      },
      { id: 9002, name: 'Eloisa Melendez', title: 'Common Council President, Norwalk', level: 'Local', party: 'D', approval: 58, avatar: '\u{1F3DB}', color: '#1d4ed8',
        bio: 'Eloisa Melendez serves as President of the Norwalk Common Council. She has focused on affordable housing, environmental justice, and immigrant rights.',
        posts: [
          { id: 90021, text: 'The Council approved a $2.1M affordable housing trust fund tonight. Every Norwalk resident deserves a safe, stable home.', time: '5d ago', likes: 328, type: 'vote' },
        ]
      },
    ]
  },
  '10001': {
    city: 'New York City', state: 'NY', displayName: 'New York City, NY',
    officials: [
      { id: 9010, name: 'Eric Adams', title: 'Mayor of New York City', level: 'Local', party: 'D', approval: 28, avatar: '\u{1F3D9}', color: '#1d4ed8',
        bio: 'Eric Adams has served as Mayor of New York City since January 2022. A former Brooklyn Borough President, he has focused on public safety, mental health, and economic recovery.',
        posts: [
          { id: 90101, text: 'New York City will invest $650 million in new mental health services over the next three years. Mental health is public safety.', time: '2d ago', likes: 2840, type: 'announcement' },
        ]
      },
      { id: 9011, name: 'Brad Lander', title: 'NYC Comptroller', level: 'Local', party: 'D', approval: 55, avatar: '\u{1F4CA}', color: '#0f766e',
        bio: 'Brad Lander has served as NYC Comptroller since 2022. He oversees the city $100 billion pension funds and conducts independent audits of city agencies.',
        posts: [
          { id: 90111, text: 'My audit of NYPD overtime found $150M in questionable payments over three years. Taxpayers deserve accountability.', time: '1w ago', likes: 1240, type: 'announcement' },
        ]
      },
    ]
  },
  '33101': {
    city: 'Miami', state: 'FL', displayName: 'Miami, FL',
    officials: [
      { id: 9020, name: 'Francis Suarez', title: 'Mayor of Miami', level: 'Local', party: 'R', approval: 52, avatar: '\u{1F334}', color: '#dc2626',
        bio: 'Francis Suarez has served as Mayor of Miami since 2017. Known for his pro-technology and crypto positions, he has marketed Miami as a tech hub.',
        posts: [
          { id: 90201, text: 'Miami is now home to more tech companies than Silicon Valley per capita. The magic of Miami is real and it is only getting stronger.', time: '4d ago', likes: 3120, type: 'announcement' },
        ]
      },
    ]
  },
  '78701': {
    city: 'Austin', state: 'TX', displayName: 'Austin, TX',
    officials: [
      { id: 9030, name: 'Kirk Watson', title: 'Mayor of Austin', level: 'Local', party: 'D', approval: 49, avatar: '\u{1F920}', color: '#1d4ed8',
        bio: 'Kirk Watson returned as Mayor of Austin in 2023. A former Texas state senator, he has focused on housing affordability, homelessness, and managing rapid growth.',
        posts: [
          { id: 90301, text: 'Austin added 16,000 housing units last year, more than any other city our size in America. We are proving you can build your way out of a housing crisis.', time: '3d ago', likes: 1890, type: 'announcement' },
        ]
      },
    ]
  },
  '60601': {
    city: 'Chicago', state: 'IL', displayName: 'Chicago, IL',
    officials: [
      { id: 9040, name: 'Brandon Johnson', title: 'Mayor of Chicago', level: 'Local', party: 'D', approval: 31, avatar: '\u{1F32C}', color: '#1d4ed8',
        bio: 'Brandon Johnson became Mayor of Chicago in May 2023. A former school teacher backed by the Chicago Teachers Union, he has focused on progressive policing reform and social investment.',
        posts: [
          { id: 90401, text: 'Our new mental health clinics have served 12,000 residents in our first year. We are investing in people, not just punishment.', time: '5d ago', likes: 1420, type: 'announcement' },
        ]
      },
    ]
  },
  '90001': {
    city: 'Los Angeles', state: 'CA', displayName: 'Los Angeles, CA',
    officials: [
      { id: 9050, name: 'Karen Bass', title: 'Mayor of Los Angeles', level: 'Local', party: 'D', approval: 38, avatar: '\u{1F306}', color: '#1d4ed8',
        bio: 'Karen Bass became Mayor of Los Angeles in December 2022, the first Black woman elected mayor of a major U.S. city. She has focused on the homelessness crisis and recovery from the 2025 Palisades and Eaton fires.',
        posts: [
          { id: 90501, text: 'We have housed 15,000 people experiencing homelessness in two years. Inside Safe is working and we will not go back to the old approach.', time: '2d ago', likes: 2200, type: 'announcement' },
        ]
      },
    ]
  },
};

const CITY_TO_ZIP = {
  'norwalk ct': '06850', 'norwalk': '06850', 'norwalk connecticut': '06850',
  'new york': '10001', 'new york city': '10001', 'nyc': '10001', 'manhattan': '10001', 'new york ny': '10001',
  'miami': '33101', 'miami fl': '33101', 'miami florida': '33101',
  'austin': '78701', 'austin tx': '78701', 'austin texas': '78701',
  'chicago': '60601', 'chicago il': '60601', 'chicago illinois': '60601',
  'los angeles': '90001', 'la': '90001', 'los angeles ca': '90001',
  'palm coast': '32164', 'palm coast fl': '32164', 'flagler': '32164',
};

// Florida ZIP to city/county display name
const FL_ZIP_CITY = {
  // Flagler
  '32110': 'Bunnell, Flagler Co.', '32136': 'Flagler Beach, Flagler Co.', '32137': 'Palm Coast, Flagler Co.', '32164': 'Palm Coast, Flagler Co.',
  // Hillsborough/Tampa
  '33601': 'Tampa, Hillsborough Co.', '33602': 'Tampa, Hillsborough Co.', '33603': 'Tampa, Hillsborough Co.', '33604': 'Tampa, Hillsborough Co.',
  '33605': 'Tampa, Hillsborough Co.', '33606': 'Tampa, Hillsborough Co.', '33607': 'Tampa, Hillsborough Co.', '33609': 'Tampa, Hillsborough Co.',
  '33610': 'Tampa, Hillsborough Co.', '33611': 'Tampa, Hillsborough Co.', '33612': 'Tampa, Hillsborough Co.', '33613': 'Tampa, Hillsborough Co.',
  '33614': 'Tampa, Hillsborough Co.', '33615': 'Tampa, Hillsborough Co.', '33616': 'Tampa, Hillsborough Co.', '33617': 'Tampa, Hillsborough Co.',
  '33618': 'Tampa, Hillsborough Co.', '33619': 'Tampa, Hillsborough Co.', '33621': 'Tampa, Hillsborough Co.', '33629': 'Tampa, Hillsborough Co.',
  '33634': 'Tampa, Hillsborough Co.', '33635': 'Tampa, Hillsborough Co.', '33637': 'Tampa, Hillsborough Co.', '33647': 'Tampa, Hillsborough Co.',
  // Miami-Dade
  '33101': 'Miami, Miami-Dade Co.', '33125': 'Miami, Miami-Dade Co.', '33126': 'Miami, Miami-Dade Co.', '33127': 'Miami, Miami-Dade Co.',
  '33128': 'Miami, Miami-Dade Co.', '33129': 'Miami, Miami-Dade Co.', '33130': 'Miami, Miami-Dade Co.', '33131': 'Miami, Miami-Dade Co.',
  '33132': 'Miami, Miami-Dade Co.', '33133': 'Miami, Miami-Dade Co.', '33134': 'Miami, Miami-Dade Co.', '33135': 'Miami, Miami-Dade Co.',
  '33136': 'Miami, Miami-Dade Co.', '33137': 'Miami, Miami-Dade Co.', '33138': 'Miami, Miami-Dade Co.', '33139': 'Miami Beach, Miami-Dade Co.',
  '33140': 'Miami Beach, Miami-Dade Co.', '33141': 'Miami Beach, Miami-Dade Co.', '33142': 'Miami, Miami-Dade Co.', '33143': 'Miami, Miami-Dade Co.',
  '33144': 'Miami, Miami-Dade Co.', '33145': 'Miami, Miami-Dade Co.', '33146': 'Miami, Miami-Dade Co.', '33147': 'Miami, Miami-Dade Co.',
  '33149': 'Key Biscayne, Miami-Dade Co.', '33150': 'Miami, Miami-Dade Co.',
  '33155': 'Miami, Miami-Dade Co.', '33156': 'Miami, Miami-Dade Co.', '33157': 'Miami, Miami-Dade Co.', '33158': 'Miami, Miami-Dade Co.',
  '33160': 'Miami, Miami-Dade Co.', '33161': 'Miami, Miami-Dade Co.', '33162': 'Miami, Miami-Dade Co.',
  '33165': 'Miami, Miami-Dade Co.', '33166': 'Miami, Miami-Dade Co.', '33167': 'Miami, Miami-Dade Co.', '33168': 'Miami, Miami-Dade Co.',
  '33169': 'Miami, Miami-Dade Co.', '33170': 'Miami, Miami-Dade Co.',
  // Broward
  '33301': 'Fort Lauderdale, Broward Co.', '33304': 'Fort Lauderdale, Broward Co.', '33305': 'Fort Lauderdale, Broward Co.',
  '33306': 'Fort Lauderdale, Broward Co.', '33308': 'Fort Lauderdale, Broward Co.', '33309': 'Fort Lauderdale, Broward Co.',
  '33310': 'Fort Lauderdale, Broward Co.', '33311': 'Fort Lauderdale, Broward Co.', '33312': 'Fort Lauderdale, Broward Co.',
  '33313': 'Lauderhill, Broward Co.', '33314': 'Fort Lauderdale, Broward Co.', '33315': 'Fort Lauderdale, Broward Co.',
  '33316': 'Fort Lauderdale, Broward Co.', '33317': 'Plantation, Broward Co.', '33319': 'Lauderhill, Broward Co.',
  '33321': 'Tamarac, Broward Co.', '33322': 'Sunrise, Broward Co.', '33323': 'Sunrise, Broward Co.',
  '33324': 'Davie, Broward Co.', '33325': 'Davie, Broward Co.', '33326': 'Weston, Broward Co.',
  '33328': 'Davie, Broward Co.', '33334': 'Fort Lauderdale, Broward Co.',
  // Palm Beach
  '33401': 'West Palm Beach, Palm Beach Co.', '33403': 'West Palm Beach, Palm Beach Co.', '33404': 'West Palm Beach, Palm Beach Co.',
  '33405': 'West Palm Beach, Palm Beach Co.', '33406': 'West Palm Beach, Palm Beach Co.', '33407': 'West Palm Beach, Palm Beach Co.',
  '33408': 'North Palm Beach, Palm Beach Co.', '33409': 'West Palm Beach, Palm Beach Co.', '33410': 'Palm Beach Gardens, Palm Beach Co.',
  '33411': 'West Palm Beach, Palm Beach Co.', '33412': 'West Palm Beach, Palm Beach Co.', '33413': 'West Palm Beach, Palm Beach Co.',
  '33414': 'Wellington, Palm Beach Co.', '33415': 'West Palm Beach, Palm Beach Co.', '33417': 'West Palm Beach, Palm Beach Co.',
  '33418': 'Palm Beach Gardens, Palm Beach Co.', '33426': 'Boynton Beach, Palm Beach Co.', '33428': 'Boca Raton, Palm Beach Co.',
  '33431': 'Boca Raton, Palm Beach Co.', '33432': 'Boca Raton, Palm Beach Co.', '33433': 'Boca Raton, Palm Beach Co.',
  '33434': 'Boca Raton, Palm Beach Co.', '33435': 'Boynton Beach, Palm Beach Co.', '33436': 'Boynton Beach, Palm Beach Co.',
  '33437': 'Boynton Beach, Palm Beach Co.', '33444': 'Delray Beach, Palm Beach Co.', '33445': 'Delray Beach, Palm Beach Co.',
  '33446': 'Delray Beach, Palm Beach Co.', '33458': 'Jupiter, Palm Beach Co.', '33460': 'Lake Worth, Palm Beach Co.',
  '33461': 'Lake Worth, Palm Beach Co.', '33462': 'Lake Worth, Palm Beach Co.', '33463': 'Lake Worth, Palm Beach Co.',
  '33467': 'Lake Worth, Palm Beach Co.', '33480': 'Palm Beach, Palm Beach Co.', '33483': 'Delray Beach, Palm Beach Co.',
  '33484': 'Delray Beach, Palm Beach Co.', '33486': 'Boca Raton, Palm Beach Co.', '33487': 'Boca Raton, Palm Beach Co.',
  '33496': 'Boca Raton, Palm Beach Co.', '33498': 'Boca Raton, Palm Beach Co.',
  // Duval/Jacksonville
  '32099': 'Jacksonville, Duval Co.', '32201': 'Jacksonville, Duval Co.', '32202': 'Jacksonville, Duval Co.',
  '32204': 'Jacksonville, Duval Co.', '32205': 'Jacksonville, Duval Co.', '32206': 'Jacksonville, Duval Co.',
  '32207': 'Jacksonville, Duval Co.', '32208': 'Jacksonville, Duval Co.', '32209': 'Jacksonville, Duval Co.',
  '32210': 'Jacksonville, Duval Co.', '32211': 'Jacksonville, Duval Co.', '32216': 'Jacksonville, Duval Co.',
  '32217': 'Jacksonville, Duval Co.', '32218': 'Jacksonville, Duval Co.', '32219': 'Jacksonville, Duval Co.',
  '32220': 'Jacksonville, Duval Co.', '32221': 'Jacksonville, Duval Co.', '32222': 'Jacksonville, Duval Co.',
  '32223': 'Jacksonville, Duval Co.', '32224': 'Jacksonville, Duval Co.', '32225': 'Jacksonville, Duval Co.',
  '32226': 'Jacksonville, Duval Co.', '32244': 'Jacksonville, Duval Co.', '32246': 'Jacksonville, Duval Co.',
  '32250': 'Jacksonville Beach, Duval Co.', '32254': 'Jacksonville, Duval Co.', '32256': 'Jacksonville, Duval Co.',
  '32257': 'Jacksonville, Duval Co.', '32258': 'Jacksonville, Duval Co.', '32266': 'Neptune Beach, Duval Co.',
  '32277': 'Jacksonville, Duval Co.',
  // Orange/Orlando
  '32801': 'Orlando, Orange Co.', '32803': 'Orlando, Orange Co.', '32804': 'Orlando, Orange Co.',
  '32805': 'Orlando, Orange Co.', '32806': 'Orlando, Orange Co.', '32807': 'Orlando, Orange Co.',
  '32808': 'Orlando, Orange Co.', '32809': 'Orlando, Orange Co.', '32810': 'Orlando, Orange Co.',
  '32811': 'Orlando, Orange Co.', '32812': 'Orlando, Orange Co.', '32814': 'Orlando, Orange Co.',
  '32817': 'Orlando, Orange Co.', '32818': 'Orlando, Orange Co.', '32819': 'Orlando, Orange Co.',
  '32821': 'Orlando, Orange Co.', '32822': 'Orlando, Orange Co.', '32824': 'Orlando, Orange Co.',
  '32825': 'Orlando, Orange Co.', '32826': 'Orlando, Orange Co.', '32827': 'Orlando, Orange Co.',
  '32828': 'Orlando, Orange Co.', '32829': 'Orlando, Orange Co.', '32831': 'Orlando, Orange Co.',
  '32835': 'Orlando, Orange Co.', '32836': 'Orlando, Orange Co.', '32837': 'Orlando, Orange Co.',
  '32839': 'Orlando, Orange Co.',
  // Pinellas
  '33701': 'St. Petersburg, Pinellas Co.', '33702': 'St. Petersburg, Pinellas Co.', '33703': 'St. Petersburg, Pinellas Co.',
  '33704': 'St. Petersburg, Pinellas Co.', '33705': 'St. Petersburg, Pinellas Co.', '33706': 'St. Pete Beach, Pinellas Co.',
  '33707': 'St. Petersburg, Pinellas Co.', '33708': 'St. Petersburg, Pinellas Co.', '33709': 'St. Petersburg, Pinellas Co.',
  '33710': 'St. Petersburg, Pinellas Co.', '33711': 'St. Petersburg, Pinellas Co.', '33712': 'St. Petersburg, Pinellas Co.',
  '33713': 'St. Petersburg, Pinellas Co.', '33714': 'St. Petersburg, Pinellas Co.', '33715': 'St. Petersburg, Pinellas Co.',
  '33716': 'St. Petersburg, Pinellas Co.',
  '33755': 'Clearwater, Pinellas Co.', '33756': 'Clearwater, Pinellas Co.', '33759': 'Clearwater, Pinellas Co.',
  '33760': 'Clearwater, Pinellas Co.', '33761': 'Clearwater, Pinellas Co.', '33762': 'Clearwater, Pinellas Co.',
  '33763': 'Clearwater, Pinellas Co.', '33764': 'Clearwater, Pinellas Co.', '33765': 'Clearwater, Pinellas Co.',
  '33767': 'Clearwater Beach, Pinellas Co.',
  // Polk
  '33801': 'Lakeland, Polk Co.', '33803': 'Lakeland, Polk Co.', '33805': 'Lakeland, Polk Co.',
  '33809': 'Lakeland, Polk Co.', '33810': 'Lakeland, Polk Co.', '33811': 'Lakeland, Polk Co.',
  '33812': 'Lakeland, Polk Co.', '33813': 'Lakeland, Polk Co.', '33815': 'Lakeland, Polk Co.',
  '33823': 'Auburndale, Polk Co.', '33825': 'Avon Park, Polk Co.', '33827': 'Babson Park, Polk Co.',
  '33830': 'Bartow, Polk Co.', '33837': 'Davenport, Polk Co.', '33838': 'Dundee, Polk Co.',
  '33839': 'Eagle Lake, Polk Co.', '33841': 'Fort Meade, Polk Co.', '33843': 'Frostproof, Polk Co.',
  '33844': 'Haines City, Polk Co.', '33849': 'Kathleen, Polk Co.', '33850': 'Lake Alfred, Polk Co.',
  '33851': 'Lake Hamilton, Polk Co.', '33853': 'Lake Wales, Polk Co.', '33859': 'Lake Wales, Polk Co.',
  '33860': 'Mulberry, Polk Co.', '33868': 'Polk City, Polk Co.', '33880': 'Winter Haven, Polk Co.',
  '33881': 'Winter Haven, Polk Co.', '33884': 'Winter Haven, Polk Co.',
  // Brevard
  '32901': 'Melbourne, Brevard Co.', '32903': 'Indialantic, Brevard Co.', '32904': 'Melbourne, Brevard Co.',
  '32905': 'Palm Bay, Brevard Co.', '32907': 'Palm Bay, Brevard Co.', '32908': 'Palm Bay, Brevard Co.',
  '32909': 'Palm Bay, Brevard Co.', '32920': 'Cape Canaveral, Brevard Co.', '32922': 'Cocoa, Brevard Co.',
  '32925': 'Patrick AFB, Brevard Co.', '32926': 'Cocoa, Brevard Co.', '32927': 'Cocoa, Brevard Co.',
  '32931': 'Cocoa Beach, Brevard Co.', '32934': 'Melbourne, Brevard Co.', '32935': 'Melbourne, Brevard Co.',
  '32937': 'Satellite Beach, Brevard Co.', '32940': 'Melbourne, Brevard Co.', '32948': 'Fellsmere, Brevard Co.',
  '32949': 'Grant, Brevard Co.', '32950': 'Malabar, Brevard Co.', '32951': 'Melbourne Beach, Brevard Co.',
  '32952': 'Merritt Island, Brevard Co.', '32953': 'Merritt Island, Brevard Co.', '32955': 'Rockledge, Brevard Co.',
  '32958': 'Sebastian, Brevard Co.', '32959': 'Viera, Brevard Co.', '32976': 'Sebastian, Brevard Co.',
  // Volusia
  '32114': 'Daytona Beach, Volusia Co.', '32117': 'Daytona Beach, Volusia Co.', '32118': 'Daytona Beach, Volusia Co.',
  '32119': 'Daytona Beach, Volusia Co.', '32124': 'Daytona Beach, Volusia Co.', '32127': 'Port Orange, Volusia Co.',
  '32128': 'Port Orange, Volusia Co.', '32129': 'Port Orange, Volusia Co.', '32130': 'DeLand, Volusia Co.',
  '32132': 'Edgewater, Volusia Co.', '32141': 'Edgewater, Volusia Co.', '32168': 'New Smyrna Beach, Volusia Co.',
  '32169': 'New Smyrna Beach, Volusia Co.', '32174': 'Ormond Beach, Volusia Co.', '32176': 'Ormond Beach, Volusia Co.',
  '32180': 'Pierson, Volusia Co.', '32190': 'Seville, Volusia Co.', '32198': 'DeLand, Volusia Co.',
};

function resolveLocation(query) {
  const q = query.trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');
  if (/^\d{5}$/.test(q)) {
    return LOCATION_DB[q] ? { zip: q, ...LOCATION_DB[q] } : null;
  }
  const zip = CITY_TO_ZIP[q];
  if (zip && LOCATION_DB[zip]) return { zip, ...LOCATION_DB[zip] };
  for (const [key, zipVal] of Object.entries(CITY_TO_ZIP)) {
    if (key.startsWith(q) || q.includes(key.split(' ')[0])) {
      if (LOCATION_DB[zipVal]) return { zip: zipVal, ...LOCATION_DB[zipVal] };
    }
  }
  return null;
}

const FEED_ALL = buildFeed();

const partyColor = (p) => p === 'R' ? '#dc2626' : '#2563eb';
const typeIcon = (t) => ({ vote:'🗳️', legislation:'📜', announcement:'📢', event:'📅' }[t] || '💬');
const typeLabel = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// ─── OFFICIAL AVATAR (photo + emoji fallback) ────────────────────────────────

function OfficialAvatar({ official, size = 44, radius = 12, fontSize = '1.3rem' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImg = official.image && !imgFailed;
  return (
    <div
      className="off-avatar"
      style={{
        width: size, height: size,
        borderRadius: radius,
        border: `2px solid ${official.color}66`,
        background: hasImg ? '#f0f2f5' : official.color + '22',
        overflow: 'hidden',
        flexShrink: 0,
        display: "flex', alignItems: 'center', justifyContent: 'center",
        fontSize: fontSize,
      }}
    >
      {hasImg ? (
        <img
          src={official.image}
          alt={official.name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
      ) : (
        <span>{official.avatar}</span>
      )}
    </div>
  );
}

// ─── ONBOARDING ─────────────────────────────────────────────────────────────

function ZipOnboarding({ onComplete }) {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d+$/.test(zip)) onComplete(zip);
    else setError('Please enter a valid 5-digit ZIP code');
  };

  return (
    <div className="onboard-screen">
      <div className="onboard-orbs">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>
      <div className="onboard-inner">
        <div className="onboard-logo">
          <span className="ob-hex">⬡</span>
          <PolitiCardLogo height={36} />
        </div>
<h1 className="onboard-headline">Bringing truth<br /><em>to light.</em></h1>
<p className="onboard-sub">Unbiased. Ad-free. Your elected officials, their votes, and their statements — all in one place.</p>
        <form className="onboard-form" onSubmit={submit}>
          <div className="zip-row">
            <span className="zip-pin">📍</span>
            <input className="zip-inp" type="text" placeholder="Enter ZIP code" value={zip} maxLength={5} autoFocus
              onChange={e => { setZip(e.target.value.slice(0,5)); setError(''); }} />
            <button className="zip-go" type="submit">Get Started →</button>
          </div>
          {error && <p className="zip-error">{error}</p>}
          <p className="zip-note">Free · No ads · No data selling</p>
        </form>
        <div className="onboard-levels">
          <div className="level-pill">🏛️ Federal</div>
          <div className="level-pill">🌴 State</div>
          <div className="level-pill">🏙️ Local</div>
        </div>
      </div>
    </div>
  );
}

// ─── ZIP CHANGE MODAL ────────────────────────────────────────────────────────

function ZipModal({ currentZip, onClose, onSave }) {
  const [val, setVal] = useState(currentZip);
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (val.length === 5 && /^\d+$/.test(val)) { onSave(val); onClose(); }
    else setError('Enter a valid 5-digit ZIP');
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Change ZIP Code</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">Your feed will update to show officials representing the new ZIP code.</p>
        <form onSubmit={submit}>
          <div className="modal-zip-row">
            <span>📍</span>
            <input className="modal-zip-inp" type="text" value={val} maxLength={5} autoFocus
              onChange={e => { setVal(e.target.value.slice(0,5)); setError(''); }} />
          </div>
          {error && <p className="zip-error" style={{marginTop:'0.4rem'}}>{error}</p>}
          <button className="modal-save-btn" type="submit">Update Feed</button>
        </form>
      </div>
    </div>
  );
}


// ─── LOCATION SEARCH MODAL ───────────────────────────────────────────────────

function LocationSearchModal({ followedLocations, onAdd, onRemove, onClose }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = (e) => {
    e && e.preventDefault();
    if (!query.trim()) return;
    const found = resolveLocation(query);
    setSearched(true);
    if (found) { setResult(found); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const isFollowed = (zip) => followedLocations.some(l => l.zip === zip);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card loc-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📍 Follow Another Location</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="loc-modal-sub">Search by ZIP code or city name to follow officials anywhere in the U.S.</p>

        <form className="loc-search-form" onSubmit={search}>
          <div className="loc-search-row">
            <input
              className="loc-search-inp"
              type="text"
              placeholder="ZIP or city — e.g. 06850 or Norwalk CT"
              value={query}
              autoFocus
              onChange={e => { setQuery(e.target.value); setSearched(false); setNotFound(false); setResult(null); }}
            />
            <button className="loc-search-btn" type="submit">Search</button>
          </div>
        </form>

        {/* Quick city pills */}
        <div className="loc-quick-label">Quick add</div>
        <div className="loc-quick-pills">
          {[
            { label: 'Norwalk, CT', q: 'norwalk ct' },
            { label: 'New York City', q: 'nyc' },
            { label: 'Miami, FL', q: 'miami' },
            { label: 'Austin, TX', q: 'austin' },
            { label: 'Chicago, IL', q: 'chicago' },
            { label: 'Los Angeles', q: 'los angeles' },
          ].map(city => {
            const loc = resolveLocation(city.q);
            const following = loc && isFollowed(loc.zip);
            return (
              <button key={city.q}
                className={`loc-quick-pill ${following ? 'loc-quick-following' : ''}`}
                onClick={() => {
                  if (!loc) return;
                  if (following) onRemove(loc.zip);
                  else { onAdd(loc); onClose(); }
                }}>
                {following ? '✓ ' : '+ '}{city.label}
              </button>
            );
          })}
        </div>

        {/* Search result */}
        {searched && result && (
          <div className="loc-result-card">
            <div className="loc-result-header">
              <div>
                <div className="loc-result-city">{result.displayName}</div>
                <div className="loc-result-count">{result.officials.length} official{result.officials.length !== 1 ? 's' : ''} available</div>
              </div>
              {isFollowed(result.zip) ? (
                <button className="loc-unfollow-btn" onClick={() => { onRemove(result.zip); setResult(null); }}>
                  ✓ Following · Remove
                </button>
              ) : (
                <button className="loc-follow-btn" onClick={() => { onAdd(result); onClose(); }}>
                  + Follow
                </button>
              )}
            </div>
            <div className="loc-result-officials">
              {result.officials.map((o, i) => (
                <div key={i} className="loc-result-official">
                  <span className="loc-result-avatar">{o.avatar}</span>
                  <div className="loc-result-info">
                    <span className="loc-result-name">{o.name}</span>
                    <span className="loc-result-title">{o.title}</span>
                  </div>
                  <span className={`loc-result-party loc-party-${o.party}`}>{o.party}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && notFound && (
          <div className="loc-not-found">
            <div className="loc-nf-icon">🔍</div>
            <div className="loc-nf-title">Location not found</div>
            <p className="loc-nf-sub">Try a 5-digit ZIP code or major city name. More cities are added regularly.</p>
          </div>
        )}

        {/* Currently following */}
        {followedLocations.length > 0 && (
          <div className="loc-following-section">
            <div className="loc-following-label">Locations you follow</div>
            {followedLocations.map(loc => (
              <div key={loc.zip} className="loc-following-row">
                <div className="loc-following-info">
                  <span className="loc-following-name">{loc.displayName}</span>
                  <span className="loc-following-count">{loc.officials.length} officials in feed</span>
                </div>
                <button className="loc-following-remove" onClick={() => onRemove(loc.zip)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



// ─── VERIFIED BADGE ───────────────────────────────────────────────────────────

function VerifiedBadge({ size = 'sm' }) {
  const sizes = { sm: { font: '0.58rem', pad: '0.12rem 0.45rem', icon: '✓' }, md: { font: '0.68rem', pad: '0.18rem 0.6rem', icon: '✓ Verified Candidate' } };
  const s = sizes[size] || sizes.sm;
  return (
    <span className="verified-badge" style={{ fontSize: s.font, padding: s.pad }}>
      {s.icon}
    </span>
  );
}

// ─── PAC DRILL-DOWN MODAL ─────────────────────────────────────────────────────

function PacDrillModal({ pac, candidateName, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pac-modal" onClick={e => e.stopPropagation()}>
        <div className="pac-modal-header">
          <div>
            <div className="pac-modal-title">{pac.label}</div>
            <div className="pac-modal-sub">PAC Transparency Report · Donation to {candidateName}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Registration */}
        <div className="pac-reg-card">
          <div className="pac-reg-row"><span className="pac-reg-lbl">Registered</span><span className="pac-reg-val">{pac.pacDetail.registered}</span></div>
          <div className="pac-reg-row"><span className="pac-reg-lbl">Formed</span><span className="pac-reg-val">{pac.pacDetail.formed}</span></div>
          <div className="pac-reg-row"><span className="pac-reg-lbl">Treasurer</span><span className="pac-reg-val">{pac.pacDetail.treasurer}</span></div>
          <div className="pac-reg-row"><span className="pac-reg-lbl">Total Raised</span><span className="pac-reg-val pac-money">${pac.pacDetail.totalRaised.toLocaleString()}</span></div>
          <div className="pac-reg-row"><span className="pac-reg-lbl">Total Spent</span><span className="pac-reg-val">${pac.pacDetail.totalSpent.toLocaleString()}</span></div>
        </div>

        {/* Who funds the PAC */}
        <div className="pac-section-label">💰 Who Funds This PAC</div>
        <div className="pac-funders">
          {pac.pacDetail.topFunders.map((f, i) => (
            <div key={i} className="pac-funder-row">
              <div className="pac-funder-left">
                <span className="pac-funder-name">{f.name}</span>
                <span className="pac-funder-industry">{f.industry}</span>
                <p className="pac-funder-note">{f.note}</p>
              </div>
              <span className="pac-funder-amount">${f.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Other candidates this PAC funded */}
        <div className="pac-section-label">🗳️ Other Candidates This PAC Funded</div>
        <div className="pac-other-candidates">
          {pac.pacDetail.otherCandidates.map((c, i) => (
            <div key={i} className="pac-other-row">
              <div className="pac-other-info">
                <span className="pac-other-name">{c.name}</span>
                <span className="pac-other-office">{c.office} · {c.year}</span>
              </div>
              <span className="pac-other-amount">${c.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Relevant votes */}
        <div className="pac-section-label">⚖️ Votes That May Benefit PAC Donors</div>
        <p className="pac-votes-disclaimer">Listed for transparency. Correlation does not imply quid pro quo. All votes are public record.</p>
        <div className="pac-relevant-votes">
          {pac.pacDetail.relevantVotes.map((v, i) => (
            <div key={i} className="pac-vote-row">
              <div className="pac-vote-header">
                <span className="pac-vote-name">{v.vote}</span>
                <span className="pac-vote-outcome">{v.outcome}</span>
              </div>
              <p className="pac-vote-note">{v.note}</p>
            </div>
          ))}
        </div>

        <a href={pac.pacDetail.sourceUrl} target="_blank" rel="noreferrer" className="pac-source-link">
          📄 Source: {pac.pacDetail.source} ↗
        </a>
      </div>
    </div>
  );
}

// ─── PUBLIC RECORD DRAWER ─────────────────────────────────────────────────────

function PublicRecordDrawer({ candidate, onClose }) {
  const [view, setView] = useState('overview');
  const pr = candidate.publicRecord;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-header">
          <div className="pr-header-left">
            <span className="pr-avatar">{candidate.avatar}</span>
            <div>
              <div className="pr-name-row">
                <span className="pr-name">{candidate.name}</span>
                {candidate.verified && <VerifiedBadge size="sm" />}
                {candidate.incumbent && <span className="pr-incumbent-badge">Incumbent</span>}
              </div>
              <span className="pr-title">{candidate.priorOffice || 'First-time candidate'}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="pr-tabs">
          {[
            { id:'overview', label:'📋 Overview' },
            candidate.priorVotingRecord ? { id:'votes', label:'🗳️ Voting Record' } : null,
            { id:'statements', label:'💬 Statements' },
          ].filter(Boolean).map(t => (
            <button key={t.id} className={`cc-tab ${view === t.id ? 'cc-tab-active' : ''}`} onClick={() => setView(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div className="pr-overview">
            <div className="pr-filed-card">
              <div className="pr-filed-label">📄 Official Filing</div>
              <div className="pr-filed-row"><span>Filed</span><span>{pr.filingDate}</span></div>
              <div className="pr-filed-row"><span>Source</span><a href={pr.filingUrl} target="_blank" rel="noreferrer" className="pr-filed-link">{pr.filingSource} ↗</a></div>
              {pr.professionalLicense && <div className="pr-filed-row"><span>License</span><span className="pr-license">{pr.professionalLicense}</span></div>}
            </div>

            {pr.endorsements?.length > 0 && (
              <div className="pr-endorsements">
                <div className="pr-section-label">Endorsements</div>
                {pr.endorsements.map((e, i) => (
                  <div key={i} className="pr-endorsement-row">
                    <span className="pr-endorse-dot" />
                    <span className="pr-endorse-name">{e}</span>
                  </div>
                ))}
              </div>
            )}

            {pr.noRecordNote && (
              <div className="pr-no-record">
                <span className="pr-no-record-icon">ℹ️</span>
                <p className="pr-no-record-text">{pr.noRecordNote}</p>
              </div>
            )}
          </div>
        )}

        {/* VOTING RECORD */}
        {view === 'votes' && candidate.publicRecord?.priorVotingRecord && (
          <div className="pr-votes">
            <p className="pr-votes-context">Votes cast while serving on Flagler County Planning Board. Planning Board votes are advisory — they recommend to the County Commission.</p>
            {candidate.publicRecord.priorVotingRecord.map((v, i) => (
              <div key={i} className="pr-vote-card">
                <div className="pr-vote-header">
                  <div className="pr-vote-meta">
                    <span className="pr-vote-body">{v.body}</span>
                    <span className="pr-vote-date">{v.date}</span>
                  </div>
                  <span className={`pr-vote-badge ${v.vote === 'YES' ? 'pr-yes' : 'pr-no'}`}>{v.vote}</span>
                </div>
                <div className="pr-vote-item">{v.item}</div>
                <p className="pr-vote-note">{v.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* PUBLIC STATEMENTS */}
        {view === 'statements' && (
          <div className="pr-statements">
            {pr.publicStatements.map((s, i) => (
              <div key={i} className="pr-statement-card">
                <div className="pr-statement-meta">
                  <span className="pr-statement-source">{s.source}</span>
                  <span className="pr-statement-date">{s.date}</span>
                </div>
                <p className="pr-statement-quote">"{s.quote}"</p>
              </div>
            ))}
          </div>
        )}

        <p className="pr-disclaimer">All information sourced from public records, official filings, and published media. PolitiCard does not verify candidate statements for accuracy.</p>
      </div>
    </div>
  );
}

// ─── ELECTION COMPARISON COMPONENTS ──────────────────────────────────────────

function ImportancePill({ level }) {
  const styles = {
    HIGH:     { bg: 'rgba(220,38,38,0.12)',  color: '#f87171', label: '🔴 HIGH IMPACT' },
    MEDIUM:   { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: '🟡 MEDIUM IMPACT' },
    LOCAL:    { bg: 'rgba(8,145,178,0.12)',  color: '#38bdf8', label: '🔵 LOCAL RACE' },
  };
  const s = styles[level] || styles.LOCAL;
  return <span className="importance-pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

function ElectionBanner({ race, onExpand }) {
  const daysLabel = race.daysOut > 60 ? `${race.daysOut} days away` : race.daysOut > 14 ? `${race.daysOut} days — coming up` : `⚠️ ${race.daysOut} days — act soon`;
  return (
    <div className="election-banner" style={{ borderLeftColor: race.color }}>
      <div className="eb-eyebrow">
        <span className="eb-icon">🗳️</span>
        <span className="eb-label">ELECTION COMING UP</span>
        <ImportancePill level={race.importance} />
      </div>
      <div className="eb-race">{race.race}</div>
      <div className="eb-meta">
        <span className="eb-date">{race.electionDate}</span>
        <span className="eb-days" style={{ color: race.daysOut < 30 ? '#f87171' : '#94a3b8' }}>{daysLabel}</span>
      </div>
      <p className="eb-why">{race.importanceReason}</p>
      <button className="eb-compare-btn" style={{ background: race.color }} onClick={onExpand}>
        Compare the Candidates →
      </button>
    </div>
  );
}

function CandidateComparison({ race, onClose }) {
  const [view, setView] = useState('issues');
  const [activePac, setActivePac] = useState(null);       // { pac, candidateName }
  const [activeRecord, setActiveRecord] = useState(null); // candidate object

  const stanceColor = { supportive:'#16a34a', moderate:'#d97706', conservative:'#dc2626', restrictive:'#7c3aed', cautious:'#0891b2' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>

        {/* PAC drill-down — layered on top */}
        {activePac && (
          <PacDrillModal pac={activePac.pac} candidateName={activePac.candidateName} onClose={() => setActivePac(null)} />
        )}
        {activeRecord && (
          <PublicRecordDrawer candidate={activeRecord} onClose={() => setActiveRecord(null)} />
        )}

        <div className="cc-header">
          <div className="cc-header-left">
            <div className="cc-race-label">{race.race}</div>
            <div className="cc-date">{race.electionDate}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <ImportancePill level={race.importance} />
        <p className="cc-importance-reason">{race.importanceReason}</p>

        {/* Candidate headers — with verified badge + public record button */}
        <div className="cc-candidates-row">
          {race.candidates.map(c => (
            <div key={c.id} className="cc-candidate-header" style={{ borderTopColor: c.color }}>
              <div className="cc-cand-avatar-wrap">
                <span className="cc-cand-avatar">{c.avatar}</span>
                {c.verified && <VerifiedBadge size="sm" />}
              </div>
              <div className="cc-cand-info">
                <span className="cc-cand-name">{c.name}</span>
                {c.incumbent && <span className="cc-incumbent-tag">Incumbent</span>}
                <span className="cc-cand-party" style={{ color: c.color }}>{c.party === 'R' ? 'Republican' : c.party === 'D' ? 'Democrat' : 'Independent'}</span>
                <span className="cc-cand-age">Age {c.age}</span>
              </div>
              {c.publicRecord && (
                <button className="cc-record-btn" onClick={() => setActiveRecord(c)}>
                  Public Record ›
                </button>
              )}
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div className="cc-tabs">
          {[{ id:'issues', label:'📋 Issues' }, { id:'differences', label:'⚖️ Differences' }, { id:'funding', label:'💰 Funding' }].map(t => (
            <button key={t.id} className={`cc-tab ${view === t.id ? 'cc-tab-active' : ''}`} onClick={() => setView(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ISSUES VIEW */}
        {view === 'issues' && (
          <div className="cc-issues">
            {race.candidates[0].topIssues.map((issue, i) => (
              <div key={i} className="cc-issue-block">
                <div className="cc-issue-name">{issue.issue}</div>
                <div className="cc-issue-positions">
                  {race.candidates.map(c => {
                    const pos = c.topIssues[i];
                    return (
                      <div key={c.id} className="cc-issue-position" style={{ borderLeftColor: c.color }}>
                        <span className="cc-pos-name" style={{ color: c.color }}>{c.name.split(' ')[0]}</span>
                        <p className="cc-pos-text">{pos.position}</p>
                        <span className="cc-pos-stance" style={{ background: stanceColor[pos.stance] + '18', color: stanceColor[pos.stance] }}>{pos.stance}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="cc-shared">
              <div className="cc-shared-label">✅ Where they agree</div>
              {race.sharedPositions.map((s, i) => (
                <div key={i} className="cc-shared-row">
                  <span className="cc-shared-dot" />
                  <span className="cc-shared-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIFFERENCES VIEW */}
        {view === 'differences' && (
          <div className="cc-diffs">
            {race.keyDifferences.map((d, i) => (
              <div key={i} className="cc-diff-row">
                <div className="cc-diff-issue">{d.issue}</div>
                <div className="cc-diff-cols">
                  {race.candidates.map((c, ci) => (
                    <div key={c.id} className="cc-diff-col" style={{ borderTopColor: c.color }}>
                      <span className="cc-diff-name" style={{ color: c.color }}>{c.name.split(' ')[0]}</span>
                      <p className="cc-diff-text">{ci === 0 ? d.c1 : d.c2}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FUNDING VIEW — PAC sources now clickable */}
        {view === 'funding' && (
          <div className="cc-funding">
            {race.candidates.map(c => (
              <div key={c.id} className="cc-fund-card" style={{ borderTopColor: c.color }}>
                <div className="cc-fund-header">
                  <span className="cc-fund-name" style={{ color: c.color }}>{c.name}</span>
                  <span className="cc-fund-total">${c.funding.total.toLocaleString()} raised</span>
                </div>
                <div className="cc-fund-sources">
                  {c.funding.topSources.map((s, i) => {
                    const isPac = s.pacDetail != null;
                    return isPac ? (
                      <button key={i} className="cc-fund-source-row cc-fund-pac-btn" onClick={() => setActivePac({ pac: s, candidateName: c.name })}>
                        <span className="cc-fund-dot" style={{ background: c.color }} />
                        <span className="cc-fund-source cc-fund-pac-label">{s.label} · ${s.amount.toLocaleString()}</span>
                        <span className="cc-pac-drill">Who funds this? ›</span>
                      </button>
                    ) : (
                      <div key={i} className="cc-fund-source-row">
                        <span className="cc-fund-dot" style={{ background: c.color }} />
                        <span className="cc-fund-source">{s.label} · ${s.amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="cc-fund-background">
                  <div className="cc-bg-label">Background</div>
                  <p className="cc-bg-text">{c.background}</p>
                  {c.priorOffice && <div className="cc-bg-office">{c.incumbent ? '🏛️ Currently serving: ' : 'Prior office: '}{c.priorOffice}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="cc-data-note">⚠️ {race.dataNote}</p>
      </div>
    </div>
  );
}

// ─── FILTER MODAL ────────────────────────────────────────────────────────────

function FilterModal({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });
  const toggle = (key, val) => {
    setLocal(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };
  const levels = ['Federal','State','Local'];
  const types = ['vote','legislation','announcement','event'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card filter-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Filter Feed</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="filter-section">
          <div className="filter-label">Level</div>
          <div className="filter-chips">
            {levels.map(l => (
              <button key={l} className={`filter-chip ${local.levels.includes(l) ? 'chip-active' : ''}`}
                onClick={() => toggle('levels', l)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-label">Post Type</div>
          <div className="filter-chips">
            {types.map(t => (
              <button key={t} className={`filter-chip ${local.types.includes(t) ? 'chip-active' : ''}`}
                onClick={() => toggle('types', t)}>{typeIcon(t)} {typeLabel(t)}</button>
            ))}
          </div>
        </div>
        <div className="filter-actions">
          <button className="filter-reset" onClick={() => setLocal({ levels:['Federal','State','Local'], types:['vote','legislation','announcement','event'] })}>
            Reset
          </button>
          <button className="filter-apply" onClick={() => { onApply(local); onClose(); }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── YOUTUBE EMBED ───────────────────────────────────────────────────────────

function VideoEmbed({ videoId, title, org }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="video-embed">
      {playing ? (
        <iframe
          className="video-iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="video-thumb-wrap" onClick={() => setPlaying(true)}>
          <img src={thumb} alt={title} className="video-thumb" />
          <div className="video-play-overlay">
            <div className="video-play-btn">▶</div>
          </div>
        </div>
      )}
      <div className="video-meta-bar">
        <div className="video-yt-icon">▶</div>
        <div>
          <div className="video-title-text">{title}</div>
          <div className="video-org-text">{org}</div>
        </div>
      </div>
    </div>
  );
}

// ─── POST CARD ───────────────────────────────────────────────────────────────

function PostCard({ post, onProfile, liked, onLike, pinned, onPin }) {
  const o = post.official;
  return (
    <article className="post-card">
      <div className="pc-top">
        <button className="pc-avatar-btn" onClick={() => onProfile(o)}>
          <OfficialAvatar official={o} size={44} radius={12} fontSize="1.3rem" />
        </button>
        <div className="pc-meta">
          <button className="pc-name" onClick={() => onProfile(o)}>
            {o.name} <span className="pc-party-inline" style={{ color: partyColor(o.party) }}>{o.party}</span>
          </button>
          <div className="pc-sub">
            <span>{o.title}</span>
            <span className="pc-dot">·</span>
            <span className="pc-time">{post.time}</span>
          </div>
        </div>
        {onPin && (
          <button className={`pc-pin-btn ${pinned ? 'pc-pin-active' : ''}`} onClick={() => onPin(post)} title={pinned ? 'Unpin' : 'Pin to profile'}>
            📌
          </button>
        )}
      </div>

      <div className="pc-body">
        <div className="pc-type-tag">
          <span>{typeIcon(post.type)}</span>
          <span>{typeLabel(post.type)}</span>
        </div>
        <p className="pc-text">{post.text}</p>
        {post.videoId && (
          <div style={{ marginTop: '0.75rem' }}>
            <VideoEmbed videoId={post.videoId} title={post.videoTitle} org={post.videoOrg} />
          </div>
        )}
      </div>

      <div className="pc-actions">
        <button className={`pc-action ${liked ? 'pc-liked' : ''}`} onClick={() => onLike(post.id)}>
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{(liked ? post.likes + 1 : post.likes).toLocaleString()}</span>
        </button>
        <button className="pc-action"><span>💬</span><span>Reply</span></button>
        <button className="pc-action"><span>↗️</span><span>Share</span></button>
        {post.type === 'legislation' && (
          <a href={`https://www.congress.gov/search?q=${encodeURIComponent(post.text.substring(0,40))}`} target="_blank" rel="noreferrer" className="pc-action pc-sources">
            <span>🔍</span><span>Sources</span>
          </a>
        )}
      </div>
    </article>
  );
}

// ─── LOCAL NEWS DATA ─────────────────────────────────────────────────────────

const LOCAL_NEWS = [
  {
    id: 'news1',
    type: 'news',
    outlet: 'FlaglerLive',
    outletIcon: '📰',
    outletColor: '#1e40af',
    headline: 'Palm Coast Council Votes 3-2 to Approve Traffic Calming Pilot on Seminole Woods Blvd',
    summary: 'After months of resident complaints, the city council approved speed cushions and lane narrowing on a major Palm Coast corridor. Implementation begins in April.',
    url: 'https://flaglerlive.com',
    time: '4h ago',
    topic: 'Local Government',
    related: 'Ed Danko, Mike Norris',
  },
  {
    id: 'news2',
    type: 'news',
    outlet: 'FlaglerLive',
    outletIcon: '📰',
    outletColor: '#1e40af',
    headline: 'Flagler County Half-Cent Sales Tax Referendum Likely for November Ballot',
    summary: 'County commissioners are advancing a half-cent sales tax proposal that would fund road repairs, parks, and public safety upgrades across all of Flagler County.',
    url: 'https://flaglerlive.com',
    time: '1d ago',
    topic: 'Budget & Taxes',
    related: "Andy Dance, Donald O'Brien",
  },
  {
    id: 'news3',
    type: 'news',
    outlet: 'Palm Coast Observer',
    outletIcon: '🗞️',
    outletColor: '#065f46',
    headline: 'Rick Staly: Flagler Crime Rate Down 11% in 2024, One of Lowest in Florida',
    summary: 'Sheriff Staly announced annual crime statistics showing Flagler County among the safest counties in Florida, crediting community policing and increased deputy presence.',
    url: 'https://palmcoastobserver.com',
    time: '2d ago',
    topic: 'Public Safety',
    related: 'Rick Staly',
  },
  {
    id: 'news4',
    type: 'news',
    outlet: 'Flagler News Weekly',
    outletIcon: '📋',
    outletColor: '#92400e',
    headline: 'School Board Approves $2.4M in AI Literacy Grants for Flagler County Classrooms',
    summary: 'Board member Colleen Conklin championed the funding to introduce AI tools across K-12 classrooms, with teacher training beginning this summer.',
    url: 'https://flaglernewsweekly.com',
    time: '3d ago',
    topic: 'Education',
    related: 'Colleen Conklin',
  },
];

// ─── WHAT'S BEING DECIDED ──────────────────────────────────────────────────

const LEVEL_META = {
  City:         { color: '#0891b2', icon: '🏙️', label: 'City' },
  County:       { color: '#7c3aed', icon: '🏛️', label: 'County' },
  State:        { color: '#b45309', icon: '🏛️', label: 'State of Florida' },
  Federal:      { color: '#1d4ed8', icon: '🇺🇸', label: 'U.S. Congress' },
  Presidential: { color: '#0f172a', icon: '🏛️', label: 'Executive / Presidential' },
  Supreme:      { color: '#7f1d1d', icon: '⚖️', label: 'Supreme Court' },
};

const DECISIONS = [
  // ── CITY ──────────────────────────────────────────────────────────────────
  {
    id: 'd_city1',
    level: 'City',
    type: 'decision',
    title: 'Palm Coast Traffic Calming — Seminole Woods Blvd',
    plain: "The city is considering adding speed cushions, narrowed lanes, and new crosswalks on Seminole Woods Blvd after years of resident complaints about speeding. Construction would take about 4 months and cost $380,000.",
    why: "Residents reported 47 near-miss incidents in 2024. Pedestrian injuries on this corridor have doubled since 2021.",
    proPoints: ["Reduces vehicle speeds by an estimated 12 mph", "Safer walking routes for kids to Palm Coast Middle School", "Supported by 73% of residents surveyed on the corridor"],
    conPoints: ["Adds 2-3 minutes to commute times for through traffic", "Emergency vehicle response times could increase slightly", "Some businesses worry about reduced parking visibility"],
    status: 'Palm Coast City Council — Vote March 18, 2026',
    official: OFFICIALS[8],
    votes: { support: 734, oppose: 198, more: 112 },
    sourceUrl: 'https://www.palmcoastgov.com',
  },
  {
    id: 'd_city2',
    level: 'City',
    type: 'decision',
    title: 'Palm Coast Short-Term Rental Ordinance',
    plain: "Palm Coast is considering new rules for Airbnb and VRBO rentals — requiring owners to register, pay a fee, and follow noise/parking rules. Violations could result in fines or license revocation.",
    why: "Short-term rental complaints to the city jumped 210% in two years. Neighborhoods report party houses, parking overflow, and trash issues.",
    proPoints: ["Protects neighborhood character and quality of life", "Generates estimated $280K/year in registration fees", "Gives residents a legal mechanism to report problem properties"],
    conPoints: ["Restricts property owner income rights", "Enforcement is resource-intensive for a small city", "Could reduce tourism accommodation options and local revenue"],
    status: 'Public Comment Period Open — Closes April 1, 2026',
    official: OFFICIALS[6],
    votes: { support: 521, oppose: 344, more: 201 },
    sourceUrl: 'https://www.palmcoastgov.com',
  },

  // ── COUNTY ────────────────────────────────────────────────────────────────
  {
    id: 'd_county1',
    level: 'County',
    type: 'decision',
    title: 'Flagler County Half-Cent Sales Tax Referendum',
    plain: "The county wants to add ½ cent to every dollar you spend on most purchases in Flagler County. That's $0.50 on a $100 grocery bill. The money would go toward fixing roads, upgrading parks, and adding sheriff deputies. It would raise about $12 million a year for 10 years.",
    why: "Flagler County roads ranked D or F on 38% of its arterial network. The county has no dedicated capital improvement funding stream outside state grants.",
    proPoints: ["Fixes roads without raising property taxes", "Funds 12 new sheriff deputy positions", "Shared cost — tourists and visitors pay it too"],
    conPoints: ["Regressive tax — hits lower-income residents harder", "No sunset clause guarantee; could be extended", "County has history of budget overruns on capital projects"],
    status: 'Flagler County Commission — Ballot measure Nov 2026',
    official: OFFICIALS[7],
    votes: { support: 412, oppose: 287, more: 194 },
    sourceUrl: 'https://www.flaglercounty.gov',
  },
  {
    id: 'd_county2',
    level: 'County',
    type: 'decision',
    title: 'Flagler County Comprehensive Plan Update — Rural Land Use',
    plain: "The county is updating its long-range land use plan which controls where housing, businesses, and farms can be built through 2040. The proposed changes would open up more rural land in western Flagler County for residential development.",
    why: "Flagler is one of the fastest-growing counties in Florida. Without planning updates, housing supply can't keep pace with demand, driving up home prices.",
    proPoints: ["Increases housing supply to address affordability", "Generates impact fees that fund schools and roads", "Attracts businesses that need nearby workforce housing"],
    conPoints: ["Destroys agricultural land and rural character permanently", "Strains existing water, sewer, and school infrastructure", "Benefits developers more than existing residents"],
    status: 'Flagler County Planning Board — Hearing Feb 28, 2026',
    official: OFFICIALS[7],
    votes: { support: 298, oppose: 445, more: 310 },
    sourceUrl: 'https://www.flaglercounty.gov',
  },

  // ── STATE ─────────────────────────────────────────────────────────────────
  {
    id: 'd_state1',
    level: 'State',
    type: 'decision',
    title: "Florida School Voucher Expansion — HB 1",
    plain: "Florida is proposing to expand its school voucher program so that more families — including middle-class households — can use state education dollars to pay for private school tuition, homeschool costs, or tutoring.",
    why: "Supporters say the current income caps are too low and leave working-class families without school choice. Florida already has the largest voucher program in the U.S.",
    proPoints: ["Extends school choice to more Florida families", "Creates competition that advocates say improves all schools", "Allows parents to choose schools aligned with their values"],
    conPoints: ["Diverts $1.2B+ from public school funding statewide", "Private schools aren't required to meet same accountability standards", "Flagler County School Board estimates $4.1M local funding loss"],
    status: 'Florida House Education Committee — Feb 2026',
    official: OFFICIALS[4],
    votes: { support: 8900, oppose: 11200, more: 4100 },
    sourceUrl: 'https://www.flsenate.gov',
  },
  {
    id: 'd_state2',
    level: 'State',
    type: 'decision',
    title: "Florida Home Insurance Rate Reform — SB 412",
    plain: "Florida lawmakers are debating a bill that would cap annual home insurance rate increases at 12%, require insurers to pay claims within 45 days, and penalize companies that drop customers in high-risk areas without 6 months notice.",
    why: "Florida homeowners pay an average of $6,000/year for home insurance — nearly 4x the national average. Seven major insurers have left Florida since 2020.",
    proPoints: ["Immediate relief for homeowners facing 30-40% annual rate hikes", "Keeps insurers accountable for delayed claim payments", "Reduces Citizens Insurance (state insurer of last resort) burden"],
    conPoints: ["Insurers say caps will cause more companies to exit Florida", "Could reduce competition and lead to higher prices long-term", "Doesn't address root causes: litigation abuse and hurricane risk"],
    status: 'Florida Senate — Floor Vote Expected March 2026',
    official: OFFICIALS[3],
    votes: { support: 21400, oppose: 3800, more: 6900 },
    sourceUrl: 'https://www.flsenate.gov',
  },

  // ── FEDERAL ───────────────────────────────────────────────────────────────
  {
    id: 'd_fed1',
    level: 'Federal',
    type: 'decision',
    title: 'CLEAR LABELS Act — Prescription Drug Origin',
    plain: "A U.S. Senate bill that would require the label on your prescription medicine bottle to say exactly which country made it. Right now, most labels don't tell you. About 90% of generic drugs are made overseas, mostly in China and India.",
    why: "Congress became alarmed after COVID-19 exposed how dependent the U.S. is on foreign drug supply chains. A disruption could leave Americans without critical medications.",
    proPoints: ["Lets patients and doctors make informed choices about drug sourcing", "Creates market pressure to bring manufacturing back to the U.S.", "Costs nothing — labeling change only, no new regulations"],
    conPoints: ["Pharmaceutical industry says complex supply chains make single-country labeling misleading", "Could stigmatize safe foreign-made drugs and raise prices", "May not change consumer behavior enough to shift supply chains"],
    status: 'U.S. Senate Aging Committee — Feb 2026',
    official: OFFICIALS[1],
    votes: { support: 184000, oppose: 32000, more: 41000 },
    sourceUrl: 'https://www.rickscott.senate.gov',
  },
  {
    id: 'd_fed2',
    level: 'Federal',
    type: 'decision',
    title: 'Social Security Fairness Act — Implementation',
    plain: "Congress recently passed the Social Security Fairness Act, which increases benefits for about 3.2 million public workers — including teachers, firefighters, and police officers — who were previously penalized because they also receive a government pension. The question now is how to fund the $196 billion cost over 10 years.",
    why: "The old rules (WEP/GPO) reduced Social Security checks for public servants who had separate pension plans, which many argued was unfair double-penalization.",
    proPoints: ["Delivers overdue fairness to teachers, first responders, and other public servants", "Boosts retirement security for Florida's 180,000+ affected workers", "Bipartisan — passed with broad support in both chambers"],
    conPoints: ["Adds $196 billion to Social Security's funding shortfall over 10 years", "Accelerates Social Security insolvency date by approximately 6 months", "No offsetting revenue source has been identified yet"],
    status: 'Social Security Administration — Implementation underway 2026',
    official: OFFICIALS[0],
    votes: { support: 890000, oppose: 124000, more: 201000 },
    sourceUrl: 'https://www.ssa.gov',
  },

  // ── PRESIDENTIAL ──────────────────────────────────────────────────────────
  {
    id: 'd_pres1',
    level: 'Presidential',
    type: 'decision',
    title: 'Executive Order — Federal Workforce AI Screening',
    plain: "The White House is considering an executive order that would allow federal agencies to use AI tools to screen job applications and evaluate employee performance reviews. It would affect roughly 2.2 million federal civilian employees.",
    why: "The administration wants to reduce the federal workforce size and speed up hiring for critical roles by replacing slow manual HR processes with automated screening.",
    proPoints: ["Cuts federal hiring timelines from 6 months to potentially 6 weeks", "Estimated $2.4B in annual HR processing savings", "Identifies high performers for advancement more objectively"],
    conPoints: ["AI hiring tools have documented racial and gender bias patterns", "Removes human judgment from life-impacting employment decisions", "Veterans and disabled applicants may face new barriers in automated systems"],
    status: 'Under White House review — Decision expected Q2 2026',
    official: OFFICIALS[3],
    votes: { support: 412000, oppose: 589000, more: 298000 },
    sourceUrl: 'https://www.whitehouse.gov',
  },
  {
    id: 'd_pres2',
    level: 'Presidential',
    type: 'decision',
    title: 'Tariff Expansion — Consumer Electronics & Apparel',
    plain: "The administration is weighing 25% tariffs on imported consumer electronics and clothing from countries with trade deficits with the U.S. This would affect smartphones, laptops, TVs, and most clothing sold at major retailers.",
    why: "The goal is to pressure trading partners to open their markets to U.S. exports, and to encourage manufacturers to build factories in the U.S. rather than overseas.",
    proPoints: ["Creates negotiating leverage to open foreign markets to U.S. goods", "Could incentivize domestic manufacturing and create American jobs", "Raises federal revenue that could offset income tax cuts"],
    conPoints: ["A $1,000 phone could cost $1,250. Clothing prices could rise 15-25%", "Economists broadly agree tariffs function as a tax on American consumers", "Risks retaliatory tariffs on U.S. agricultural exports, hurting Florida farmers"],
    status: 'White House Trade Office — Review ongoing Feb 2026',
    official: OFFICIALS[3],
    votes: { support: 1240000, oppose: 1890000, more: 710000 },
    sourceUrl: 'https://ustr.gov',
  },

  // ── SUPREME COURT ─────────────────────────────────────────────────────────
  {
    id: 'd_sup1',
    level: 'Supreme',
    type: 'decision',
    title: 'SCOTUS — State Social Media Content Laws (NetChoice v. Florida)',
    plain: "The Supreme Court is reviewing whether Florida and Texas state laws that prevent social media companies from censoring or removing political content are constitutional. The case will determine how much control states have over what private tech companies can publish.",
    why: "Florida passed SB 7072 after conservatives argued platforms like Facebook and Twitter systematically suppressed right-leaning content. Tech companies argue they have First Amendment rights to moderate their own platforms.",
    proPoints: ["Prevents large platforms from silencing political speech based on viewpoint", "Gives users more legal recourse when content is removed unfairly", "Asserts state sovereignty over powerful private corporations"],
    conPoints: ["Forces private companies to host content they find harmful or false", "Could make platforms legally liable for content they're forced to keep", "First Amendment has historically protected private editorial discretion"],
    status: 'Supreme Court — Oral arguments scheduled Spring 2026',
    official: OFFICIALS[0],
    votes: { support: 2100000, oppose: 1800000, more: 980000 },
    sourceUrl: 'https://www.supremecourt.gov',
  },
  {
    id: 'd_sup2',
    level: 'Supreme',
    type: 'decision',
    title: 'SCOTUS — Birthright Citizenship Executive Order',
    plain: "The Supreme Court will decide whether a presidential executive order limiting birthright citizenship — the automatic right to U.S. citizenship for anyone born on American soil — is constitutional. The 14th Amendment has guaranteed this right since 1868.",
    why: "The administration argues the 14th Amendment was never meant to apply to children of people who entered the country illegally. Critics say the text is clear and has been settled law for 150 years.",
    proPoints: ["Administration argues it closes a policy incentive for illegal border crossings", "Could reduce anchor baby claims used in immigration proceedings", "Aligns U.S. policy with most of the world, which does not grant automatic birthright"],
    conPoints: ["14th Amendment text is explicit: 'all persons born in the United States'", "Would require a constitutional amendment, not an executive order, legal scholars say", "Creates statelessness risk for children born to legal visa holders"],
    status: 'Supreme Court — Emergency stay in effect, ruling expected 2026',
    official: OFFICIALS[0],
    votes: { support: 3400000, oppose: 4100000, more: 1200000 },
    sourceUrl: 'https://www.supremecourt.gov',
  },
];

// ─── CAMPAIGN CONTRIBUTOR DATA ───────────────────────────────────────────────

const INDUSTRY_META = {
  'Real Estate':       { color: '#d97706', icon: '🏗️',  why: 'Real estate donors often seek favorable zoning, land use approvals, and development permits.' },
  'Healthcare':        { color: '#0891b2', icon: '🏥',  why: 'Healthcare donors typically support or oppose regulations affecting hospitals, insurers, and pharmaceutical companies.' },
  'Law / Legal':       { color: '#7c3aed', icon: '⚖️',  why: 'Law firms often donate to officials who influence judicial appointments, tort reform, and regulatory enforcement.' },
  'Energy':            { color: '#16a34a', icon: '⚡',  why: 'Energy donors seek favorable utility regulation, pipeline permits, and environmental policy.' },
  'Finance / Banking': { color: '#1d4ed8', icon: '🏦',  why: 'Financial sector donors influence banking regulation, interest rate policy, and consumer protection rules.' },
  'Agriculture':       { color: '#65a30d', icon: '🌾',  why: 'Agricultural donors seek water rights, land use protections, and farm subsidy programs.' },
  'Technology':        { color: '#6366f1', icon: '💻',  why: 'Tech donors influence data privacy law, digital regulation, and government contract awards.' },
  'Defense':           { color: '#dc2626', icon: '🎖️',  why: 'Defense contractors donate to members of armed services committees and those who influence military spending.' },
  'Labor / Unions':    { color: '#f59e0b', icon: '✊',  why: 'Union donations support candidates favorable to collective bargaining, minimum wage increases, and worker protections.' },
  'Retail / Business': { color: '#94a3b8', icon: '🏪',  why: 'Small and large business donors seek favorable tax policy, reduced regulation, and economic development.' },
  'Education':         { color: '#0ea5e9', icon: '🎓',  why: 'Education donors influence school funding formulas, voucher programs, and teacher policy.' },
  'Individual':        { color: '#64748b', icon: '👤',  why: 'Individual donors are private citizens. Large individual donations may signal personal financial interests or ideological alignment.' },
};

const CONTRIBUTORS = {
  // Rick Scott — U.S. Senator
  1: {
    cycleTotal: 42800000,
    cycle: '2024 Senate Race',
    topIndustries: [
      { name: 'Finance / Banking', total: 8940000, pct: 21 },
      { name: 'Real Estate',       total: 6420000, pct: 15 },
      { name: 'Healthcare',        total: 5140000, pct: 12 },
      { name: 'Defense',           total: 4280000, pct: 10 },
      { name: 'Energy',            total: 3850000, pct: 9  },
      { name: 'Technology',        total: 2996000, pct: 7  },
    ],
    topDonors: [
      { name: 'Richard LeFrak',        amount: 814600, employer: 'LeFrak Organization',     industry: 'Real Estate',       location: 'New York, NY',      relationship: 'Major bundler and longtime supporter' },
      { name: 'Steve Schwarzman',       amount: 800000, employer: 'Blackstone Group',        industry: 'Finance / Banking', location: 'New York, NY',      relationship: 'Private equity executive, donated to Scott Leadership PAC' },
      { name: 'Ken Griffin',            amount: 750000, employer: 'Citadel LLC',             industry: 'Finance / Banking', location: 'Miami, FL',         relationship: 'Hedge fund billionaire, Florida resident since 2022' },
      { name: 'Micki Easterly',         amount: 250000, employer: 'Self-employed',           industry: 'Individual',        location: 'Naples, FL',        relationship: 'Republican donor network, contributed to Scott Victory Fund' },
      { name: 'Publix Super Markets PAC', amount: 208000, employer: 'Publix Super Markets', industry: 'Retail / Business', location: 'Lakeland, FL',      relationship: 'Largest private employer in Florida, seeks favorable labor and tax policy' },
      { name: 'Florida Blue PAC',       amount: 185000, employer: 'Florida Blue / BCBS',    industry: 'Healthcare',        location: 'Jacksonville, FL',  relationship: 'Largest health insurer in Florida, opposes public option legislation' },
      { name: 'NextEra Energy PAC',     amount: 162000, employer: 'NextEra Energy',         industry: 'Energy',            location: 'Juno Beach, FL',    relationship: 'Largest utility in Florida, seeks favorable rate and permit approvals' },
      { name: 'L3Harris Technologies',  amount: 145000, employer: 'L3Harris',               industry: 'Defense',           location: 'Melbourne, FL',     relationship: 'Major FL defense contractor, Scott sits on Armed Services Committee' },
    ],
    geographicSplit: [
      { region: 'Florida',         pct: 34 },
      { region: 'New York / NJ',   pct: 22 },
      { region: 'Texas',           pct: 11 },
      { region: 'California',      pct: 9  },
      { region: 'Other states',    pct: 24 },
    ],
    smallDonorPct: 18,
    source: 'OpenSecrets.org · FEC filings',
    sourceUrl: 'https://www.opensecrets.org/members-of-congress/rick-scott',
  },

  // Matt Gaetz (or replace with actual District 1 rep) — U.S. House
  2: {
    cycleTotal: 3200000,
    cycle: '2024 House Race',
    topIndustries: [
      { name: 'Real Estate',       total: 640000,  pct: 20 },
      { name: 'Law / Legal',       total: 480000,  pct: 15 },
      { name: 'Finance / Banking', total: 384000,  pct: 12 },
      { name: 'Individual',        total: 352000,  pct: 11 },
      { name: 'Healthcare',        total: 288000,  pct: 9  },
    ],
    topDonors: [
      { name: 'Building Industry Assoc PAC', amount: 98000, employer: 'FL Home Builders',  industry: 'Real Estate',       location: 'Tallahassee, FL',   relationship: 'Statewide builders assoc, supports candidates favoring development approvals' },
      { name: 'Associated Industries of FL', amount: 87000, employer: 'AIF',              industry: 'Retail / Business', location: 'Tallahassee, FL',    relationship: 'Largest FL business lobbying group, opposes business regulation' },
      { name: 'Florida Medical Assoc PAC',   amount: 75000, employer: 'FMA',              industry: 'Healthcare',        location: 'Tallahassee, FL',    relationship: 'Physician group, opposes liability expansion and supports tort reform' },
      { name: 'Mark Fernandez',              amount: 52000, employer: 'Fernandez & Assoc',industry: 'Law / Legal',       location: 'Palm Coast, FL',     relationship: 'Local attorney, personal donor and local fundraiser' },
    ],
    geographicSplit: [
      { region: 'Flagler County',  pct: 41 },
      { region: 'Other FL',        pct: 38 },
      { region: 'Out of state',    pct: 21 },
    ],
    smallDonorPct: 34,
    source: 'OpenSecrets.org · FEC filings',
    sourceUrl: 'https://www.opensecrets.org',
  },

  // Andy Dance — Flagler County Commissioner District 1
  6: {
    cycleTotal: 187000,
    cycle: '2024 County Race',
    topIndustries: [
      { name: 'Real Estate',    total: 52000, pct: 28 },
      { name: 'Individual',     total: 46000, pct: 25 },
      { name: 'Agriculture',    total: 28000, pct: 15 },
      { name: 'Law / Legal',    total: 22000, pct: 12 },
      { name: 'Healthcare',     total: 17000, pct: 9  },
    ],
    topDonors: [
      { name: 'Flagler County Farm Bureau', amount: 25000, employer: 'Farm Bureau',         industry: 'Agriculture',  location: 'Bunnell, FL',      relationship: 'Supports conservation-friendly candidates who protect agricultural zoning' },
      { name: 'ITT/Arvida Legacy PAC',      amount: 18500, employer: 'Land holding entity', industry: 'Real Estate',  location: 'Palm Coast, FL',   relationship: 'Legacy landowner interests in western Flagler County development decisions' },
      { name: 'Dr. James Moriarty',         amount: 12000, employer: 'AdventHealth',        industry: 'Healthcare',   location: 'Palm Coast, FL',   relationship: 'Local physician and community donor' },
      { name: 'Susan Andrews',              amount: 10000, employer: 'Retired',             industry: 'Individual',   location: 'Palm Coast, FL',   relationship: 'Environmental advocate and community leader' },
      { name: 'Flagler Beach Realty PAC',   amount: 9500,  employer: 'Real estate assoc',   industry: 'Real Estate',  location: 'Flagler Beach, FL', relationship: 'Local realtors association, seeks pro-growth zoning and permit approvals' },
    ],
    geographicSplit: [
      { region: 'Palm Coast',      pct: 58 },
      { region: 'Flagler County',  pct: 31 },
      { region: 'Out of county',   pct: 11 },
    ],
    smallDonorPct: 62,
    source: 'Florida Division of Elections · County filings',
    sourceUrl: 'https://dos.elections.myflorida.com',
  },

  // Donald O'Brien — Flagler County Commissioner District 2
  13: {
    cycleTotal: 156000,
    cycle: '2022 County Race',
    topIndustries: [
      { name: 'Real Estate',       total: 62400, pct: 40 },
      { name: 'Retail / Business', total: 31200, pct: 20 },
      { name: 'Individual',        total: 23400, pct: 15 },
      { name: 'Law / Legal',       total: 18720, pct: 12 },
      { name: 'Energy',            total: 12480, pct: 8  },
    ],
    topDonors: [
      { name: 'Palm Coast Land Partners LLC', amount: 29000, employer: 'Development LLC',    industry: 'Real Estate',       location: 'Palm Coast, FL',  relationship: 'Developer with active rezoning applications before the commission during donation period' },
      { name: 'ITT/Arvida Legacy PAC',        amount: 18000, employer: 'Land holding entity',industry: 'Real Estate',       location: 'Palm Coast, FL',  relationship: 'Western Flagler landowner, beneficiary of rural lands comp plan amendment' },
      { name: 'Flagler Contractors Assoc',    amount: 14000, employer: 'Contractors group',  industry: 'Retail / Business', location: 'Bunnell, FL',     relationship: 'Construction industry group, supports pro-development candidates' },
      { name: 'FPL / NextEra PAC',            amount: 12000, employer: 'Florida Power & Light',industry: 'Energy',          location: 'Juno Beach, FL',  relationship: 'Utility donor, seeks favorable county easement and permitting decisions' },
      { name: 'Robert Harrison',              amount: 9500,  employer: 'Harrison Law Group', industry: 'Law / Legal',       location: 'Daytona Beach, FL', relationship: 'Real estate attorney who practices before Flagler County boards' },
    ],
    geographicSplit: [
      { region: 'Palm Coast',       pct: 52 },
      { region: 'Flagler County',   pct: 28 },
      { region: 'Out of county',    pct: 20 },
    ],
    smallDonorPct: 31,
    noteworthy: "Palm Coast Land Partners donated $29,000 while having an active rezoning application before the commission. O'Brien voted YES on the related Comprehensive Plan amendment.",
    source: 'Florida Division of Elections · County filings',
    sourceUrl: 'https://dos.elections.myflorida.com',
  },
};

// ─── SCHOOL BOARD DATA ────────────────────────────────────────────────────────

const SCHOOL_BOARD_DATA = {
  district: {
    name: 'Flagler County School District',
    superintendent: 'LaShakia Moore',
    totalBudget: 338224969,
    generalFund: 131000000,
    fundBalance: 7600000,
    fundBalancePct: 5.8,
    stateFundingPct: 52,
    localFundingPct: 40,
    federalFundingPct: 8,
    millageRate: 3.1010,
    millageRateNote: 'Set by Florida DOE — lowest in 20+ years, 11th straight year of reduction',
    voucherImpact: 17095511,
    voucherStudents: 1926,
    totalStudents: 13200,
    totalStaff: 2009,
    schoolCount: 10,
    districtGrade: 'B',
    districtGradeNote: '4th consecutive B — 11th B in last 12 years',
    graduationRate: 89,
    graduationRateChange: +1,
    grade3ELARate: 64,
    grade3ELAChange: +3,
    elaPassRate: 58,
    elaPassChange: +3,
    mathPassRate: 51,
    mathPassChange: -2,
    chronicAbsenteeism: 18,
    teacherVacancyRate: 6.2,
    teacherRetentionRate: 82,
    perPupilSpending: 9840,
    stateAvgPerPupil: 10200,
    classroomVsAdminRatio: 61,
    nextMeeting: 'March 11, 2026',
    unanimousPct: 88,
    splitVotes: 4,
    votesThisYear: 34,
    // Revenue sources
    revenue: [
      { label: 'State FEFP Funding',     pct: 52, amount: 175700000, color: '#1d4ed8', note: 'Florida Education Finance Program — decreases as local property values rise' },
      { label: 'Local Property Tax',     pct: 40, amount: 135200000, color: '#0891b2', note: 'Required Local Effort millage set by state DOE, not the school board' },
      { label: 'Federal Grants',         pct:  8, amount: 27300000,  color: '#7c3aed', note: 'Title I, IDEA special education, and other federal programs' },
    ],
    // Spending breakdown
    spending: [
      { label: 'Instruction (Classroom)', pct: 53, amount: 179300000, color: '#16a34a' },
      { label: 'Support Services',        pct: 16, amount: 54100000,  color: '#0891b2' },
      { label: 'Administration',          pct:  8, amount: 27100000,  color: '#7c3aed' },
      { label: 'Transportation',          pct:  7, amount: 23700000,  color: '#d97706' },
      { label: 'Capital Outlay',          pct:  9, amount: 30400000,  color: '#dc2626' },
      { label: 'Debt Service',            pct:  4, amount: 13500000,  color: '#64748b' },
      { label: 'Other',                   pct:  3, amount: 10100000,  color: '#94a3b8' },
    ],
    // School-level budget drill-down (estimated allocations)
    schools: [
      { name: 'Flagler-Palm Coast High School', type: 'High',        grade: 'B', enrollment: 2480, gradeChange: '+30pts', budget: 28400000, perPupil: 11450, highlights: ['IB Programme', 'AICE', 'Dual Enrollment', '5-Star School Award'], url: 'https://fpchs.flaglerschools.com' },
      { name: 'Matanzas High School',            type: 'High',        grade: 'A', enrollment: 2210, gradeChange: '+pts',   budget: 25200000, perPupil: 11400, highlights: ['A-rated 2024', '5-Star School Award', 'New principal Mike Rinaldi 2025'], url: 'https://mhs.flaglerschools.com' },
      { name: 'Indian Trails Middle School',     type: 'Middle',      grade: 'A', enrollment: 1380, gradeChange: '+pts',   budget: 14800000, perPupil: 10720, highlights: ['School of Excellence (FLDOE)', 'Consistent A rating', '2026 Teacher of Year finalist'], url: 'https://itms.flaglerschools.com' },
      { name: 'Buddy Taylor Middle School',      type: 'Middle',      grade: 'B', enrollment: 1190, gradeChange: '→',      budget: 12600000, perPupil: 10590, highlights: ['Improved to B in 2024', 'Career Expo program'], url: 'https://btms.flaglerschools.com' },
      { name: 'Old Kings Elementary',            type: 'Elementary',  grade: 'A', enrollment: 910,  gradeChange: '→',      budget: 8900000,  perPupil: 9780,  highlights: ['School of Excellence 2024', 'Consistent A rating', 'Golden School Award'], url: 'https://okes.flaglerschools.com' },
      { name: 'Belle Terre Elementary',          type: 'Elementary',  grade: 'B', enrollment: 860,  gradeChange: '+15pts', budget: 8400000,  perPupil: 9770,  highlights: ['2025-26 District Teacher of Year', 'Up 15 pts in 2025', 'Golden School Award'], url: 'https://btes.flaglerschools.com' },
      { name: 'Rymfire Elementary',              type: 'Elementary',  grade: 'B', enrollment: 820,  gradeChange: '+19pts', budget: 8100000,  perPupil: 9880,  highlights: ['Up 19 pts in 2025 (biggest gain)', 'Golden School Award'], url: 'https://res.flaglerschools.com' },
      { name: 'Bunnell Elementary',              type: 'Elementary',  grade: 'B', enrollment: 680,  gradeChange: '+pts',   budget: 7200000,  perPupil: 10590, highlights: ['Improved to B in 2024', 'Title I school', 'Golden School Award'], url: 'https://bes.flaglerschools.com' },
      { name: 'Lewis E. Wadsworth Elementary',   type: 'Elementary',  grade: 'B', enrollment: 740,  gradeChange: '→',      budget: 7600000,  perPupil: 10270, highlights: ['5-Star School Award', 'Golden School Award'], url: 'https://wes.flaglerschools.com' },
      { name: 'iFlagler Virtual School',         type: 'Virtual',     grade: 'N/A', enrollment: 930, gradeChange: '—',     budget: 4200000,  perPupil: 4520,  highlights: ['K-12 virtual', 'FLVS franchise', 'Award-winning'], url: 'https://www.iflagler.org' },
    ],
    recentDecisions: [
      {
        title: 'FY2025-26 Budget — $338.2 Million Adopted',
        outcome: '5-0', date: 'Sep 2025', impact: 'Budget', passed: true,
        what: "The board unanimously adopted the $338,224,969 final budget for fiscal year 2025-26 at a Sept. 9 public hearing, along with the Required Local Effort millage rate of 3.1010 mills — the lowest rate in more than 20 years and the 11th consecutive annual reduction.",
        whyItMatters: "For a Flagler County homeowner assessed at $300,000 with a $50,000 homestead exemption, the school district's Required Local Effort portion equals approximately $775 per year. Unlike city or county taxes, this rate is set by the Florida DOE, not the school board — the board has no authority to raise or lower it. As Flagler property values rise, state FEFP funding is reduced dollar-for-dollar, meaning homeowners pay more in property taxes but the district receives no net gain.",
        howTheyVoted: [
          { name: 'Will Furry (Chair)',   vote: 'YES', note: 'Called budget fiscally responsible given state funding constraints' },
          { name: 'Christy Chong',        vote: 'YES', note: 'Supported with emphasis on capital improvements' },
          { name: 'Lauren Ramirez',       vote: 'YES', note: 'Backed increased CTE and mental health funding' },
          { name: 'Janie Ruddy',          vote: 'YES', note: 'Voted yes while voicing concern about voucher funding impact' },
          { name: 'Derek Barrs',          vote: 'YES', note: 'Present at meeting — resigned Sept 30, 2025' },
        ],
        fiscalImpact: 'Total: $338.2M. General fund projected to end FY2026 with $7.6M reserve (5.8% of revenues). State minimum reserve requirement: 3%. Voucher diversion: $17.1M to 1,926 students.',
        sourceUrl: 'https://www.flaglerschools.com/about-us/financial-transparency',
        mediaLink: 'https://www.observerlocalnews.com/news/2025/sep/09/flagler-school-board-adopts-final-budget-of-338-million-for-2025-2026-fiscal-year/',
      },
      {
        title: 'Book Review Policy — Instructional Materials Process',
        outcome: '3-2', date: 'Oct 2025', impact: 'Curriculum', passed: true,
        what: "The board voted 3-2 to adopt an updated instructional materials review process, establishing clearer timelines for library book challenges and requiring written justification from reviewers. The policy came following years of controversial book removals under a prior process criticized as inconsistent.",
        whyItMatters: "Flagler County has been among Florida districts with the highest number of book challenges. The new process sets a 30-day timeline for initial review and requires a district committee review before any title is removed from shelves. Critics argued it still allows too-easy removal; supporters said it adds needed structure and accountability.",
        howTheyVoted: [
          { name: 'Will Furry (Chair)',   vote: 'YES', note: 'Supported as bringing order and consistency to the process' },
          { name: 'Christy Chong',        vote: 'YES', note: 'Backed transparency requirements and written justification mandate' },
          { name: 'Lauren Ramirez',       vote: 'YES', note: 'Supported — emphasized student access to diverse materials' },
          { name: 'Janie Ruddy',          vote: 'NO',  note: 'Argued process still allows too-rapid removal without full committee review' },
          { name: 'District 1 — Vacant',  vote: 'N/A', note: 'Seat vacant at time of this vote' },
        ],
        fiscalImpact: 'No direct cost. Staff time for review process estimated at ~$40K annually in administrative hours.',
        sourceUrl: 'https://www.flaglerschools.com',
        mediaLink: 'https://flaglerlive.com/?s=flagler+school+board+books',
      },
      {
        title: 'Teacher Salary Supplement — $1,500 One-Time Payment',
        outcome: '5-0', date: 'Nov 2025', impact: 'Personnel', passed: true,
        what: "The board unanimously approved a one-time $1,500 salary supplement for all full-time classroom teachers, funded from the district's discretionary local millage. The payment was distributed before the winter holiday break.",
        whyItMatters: "Florida ranks 50th in average teacher pay nationally. Flagler Schools has lost teachers to neighboring Volusia and St. Johns counties which have higher base salaries and lower cost of living pressure. The supplement was an attempt to retain staff ahead of the spring transfer window.",
        howTheyVoted: [
          { name: 'All 5 members', vote: 'YES', note: 'Unanimous — framed as critical staff retention investment' },
        ],
        fiscalImpact: 'Approximately $1.8M from discretionary local millage. Approximately 1,200 eligible full-time classroom teachers.',
        sourceUrl: 'https://www.flaglerschools.com',
        mediaLink: 'https://flaglerlive.com/?s=flagler+teacher+salary',
      },
      {
        title: 'Rymfire Elementary Renovation — $4.2M Capital Project',
        outcome: '5-0', date: 'Aug 2025', impact: 'Facilities', passed: true,
        what: "The board approved a $4.2 million capital renovation at Rymfire Elementary covering HVAC replacement, roof repairs, cafeteria expansion, and classroom technology upgrades. The project is funded from the district's capital outlay millage.",
        whyItMatters: "Rymfire serves one of the fastest-growing residential areas in western Palm Coast. The cafeteria expansion addresses severe overcrowding during lunch periods, and the HVAC replacement resolves a chronic heat issue that required early dismissals on hot days.",
        howTheyVoted: [
          { name: 'All 5 members', vote: 'YES', note: 'Unanimous — deferred maintenance cited as safety and learning concern' },
        ],
        fiscalImpact: '$4.2M from capital outlay fund (1.5 mill levy). Construction expected to complete before start of 2026-27 school year.',
        sourceUrl: 'https://www.flaglerschools.com',
        mediaLink: 'https://flaglerlive.com/?s=rymfire+elementary',
      },
    ],
  },
  members: {
    // Will Furry — Chair, District 2
    16: {
      seat: 'Chair, District 2', termStart: 2022, termEnd: 2026, nextElection: 2026,
      howElected: 'Elected countywide — all 5 seats are elected by all Flagler voters regardless of district',
      committeeRoles: ['Board Chair', 'Flagler County Education Foundation Liaison', 'Florida School Boards Association Representative'],
      scores: { civic: 81, transparency: 77, responsiveness: 74 },
      keyPositions: ['Fiscal accountability and budget transparency', 'Parental rights in education', 'School safety and security infrastructure', 'Considering 2026 Congressional run vs Randy Fine'],
      votingRecord: [
        { bill: 'FY2025-26 Budget $338.2M',              vote: 'YES', date: 'Sep 2025', category: 'Budget',     impact: 'Critical' },
        { bill: 'Book Review Policy Update',             vote: 'YES', date: 'Oct 2025', category: 'Curriculum', impact: 'High' },
        { bill: 'Teacher Salary Supplement $1,500',      vote: 'YES', date: 'Nov 2025', category: 'Personnel',  impact: 'High' },
        { bill: 'Rymfire Elementary Renovation $4.2M',   vote: 'YES', date: 'Aug 2025', category: 'Facilities', impact: 'High' },
        { bill: 'Superintendent Performance Review',     vote: 'YES', date: 'Jan 2026', category: 'Personnel',  impact: 'Medium' },
      ],
    },
    // Christy Chong — Vice Chair, District 4
    22: {
      seat: 'Vice Chair, District 4', termStart: 2022, termEnd: 2026, nextElection: 2026,
      howElected: 'Elected countywide — all 5 seats are elected by all Flagler voters regardless of district',
      committeeRoles: ['Board Vice Chair', 'Curriculum & Instruction Committee', 'School Safety Liaison'],
      scores: { civic: 84, transparency: 79, responsiveness: 76 },
      keyPositions: ['Curriculum transparency and parent notification', 'School safety and threat assessment', 'Fiscal oversight of district budget', 'Career and technical education expansion'],
      votingRecord: [
        { bill: 'FY2025-26 Budget $338.2M',              vote: 'YES', date: 'Sep 2025', category: 'Budget',     impact: 'Critical' },
        { bill: 'Book Review Policy Update',             vote: 'YES', date: 'Oct 2025', category: 'Curriculum', impact: 'High' },
        { bill: 'Teacher Salary Supplement $1,500',      vote: 'YES', date: 'Nov 2025', category: 'Personnel',  impact: 'High' },
        { bill: 'Rymfire Elementary Renovation $4.2M',   vote: 'YES', date: 'Aug 2025', category: 'Facilities', impact: 'High' },
        { bill: 'Superintendent Performance Review',     vote: 'YES', date: 'Jan 2026', category: 'Personnel',  impact: 'Medium' },
      ],
    },
    // Lauren Ramirez — District 3
    23: {
      seat: 'District 3', termStart: 2024, termEnd: 2028, nextElection: 2028,
      howElected: 'Elected countywide — all 5 seats are elected by all Flagler voters regardless of district',
      committeeRoles: ['FSBA Emerging Leader 2025', 'Career & Technical Education Committee', 'Student Mental Health Liaison'],
      scores: { civic: 88, transparency: 82, responsiveness: 86 },
      keyPositions: ['Career and technical education pathways', 'Student mental health and wellness programs', 'Community partnerships with employers', 'Equity in educational access'],
      votingRecord: [
        { bill: 'FY2025-26 Budget $338.2M',              vote: 'YES', date: 'Sep 2025', category: 'Budget',     impact: 'Critical' },
        { bill: 'Book Review Policy Update',             vote: 'YES', date: 'Oct 2025', category: 'Curriculum', impact: 'High' },
        { bill: 'Teacher Salary Supplement $1,500',      vote: 'YES', date: 'Nov 2025', category: 'Personnel',  impact: 'High' },
        { bill: 'Rymfire Elementary Renovation $4.2M',   vote: 'YES', date: 'Aug 2025', category: 'Facilities', impact: 'High' },
        { bill: 'Superintendent Performance Review',     vote: 'YES', date: 'Jan 2026', category: 'Personnel',  impact: 'Medium' },
      ],
    },
    // Janie Ruddy — District 5
    24: {
      seat: 'District 5', termStart: 2024, termEnd: 2028, nextElection: 2028,
      howElected: 'Elected countywide — all 5 seats are elected by all Flagler voters regardless of district',
      committeeRoles: ['Special Education Oversight', 'Finance & Budget Committee', 'FSBA Legislative Committee'],
      scores: { civic: 86, transparency: 89, responsiveness: 83 },
      keyPositions: ['Skeptical of voucher expansion — most vocal critic on board', 'Reading proficiency and 3rd grade literacy', 'Special education services and funding', 'Budget accountability and reserve maintenance'],
      votingRecord: [
        { bill: 'FY2025-26 Budget $338.2M',              vote: 'YES', date: 'Sep 2025', category: 'Budget',     impact: 'Critical' },
        { bill: 'Book Review Policy Update',             vote: 'NO',  date: 'Oct 2025', category: 'Curriculum', impact: 'High' },
        { bill: 'Teacher Salary Supplement $1,500',      vote: 'YES', date: 'Nov 2025', category: 'Personnel',  impact: 'High' },
        { bill: 'Rymfire Elementary Renovation $4.2M',   vote: 'YES', date: 'Aug 2025', category: 'Facilities', impact: 'High' },
        { bill: 'Superintendent Performance Review',     vote: 'YES', date: 'Jan 2026', category: 'Personnel',  impact: 'Medium' },
      ],
    },
  },
};

// ─── CITY COUNCIL DATA ────────────────────────────────────────────────────────

const CITY_COUNCIL_DATA = {
  council: {
    fy2026Budget: 290400000,
    budgetPerResident: 4687,
    propertyTaxRate: 4.6871,
    propertyTaxRateChange: -0.12,
    generalFundReserve: 8200000,
    unanimousPct: 74,
    splitVotes: 8,
    votesThisYear: 31,
    avgAttendance: 96,
    nextMeeting: 'March 4, 2026',
    cityManager: 'Lauren Johnston (Acting)',
    incorporated: 1999,
    population: 102000,
    topSpendingCategories: [
      { label: 'Public Safety',         pct: 21, amount: 62100000, color: '#dc2626' },
      { label: 'Infrastructure & Roads', pct: 19, amount: 55100000, color: '#d97706' },
      { label: 'Utilities',             pct: 17, amount: 49400000, color: '#0891b2' },
      { label: 'Parks & Recreation',    pct: 8,  amount: 23200000, color: '#16a34a' },
      { label: 'General Government',    pct: 13, amount: 37700000, color: '#7c3aed' },
      { label: 'Community Development', pct: 11, amount: 31900000, color: '#059669' },
      { label: 'Debt Service',          pct: 7,  amount: 20300000, color: '#64748b' },
      { label: 'Other',                 pct: 4,  amount: 11600000, color: '#94a3b8' },
    ],
    recentDecisions: [
      {
        title: 'Traffic Calming Pilot — Seminole Woods Blvd',
        outcome: '3-2', date: 'Feb 2026', impact: 'Infrastructure', passed: true,
        what: "The council voted 3-2 to approve a 6-month traffic calming pilot on Seminole Woods Boulevard, including speed tables, narrowed travel lanes, and enhanced crosswalks. The $340,000 project will be evaluated before any permanent changes.",
        whyItMatters: "Seminole Woods is one of the most heavily used cut-through roads in Palm Coast. Residents have complained about speeding for years, especially near the elementary school. This pilot tests whether physical changes reduce speeds before committing to permanent infrastructure.",
        howTheyVoted: [
          { name: 'Mike Norris',       vote: 'YES', note: 'Supported as a safety measure for school zone and pedestrians' },
          { name: 'Theresa Pontieri',  vote: 'YES', note: 'Backed pilot approach — evaluate before making permanent' },
          { name: 'Ty Miller',         vote: 'YES', note: 'Supported constituent-driven safety improvements' },
          { name: 'David Sullivan',    vote: 'NO',  note: 'Concerned about traffic diversion to residential side streets' },
          { name: 'Charles Gambaro',   vote: 'NO',  note: 'Wanted more traffic study data before spending $340K' },
        ],
        fiscalImpact: '$340,000 from infrastructure reserve fund. If pilot succeeds, permanent installation estimated at $1.2M.',
        sourceUrl: 'https://www.palmcoast.gov',
      },
      {
        title: 'FY2026 City Budget — $290.4 Million',
        outcome: '4-1', date: 'Sep 2025', impact: 'Budget', passed: true,
        what: "The City Council approved the $290.4 million operating budget for fiscal year 2026, a 6.8% increase over the prior year. The budget sets the city property tax rate at $4.6871 per $1,000 of assessed value — a slight decrease from the prior year despite higher spending, due to increased property values across Palm Coast.",
        whyItMatters: "For a Palm Coast home assessed at $300,000 with a $50,000 homestead exemption, this means approximately $1,172 per year in city taxes — separate from your county and school board taxes. The largest increases went to road maintenance (+14%) and stormwater infrastructure (+18%).",
        howTheyVoted: [
          { name: 'Mike Norris',       vote: 'YES', note: 'Supported as responsible investment in city infrastructure' },
          { name: 'Theresa Pontieri',  vote: 'YES', note: 'Backed increased parks and community development funding' },
          { name: 'Ty Miller',         vote: 'YES', note: 'Supported road and infrastructure spending increases' },
          { name: 'David Sullivan',    vote: 'YES', note: 'Voted yes with note requesting quarterly spending reviews' },
          { name: 'Charles Gambaro',   vote: 'NO',  note: 'Dissented — argued 6.8% increase exceeded inflation and growth rate' },
        ],
        fiscalImpact: '$290.4M total. Property tax rate: $4.6871/$1,000 (down $0.12). General fund reserve: $8.2M. Largest increases: Roads +14%, Stormwater +18%.',
        sourceUrl: 'https://www.palmcoast.gov',
      },
      {
        title: 'Stormwater Improvement Assessment District',
        outcome: '5-0', date: 'Nov 2025', impact: 'Infrastructure', passed: true,
        what: "The council unanimously approved the creation of a Stormwater Improvement Assessment District, allowing the city to levy a dedicated annual stormwater fee on all properties to fund canal dredging, drainage improvements, and flood mitigation. Residential properties will pay approximately $120-180 per year depending on impervious surface area.",
        whyItMatters: "Palm Coast was built around an extensive canal system that requires continuous maintenance. Without dedicated funding, the city has deferred millions in dredging and drainage work. Flooding in low-lying sections — particularly in the R and F sections — has worsened. This fee creates a sustainable funding stream tied directly to the problem.",
        howTheyVoted: [
          { name: 'All 5 members', vote: 'YES', note: 'Unanimous — council agreed dedicated stormwater funding is overdue' },
        ],
        fiscalImpact: 'Estimated $8.4M annually. Average residential fee: $140-160/year. First assessments appear on 2026 property tax bills.',
        sourceUrl: 'https://www.palmcoast.gov',
      },
      {
        title: 'Affordable Housing Incentive Program',
        outcome: '3-2', date: 'Jan 2026', impact: 'Housing', passed: true,
        what: "The council voted 3-2 to create an affordable housing incentive program offering density bonuses and permit fee waivers to developers who include at least 15% affordable units (priced for households earning 80% or less of area median income) in new residential projects of 50+ units.",
        whyItMatters: "Median home prices in Palm Coast have risen 42% since 2020. Essential workers — teachers, deputies, healthcare workers — are increasingly unable to afford homes in the city where they work. This program incentivizes developers to include affordable units without spending city funds on direct subsidies.",
        howTheyVoted: [
          { name: 'Mike Norris',       vote: 'YES', note: 'Called housing affordability a workforce retention crisis' },
          { name: 'Theresa Pontieri',  vote: 'YES', note: 'Supported as pro-community development without direct subsidy' },
          { name: 'Ty Miller',         vote: 'YES', note: 'Backed as market-based approach to workforce housing' },
          { name: 'David Sullivan',    vote: 'NO',  note: 'Concerned density bonuses could strain existing infrastructure' },
          { name: 'Charles Gambaro',   vote: 'NO',  note: 'Argued program would attract higher-density development inconsistent with Palm Coast character' },
        ],
        fiscalImpact: 'No direct cost. Permit fee waivers estimated at $180K-$340K annually in foregone revenue. Long-term infrastructure cost depends on uptake.',
        sourceUrl: 'https://www.palmcoast.gov',
      },
      {
        title: 'City Hall Renovation & Expansion',
        outcome: '5-0', date: 'Oct 2025', impact: 'Infrastructure', passed: true,
        what: "The council unanimously approved a $6.2 million renovation and expansion of City Hall at 160 Lake Avenue, including new council chambers, expanded public meeting space, upgraded AV systems for hybrid public participation, and ADA accessibility improvements throughout the building.",
        whyItMatters: "The current council chambers cannot accommodate public attendance at controversial meetings — residents have been turned away or forced to watch from hallways during high-attendance votes. The expansion adds 180 public seats and enables live streaming with two-way participation for residents who cannot attend in person.",
        howTheyVoted: [
          { name: 'All 5 members', vote: 'YES', note: 'Unanimous — aging facility cited as barrier to public participation' },
        ],
        fiscalImpact: '$6.2M funded from capital improvement reserve. Construction expected to begin Q3 2026, complete Q1 2028.',
        sourceUrl: 'https://www.palmcoast.gov',
      },
    ],
  },
  members: {
    // Mayor Mike Norris
    7: {
      officialId: 7,
      seat: 'Mayor',
      termStart: 2024,
      termEnd: 2028,
      nextElection: 2028,
      committeeRoles: ['Affordable Housing Advisory Committee', 'Flagler County Transportation Disadvantaged Local Coordinating Board', 'Joint Cities and County Workshop', 'Volusia-Flagler Transportation Planning Organization'],
      scores: { civic: 88, transparency: 82, responsiveness: 79 },
      votingRecord: [
        { bill: 'FY2026 City Budget $290.4M',           vote: 'YES', date: 'Sep 2025', category: 'Budget',         impact: 'Critical' },
        { bill: 'Traffic Calming — Seminole Woods',      vote: 'YES', date: 'Feb 2026', category: 'Infrastructure', impact: 'High' },
        { bill: 'Stormwater Assessment District',        vote: 'YES', date: 'Nov 2025', category: 'Infrastructure', impact: 'Critical' },
        { bill: 'Affordable Housing Incentive Program',  vote: 'YES', date: 'Jan 2026', category: 'Housing',        impact: 'High' },
        { bill: 'City Hall Renovation $6.2M',            vote: 'YES', date: 'Oct 2025', category: 'Infrastructure', impact: 'High' },
        { bill: 'Palm Coast Parkway Widening Phase 2',   vote: 'YES', date: 'Aug 2025', category: 'Infrastructure', impact: 'High' },
      ],
      keyPositions: ['Fiscal responsibility and infrastructure-first approach', 'Smart managed growth over rapid development', 'Transparent quarterly financial reporting'],
    },
    // Theresa Pontieri — Vice Mayor District 2
    15: {
      officialId: 15,
      seat: 'Vice Mayor, District 2',
      termStart: 2022,
      termEnd: 2026,
      nextElection: 2026,
      committeeRoles: ['Vice Mayor', 'Family Life Center Liaison', 'Flagler County Cultural Council Liaison'],
      scores: { civic: 84, transparency: 78, responsiveness: 81 },
      votingRecord: [
        { bill: 'FY2026 City Budget $290.4M',           vote: 'YES', date: 'Sep 2025', category: 'Budget',         impact: 'Critical' },
        { bill: 'Traffic Calming — Seminole Woods',      vote: 'YES', date: 'Feb 2026', category: 'Infrastructure', impact: 'High' },
        { bill: 'Stormwater Assessment District',        vote: 'YES', date: 'Nov 2025', category: 'Infrastructure', impact: 'Critical' },
        { bill: 'Affordable Housing Incentive Program',  vote: 'YES', date: 'Jan 2026', category: 'Housing',        impact: 'High' },
        { bill: 'City Hall Renovation $6.2M',            vote: 'YES', date: 'Oct 2025', category: 'Infrastructure', impact: 'High' },
      ],
      keyPositions: ['Community-centered development', 'Cultural and arts investment', 'Senior services and quality of life'],
    },
    // Ty Miller — District 1
    30: {
      officialId: 30,
      seat: 'District 1',
      termStart: 2024,
      termEnd: 2028,
      nextElection: 2028,
      committeeRoles: ['Flagler Schools Oversight Committee', 'Joint Cities and County Workshop'],
      scores: { civic: 81, transparency: 75, responsiveness: 77 },
      votingRecord: [
        { bill: 'FY2026 City Budget $290.4M',           vote: 'YES', date: 'Sep 2025', category: 'Budget',         impact: 'Critical' },
        { bill: 'Traffic Calming — Seminole Woods',      vote: 'YES', date: 'Feb 2026', category: 'Infrastructure', impact: 'High' },
        { bill: 'Stormwater Assessment District',        vote: 'YES', date: 'Nov 2025', category: 'Infrastructure', impact: 'Critical' },
        { bill: 'Affordable Housing Incentive Program',  vote: 'YES', date: 'Jan 2026', category: 'Housing',        impact: 'High' },
        { bill: 'City Hall Renovation $6.2M',            vote: 'YES', date: 'Oct 2025', category: 'Infrastructure', impact: 'High' },
      ],
      keyPositions: ['Neighborhood infrastructure and road maintenance', 'Managed growth', 'District 1 constituent services'],
    },
    // David Sullivan — District 3
    31: {
      officialId: 31,
      seat: 'District 3',
      termStart: 2025,
      termEnd: 2026,
      nextElection: 2026,
      committeeRoles: ['Florida Department of Juvenile Justice Circuit 7 Liaison'],
      scores: { civic: 79, transparency: 86, responsiveness: 83 },
      votingRecord: [
        { bill: 'Traffic Calming — Seminole Woods',      vote: 'NO',  date: 'Feb 2026', category: 'Infrastructure', impact: 'High' },
        { bill: 'Stormwater Assessment District',        vote: 'YES', date: 'Nov 2025', category: 'Infrastructure', impact: 'Critical' },
        { bill: 'Affordable Housing Incentive Program',  vote: 'NO',  date: 'Jan 2026', category: 'Housing',        impact: 'High' },
        { bill: 'City Hall Renovation $6.2M',            vote: 'YES', date: 'Oct 2025', category: 'Infrastructure', impact: 'High' },
      ],
      keyPositions: ['Fact-based decision making', 'Infrastructure before density increases', 'Fiscal oversight and government accountability'],
    },
    // Charles Gambaro — District 4
    32: {
      officialId: 32,
      seat: 'District 4',
      termStart: 2022,
      termEnd: 2026,
      nextElection: 2026,
      committeeRoles: ['Flagler Schools Oversight Committee', 'St. Johns River Water Management District Liaison'],
      scores: { civic: 77, transparency: 74, responsiveness: 72 },
      votingRecord: [
        { bill: 'FY2026 City Budget $290.4M',           vote: 'NO',  date: 'Sep 2025', category: 'Budget',         impact: 'Critical' },
        { bill: 'Traffic Calming — Seminole Woods',      vote: 'NO',  date: 'Feb 2026', category: 'Infrastructure', impact: 'High' },
        { bill: 'Stormwater Assessment District',        vote: 'YES', date: 'Nov 2025', category: 'Infrastructure', impact: 'Critical' },
        { bill: 'Affordable Housing Incentive Program',  vote: 'NO',  date: 'Jan 2026', category: 'Housing',        impact: 'High' },
        { bill: 'City Hall Renovation $6.2M',            vote: 'YES', date: 'Oct 2025', category: 'Infrastructure', impact: 'High' },
      ],
      keyPositions: ['Water quality and stormwater management', 'Fiscal restraint and budget control', 'Preserve Palm Coast character against overdevelopment'],
    },
  },
};

// ─── COMMISSIONER METRICS DATA ───────────────────────────────────────────────

const COMMISSIONER_DATA = {
  role_explainer: {
    title: "What Does a County Commissioner Do?",
    summary: "County Commissioners are your most directly accessible elected officials. They control the budget, set property tax rates, approve land use decisions, fund the sheriff's office, manage county roads, and make decisions that affect daily life more than almost any other level of government.",
    powers: [
      { icon: "💰", label: "Budget & Taxes", desc: "Approve the entire county budget and set the property tax rate each year" },
      { icon: "🏗️", label: "Land Use", desc: "Decide what gets built where — housing, commercial, industrial, conservation" },
      { icon: "🚔", label: "Public Safety", desc: "Fund the Sheriff, Emergency Management, and Fire rescue" },
      { icon: "🛣️", label: "Infrastructure", desc: "County roads, bridges, stormwater, parks, and public facilities" },
      { icon: "📋", label: "Zoning & Permits", desc: "Control growth through comprehensive plan and zoning changes" },
      { icon: "🤝", label: "Contracts", desc: "Approve all major vendor contracts and interlocal city agreements" },
    ],
    meetingSchedule: "2nd and 4th Monday — 9:00 AM, Government Services Building, Bunnell",
    watchLive: "https://www.flaglercounty.gov",
  },
  commissioners: {
    6: {
      officialId: 6,
      district: "District 1",
      termStart: 2020,
      termEnd: 2024,
      nextElection: 2028,
      committeeRoles: ["Chair, Flagler County Commission (2022-23)", "FL Association of Counties Board", "Small County Coalition — Executive Committee"],
      votingRecord: [
        { bill: "Bulow Creek Floodplain Preservation", vote: "YES", date: "Jan 2026", category: "Environment", impact: "High" },
        { bill: "Half-Cent Sales Tax Referendum", vote: "YES", date: "Dec 2025", category: "Budget", impact: "High" },
        { bill: "Comprehensive Plan — Western Rural Lands", vote: "NO", date: "Nov 2025", category: "Land Use", impact: "High" },
        { bill: "FY2026 County Budget ($248M)", vote: "YES", date: "Sep 2025", category: "Budget", impact: "Critical" },
        { bill: "Affordable Housing Trust Fund", vote: "YES", date: "Aug 2025", category: "Housing", impact: "Medium" },
        { bill: "Sheriff Dept Budget Increase (+8%)", vote: "YES", date: "Sep 2025", category: "Public Safety", impact: "High" },
      ],
      metrics: { attendanceRate:96, voteParticipation:100, legislationIntroduced:4, constituentResponseDays:2.1, publicCommentsSponsored:8 },
      keyPositions: ["Conservation land purchases", "Environmental protections", "Infrastructure-first growth"],
      civicScore: 88, transparencyScore: 82, responsiveScore: 91,
    },
    13: {
      officialId: 13,
      district: "District 2",
      termStart: 2022,
      termEnd: 2026,
      nextElection: 2026,
      committeeRoles: ["Vice Chair, Flagler County Commission (2024)", "Growth Management Subcommittee"],
      votingRecord: [
        { bill: "Comprehensive Plan — Western Rural Lands", vote: "YES", date: "Nov 2025", category: "Land Use", impact: "High" },
        { bill: "Half-Cent Sales Tax Referendum", vote: "YES", date: "Dec 2025", category: "Budget", impact: "High" },
        { bill: "FY2026 County Budget ($248M)", vote: "YES", date: "Sep 2025", category: "Budget", impact: "Critical" },
        { bill: "Bulow Creek Floodplain Preservation", vote: "YES", date: "Jan 2026", category: "Environment", impact: "High" },
        { bill: "Sheriff Dept Budget Increase (+8%)", vote: "YES", date: "Sep 2025", category: "Public Safety", impact: "High" },
        { bill: "Affordable Housing Trust Fund", vote: "NO", date: "Aug 2025", category: "Housing", impact: "Medium" },
      ],
      metrics: { attendanceRate:92, voteParticipation:98, legislationIntroduced:2, constituentResponseDays:3.4, publicCommentsSponsored:5 },
      keyPositions: ["Managed pro-growth development", "Fiscal conservatism", "Public safety funding priority"],
      civicScore: 74, transparencyScore: 68, responsiveScore: 72,
    },
  },
  commission: {
    name: "Flagler County Board of County Commissioners",
    seats: 5,
    fy2026Budget: 248000000,
    budgetPerResident: 4318,
    propertyTaxRate: 5.37,
    propertyTaxRateChange: -0.08,
    nextMeeting: "Feb 24, 2026",
    votesThisYear: 47,
    unanimousPct: 81,
    splitVotes: 9,
    avgAttendance: 94,
    avgResponseTime: 2.8,
    topSpendingCategories: [
      { label: "Public Safety",          pct: 34, amount: 84320000,  color: "#dc2626" },
      { label: "Infrastructure",          pct: 22, amount: 54560000,  color: "#d97706" },
      { label: "Health & Human Services", pct: 18, amount: 44640000,  color: "#0891b2" },
      { label: "General Government",      pct: 14, amount: 34720000,  color: "#7c3aed" },
      { label: "Parks & Recreation",      pct: 7,  amount: 17360000,  color: "#16a34a" },
      { label: "Other",                   pct: 5,  amount: 12400000,  color: "#94a3b8" },
    ],
    recentDecisions: [
      {
        title: "Bulow Creek — 153 acres preserved",
        outcome: "5-0", date: "Jan 2026", impact: "Environment", passed: true,
        what: "The commission voted unanimously to permanently preserve 153 acres of floodplain land around the Bulow Creek headwaters using Florida Forever state grant funds. The land cannot be developed or sold in the future.",
        whyItMatters: "Bulow Creek drains directly into the R and E sections of Palm Coast. Preserving this floodplain protects roughly 4,200 homes from flooding and keeps a natural buffer between development and the watershed permanently intact.",
        howTheyVoted: [
          { name: "Andy Dance",    vote: "YES", note: "Championed the purchase as part of his environmental platform" },
          { name: "Donald O'Brien", vote: "YES", note: "Supported unanimous conservation effort" },
          { name: "3 others",      vote: "YES", note: "Full 5-0 unanimous vote" },
        ],
        fiscalImpact: "Funded entirely by Florida Forever state grant — $1.2M, no local tax dollars required.",
        sourceUrl: "https://www.flaglercounty.gov",
      },
      {
        title: "FY2026 County Budget — $248 Million",
        outcome: "4-1", date: "Sep 2025", impact: "Budget", passed: true,
        what: "The commission approved the $248 million operating budget for fiscal year 2026 — a 6.2% increase over the prior year. The budget funds all county services including roads, sheriff, health services, parks, and county staff.",
        whyItMatters: "This budget sets your property tax rate at 5.37 mills — down slightly from last year. For a home assessed at $300,000 with a $50,000 homestead exemption, that is approximately $1,342/year in county taxes. The biggest single increase was an 8% boost to the Sheriff's Office.",
        howTheyVoted: [
          { name: "Andy Dance",    vote: "YES", note: "Supported increased infrastructure and public safety spending" },
          { name: "Donald O'Brien", vote: "YES", note: "Voted yes despite concerns about budget growth rate" },
          { name: "1 commissioner", vote: "NO",  note: "Dissented arguing the 6.2% increase was too fast given inflation pressures" },
        ],
        fiscalImpact: "$248M total. Property tax rate: 5.37 mills (down 0.08 from prior year). Largest increases: Sheriff +8%, Roads +11%.",
        sourceUrl: "https://www.flaglercounty.gov",
      },
      {
        title: "Sheriff's Office Budget Increase +8%",
        outcome: "5-0", date: "Sep 2025", impact: "Public Safety", passed: true,
        what: "As part of the FY2026 budget, commissioners unanimously approved an 8% increase to the Flagler County Sheriff's Office budget, adding funding for 4 new deputy positions, body camera upgrades, and a new mental health crisis response unit.",
        whyItMatters: "Flagler County's population has grown 40% in 10 years while the sheriff's department had not grown proportionally. The new deputies will reduce average response times in western Palm Coast neighborhoods that currently experience longer waits.",
        howTheyVoted: [
          { name: "All 5 commissioners", vote: "YES", note: "Unanimous support citing rapid population growth and public safety needs" },
        ],
        fiscalImpact: "Approximately $3.1M added to Sheriff budget. Funded within the overall county budget increase.",
        sourceUrl: "https://www.flaglercounty.gov",
      },
      {
        title: "Rural Land Comprehensive Plan Amendment",
        outcome: "3-2", date: "Nov 2025", impact: "Land Use", passed: true,
        what: "The commission voted 3-2 to amend the county's comprehensive land use plan, opening approximately 1,800 acres of rural western Flagler County to residential development. The land had previously been designated for agriculture and conservation.",
        whyItMatters: "This is one of the most consequential land use decisions in Flagler County in a decade. It could mean 3,000 to 5,000 new homes, new schools, and expanded roads over the next 20 years — or it could mean traffic, overcrowded services, and permanently lost farmland, depending on how development proceeds.",
        howTheyVoted: [
          { name: "Andy Dance",    vote: "NO",  note: "Argued roads and schools must be built before homes are approved" },
          { name: "Donald O'Brien", vote: "YES", note: "Said housing supply is needed to address affordability for working families" },
          { name: "3 others",      vote: "YES", note: "Majority cited housing shortage and economic development needs" },
        ],
        fiscalImpact: "No direct cost. Long-term impact: significant infrastructure investment required. Developer impact fees expected to partially offset costs.",
        sourceUrl: "https://www.flaglercounty.gov",
      },
      {
        title: "Half-Cent Sales Tax — Ballot Measure",
        outcome: "4-1", date: "Dec 2025", impact: "Budget", passed: true,
        what: "The commission voted 4-1 to place a half-cent sales tax referendum on the November 2026 ballot. If voters approve it, the tax would add $0.50 to every $100 spent on most purchases in Flagler County for 10 years, raising approximately $12 million annually for roads, parks, and public safety.",
        whyItMatters: "This vote does not enact the tax — it lets voters decide. If approved by voters in November 2026, it would be the first dedicated capital improvement fund in county history. Supporters say it fixes roads without raising property taxes. Critics say it is a regressive tax that hits lower-income residents harder since they spend more of their income on goods.",
        howTheyVoted: [
          { name: "Andy Dance",    vote: "YES", note: "Supported putting the question to voters" },
          { name: "Donald O'Brien", vote: "YES", note: "Backed the referendum as an alternative to property tax increases" },
          { name: "1 commissioner", vote: "NO",  note: "Argued the county should cut spending instead of seeking new revenue" },
        ],
        fiscalImpact: "No immediate fiscal impact — this only places the question on the ballot. If voters approve: estimated $12M/year for 10 years.",
        sourceUrl: "https://www.flaglercounty.gov",
      },
    ],
  },
};

// ─── VOTE FEED CARDS ─────────────────────────────────────────────────────────
// These are real commissioner votes surfaced as constituent poll cards in the feed

const VOTE_FEED_CARDS = [
  {
    id: 'vfc1',
    type: 'vote_poll',
    officialId: 12,
    level: 'County',
    vote: 'YES',
    bill: 'Bulow Creek Floodplain Preservation',
    date: 'Jan 2026',
    category: 'Environment',
    impact: 'High',
    // What it is — plain English, 2-3 sentences, enough for a scrolling user to understand
    what: "The county voted to permanently preserve 153 acres of floodplain land around the Bulow Creek headwaters using Florida Forever grant funds. This land absorbs floodwater that would otherwise back up into Palm Coast neighborhoods during storms.",
    // Why it matters to residents specifically
    whyItMatters: "Bulow Creek drains directly into neighborhoods in the R and E sections of Palm Coast. Preserving this land protects roughly 4,200 homes from flooding and keeps the land out of development permanently.",
    // What it cost / trade-off
    tradeoff: "The county used $1.2M in state grant funds - no local tax dollars. The land cannot be developed or sold in the future.",
    votes: { agree: 847, disagree: 134, notsure: 201 },
  },
  {
    id: 'vfc2',
    type: 'vote_poll',
    officialId: 13,
    level: 'County',
    vote: 'YES',
    bill: 'Comprehensive Plan — Western Rural Lands Amendment',
    date: 'Nov 2025',
    category: 'Land Use',
    impact: 'High',
    what: "The commission voted 3-2 to amend Flagler County's comprehensive land use plan, opening up approximately 1,800 acres of rural western Flagler County for residential development. The land had previously been designated for agriculture and conservation.",
    whyItMatters: "This decision determines what gets built in western Flagler County for the next 20 years. It could mean 3,000-5,000 new homes, new schools, and expanded roads - or it could mean traffic, overcrowded services, and lost farmland depending on who you ask.",
    tradeoff: "Commissioner Dance voted NO, arguing infrastructure needs to come before development. Commissioners O'Brien and others argued housing supply is needed to address affordability.",
    votes: { agree: 312, disagree: 589, notsure: 245 },
  },
  {
    id: 'vfc3',
    type: 'vote_poll',
    officialId: 12,
    level: 'County',
    vote: 'YES',
    bill: 'FY2026 County Budget — $248 Million',
    date: 'Sep 2025',
    category: 'Budget',
    impact: 'Critical',
    what: "The Flagler County Commission approved the FY2026 annual budget of $248 million - up 6.2% from the prior year. The budget funds every county service: roads, sheriff, health services, parks, libraries, and county staff.",
    whyItMatters: "This budget sets your property tax rate at 5.37 mills - down slightly from last year. For a home assessed at $300,000 with a $50,000 homestead exemption, that's approximately $1,342/year in county taxes. The biggest increase was an 8% boost to the Sheriff's Office budget.",
    tradeoff: "One commissioner voted NO, arguing the budget grew too fast. Supporters said public safety and road maintenance couldn't be deferred any longer.",
    votes: { agree: 1240, disagree: 389, notsure: 412 },
  },
  {
    id: 'vfc4',
    type: 'vote_poll',
    officialId: 13,
    level: 'County',
    vote: 'NO',
    bill: 'Affordable Housing Trust Fund',
    date: 'Aug 2025',
    category: 'Housing',
    impact: 'Medium',
    what: "The commission voted on creating a dedicated Affordable Housing Trust Fund that would collect fees from new developments and use the money to subsidize workforce housing for teachers, deputies, healthcare workers, and service employees who work in Flagler County but cannot afford to live here.",
    whyItMatters: "The average home price in Palm Coast is now $298,000. A teacher earning $48,000/year qualifies for a mortgage of roughly $180,000. There is virtually no housing in that price range in Flagler County. This fund was designed to bridge that gap.",
    tradeoff: "Commissioner O'Brien voted NO, arguing the fund would be funded by fees that get passed to homebuyers - effectively a tax on new construction. The measure passed 3-2 without his support.",
    votes: { agree: 203, disagree: 741, notsure: 298 },
  },
];

// ─── TABS ────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  levels: ['Federal','State','Local'],
  types: ['vote','legislation','announcement','event'],
};

// Tracked post wrapper — fires onRead when scrolled into view
function TrackedPost({ post, onProfile, liked, onLike, onRead, pinned, onPin }) {
  const ref = useRef();
  const fired = useRef(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          onRead(post.id);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <PostCard post={post} onProfile={onProfile} liked={liked} onLike={onLike} pinned={pinned} onPin={onPin} />
    </div>
  );
}

function NewsCard({ item }) {
  return (
    <article className="news-card">
      <div className="news-top">
        <span className="news-outlet-icon">{item.outletIcon}</span>
        <span className="news-outlet-name" style={{ color: item.outletColor }}>{item.outlet}</span>
        <span className="news-topic-tag">{item.topic}</span>
        <span className="news-time">{item.time}</span>
      </div>
      <h3 className="news-headline">{item.headline}</h3>
      <p className="news-summary">{item.summary}</p>
      <div className="news-footer">
        <span className="news-related">🔗 {item.related}</span>
        <a href={item.url} target="_blank" rel="noreferrer" className="news-read-btn">Read →</a>
      </div>
    </article>
  );
}

function DecisionCard({ item }) {
  const [vote, setVote] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const votes = { ...item.votes };
  if (vote) votes[vote] += 1;
  const t = votes.support + votes.oppose + votes.more;
  const pct = (v) => Math.round((v / t) * 100);
  const meta = LEVEL_META[item.level] || LEVEL_META.Federal;
  const totalVotes = (t / 1000).toFixed(t >= 1000000 ? 1 : 0);
  const totalLabel = t >= 1000000 ? (t/1000000).toFixed(1)+'M' : t >= 1000 ? (t/1000).toFixed(0)+'K' : t;

  return (
    <article className="decision-card">
      {/* Level badge */}
      <div className="decision-level-row">
        <span className="decision-level-badge" style={{ background: meta.color + '22', color: meta.color, borderColor: meta.color + '44' }}>
          {meta.icon} {meta.label}
        </span>
        <span className="decision-eyebrow">⚖️ What's Being Decided</span>
      </div>

      <h3 className="decision-title">{item.title}</h3>
      <div className="decision-status-row">
        <span className="decision-status-dot" />
        <span className="decision-status">{item.status}</span>
      </div>

      {/* Plain English summary */}
      <p className="decision-plain">{item.plain}</p>

      {/* Why proposed */}
      <div className="decision-why">
        <span className="decision-why-label">💡 Why it's being proposed</span>
        <p className="decision-why-text">{item.why}</p>
      </div>

      {/* Pro / Con toggle */}
      <button className="decision-expand-btn" onClick={() => setExpanded(v => !v)}>
        {expanded ? '▲ Hide arguments' : '▼ See arguments for & against'}
      </button>

      {expanded && (
        <div className="decision-arguments">
          <div className="decision-arg-col decision-arg-pro">
            <div className="decision-arg-header">👍 Arguments For</div>
            {item.proPoints.map((p, i) => (
              <div key={i} className="decision-arg-point">
                <span className="decision-arg-dot decision-arg-dot-pro" />
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="decision-arg-col decision-arg-con">
            <div className="decision-arg-header">👎 Arguments Against</div>
            {item.conPoints.map((p, i) => (
              <div key={i} className="decision-arg-point">
                <span className="decision-arg-dot decision-arg-dot-con" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="decision-official-row">
        <span className="decision-official-label">Sponsored by</span>
        <strong className="decision-official-name"> {item.official.name}</strong>
      </div>

      {/* Poll */}
      {!vote ? (
        <div className="decision-poll">
          <div className="decision-poll-label">Where do you stand?</div>
          <div className="decision-poll-btns">
            <button className="dpoll-btn dpoll-support" onClick={() => setVote('support')}>👍 Support</button>
            <button className="dpoll-btn dpoll-oppose" onClick={() => setVote('oppose')}>👎 Oppose</button>
            <button className="dpoll-btn dpoll-more" onClick={() => setVote('more')}>❓ Need more info</button>
          </div>
        </div>
      ) : (
        <div className="decision-results">
          <div className="decision-results-header">
            <span className="decision-voted-msg">✓ Your voice counted</span>
            <span className="decision-total-votes">{totalLabel} total responses</span>
          </div>
          {[['support','Support','#16a34a'],['oppose','Oppose','#dc2626'],['more','Need more info','#d97706']].map(([k, label, color]) => (
            <div key={k} className="dr-row">
              <span className="dr-label" style={{ color }}>{label}</span>
              <div className="dr-bar-wrap">
                <div className="dr-bar" style={{ width: `${pct(votes[k])}%`, background: color }} />
              </div>
              <span className="dr-pct" style={{ color }}>{pct(votes[k])}%</span>
            </div>
          ))}
          <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="decision-source-link">Read full text →</a>
        </div>
      )}
    </article>
  );
}

// ─── VOTE FEED CARD ──────────────────────────────────────────────────────────

function VoteFeedCard({ item, onPollVote, hasVoted }) {
  const [userVote, setUserVote] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const official = OFFICIALS.find(o => o.id === item.officialId);
  if (!official) return null;

  const handleVote = (choice) => {
    if (userVote) return;
    setUserVote(choice);
    if (onPollVote) onPollVote(item.id, choice);
  };

  const catColor = { Budget:'#7c3aed', Environment:'#16a34a', 'Land Use':'#d97706', 'Public Safety':'#dc2626', Housing:'#0891b2' };
  const levelMeta = LEVEL_META[item.level] || LEVEL_META.Federal;

  const counts = { ...item.votes };
  if (userVote) counts[userVote] += 1;
  const total = counts.agree + counts.disagree + counts.notsure;
  const pct = (v) => Math.round((v / total) * 100);
  const totalLabel = total >= 1000 ? (total/1000).toFixed(1) + 'K' : total;

  const alignment = userVote === 'agree'
    ? { msg: `You agree with how ${official.name} voted`, color: '#16a34a' }
    : userVote === 'disagree'
    ? { msg: `You disagree with how ${official.name} voted`, color: '#dc2626' }
    : null;

  return (
    <article className="vfc-card">
      {/* Header */}
      <div className="vfc-header">
        <div className="vfc-badges">
          <span className="vfc-eyebrow">🗳️ Real Vote · Your Rep</span>
          <span className="vfc-level-badge" style={{ background: levelMeta.color + '22', color: levelMeta.color, borderColor: levelMeta.color + '44' }}>
            {levelMeta.icon} {levelMeta.label}
          </span>
        </div>
        <span className="vfc-date">{item.date}</span>
      </div>

      {/* Official row */}
      <div className="vfc-official-row">
        <OfficialAvatar official={official} size={38} radius={10} fontSize="1rem" />
        <div className="vfc-official-info">
          <span className="vfc-official-name">{official.name}</span>
          <span className="vfc-official-role">{official.title}</span>
        </div>
        <span className={`vfc-vote-badge ${item.vote === 'YES' ? 'vfc-yes' : 'vfc-no'}`}>
          {item.vote === 'YES' ? '✓ YES' : '✗ NO'}
        </span>
      </div>

      {/* Bill title */}
      <div className="vfc-bill-title">{item.bill}</div>
      <span className="vfc-category" style={{ color: catColor[item.category] || '#94a3b8' }}>
        {item.category} · {item.impact} impact
      </span>

      {/* What it is — always visible */}
      <div className="vfc-what-block">
        <div className="vfc-what-label">📋 What this vote was about</div>
        <p className="vfc-what-text">{item.what}</p>
      </div>

      {/* Expandable deeper context */}
      <button className="vfc-expand-btn" onClick={() => setExpanded(v => !v)}>
        {expanded ? '▲ Less detail' : '▼ Why it matters to you + trade-offs'}
      </button>

      {expanded && (
        <div className="vfc-expanded">
          <div className="vfc-context-block vfc-matters">
            <div className="vfc-context-label">📍 Why it matters to ZIP 32164</div>

            <p className="vfc-context-text">{item.whyItMatters}</p>
          </div>
          <div className="vfc-context-block vfc-tradeoff">
            <div className="vfc-context-label">⚖️ The trade-off</div>
            <p className="vfc-context-text">{item.tradeoff}</p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="vfc-divider" />

      {/* Poll */}
      <div className="vfc-poll-label">Do you agree with this vote?</div>

      {!userVote ? (
        <div className="vfc-poll-btns">
          <button className="vfc-poll-btn vfc-poll-agree" onClick={() => handleVote('agree')}>
            👍 Yes, I agree
          </button>
          <button className="vfc-poll-btn vfc-poll-disagree" onClick={() => handleVote('disagree')}>
            👎 No, I disagree
          </button>
          <button className="vfc-poll-btn vfc-poll-notsure" onClick={() => handleVote('notsure')}>
            ❓ Not sure
          </button>
        </div>
      ) : (
        <div className="vfc-results">
          {alignment && (
            <div className="vfc-alignment" style={{ color: alignment.color, borderColor: alignment.color + '33' }}>
              {alignment.msg}
            </div>
          )}
          {[['agree','Agree with vote','#16a34a'],['disagree','Disagree','#dc2626'],['notsure','Not sure','#d97706']].map(([k,label,color]) => (
            <div key={k} className="vfc-result-row">
              <span className="vfc-result-label" style={{ color }}>{label}</span>
              <div className="vfc-result-track">
                <div className="vfc-result-fill" style={{ width: pct(counts[k]) + '%', background: color }} />
              </div>
              <span className="vfc-result-pct" style={{ color }}>{pct(counts[k])}%</span>
            </div>
          ))}
          <div className="vfc-total">{totalLabel} constituents weighed in</div>
        </div>
      )}
    </article>
  );
}

function FeedTab({ zip, userName, onProfile, likes, onLike, onPostRead, remoteOfficials = [], followedLocations = [], onAddLocation, pollVotes = [], onPollVote, pinnedPosts = [], onPin, liveOfficials = [], liveFeedItems = [] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [showElection, setShowElection] = useState(null);

  const activeFilterCount = () => {
    let n = 0;
    if (filters.levels.length < 3) n++;
    if (filters.types.length < 4) n++;

    return n;
  };

  const filteredFeed = FEED_ALL.filter(post =>
    filters.levels.includes(post.official.level) &&
    filters.types.includes(post.type)
  );

  // Build remote posts from followed locations
  const remotePosts = remoteOfficials.flatMap(official =>
    (official.posts || []).map(post => ({ ...post, official, isRemote: true, remoteLocation: followedLocations.find(l => l.officials.some(o => o.id === official.id)) }))
  );

  const count = activeFilterCount();

  const decisionOrder = [
    'City','County','State','Federal','Presidential','Supreme',
    'City','County','State','Federal',
  ].map(lvl => DECISIONS.find(d => d.level === lvl)).filter(Boolean);

  const feedItems = [];
  let dIdx = 0, nIdx = 0, vIdx = 0, rIdx = 0;
  filteredFeed.forEach((post, i) => {
    feedItems.push({ kind:'post', data:post });

    // Inject a remote post every 5 local posts
    if ((i + 1) % 5 === 0 && rIdx < remotePosts.length) {
      feedItems.push({ kind:'remote', data:remotePosts[rIdx++] });
    }
    if ((i + 1) % 2 === 0 && vIdx < VOTE_FEED_CARDS.length) {
      feedItems.push({ kind:'vote', data:VOTE_FEED_CARDS[vIdx++] });
    }
    if ((i + 1) % 4 === 0 && dIdx < decisionOrder.length) {
      feedItems.push({ kind:'decision', data:decisionOrder[dIdx++] });
    }
    if ((i + 1) % 6 === 0 && nIdx < LOCAL_NEWS.length) {
      feedItems.push({ kind:'news', data:LOCAL_NEWS[nIdx++] });
    }
  });
  // Append any remaining remote posts at end
  while (rIdx < remotePosts.length) {
    feedItems.push({ kind:'remote', data:remotePosts[rIdx++] });
  }

  return (
    <div className="tab-content">
      {showFilter && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilter(false)} />}
      {showElection && <CandidateComparison race={showElection} onClose={() => setShowElection(null)} />}
      <div className="feed-topbar">
        <div>
          <h2 className="feed-heading">{userName ? `${userName}'s Feed` : 'Your Feed'}</h2>
          <p className="feed-subhead">
            📍 {zip}
            {followedLocations.length > 0 && followedLocations.map(l => (
              <span key={l.zip} className="feed-loc-tag"> · {l.city}, {l.state}</span>
            ))}
            {' · '}{(liveOfficials.length > 0 ? liveOfficials.length : OFFICIALS.length) + remoteOfficials.length} officials
          </p>
        </div>
        <button className={`filter-pill ${count > 0 ? 'filter-pill-active' : ''}`} onClick={() => setShowFilter(true)}>
          Filter {count > 0 ? `(${count})` : '▾'}
        </button>
      </div>

      {/* Election banners — shown near top of feed when races are within range */}
      {UPCOMING_RACES.filter(race => !race.zips || race.zips.includes(zip)).map(race => (
        <ElectionBanner key={race.id} race={race} onExpand={() => setShowElection(race)} />
      ))}

      {/* Live legislative activity from real officials */}
      {liveFeedItems.length > 0 && (
        <div className="live-feed-section">
          <div className="live-feed-header" style={{padding:'0.5rem 1rem', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em'}}>
            📋 Recent Legislative Activity
          </div>
          {liveFeedItems.slice(0, 10).map(item => (
            <div key={item.id} className="live-feed-card" style={{margin:'0.5rem 1rem', padding:'0.85rem', background:'var(--card)', borderRadius:'0.75rem', border:'1px solid var(--border)'}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:'0.5rem'}}>
                <span style={{fontSize:'1.1rem'}}>{item.item_type === 'vote' ? '🗳️' : '📜'}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.8rem', fontWeight:700, color:'var(--text-1)', lineHeight:1.3}}>{item.title}</div>
                  {item.description && <div style={{fontSize:'0.75rem', color:'var(--text-2)', marginTop:'0.25rem', lineHeight:1.4}}>{item.description.length > 120 ? item.description.slice(0,120) + '…' : item.description}</div>}
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.4rem'}}>
                    <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>{item.official_name}</span>
                    {item.bill_url && <a href={item.bill_url} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.7rem', color:'var(--accent)', textDecoration:'none'}}>View Bill →</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFeed.length === 0 ? (
        <div className="no-posts" style={{padding:'3rem 1rem'}}>No posts match your filters. <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{color:'var(--accent)',fontWeight:700}}>Reset</button></div>
      ) : feedItems.map((item, i) => {
        if (item.kind === 'news') return <NewsCard key={item.data.id} item={item.data} />;
        if (item.kind === 'decision') return <DecisionCard key={item.data.id} item={item.data} />;
        if (item.kind === 'vote') return <VoteFeedCard key={item.data.id} item={item.data} onPollVote={onPollVote} hasVoted={pollVotes.some(v => v.pollId === item.data.id)} />;
        if (item.kind === 'remote') {
          const post = item.data;
          const loc = post.remoteLocation;
          return (
            <div key={post.id} className="remote-post-card">
              <div className="remote-post-loc-tag">
                <span className="remote-post-loc-dot" />
                {loc ? loc.displayName : 'Followed location'}
              </div>
              <TrackedPost post={post} onProfile={onProfile} liked={likes.includes(post.id)} onLike={onLike} onRead={onPostRead} pinned={pinnedPosts.some(p => p.id === post.id)} onPin={onPin} />
            </div>
          );
        }
        return <TrackedPost key={item.data.id} post={item.data} onProfile={onProfile} liked={likes.includes(item.data.id)} onLike={onLike} onRead={onPostRead} pinned={pinnedPosts.some(p => p.id === item.data.id)} onPin={onPin} />;
      })}
    </div>
  );
}

const ZIP_DEMOGRAPHICS = {
  zip: '32164',
  city: 'Palm Coast',
  county: 'Flagler County',
  population: 57420,
  medianAge: 47.2,
  medianIncome: 62400,
  medianHomeValue: 298500,
  homeOwnership: 82,
  collegeGrad: 28,
  unemployment: 3.8,
  race: [
    { label: 'White', pct: 74 },
    { label: 'Hispanic', pct: 11 },
    { label: 'Black', pct: 8 },
    { label: 'Asian', pct: 3 },
    { label: 'Other', pct: 4 },
  ],
  voters: [
    { label: 'Republican', pct: 44, color: '#dc2626' },
    { label: 'Democrat', pct: 29, color: '#2563eb' },
    { label: 'No Party', pct: 27, color: '#94a3b8' },
  ],
  turnout: 68,
  govMakeup: { federal:'R', state:'R', local:'Mixed' },
};

function DemographicsPanel() {
  const d = ZIP_DEMOGRAPHICS;
  return (
    <div className="demo-panel">
      <div className="demo-header">
        <div>
          <div className="demo-zip-title">ZIP {d.zip} — {d.city}</div>
          <div className="demo-county">{d.county}, Florida</div>
        </div>
        <div className="demo-pop">{d.population.toLocaleString()} residents</div>
      </div>

      <div className="demo-stats-grid">
        {[
          { label:'Median Age', value: d.medianAge + ' yrs' },
          { label:'Median Income', value: '$' + (d.medianIncome/1000).toFixed(0) + 'K' },
          { label:'Home Value', value: '$' + (d.medianHomeValue/1000).toFixed(0) + 'K' },
          { label:'Home Ownership', value: d.homeOwnership + '%' },
          { label:'College Grad', value: d.collegeGrad + '%' },
          { label:'Unemployment', value: d.unemployment + '%' },
        ].map(s => (
          <div key={s.label} className="demo-stat-box">
            <span className="demo-stat-val">{s.value}</span>
            <span className="demo-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="demo-section-title">Voter Registration</div>
      <div className="demo-bars">
        {d.voters.map(v => (
          <div key={v.label} className="demo-bar-row">
            <span className="demo-bar-label">{v.label}</span>
            <div className="demo-bar-track">
              <div className="demo-bar-fill" style={{ width:`${v.pct}%`, background:v.color }} />
            </div>
            <span className="demo-bar-pct" style={{ color:v.color }}>{v.pct}%</span>
          </div>
        ))}
        <div className="demo-turnout">Last election turnout: <strong>{d.turnout}%</strong></div>
      </div>

      <div className="demo-section-title">Race & Ethnicity</div>
      <div className="demo-race-bars">
        {d.race.map(r => (
          <div key={r.label} className="demo-bar-row">
            <span className="demo-bar-label">{r.label}</span>
            <div className="demo-bar-track">
              <div className="demo-bar-fill" style={{ width:`${r.pct}%`, background:'#0891b2' }} />
            </div>
            <span className="demo-bar-pct" style={{ color:'#0891b2' }}>{r.pct}%</span>
          </div>
        ))}
      </div>

      <div className="demo-gov-makeup">
        <div className="demo-section-title">Government Makeup</div>
        <div className="demo-gov-row">
          {[['Federal','R'],['State','R'],['Local','Mixed']].map(([lvl,party]) => (
            <div key={lvl} className="demo-gov-box">
              <span className="demo-gov-level">{lvl}</span>
              <span className="demo-gov-party" style={{ color: party==='R'?'#dc2626':party==='D'?'#2563eb':'#d97706' }}>{party}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WHAT DO COMMISSIONERS DO ────────────────────────────────────────────────

function CommissionerRoleCard({ onClose }) {
  const r = COMMISSIONER_DATA.role_explainer;
  return (
    <div className="role-card">
      <div className="role-card-header">
        <div>
          <div className="role-card-title">{r.title}</div>
          <div className="role-card-sub">Flagler County, Florida</div>
        </div>
        <button className="role-close-btn" onClick={onClose}>✕</button>
      </div>
      <p className="role-summary">{r.summary}</p>
      <div className="role-powers-grid">
        {r.powers.map((p, i) => (
          <div key={i} className="role-power-item">
            <span className="role-power-icon">{p.icon}</span>
            <div>
              <div className="role-power-label">{p.label}</div>
              <div className="role-power-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="role-meeting-row">
        <span className="role-meeting-icon">📅</span>
        <span className="role-meeting-text">{r.meetingSchedule}</span>
        <a href={r.watchLive} target="_blank" rel="noreferrer" className="role-watch-btn">Watch Live →</a>
      </div>
    </div>
  );
}

// ─── COMMISSION OVERVIEW ──────────────────────────────────────────────────────

function CommissionOverview() {
  const c = COMMISSIONER_DATA.commission;
  const fmt = (n) => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : '$' + (n/1000).toFixed(0) + 'K';
  const [expandedDecision, setExpandedDecision] = useState(null);

  const impactColors = {
    Budget: { bg: '#7c3aed22', color: '#a78bfa' },
    Environment: { bg: '#16a34a22', color: '#4ade80' },
    'Public Safety': { bg: '#dc262622', color: '#f87171' },
    'Land Use': { bg: '#d9770622', color: '#fbbf24' },
  };

  return (
    <div className="commission-overview">
      <div className="co-header">
        <div className="co-title-block">
          <div className="co-title">Flagler County Commission</div>
          <div className="co-sub">Board Overview · FY2026</div>
        </div>
        <div className="co-budget-badge">
          <span className="co-budget-num">{fmt(c.fy2026Budget)}</span>
          <span className="co-budget-label">Annual Budget</span>
        </div>
      </div>

      <div className="co-stats-row">
        {[
          { val: c.propertyTaxRate + ' mills', label: 'Property Tax Rate', sub: '▼ ' + Math.abs(c.propertyTaxRateChange) + ' from prior year', good: true },
          { val: '$' + c.budgetPerResident.toLocaleString(), label: 'Budget Per Resident', sub: 'Per year' },
          { val: c.unanimousPct + '%', label: 'Unanimous Votes', sub: c.splitVotes + ' split votes this year', good: c.unanimousPct > 75 },
          { val: c.avgAttendance + '%', label: 'Avg Attendance', sub: c.votesThisYear + ' votes cast', good: c.avgAttendance > 90 },
        ].map((s, i) => (
          <div key={i} className="co-stat">
            <span className="co-stat-val" style={{ color: s.good === false ? '#dc2626' : s.good === true ? '#16a34a' : 'var(--accent)' }}>{s.val}</span>
            <span className="co-stat-label">{s.label}</span>
            {s.sub && <span className="co-stat-sub">{s.sub}</span>}
          </div>
        ))}
      </div>

      <div className="co-section-title">Where Your Tax Dollars Go</div>
      <div className="co-budget-bars">
        {c.topSpendingCategories.map((cat, i) => (
          <div key={i} className="co-budget-row">
            <span className="co-budget-cat">{cat.label}</span>
            <div className="co-budget-track">
              <div className="co-budget-fill" style={{ width: cat.pct + '%', background: cat.color }} />
            </div>
            <span className="co-budget-pct" style={{ color: cat.color }}>{cat.pct}%</span>
            <span className="co-budget-amt">{fmt(cat.amount)}</span>
          </div>
        ))}
      </div>

      {/* Clickable recent decisions */}
      <div className="co-section-title">Recent Decisions <span className="co-tap-hint">Tap to expand</span></div>
      <div className="co-decisions">
        {c.recentDecisions.map((d, i) => {
          const ic = impactColors[d.impact] || { bg: '#0891b222', color: '#38bdf8' };
          const isOpen = expandedDecision === i;
          return (
            <div key={i} className={`co-decision-card ${isOpen ? 'co-decision-card-open' : ''}`}>
              {/* Clickable header row */}
              <button className="co-decision-row co-decision-clickable" onClick={() => setExpandedDecision(isOpen ? null : i)}>
                <div className="co-decision-info">
                  <span className="co-decision-title">{d.title}</span>
                  <span className="co-decision-impact" style={{ background: ic.bg, color: ic.color }}>{d.impact}</span>
                </div>
                <div className="co-decision-meta">
                  <span className={`co-decision-outcome ${d.outcome === '5-0' ? 'co-unanimous' : d.outcome === '3-2' ? 'co-split' : ''}`}>{d.outcome}</span>
                  <span className="co-decision-date">{d.date}</span>
                  <span className="co-decision-expand-arrow">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="co-decision-detail">
                  {/* What it was */}
                  <div className="co-detail-block co-detail-what">
                    <div className="co-detail-label">📋 What was decided</div>
                    <p className="co-detail-text">{d.what}</p>
                  </div>

                  {/* Why it matters */}
                  <div className="co-detail-block co-detail-matters">
                    <div className="co-detail-label">📍 Why it matters to you</div>
                    <p className="co-detail-text">{d.whyItMatters}</p>
                  </div>

                  {/* How they voted */}
                  <div className="co-detail-label co-voted-label">🗳️ How each commissioner voted</div>
                  <div className="co-voted-list">
                    {d.howTheyVoted.map((v, j) => (
                      <div key={j} className="co-voted-row">
                        <span className={`co-voted-badge ${v.vote === 'YES' ? 'co-voted-yes' : 'co-voted-no'}`}>{v.vote}</span>
                        <div className="co-voted-info">
                          <span className="co-voted-name">{v.name}</span>
                          <span className="co-voted-note">{v.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fiscal impact */}
                  <div className="co-detail-block co-detail-fiscal">
                    <div className="co-detail-label">💰 Fiscal impact</div>
                    <p className="co-detail-text">{d.fiscalImpact}</p>
                  </div>

                  <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="co-detail-source-link">
                    View official record →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="co-next-meeting">
        📅 Next meeting: <strong>{c.nextMeeting}</strong> · <a href="https://www.flaglercounty.gov" target="_blank" rel="noreferrer" className="co-attend-link">How to attend or comment →</a>
      </div>
    </div>
  );
}

// ─── VOTE POLL DRAWER ────────────────────────────────────────────────────────

function VotePollDrawer({ vote, official, onClose }) {
  const [userVote, setUserVote] = useState(null);
  const catColor = { Budget:'#7c3aed', Environment:'#16a34a', 'Land Use':'#d97706', 'Public Safety':'#dc2626', Housing:'#0891b2' };

  // Look up full context from VOTE_FEED_CARDS if available
  const fullCard = VOTE_FEED_CARDS.find(c =>
    c.officialId === official.id && c.bill === vote.bill
  );

  const seed = vote.vote === 'YES'
    ? { agree: 58, disagree: 24, notsure: 18 }
    : { agree: 31, disagree: 49, notsure: 20 };
  // Use real vote counts if available
  const baseCounts = fullCard ? { ...fullCard.votes } : { ...seed };

  const counts = { ...baseCounts };
  if (userVote) counts[userVote] += 1;
  const total = counts.agree + counts.disagree + counts.notsure;
  const pct = (v) => Math.round((v / total) * 100);
  const totalLabel = total >= 1000 ? (total/1000).toFixed(1) + 'K' : total;

  const alignment = userVote === 'agree'
    ? { msg: `You agree with how ${official.name} voted`, color: '#16a34a', icon: '✓' }
    : userVote === 'disagree'
    ? { msg: `You disagree with how ${official.name} voted`, color: '#dc2626', icon: '✗' }
    : null;

  return (
    <div className="vpd-overlay" onClick={onClose}>
      <div className="vpd-drawer" onClick={e => e.stopPropagation()}>
        <div className="vpd-handle" />

        {/* Scrollable content area */}
        <div className="vpd-scroll">

          {/* Official + vote badge */}
          <div className="vpd-rep-vote">
            <OfficialAvatar official={official} size={36} radius={10} fontSize="1rem" />
            <div className="vpd-rep-info">
              <span className="vpd-rep-name">{official.name}</span>
              <span className="vpd-rep-voted">voted</span>
              <span className={`vpd-rep-badge ${vote.vote === 'YES' ? 'vpd-yes' : 'vpd-no'}`}>{vote.vote}</span>
            </div>
            <span className="vpd-vote-date">{vote.date}</span>
          </div>

          {/* Bill title + category */}
          <div className="vpd-bill-block">
            <div className="vpd-bill-name">{vote.bill}</div>
            <div className="vpd-bill-meta">
              <span className="vpd-bill-cat" style={{ color: catColor[vote.category] || '#94a3b8' }}>{vote.category}</span>
              <span className="vpd-bill-impact">· {vote.impact} impact</span>
            </div>
          </div>

          {/* ── Full context — always shown before the poll ── */}
          {fullCard ? (
            <div className="vpd-context-section">
              {/* What it was */}
              <div className="vpd-ctx-block vpd-ctx-what">
                <div className="vpd-ctx-label">📋 What this vote was about</div>
                <p className="vpd-ctx-text">{fullCard.what}</p>
              </div>

              {/* Why it matters */}
              <div className="vpd-ctx-block vpd-ctx-matters">
                 <div className="vfc-context-label">📍 Why it matters to ZIP 32164</div>
                <p className="vpd-ctx-text">{fullCard.whyItMatters}</p>
              </div>

              {/* Trade-off */}
              <div className="vpd-ctx-block vpd-ctx-tradeoff">
                <div className="vpd-ctx-label">⚖️ The trade-off</div>
                <p className="vpd-ctx-text">{fullCard.tradeoff}</p>
              </div>
            </div>
          ) : (
            /* Fallback for votes not in VOTE_FEED_CARDS */
            <div className="vpd-ctx-block vpd-ctx-what" style={{marginBottom:'0.85rem'}}>
              <div className="vpd-ctx-label">ℹ️ About this vote</div>
              <p className="vpd-ctx-text">
                {official.name} voted {vote.vote} on {vote.bill} in {vote.date}.
                This was classified as a {vote.impact.toLowerCase()} impact {vote.category.toLowerCase()} decision.
                More context will be added as public records are verified.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="vpd-ctx-divider" />

          {/* Poll question */}
          <div className="vpd-poll-label">Now that you know the details — do you agree with this vote?</div>

          {!userVote ? (
            <div className="vpd-poll-btns">
              <button className="vpd-btn vpd-agree" onClick={() => setUserVote('agree')}>
                <span className="vpd-btn-icon">👍</span>
                <span>Yes, I agree</span>
              </button>
              <button className="vpd-btn vpd-disagree" onClick={() => setUserVote('disagree')}>
                <span className="vpd-btn-icon">👎</span>
                <span>No, I disagree</span>
              </button>
              <button className="vpd-btn vpd-notsure" onClick={() => setUserVote('notsure')}>
                <span className="vpd-btn-icon">❓</span>
                <span>Not sure yet</span>
              </button>
            </div>
          ) : (
            <div className="vpd-results">
              {alignment && (
                <div className="vpd-alignment-msg" style={{ color: alignment.color, borderColor: alignment.color + '33' }}>
                  <span>{alignment.icon}</span> {alignment.msg}
                </div>
              )}
              {[['agree','Constituents agree','#16a34a'],['disagree','Constituents disagree','#dc2626'],['notsure','Not sure','#d97706']].map(([k,label,color]) => (
                <div key={k} className="vpd-result-row">
                  <span className="vpd-result-label" style={{ color }}>{label}</span>
                  <div className="vpd-result-track">
                    <div className="vpd-result-fill" style={{ width: pct(counts[k]) + '%', background: color }} />
                  </div>
                  <span className="vpd-result-pct" style={{ color }}>{pct(counts[k])}%</span>
                </div>
              ))}
              <div className="vpd-total-note">{totalLabel} constituents responded</div>
            </div>
          )}
        </div>{/* end vpd-scroll */}

        <button className="vpd-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ─── INDIVIDUAL COMMISSIONER SCORECARD ───────────────────────────────────────

function CommissionerScorecard({ officialId }) {
  const d = COMMISSIONER_DATA.commissioners[officialId];
  const official = OFFICIALS.find(o => o.id === officialId);
  const [showVotes, setShowVotes] = useState(false);
  const [activeVotePoll, setActiveVotePoll] = useState(null);
  if (!d || !official) return null;

  const catColor = { Budget:'#7c3aed', Environment:'#16a34a', 'Land Use':'#d97706', 'Public Safety':'#dc2626', Housing:'#0891b2' };
  const scoreColor = (n) => n >= 80 ? '#16a34a' : n >= 65 ? '#d97706' : '#dc2626';

  return (
    <div className="scorecard">
      {/* Score disclaimer */}
      <div className="sc-disclaimer">
        ⚠️ Scores are beta estimates based on available public records. Not independently verified.
      </div>

      {activeVotePoll && (
        <VotePollDrawer vote={activeVotePoll} official={official} onClose={() => setActiveVotePoll(null)} />
      )}

      {/* Header */}
      <div className="sc-header">
        <OfficialAvatar official={official} size={52} radius={14} fontSize="1.4rem" />
        <div className="sc-header-info">
          <div className="sc-name">{official.name}</div>
          <div className="sc-role">{d.district} · Term ends {d.termEnd}</div>
          <div className="sc-next-election">Next election: {d.nextElection}</div>
        </div>
      </div>

      {/* Score breakdown legend */}
      <div className="sc-score-legend">
        <div className="sc-legend-item"><span className="sc-legend-dot" style={{background:'#7c3aed'}} />Civic Score = attendance + votes + bills introduced</div>
        <div className="sc-legend-item"><span className="sc-legend-dot" style={{background:'#0891b2'}} />Transparency = public disclosures + records compliance</div>
        <div className="sc-legend-item"><span className="sc-legend-dot" style={{background:'#16a34a'}} />Responsiveness = constituent contact + community presence</div>
      </div>

      {/* Three score meters */}
      <div className="sc-scores-row">
        {[
          { label: 'Civic Score',     val: d.civicScore },
          { label: 'Transparency',    val: d.transparencyScore },
          { label: 'Responsiveness',  val: d.responsiveScore },
        ].map((s, i) => (
          <div key={i} className="sc-score-box">
            <svg viewBox="0 0 40 40" className="sc-ring-svg">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
              <circle cx="20" cy="20" r="16" fill="none" stroke={scoreColor(s.val)} strokeWidth="4"
                strokeDasharray={`${(s.val/100)*100.5} 100.5`}
                strokeLinecap="round"
                transform="rotate(-90 20 20)"
              />
              <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={scoreColor(s.val)}>{s.val}</text>
            </svg>
            <span className="sc-score-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick metrics */}
      <div className="sc-metrics-grid">
        {[
          { val: d.metrics.attendanceRate + '%',              label: 'Meeting Attendance' },
          { val: d.metrics.voteParticipation + '%',           label: 'Vote Participation' },
          { val: d.metrics.legislationIntroduced,             label: 'Bills Introduced' },
          { val: d.metrics.constituentResponseDays + ' days', label: 'Avg Response Time' },
        ].map((m, i) => (
          <div key={i} className="sc-metric-box">
            <span className="sc-metric-val">{m.val}</span>
            <span className="sc-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Key positions */}
      <div className="sc-section-title">Key Positions</div>
      <div className="sc-positions">
        {d.keyPositions.map((p, i) => (
          <div key={i} className="sc-position-pill">✓ {p}</div>
        ))}
      </div>

      {/* Committee roles */}
      <div className="sc-section-title">Committee Roles</div>
      <div className="sc-committees">
        {d.committeeRoles.map((r, i) => <div key={i} className="sc-committee-item">🏛️ {r}</div>)}
      </div>

      {/* Voting record toggle */}
      <button className="sc-votes-toggle" onClick={() => setShowVotes(v => !v)}>
        {showVotes ? '▲ Hide' : '▼ Show'} Voting Record ({d.votingRecord.length} votes)
      </button>

      {showVotes && (
        <div className="sc-votes-list">
          <div className="sc-votes-hint">Tap any vote to see what your neighbors think</div>
          {d.votingRecord.map((v, i) => (
            <button key={i} className="sc-vote-row sc-vote-clickable" onClick={() => setActiveVotePoll(v)}>
              <span className={`sc-vote-badge ${v.vote === 'YES' ? 'sc-vote-yes' : 'sc-vote-no'}`}>{v.vote}</span>
              <div className="sc-vote-info">
                <span className="sc-vote-bill">{v.bill}</span>
                <div className="sc-vote-meta">
                  <span className="sc-vote-cat" style={{ color: catColor[v.category] || '#94a3b8' }}>{v.category}</span>
                  <span className="sc-vote-date">{v.date}</span>
                  <span className="sc-vote-impact" style={{ opacity: v.impact==='Critical'?1:v.impact==='High'?0.85:0.65 }}>● {v.impact}</span>
                </div>
              </div>
              <span className="sc-vote-poll-cta">Poll →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExploreTab({ onProfile, liveOfficials = [], zip = '' }) {
  const FLAGLER_ZIPS = ['32110','32136','32137','32164'];
  const LOCAL_COVERED_ZIPS = new Set([
    // Flagler
    '32110','32136','32137','32164',
    // Hillsborough/Tampa
    '33601','33602','33603','33604','33605','33606','33607','33609','33610','33611','33612','33613','33614','33615','33616','33617','33618','33619','33621','33629','33634','33635','33637','33647',
    // Miami-Dade
    '33101','33125','33126','33127','33128','33129','33130','33131','33132','33133','33134','33135','33136','33137','33138','33139','33140','33141','33142','33143','33144','33145','33146','33147','33149','33150','33155','33156','33157','33158','33160','33161','33162','33165','33166','33167','33168','33169','33170',
    // Broward
    '33301','33304','33305','33306','33308','33309','33310','33311','33312','33313','33314','33315','33316','33317','33319','33321','33322','33323','33324','33325','33326','33328','33334',
    // Palm Beach
    '33401','33403','33404','33405','33406','33407','33408','33409','33410','33411','33412','33413','33414','33415','33417','33418','33426','33428','33431','33432','33433','33434','33435','33436','33437','33444','33445','33446','33458','33460','33461','33462','33463','33467','33480','33483','33484','33486','33487','33496','33498',
    // Duval/Jacksonville
    '32099','32201','32202','32204','32205','32206','32207','32208','32209','32210','32211','32216','32217','32218','32219','32220','32221','32222','32223','32224','32225','32226','32244','32246','32250','32254','32256','32257','32258','32266','32277',
    // Orange/Orlando
    '32801','32803','32804','32805','32806','32807','32808','32809','32810','32811','32812','32814','32817','32818','32819','32821','32822','32824','32825','32826','32827','32828','32829','32831','32835','32836','32837','32839',
    // Pinellas
    '33701','33702','33703','33704','33705','33706','33707','33708','33709','33710','33711','33712','33713','33714','33715','33716','33755','33756','33759','33760','33761','33762','33763','33764','33765','33767',
    // Polk
    '33801','33803','33805','33809','33810','33811','33812','33813','33815','33823','33825','33827','33830','33837','33838','33839','33841','33843','33844','33849','33850','33851','33853','33859','33860','33868','33880','33881','33884',
    // Brevard
    '32901','32903','32904','32905','32907','32908','32909','32920','32922','32925','32926','32927','32931','32934','32935','32937','32940','32948','32949','32950','32951','32952','32953','32955','32958','32959','32976',
    // Volusia
    '32114','32117','32118','32119','32124','32127','32128','32129','32130','32132','32141','32168','32169','32174','32176','32180','32190','32198',
  ]);
  const isLocalDataAvailable = LOCAL_COVERED_ZIPS.has(zip) || liveOfficials.some(o => o.level === 'Local' || o.level === 'local');
  const [showDemo, setShowDemo] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [expandedScorecard, setExpandedScorecard] = useState(null);
  const [collapsedLevels, setCollapsedLevels] = useState([]);
  const [collapsedSubLevels, setCollapsedSubLevels] = useState([]);
  const [showCityRole, setShowCityRole] = useState(false);
  const [showCityOverview, setShowCityOverview] = useState(false);
  const [expandedCityScorecard, setExpandedCityScorecard] = useState(null);
  const [showSBRole, setShowSBRole] = useState(false);
  const [showSBOverview, setShowSBOverview] = useState(false);
  const [expandedSBScorecard, setExpandedSBScorecard] = useState(null);

  const commissionerIds = [6, 13];
  const cityCouncilIds = [7, 15, 30, 31, 32];
  const schoolBoardIds = [16, 22, 23, 24, 25];
const getBranch = (o) => {
 const t = (o.title || '').toLowerCase();

// Judicial - must check title only, not name (avoid catching "Justice, James C.")
if (t.includes('judge') || t.includes('court') || t === 'justice')
  return 'Judicial';

// Executive - only real executive titles
if (t.includes('president') || t.includes('governor') ||
    t.includes('attorney general') || t.includes('lt. governor') ||
    t.includes('secretary of state') || t.includes('chief financial officer'))
  return 'Executive';

// Legislative - everything else
return 'Legislative';
};

const getLevel = (o) => {
  const l = (o.level || '').toLowerCase();
  if (l === 'federal') return 'Federal';
  if (l === 'state') return 'State';
  return 'Local';
};

const toggleSubLevel = (branch, level) => {
  const key = `${branch}-${level}`;
  setCollapsedSubLevels(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
};
  return (
    <div className="tab-content">
      <div className="exp-top-row">
        <div>
          <h2 className="section-head">Your Representatives</h2>
          <p className="section-sub">Everyone elected to serve your community</p>
        </div>
        <button className={`demo-toggle-btn ${showDemo ? 'active':''}`} onClick={() => setShowDemo(v=>!v)}>
          {showDemo ? 'Hide' : '📊 ZIP Stats'}
        </button>
      </div>

      {showDemo && <DemographicsPanel />}

      {['Executive','Legislative','Judicial'].map(branch => {
// Normalize 'Last, First' to 'First Last' for name matching
const normalizeName = (name) => {
  if (!name) return '';
  const n = name.trim();
  if (n.includes(',')) {
    const [last, first] = n.split(',').map(s => s.trim());
    return `${first} ${last}`.toLowerCase();
  }
  return n.toLowerCase();
};

// Always include executive officials - they represent everyone, not ZIP-specific
const executiveOfficials = OFFICIALS.filter(o => getBranch(o) === 'Executive');

const mergedOfficials = liveOfficials.length > 0
  ? [
      ...executiveOfficials,
      ...liveOfficials
        .filter(o => getBranch(o) !== 'Executive')
        .map(live => {
          const liveNorm = normalizeName(live.name);
          const mock = OFFICIALS.find(m => normalizeName(m.name) === liveNorm);
          return mock ? { ...live, approval: mock.approval, followers: mock.followers, bio: mock.bio, posts: mock.posts, image: live.image || mock.image } : live;
        })
    ]
  : OFFICIALS;
const group = mergedOfficials.filter(o => getBranch(o) === branch);
        if (branch === 'Judicial' && group.length === 0) return null;
        const isCollapsed = collapsedLevels.includes(branch);
        const levelIcons = { Executive: '⚡', Legislative: '🏛️', Judicial: '⚖️' };
        const subLevelIcons = { Federal: '🇺🇸', State: '🌴', Local: '📍' };
        const subLevels = ['Federal', 'State', 'Local'];
        return (
          <div key={branch} className="exp-group">
            <button className="exp-level-header" onClick={() => setCollapsedLevels(prev => isCollapsed ? prev.filter(l=>l!==branch) : [...prev, branch])}>
              <span className="exp-level-label">{levelIcons[branch]} {branch}</span>
              <span className="exp-level-count">{group.length} officials</span>
              <span className="exp-level-chevron">{isCollapsed ? '▼' : '▲'}</span>
            </button>
            {isCollapsed ? null : <>
            {subLevels.map(subLevel => {
              const subKey = `${branch}-${subLevel}`;
              const isSubCollapsed = collapsedSubLevels.includes(subKey);
              const subGroup = group.filter(o => getLevel(o) === subLevel);
              // For Local under Legislative, count board members too
              const localBoardCount = subLevel === 'Local' && branch === 'Legislative'
                ? commissionerIds.length + cityCouncilIds.length + schoolBoardIds.length
                : 0;
              const totalSubCount = subGroup.filter(o => !commissionerIds.includes(o.id) && !cityCouncilIds.includes(o.id) && !schoolBoardIds.includes(o.id)).length + localBoardCount;
              if (totalSubCount === 0) return null;
              return (
                <div key={subLevel} style={{marginBottom:0}}>
                  <button onClick={() => toggleSubLevel(branch, subLevel)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 14px',background:'#f1f5f9',border:'none',borderTop:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',cursor:'pointer',textAlign:'left'}}>
                    <span style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',letterSpacing:'0.07em',textTransform:'uppercase'}}>{subLevelIcons[subLevel]} {subLevel}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{background:'#e2e8f0',borderRadius:10,padding:'1px 7px',fontSize:'0.68rem',fontWeight:600,color:'#64748b'}}>{totalSubCount}</span>
                      <span style={{color:'#94a3b8',fontSize:'0.65rem'}}>{isSubCollapsed ? '▼' : '▲'}</span>
                    </div>
                  </button>
                  {isSubCollapsed ? null : <>

            {/* Commission panel injected under Local */}
            {branch === 'Legislative' && subLevel === 'Local' && (
              isLocalDataAvailable ? (
              <div className="commission-section">
                <div className="commission-intro-row">
                  <div className="commission-intro-text">
                    <span className="commission-intro-title">🏛️ County Commission</span>
                    <span className="commission-intro-sub">5-member board · Meets bi-monthly</span>
                  </div>
                  <div className="commission-intro-btns">
                    <button className={`commission-pill-btn ${showRole?'active':''}`} onClick={() => setShowRole(v=>!v)}>
                      {showRole ? 'Hide' : '❓ What do they do?'}
                    </button>
                    <button className={`commission-pill-btn ${showCommission?'active':''}`} onClick={() => setShowCommission(v=>!v)}>
                      {showCommission ? 'Hide' : '📊 Full Board Metrics'}
                    </button>
                  </div>
                </div>

                {showRole && <CommissionerRoleCard onClose={() => setShowRole(false)} />}
                {showCommission && <CommissionOverview />}

                <div className="commission-members-label">Individual Scorecards</div>
                {commissionerIds.map(id => {
                  const o = OFFICIALS.find(off => off.id === id);
                  if (!o) return null;
                  const isOpen = expandedScorecard === id;
                  return (
                    <div key={id} className="commissioner-row">
                      <button className="exp-card" onClick={() => onProfile(o)}>
                        <OfficialAvatar official={o} size={44} radius={12} />
                        <div className="exp-info">
                          <div className="exp-name">{o.name} <span style={{ color: partyColor(o.party), fontSize:'0.7rem', fontWeight:800 }}>{o.party}</span></div>
                          <div className="exp-role">{o.title}</div>
                        </div>
                        <div className="exp-stats">
                          
                        </div>
                        <span className="exp-chevron">›</span>
                      </button>
                      <button className={`scorecard-toggle-btn ${isOpen?'active':''}`}
                        onClick={() => setExpandedScorecard(isOpen ? null : id)}>
                        {isOpen ? '▲ Hide scorecard' : '📋 View scorecard'}
                      </button>
                      {isOpen && <CommissionerScorecard officialId={id} />}
                    </div>
                  );
                })}
              </div>
              ) : (
              <div className="commission-section" style={{padding:'1rem', textAlign:'center', color:'#94a3b8'}}>
                <p style={{margin:0}}>🔜 Local officials data coming soon for this area.</p>
              </div>
              )
            )}

            {/* City Council section under Local */}
            {branch === 'Legislative' && subLevel === 'Local' && isLocalDataAvailable && (
              <div className="commission-section" style={{ marginTop: '0.75rem' }}>
                <div className="commission-intro-row">
                  <div className="commission-intro-text">
                    <span className="commission-intro-title">🏙️ City Council</span>
                    <span className="commission-intro-sub">5-member board · Meets every Tuesday</span>
                  </div>
                  <div className="commission-intro-btns">
                    <button className={`commission-pill-btn ${showCityRole?'active':''}`} onClick={() => setShowCityRole(v=>!v)}>
                      {showCityRole ? 'Hide' : '❓ What do they do?'}
                    </button>
                    <button className={`commission-pill-btn ${showCityOverview?'active':''}`} onClick={() => setShowCityOverview(v=>!v)}>
                      {showCityOverview ? 'Hide' : '📊 Board Overview'}
                    </button>
                  </div>
                </div>
                {showCityRole && <CityCouncilRoleCard onClose={() => setShowCityRole(false)} />}
                {showCityOverview && <CityCouncilOverview />}
                <div className="commission-members-label">Individual Scorecards</div>
                {cityCouncilIds.map(id => {
                  const o = OFFICIALS.find(off => off.id === id);
                  if (!o) return null;
                  const isOpen = expandedCityScorecard === id;
                  return (
                    <div key={id} className="commissioner-row">
                      <button className="exp-card" onClick={() => onProfile(o)}>
                        <OfficialAvatar official={o} size={44} radius={12} />
                        <div className="exp-info">
                          <div className="exp-name">{o.name} <span style={{ color: partyColor(o.party), fontSize:'0.7rem', fontWeight:800 }}>{o.party}</span></div>
                          <div className="exp-role">{o.title}</div>
                        </div>
                        <div className="exp-stats">
                          
                        </div>
                        <span className="exp-chevron">›</span>
                      </button>
                      <button className={`scorecard-toggle-btn ${isOpen?'active':''}`}
                        onClick={() => setExpandedCityScorecard(isOpen ? null : id)}>
                        {isOpen ? '▲ Hide scorecard' : '📋 View scorecard'}
                      </button>
                      {isOpen && <CityCouncilScorecard officialId={id} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* School Board section under Local */}
            {branch === 'Legislative' && subLevel === 'Local' && isLocalDataAvailable && (
              <div className="commission-section" style={{ marginTop: '0.75rem' }}>
                <div className="commission-intro-row">
                  <div className="commission-intro-text">
                    <span className="commission-intro-title">🎓 School Board</span>
                    <span className="commission-intro-sub">5-member board · Meets monthly · 13,200 students</span>
                  </div>
                  <div className="commission-intro-btns">
                    <button className={`commission-pill-btn ${showSBRole?'active':''}`} onClick={() => setShowSBRole(v=>!v)}>
                      {showSBRole ? 'Hide' : '❓ What do they do?'}
                    </button>
                    <button className={`commission-pill-btn ${showSBOverview?'active':''}`} onClick={() => setShowSBOverview(v=>!v)}>
                      {showSBOverview ? 'Hide' : '📊 Board Overview'}
                    </button>
                  </div>
                </div>
                {showSBRole && <SchoolBoardRoleCard onClose={() => setShowSBRole(false)} />}
                {showSBOverview && <SchoolBoardOverview />}
                <div className="commission-members-label">Individual Scorecards</div>
                {schoolBoardIds.map(id => {
                  const o = OFFICIALS.find(off => off.id === id);
                  if (!o) return null;
                  const isOpen = expandedSBScorecard === id;
                  const isVacant = o.name.includes('Vacant');
                  return (
                    <div key={id} className="commissioner-row">
                      <button className="exp-card" onClick={() => !isVacant && onProfile(o)
                        || isVacant && null} style={isVacant?{cursor:'default',opacity:0.6}:{}}>
                        <OfficialAvatar official={o} size={44} radius={12} />
                        <div className="exp-info">
                          <div className="exp-name">{o.name}</div>
                          <div className="exp-role">{o.title}</div>
                        </div>
                        {!isVacant && (
                          <div className="exp-stats">
                            
                          </div>
                        )}
                        <span className="exp-chevron">{isVacant ? '' : '›'}</span>
                      </button>
                      {!isVacant && SCHOOL_BOARD_DATA.members[id] && (
                        <>
                          <button className={`scorecard-toggle-btn ${isOpen?'active':''}`}
                            onClick={() => setExpandedSBScorecard(isOpen ? null : id)}>
                            {isOpen ? '▲ Hide scorecard' : '📋 View scorecard'}
                          </button>
                          {isOpen && <SchoolBoardScorecard officialId={id} />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {subGroup.filter(o => !commissionerIds.includes(o.id) && !cityCouncilIds.includes(o.id) && !schoolBoardIds.includes(o.id)).map(o => (
              <button key={o.id || o.name} className="exp-card" onClick={() => onProfile(o)}>
                <OfficialAvatar official={o} size={44} radius={12} />
                <div className="exp-info">
                  <div className="exp-name">{o.name} <span style={{ color: partyColor(o.party), fontSize:'0.7rem', fontWeight:800 }}>{o.party}</span></div>
                  <div className="exp-role">{o.title}</div>
                </div>
                <div className="exp-stats">
                </div>
                <span className="exp-chevron">›</span>
              </button>
            ))}
                  </>}
                </div>
              );
            })}
            </>}
          </div>
        );
      })}
    </div>
  );
}

function NotificationsTab({ onProfile, readNotifIds = [], onReadNotif }) {
  const NOTIF_DATA = [
    { id:1, type:'announcement', text:'posted a new announcement about Palm Coast traffic calming results', time:'8m ago', officialIdx:6, postId:701, unread:true },
    { id:2, type:'legislation',  text:'introduced the CLEAR LABELS Act requiring country-of-origin on prescription drugs', time:'2h ago', officialIdx:1, postId:201, unread:true },
    { id:3, type:'vote',         text:'voted YES on the Border Security Supplemental Act', time:'1d ago', officialIdx:0, postId:101, unread:false },
    { id:4, type:'event',        text:'scheduled a Town Hall at Flagler County Library — March 12, 6pm', time:'2d ago', officialIdx:4, postId:501, unread:false },
    { id:5, type:'legislation',  text:'introduced the TSP Fiduciary Security Act to protect federal retirement funds', time:'2d ago', officialIdx:2, postId:301, unread:false },
    { id:6, type:'announcement', text:'Florida welcomed 143.3 million visitors in 2025 — a new all-time record', time:'3d ago', officialIdx:3, postId:401, unread:false },
  ];

  const typeColors = { announcement:'#0891b2', legislation:'#7c3aed', vote:'#16a34a', event:'#d97706' };
  const typeLabels = { announcement:'Announcement', legislation:'Legislation', vote:'Vote', event:'Event' };

  const notifs = NOTIF_DATA.map(n => ({
    ...n,
    official: OFFICIALS[n.officialIdx],
    unread: n.unread && !readNotifIds.includes(n.id),
  }));

  const unreadCount = notifs.filter(n => n.unread).length;

  const handleClick = (n) => {
    if (onReadNotif) onReadNotif(n.id);
    if (onProfile) onProfile(n.official);
  };

  return (
    <div className="tab-content">
      <div className="activity-header">
        <h2 className="section-head">Activity</h2>
        {unreadCount > 0 && <span className="activity-badge">{unreadCount} new</span>}
      </div>
      <p className="section-sub">Tap any item to view the post</p>
      <div className="notif-list">
        {notifs.map(n => (
          <button key={n.id} className={`notif-row notif-row-btn ${n.unread ? 'notif-unread' : ''}`} onClick={() => handleClick(n)}>
            <div className="notif-avatar-wrap">
              <OfficialAvatar official={n.official} size={44} radius={13} fontSize="1.2rem" />
              <span className="notif-type-dot" style={{ background: typeColors[n.type] }}></span>
            </div>
            <div className="notif-body">
              <p className="notif-text">
                <strong>{n.official.name}</strong>
                <span className="notif-type-label" style={{ color: typeColors[n.type] }}> {typeLabels[n.type]}</span>
              </p>
              <p className="notif-detail">{n.text}</p>
              <span className="notif-time">{n.time}</span>
            </div>
            <div className="notif-right">
              {n.unread && <div className="notif-pip" />}
              <span className="notif-chevron">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TYPOLOGY QUIZ ────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  { id:1, question: "When your neighborhood has a problem, what's the best first step?", options: [
    { text: "Neighbors organize and solve it together", score: { community:2 } },
    { text: "Local government should step in quickly", score: { government:2, community:1 } },
    { text: "Each household handles their own part", score: { individual:2 } },
    { text: "Bring in outside experts or nonprofits", score: { pragmatist:2 } },
  ]},
  { id:2, question: "Which feels most important when evaluating a new policy?", options: [
    { text: "Does it protect individual rights?", score: { individual:2 } },
    { text: "Does it help the most vulnerable?", score: { community:2 } },
    { text: "Is it fiscally responsible?", score: { conservative:2 } },
    { text: "Is it backed by data and research?", score: { pragmatist:2 } },
  ]},
  { id:3, question: "How do you feel about your local neighborhood changing rapidly?", options: [
    { text: "Excited — growth brings opportunity", score: { progressive:2 } },
    { text: "Cautious — change should be planned carefully", score: { pragmatist:2 } },
    { text: "Concerned — we should preserve what works", score: { conservative:2 } },
    { text: "Depends on who benefits from the change", score: { community:2 } },
  ]},
  { id:4, question: "When you read local news, what topics grab you most?", options: [
    { text: "Public safety and crime", score: { conservative:2 } },
    { text: "Schools and youth programs", score: { community:2 } },
    { text: "Business and economic development", score: { individual:2 } },
    { text: "Environment and infrastructure", score: { progressive:2 } },
  ]},
  { id:5, question: "If the city needed to cut the budget, what's most acceptable?", options: [
    { text: "Reduce administrative overhead first", score: { conservative:2 } },
    { text: "Cut equally across all departments", score: { pragmatist:2 } },
    { text: "Protect social services, cut elsewhere", score: { community:2 } },
    { text: "Raise revenue instead of cutting services", score: { progressive:2 } },
  ]},
  { id:6, question: "What best describes how you make big personal decisions?", options: [
    { text: "I rely on my values and instincts", score: { conservative:2 } },
    { text: "I research and weigh the data", score: { pragmatist:2 } },
    { text: "I consult family and community", score: { community:2 } },
    { text: "I think about long-term societal impact", score: { progressive:2 } },
  ]},
  { id:7, question: "What role should government play in daily life?", options: [
    { text: "Minimal — people should govern themselves", score: { individual:2 } },
    { text: "A safety net for those who need it", score: { community:2 } },
    { text: "Active partner in improving quality of life", score: { progressive:2 } },
    { text: "Efficient and practical — no more, no less", score: { pragmatist:2 } },
  ]},
  { id:8, question: "What do you think causes most community problems?", options: [
    { text: "Lack of personal responsibility", score: { individual:2, conservative:1 } },
    { text: "Systemic inequality and lack of access", score: { progressive:2, community:1 } },
    { text: "Government inefficiency and waste", score: { conservative:2, individual:1 } },
    { text: "Poor planning and short-term thinking", score: { pragmatist:2 } },
  ]},
];

const TYPOLOGIES = [
  { key: "Faith & Flag Conservative", desc: "You believe strongly in tradition, personal responsibility, and limited government. Faith and community values guide your worldview.", dominants: ["conservative","individual"], threshold: 7, color: "#dc2626", icon: "🇺🇸" },
  { key: "Populist Right", desc: "You're skeptical of institutions and elites. You prioritize working-class concerns and American sovereignty.", dominants: ["conservative","individual"], threshold: 4, color: "#b91c1c", icon: "🏭" },
  { key: "Independent Pragmatist", desc: "You cut through partisan noise. You judge policies on outcomes, not ideology — willing to work across party lines.", dominants: ["pragmatist"], threshold: 3, color: "#7c3aed", icon: "⚖️" },
  { key: "Moderate", desc: "You see value on both sides of the aisle. You prefer compromise and stability over ideological purity.", dominants: ["pragmatist","community"], threshold: 3, color: "#0891b2", icon: "🤝" },
  { key: "Community Democrat", desc: "You believe strong communities require collective investment. You support public programs, local institutions, and civic engagement.", dominants: ["community","progressive"], threshold: 4, color: "#2563eb", icon: "🏘️" },
  { key: "Progressive", desc: "You believe in bold systemic change. You push for equity, environmental protection, and expanding access to opportunity.", dominants: ["progressive"], threshold: 4, color: "#0f766e", icon: "🌱" },
];

function scoreToTypology(scores) {
  const dims = ['conservative','individual','community','progressive','pragmatist'];
  const total = dims.reduce((s,k) => s + (scores[k]||0), 0) || 1;
  // normalize to 0-100
  const pct = {};
  dims.forEach(k => { pct[k] = Math.round(((scores[k]||0)/total)*100); });

  // Each typology gets a similarity score based on how well the user's profile matches
  const profiles = [
    { typology: TYPOLOGIES[0], weights: { conservative:40, individual:40, community:5,  progressive:5,  pragmatist:10 } }, // Faith & Flag
    { typology: TYPOLOGIES[1], weights: { conservative:45, individual:35, community:5,  progressive:5,  pragmatist:10 } }, // Populist Right
    { typology: TYPOLOGIES[2], weights: { conservative:10, individual:15, community:15, progressive:10, pragmatist:50 } }, // Independent Pragmatist
    { typology: TYPOLOGIES[3], weights: { conservative:15, individual:10, community:35, progressive:20, pragmatist:20 } }, // Moderate
    { typology: TYPOLOGIES[4], weights: { conservative:5,  individual:5,  community:45, progressive:35, pragmatist:10 } }, // Community Democrat
    { typology: TYPOLOGIES[5], weights: { conservative:5,  individual:5,  community:25, progressive:55, pragmatist:10 } }, // Progressive
  ];

  // Score each typology by dot product of user pct vs typology weight profile
  let best = profiles[0], bestScore = -1;
  for (const p of profiles) {
    const sim = dims.reduce((s,k) => s + (pct[k] * p.weights[k]), 0);
    if (sim > bestScore) { bestScore = sim; best = p; }
  }
  return best.typology;
}

function TypologyQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ conservative:0, individual:0, community:0, progressive:0, pragmatist:0, government:0 });
  const [selected, setSelected] = useState(null);
  const q = QUIZ_QUESTIONS[step];
  const total = QUIZ_QUESTIONS.length;

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt.text);
    const ns = { ...scores };
    Object.entries(opt.score).forEach(([k,v]) => { ns[k] = (ns[k]||0)+v; });
    setTimeout(() => {
      if (step + 1 < total) { setScores(ns); setStep(step+1); setSelected(null); }
      else { onComplete(scoreToTypology(ns), ns); }
    }, 350);
  };

  return (
    <div className="quiz-screen">
      <div className="quiz-top">
        <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width:`${(step/total)*100}%` }} /></div>
        <div className="quiz-step-label">Question {step+1} of {total}</div>
      </div>
      <h2 className="quiz-question">{q.question}</h2>
      <div className="quiz-options">
        {q.options.map(opt => (
          <button key={opt.text} className={`quiz-option ${selected===opt.text?'quiz-option-selected':''}`} onClick={() => choose(opt)}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const DIMENSION_LABELS = {
  conservative: { label: 'Traditional', color: '#dc2626' },
  individual:   { label: 'Individual', color: '#d97706' },
  community:    { label: 'Community', color: '#2563eb' },
  progressive:  { label: 'Progressive', color: '#0f766e' },
  pragmatist:   { label: 'Pragmatist', color: '#7c3aed' },
};

function DimensionBars({ scores }) {
  const dims = Object.entries(DIMENSION_LABELS);
  const maxScore = Math.max(...dims.map(([k]) => scores[k] || 0), 1);
  return (
    <div className="dim-bars">
      <div className="dim-bars-title">Your Dimension Scores</div>
      {dims.map(([key, { label, color }]) => {
        const val = scores[key] || 0;
        const pct = Math.round((val / (QUIZ_QUESTIONS.length * 2)) * 100);
        return (
          <div key={key} className="dim-bar-row">
            <span className="dim-bar-label">{label}</span>
            <div className="dim-bar-track">
              <div className="dim-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="dim-bar-pct" style={{ color }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function MyProfileTab({ zip, userName, userPhoto, onPhotoChange, postsRead, likes, followedLocations = [], onManageLocations, pollVotesCount = 0, pinnedPosts = [], onUnpin, onLogout }) {
  const fileRef = useRef();
  const [showQuiz, setShowQuiz] = useState(false);
  const [typology, setTypology] = useState(null);
  const [rawScores, setRawScores] = useState(null);
  const [lang, setLang] = useState('en');

  // ── Civic Engagement Badge ────────────────────────────────────────────────
  const CIVIC_BADGES = [
    { min: 0,  max: 0,  icon: '🌱', label: 'New Voter',      color: '#64748b', desc: 'Just getting started. Cast your first poll vote to level up.' },
    { min: 1,  max: 2,  icon: '🗳️', label: 'Poll Voter',     color: '#0891b2', desc: 'You\'re weighing in on how your reps vote. Keep going.' },
    { min: 3,  max: 5,  icon: '📣', label: 'Civic Voice',    color: '#7c3aed', desc: 'You\'ve voted on 3+ polls. Your opinions are being counted.' },
    { min: 6,  max: 9,  icon: '🏛️', label: 'Active Citizen', color: '#d97706', desc: 'Consistently engaged. You know what your reps are doing.' },
    { min: 10, max: 14, icon: '⚡', label: 'Civic Champion', color: '#16a34a', desc: 'Top-tier engagement. You\'re more informed than most voters.' },
    { min: 15, max: Infinity, icon: '🦅', label: 'Democracy Defender', color: '#dc2626', desc: 'Elite civic participation. You set the standard.' },
  ];
  const badge = CIVIC_BADGES.slice().reverse().find(b => pollVotesCount >= b.min) || CIVIC_BADGES[0];
  const nextBadge = CIVIC_BADGES.find(b => b.min > pollVotesCount);
  const progressToNext = nextBadge ? Math.min(100, ((pollVotesCount - badge.min) / (nextBadge.min - badge.min)) * 100) : 100;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onPhotoChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  if (showQuiz) return <TypologyQuiz onComplete={(t, scores) => { setTypology(t); setRawScores(scores); setShowQuiz(false); }} />;

  const stats = [
    { n: OFFICIALS.length, l: 'Officials in Feed' },
    { n: likes.length, l: 'Posts Liked' },
    { n: likes.filter(id => { const post = FEED_ALL.find(p=>p.id===id); return post && post.type==='legislation'; }).length, l: 'Bills Tracked' },
    { n: OFFICIALS.filter(o=>o.level==='Local').length, l: 'Local Officials' },
  ];

  const LANGS = [
    { code:'en', label:'English' },
    { code:'es', label:'Español' },
    { code:'ht', label:'Kreyòl' },
    { code:'pt', label:'Português' },
  ];

  return (
    <div className="tab-content">
      <div className="myp-header">
        <div className="myp-avatar-wrap" onClick={() => fileRef.current.click()}>
          {userPhoto ? <img src={userPhoto} alt="You" className="myp-avatar-img" /> : <div className="myp-avatar">👤</div>}
          <div className="myp-avatar-edit">📷</div>
          {/* Badge icon on avatar */}
          <div className="myp-avatar-badge" style={{ background: badge.color }} title={badge.label}>
            {badge.icon}
          </div>
        </div>
        <h2 className="myp-name">{userName || 'Your Profile'}</h2>

        {/* Inline civic rank pill under name */}
        <div className="myp-rank-pill" style={{ borderColor: badge.color + '55', background: badge.color + '15' }}>
          <span className="myp-rank-icon">{badge.icon}</span>
          <span className="myp-rank-label" style={{ color: badge.color }}>{badge.label}</span>
          <span className="myp-rank-count">{pollVotesCount} poll{pollVotesCount !== 1 ? 's' : ''}</span>
        </div>

        <p className="myp-zip">
          📍 ZIP {zip}
          {followedLocations.length > 0 && <span className="myp-also-following"> + {followedLocations.length} more location{followedLocations.length > 1 ? 's' : ''}</span>}
        </p>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
      </div>


      {/* Followed locations — dynamic card layout */}
      <div className="myp-locations-section">
        <div className="myp-locations-header">
          <div className="myp-locations-title">🌐 Locations Following</div>
          <button className="myp-locations-manage" onClick={onManageLocations}>+ Add</button>
        </div>
        <div className="myp-loc-cards">
          {/* Home card */}
          <div className="myp-loc-card myp-loc-card-home">
            <div className="myp-loc-card-top">
              <span className="myp-loc-card-flag">🏠</span>
              <span className="myp-loc-card-home-tag">Home</span>
            </div>
            <div className="myp-loc-card-city">{LOCATION_DB[zip]?.city || 'Your City'}</div>
            <div className="myp-loc-card-state">{LOCATION_DB[zip]?.state || 'FL'} · {zip}</div>
            <div className="myp-loc-card-count">{OFFICIALS.length} officials</div>
          </div>

          {/* Followed location cards */}
          {followedLocations.map(loc => (
            <div key={loc.zip} className="myp-loc-card">
              <div className="myp-loc-card-top">
                <span className="myp-loc-card-flag">📍</span>
              </div>
              <div className="myp-loc-card-city">{loc.city}</div>
              <div className="myp-loc-card-state">{loc.state} · {loc.zip}</div>
              <div className="myp-loc-card-count">{loc.officials.length} official{loc.officials.length !== 1 ? 's' : ''}</div>
            </div>
          ))}

          {/* Add location card */}
          <button className="myp-loc-card myp-loc-card-add" onClick={onManageLocations}>
            <span className="myp-loc-add-plus">+</span>
            <span className="myp-loc-add-label">Add Location</span>
          </button>
        </div>
      </div>


      <div className="lang-selector-compact">
        <span className="lang-globe">🌐</span>
        <select className="lang-dropdown" value={lang} onChange={e => setLang(e.target.value)}>
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      {typology ? (
        <div className="typology-card" style={{ borderLeft:`4px solid ${typology.color}` }}>
          <div className="typo-badge">Your Political Typology</div>
          <div className="typo-icon-row"><span className="typo-icon">{typology.icon}</span><div className="typo-type">{typology.key}</div></div>
          <p className="typo-desc">{typology.desc}</p>
          {rawScores && <DimensionBars scores={rawScores} />}
          <button className="retake-btn" style={{marginTop:'1rem'}} onClick={() => setShowQuiz(true)}>Retake Assessment →</button>
        </div>
      ) : (
        <div className="typology-card typology-cta">
          <div className="typo-badge">Political Typology</div>
          <div className="typo-type" style={{fontSize:'0.95rem',color:'#94a3b8',fontWeight:600}}>Not yet assessed</div>
          <p className="typo-desc">Take our 8-question quiz — no party questions, just how you think about your community.</p>
          <button className="retake-btn quiz-start-btn" onClick={() => setShowQuiz(true)}>Take the Quiz →</button>
        </div>
      )}

      <div className="myp-grid">
        {stats.map(({n,l}) => (
          <div key={l} className="myp-stat">
            <span className="myp-num">{n}</span>
            <span className="myp-label">{l}</span>
          </div>
        ))}
      </div>

      {/* ── Civic Engagement Badge ──────────────────────────────────────── */}
      <div className="civic-badge-card" style={{ borderColor: badge.color + '44', background: badge.color + '0d' }}>
        <div className="civic-badge-header">
          <div className="civic-badge-icon-wrap" style={{ background: badge.color + '22', border: `2px solid ${badge.color}55` }}>
            <span className="civic-badge-icon">{badge.icon}</span>
          </div>
          <div className="civic-badge-info">
            <div className="civic-badge-label">Civic Engagement</div>
            <div className="civic-badge-title" style={{ color: badge.color }}>{badge.label}</div>
          </div>
          <div className="civic-badge-count-wrap">
            <span className="civic-badge-count" style={{ color: badge.color }}>{pollVotesCount}</span>
            <span className="civic-badge-count-sub">polls voted</span>
          </div>
        </div>

        <p className="civic-badge-desc">{badge.desc}</p>

        {/* Progress bar to next badge */}
        {nextBadge ? (
          <div className="civic-badge-progress-wrap">
            <div className="civic-badge-progress-track">
              <div className="civic-badge-progress-fill" style={{ width: progressToNext + '%', background: badge.color }} />
            </div>
            <div className="civic-badge-progress-label">
              <span>{pollVotesCount} voted</span>
              <span>{nextBadge.icon} {nextBadge.label} at {nextBadge.min}</span>
            </div>
          </div>
        ) : (
          <div className="civic-badge-maxed">🦅 Maximum civic rank achieved</div>
        )}

        {/* Badge ladder — all levels */}
        <div className="civic-badge-ladder">
          {CIVIC_BADGES.map((b, i) => {
            const earned = pollVotesCount >= b.min;
            const isCurrent = badge.label === b.label;
            return (
              <div key={i} className={`civic-ladder-step ${earned ? 'civic-ladder-earned' : ''} ${isCurrent ? 'civic-ladder-current' : ''}`}>
                <span className="civic-ladder-icon" style={{ opacity: earned ? 1 : 0.3 }}>{b.icon}</span>
                <span className="civic-ladder-name" style={{ color: isCurrent ? b.color : earned ? 'var(--text-2)' : '#475569' }}>{b.label}</span>
                <span className="civic-ladder-min" style={{ opacity: earned ? 0.7 : 0.35 }}>{b.min === 0 ? 'Start' : b.min + '+'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pinned Posts ────────────────────────────────────────────────── */}
      {pinnedPosts.length > 0 && (
        <div className="pinned-posts-section">
          <div className="pinned-posts-header">
            <span className="pinned-posts-title">📌 Pinned Posts</span>
            <span className="pinned-posts-count">{pinnedPosts.length}</span>
          </div>
          <div className="pinned-posts-list">
            {pinnedPosts.map(post => (
              <div key={post.id} className="pinned-post-row">
                <div className="pinned-post-meta">
                  <span className="pinned-post-avatar">{post.official?.avatar || '👤'}</span>
                  <div className="pinned-post-info">
                    <span className="pinned-post-name">{post.official?.name}</span>
                    <span className="pinned-post-role">{typeIcon(post.type)} {typeLabel(post.type)} · {post.time}</span>
                  </div>
                  <button className="pinned-post-remove" onClick={() => onUnpin && onUnpin(post.id)} title="Unpin">📌</button>
                </div>
                <p className="pinned-post-text">{post.text.length > 120 ? post.text.slice(0, 120) + '…' : post.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <VoterResourcesPanel zip={zip} />

      <div className="myp-level-breakdown">
        <div className="myp-breakdown-title">Your Representatives by Level</div>
        {['Federal','State','Local'].map(level => {
          const count = OFFICIALS.filter(o=>o.level===level).length;
          return (
            <div key={level} className="myp-breakdown-row">
              <span className="myp-breakdown-level">{level}</span>
              <div className="myp-breakdown-bar-wrap"><div className="myp-breakdown-bar" style={{width:`${(count/OFFICIALS.length)*100}%`}} /></div>
              <span className="myp-breakdown-count">{count}</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          padding: '0.85rem',
          marginTop: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(220,38,38,0.3)',
          background: 'rgba(220,38,38,0.08)',
          color: '#dc2626',
          fontWeight: '600',
          fontSize: '0.95rem',
          cursor: 'pointer',
        }}
      >
        Log Out
      </button>
    </div>
  );
}

function VoterResourcesPanel({ zip }) {
  const [expanded, setExpanded] = useState(null);

  const resources = [
    {
      id: 'register',
      icon: '📋',
      title: 'Register to Vote',
      status: 'Required before you can vote',
      color: '#16a34a',
      summary: 'You must be registered before Election Day. Registration is free and takes about 5 minutes online.',
      steps: [
        'U.S. citizen and Florida resident',
        'At least 18 years old by Election Day',
        'Not adjudicated mentally incapacitated',
        'Not convicted of a felony (or rights restored)',
      ],
      links: [
        { label: 'Register online — Florida', url: 'https://registertovoteflorida.gov', official: true },
        { label: 'Register at any Florida DMV', url: 'https://www.flhsmv.gov', official: true },
        { label: 'Vote.gov (national resource)', url: 'https://vote.gov', official: true },
      ],
      deadline: 'Florida deadline: 29 days before each election',
    },
    {
      id: 'check',
      icon: '🔍',
      title: 'Check Your Registration',
      status: 'Confirm your status before voting',
      color: '#0891b2',
      summary: 'Moved recently? Name changed? Always verify your registration is current and your address is up to date before an election.',
      steps: [
        'Verify your name and address are correct',
        'Confirm your assigned polling location',
        'Check your party registration (for primaries)',
        'Re-register if you moved within Florida',
      ],
      links: [
        { label: 'Check FL registration status', url: 'https://registration.elections.myflorida.com/CheckVoterStatus', official: true },
        { label: 'Flagler County Supervisor of Elections', url: 'https://www.flaglerelections.com', official: true },
      ],
      deadline: 'Check at least 2 weeks before Election Day',
    },
    {
      id: 'polling',
      icon: '🏛️',
      title: 'Find Your Polling Place',
      status: 'Your location may change each election',
      color: '#7c3aed',
      summary: 'Polling locations are assigned by precinct and can change between elections. Always confirm your location before Election Day.',
      steps: [
        'Find your precinct number on your voter card',
        'Confirm your polling place address',
        'Check early voting site locations and hours',
        'Know your poll hours: Florida polls open 7am–7pm',
      ],
      links: [
        { label: 'Flagler County polling locations', url: 'https://www.flaglerelections.com/polling-locations', official: true },
        { label: 'Florida early voting info', url: 'https://dos.fl.gov/elections/for-voters/voting/early-voting/', official: true },
      ],
      deadline: 'Early voting typically runs 10 days before Election Day',
    },
    {
      id: 'mail',
      icon: '✉️',
      title: 'Vote by Mail',
      status: 'Available to all registered Florida voters',
      color: '#d97706',
      summary: 'Any registered Florida voter can request a mail ballot — no excuse required. Ballots can be returned by mail, drop box, or in person at the Supervisor of Elections office.',
      steps: [
        'Request your ballot at least 7 days before election',
        'Sign the outer envelope — signature must match registration',
        'Return by 7pm on Election Day (postmark not enough)',
        'Track your ballot online after mailing',
      ],
      links: [
        { label: 'Request mail ballot — Flagler County', url: 'https://www.flaglerelections.com/vote-by-mail', official: true },
        { label: 'Track your mail ballot', url: 'https://www.flaglerelections.com/vote-by-mail', official: true },
      ],
      deadline: 'Request deadline: 7 days before election',
    },
    {
      id: 'id',
      icon: '🪪',
      title: 'Accepted Voter ID',
      status: 'Required at the polls in Florida',
      color: '#dc2626',
      summary: 'Florida requires photo ID at the polls. If you do not have a qualifying ID, you can cast a provisional ballot and present ID within 2 days.',
      steps: [
        'Florida driver license or ID card',
        'U.S. passport',
        'Military ID',
        'Student ID (with photo and signature)',
        'Neighborhood association ID or employer ID (with photo)',
      ],
      links: [
        { label: 'Florida voter ID requirements', url: 'https://dos.fl.gov/elections/for-voters/voter-id/', official: true },
        { label: 'Get a free Florida ID card', url: 'https://www.flhsmv.gov/driver-licenses-id-cards/identification-cards/', official: true },
      ],
      deadline: 'No ID? You have 2 days after election to provide it',
    },
  ];

  const upcomingElections = [
    { name: 'Flagler County Municipal Elections', date: 'March 2026', type: 'Local', note: 'City Council and special district races' },
    { name: 'Florida Primary Election', date: 'August 2026', type: 'State/Federal', note: 'Congressional, state legislative primaries' },
    { name: 'General Election', date: 'November 3, 2026', type: 'All levels', note: 'All federal, state, and local races on one ballot' },
  ];

  return (
    <div className="voter-panel">
      <div className="voter-panel-header">
        <div className="voter-panel-title">🗳️ Voter Resources</div>
        <div className="voter-panel-sub">Official information only · Nonpartisan · ZIP {zip}</div>
      </div>

      {/* Upcoming elections */}
      <div className="voter-elections">
        <div className="voter-section-label">Upcoming Elections</div>
        {upcomingElections.map((e, i) => (
          <div key={i} className="voter-election-row">
            <div className="voter-election-info">
              <span className="voter-election-name">{e.name}</span>
              <span className="voter-election-note">{e.note}</span>
            </div>
            <div className="voter-election-right">
              <span className="voter-election-date">{e.date}</span>
              <span className="voter-election-type">{e.type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resource cards */}
      <div className="voter-section-label" style={{marginTop:'0.75rem'}}>What You Need to Know</div>
      <div className="voter-resources">
        {resources.map(r => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className={`voter-resource-card ${isOpen ? 'voter-resource-open' : ''}`} style={{ borderLeftColor: r.color }}>
              <button className="voter-resource-header" onClick={() => setExpanded(isOpen ? null : r.id)}>
                <span className="voter-resource-icon" style={{ background: r.color + '18' }}>{r.icon}</span>
                <div className="voter-resource-meta">
                  <span className="voter-resource-title">{r.title}</span>
                  <span className="voter-resource-status" style={{ color: r.color }}>{r.status}</span>
                </div>
                <span className="voter-resource-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="voter-resource-body">
                  <p className="voter-resource-summary">{r.summary}</p>

                  <div className="voter-resource-steps">
                    {r.steps.map((s, i) => (
                      <div key={i} className="voter-step-row">
                        <span className="voter-step-dot" style={{ background: r.color }} />
                        <span className="voter-step-text">{s}</span>
                      </div>
                    ))}
                  </div>

                  {r.deadline && (
                    <div className="voter-deadline" style={{ borderColor: r.color + '44', color: r.color }}>
                      ⏰ {r.deadline}
                    </div>
                  )}

                  <div className="voter-links">
                    {r.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="voter-link">
                        <span className="voter-link-label">{l.label}</span>
                        {l.official && <span className="voter-link-official">Official ↗</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="voter-disclaimer">
        All information sourced from Florida Division of Elections and Flagler County Supervisor of Elections official websites. PolitiCard does not endorse any candidate, party, or ballot position. Deadlines may vary — always verify with your county supervisor of elections.
      </p>
    </div>
  );
}

// ─── BUDGET DATA ─────────────────────────────────────────────────────────────

// Status badge colors
const PROJECT_STATUS_COLORS = {
  'Active':      { bg: 'rgba(22,163,74,0.12)',   color: '#4ade80' },
  'Completed':   { bg: 'rgba(8,145,178,0.12)',   color: '#38bdf8' },
  'Planned':     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  'Bid Phase':   { bg: 'rgba(124,58,237,0.12)',  color: '#a78bfa' },
  'On Hold':     { bg: 'rgba(220,38,38,0.12)',   color: '#f87171' },
  'Design':      { bg: 'rgba(15,118,110,0.12)',  color: '#2dd4bf' },
};

const BUDGETS = {
  // Palm Coast — Mayor Norris (id: 7) + all council members share same city budget
  7: {
    fiscalYear: 'FY 2025–2026',
    total: 290.4,
    prevTotal: 271.8,
    propertyTaxRate: 4.6871,
    surplus: 8.2,
    source: 'City of Palm Coast Adopted Budget FY2025-26',
    sourceUrl: 'https://www.palmcoast.gov/departments/finance/budget',
    // Year-over-year history (3 years)
    yearHistory: [
      { year: 'FY2023-24', total: 254.1, change: null },
      { year: 'FY2024-25', total: 271.8, change: +6.9 },
      { year: 'FY2025-26', total: 290.4, change: +6.8, current: true },
    ],
    // Approved vs actual spend for prior fiscal year (FY2024-25)
    priorYearComparison: {
      label: 'FY2024-25 Approved vs Actual',
      note: 'Actuals are estimated from quarterly financial reports. Final CAFR pending.',
      categories: [
        { name: 'Public Safety',         approved: 58.4,  actual: 57.9,  variance: -0.9 },
        { name: 'Infrastructure & Roads', approved: 51.2,  actual: 48.6,  variance: -5.1 },
        { name: 'Utilities',              approved: 45.8,  actual: 44.2,  variance: -3.5 },
        { name: 'Parks & Recreation',     approved: 21.4,  actual: 20.8,  variance: -2.8 },
        { name: 'General Government',     approved: 36.6,  actual: 37.1,  variance: +1.4 },
        { name: 'Community Development',  approved: 29.8,  actual: 31.0,  variance: +4.0 },
        { name: 'Debt Service',           approved: 19.4,  actual: 19.4,  variance:  0.0 },
        { name: 'Other',                  approved: 9.2,   actual: 12.8,  variance: +39.1 },
      ],
    },
    // Revenue sources — where the money comes from
    revenueSources: [
      { label: 'Utility Rates & Fees',       pct: 33, amount: 95.8,  color: '#0891b2', icon: '💧', note: 'Water, wastewater, and stormwater rates paid by all connected properties' },
      { label: 'Property Taxes',              pct: 30, amount: 87.1,  color: '#dc2626', icon: '🏠', note: 'Ad valorem tax at $4.6871 per $1,000 of assessed value. Set annually by City Council' },
      { label: 'State Shared Revenue',        pct: 17, amount: 49.4,  color: '#7c3aed', icon: '🏛️', note: 'Sales tax revenue sharing, gas tax, state revenue-sharing formula distributions' },
      { label: 'Permits, Fees & Charges',     pct: 8,  amount: 23.2,  color: '#16a34a', icon: '📋', note: 'Building permits, impact fees, recreation fees, code enforcement fines' },
      { label: 'Federal & State Grants',      pct: 6,  amount: 17.4,  color: '#d97706', icon: '🤝', note: 'CDBG, FDOT LAP grants, DEP grants, FEMA reimbursements' },
      { label: 'Intergovernmental & Other',   pct: 6,  amount: 17.5,  color: '#64748b', icon: '📌', note: 'CRA tax increment, interest earnings, miscellaneous revenues' },
    ],
    categories: [
      { name: 'Public Safety', amount: 62.1, color: '#dc2626', icon: '🚔',
        projects: [
          { name: 'Police Department Operations', amount: 38.4, status: 'Active', contractor: 'City of Palm Coast', note: 'Salaries, equipment, vehicles for 142 sworn officers' },
          { name: 'Fire/EMS Contract — Flagler County', amount: 14.2, status: 'Active', contractor: 'Flagler County Sheriff / FCFR', note: 'Annual interlocal agreement for fire and EMS coverage citywide' },
          { name: 'Emergency Management', amount: 2.8, status: 'Active', contractor: 'City Operations', note: 'Hurricane preparedness, EOC operations, CERT training' },
          { name: 'Code Enforcement Division', amount: 4.1, status: 'Active', contractor: 'City Operations', note: '14 inspectors, property maintenance and zoning compliance' },
          { name: 'Public Safety Technology Upgrades', amount: 2.6, status: 'Active', contractor: 'Various', note: 'Body cameras, CAD system, license plate readers' },
        ]
      },
      { name: 'Infrastructure & Roads', amount: 54.8, color: '#d97706', icon: '🛣️',
        projects: [
          { name: 'Belle Terre Pkwy Resurfacing Phase 3', amount: 2.1, status: 'Active', contractor: 'APAC-Southeast Inc.', note: 'SR 100 to Town Center Blvd. Milling and resurfacing 2.4 lane miles' },
          { name: 'Palm Harbor Pkwy Drainage Improvements', amount: 0.89, status: 'Active', contractor: 'Southeast Contracting', note: 'Stormwater drainage upgrade, 1,800 LF of pipe replacement' },
          { name: 'Stormwater Canal Dredging — F Section', amount: 1.4, status: 'Active', contractor: 'Duval Dredging Co.', note: 'F Section canal network, 11 canal segments, 280K cubic yards' },
          { name: 'Seminole Woods Blvd Resurfacing', amount: 0.76, status: 'Planned', contractor: 'TBD — Bid Phase Q2 2026', note: 'Full-depth reclamation, 1.1 miles. Pending traffic calming pilot evaluation' },
          { name: 'Utility Ave Bridge Inspection & Repair', amount: 0.34, status: 'Completed', contractor: 'DRMP Engineers', note: 'FDOT-mandated biennial bridge inspection. Minor deck repairs completed Jan 2026' },
          { name: 'Citywide Road Resurfacing Program', amount: 8.2, status: 'Active', contractor: 'Multiple — Annual Program', note: '42 lane miles scheduled for FY2026. Priority determined by Pavement Condition Index' },
          { name: 'Cypress Point Pkwy Widening', amount: 3.8, status: 'Design', contractor: 'RS&H Engineering', note: '4-lane widening, Matanzas Woods Pkwy to SR 100. Design 60% complete' },
          { name: 'Central Ave Sidewalk Connectivity', amount: 1.1, status: 'Active', contractor: 'Anzac Inc.', note: 'ADA-compliant sidewalk gaps, 3,400 LF. Funded 50% by FDOT LAP grant' },
          { name: 'Street Lighting Program', amount: 2.4, status: 'Active', contractor: 'Duke Energy / City', note: 'LED conversion and new light installations across 14 corridors' },
          { name: 'Traffic Signal Upgrades', amount: 1.7, status: 'Active', contractor: 'Dunn Traffic Systems', note: 'Adaptive signal control at 18 intersections along Palm Coast Pkwy' },
          { name: 'Bridge Replacements — Priority List', amount: 4.2, status: 'Planned', contractor: 'TBD — 2026 Procurement', note: '3 bridges rated below sufficiency threshold. FDOT-funded 80%, local match 20%' },
          { name: 'Local Road Drainage — R Section', amount: 1.9, status: 'Active', contractor: 'Hubbard Group', note: 'Swale grading and cross-drain replacement, 47 sites' },
        ]
      },
      { name: 'Utilities', amount: 48.3, color: '#0891b2', icon: '💧',
        projects: [
          { name: 'Water Treatment Plant Operations', amount: 18.6, status: 'Active', contractor: 'City Utilities Dept.', note: 'Operating 3 water treatment facilities, 14 MGD capacity' },
          { name: 'Wastewater Treatment Operations', amount: 16.2, status: 'Active', contractor: 'City Utilities Dept.', note: 'WWTF operations and FDEP compliance, 12 MGD capacity' },
          { name: 'Water Main Replacement Program', amount: 4.1, status: 'Active', contractor: 'Tri-State Utilities', note: 'Replacing aging asbestos-cement mains. 4.8 miles in FY2026' },
          { name: 'Lift Station Upgrades — Citywide', amount: 3.2, status: 'Active', contractor: 'SEMA Construction', note: '8 of 62 lift stations receiving generator and pump upgrades' },
          { name: 'Reclaimed Water Expansion — Palm Harbor', amount: 2.4, status: 'Design', contractor: 'Carollo Engineers', note: 'Expanding reclaimed water distribution to 340 additional parcels' },
          { name: 'Meter Replacement Program', amount: 3.8, status: 'Active', contractor: 'Ferguson Waterworks', note: 'AMI smart meter rollout, 8,200 meters in FY2026' },
        ]
      },
      { name: 'Parks & Recreation', amount: 22.6, color: '#16a34a', icon: '🌳',
        projects: [
          { name: 'Linear Park Trail Extension — Phase 2', amount: 1.8, status: 'Active', contractor: 'Hubbard Group', note: 'Connecting Lehigh Trail to European Village, 2.1 miles paved multi-use path' },
          { name: 'Palm Coast Tennis Center Renovation', amount: 0.94, status: 'Completed', contractor: 'Centex Construction', note: '12 resurfaced courts, new lighting, shade structures. Completed Nov 2025' },
          { name: 'Town Center Amenity Expansion', amount: 2.3, status: 'Active', contractor: 'TLC Diversified', note: 'Dog park, splash pad, amphitheater shade structure at Town Center Park' },
          { name: 'Park Operations & Maintenance', amount: 11.4, status: 'Active', contractor: 'City Parks Dept.', note: '28 parks, 57 miles of trails, 4 recreational facilities' },
          { name: 'Waterfront Park — Riverview', amount: 1.4, status: 'Planned', contractor: 'TBD — Design 2026', note: 'New waterfront amenities at Riverview Park. Funded by recreation impact fees' },
          { name: 'Sports Complex Lighting Upgrade', amount: 0.76, status: 'Completed', contractor: 'Sports Lighting Inc.', note: 'LED sports lighting at Indian Trails Sports Complex. Completed Aug 2025' },
          { name: 'Playground Replacements — 8 Parks', amount: 1.2, status: 'Active', contractor: 'PlayCore / GameTime', note: 'ADA-compliant replacements. Safety audit identified 8 units past service life' },
          { name: 'Beautification & Landscaping', amount: 2.82, status: 'Active', contractor: 'BrightView Landscapes', note: 'Medians, entranceways, street trees — citywide maintenance contract' },
        ]
      },
      { name: 'General Government', amount: 38.9, color: '#7c3aed', icon: '🏛️',
        projects: [
          { name: 'City Hall Renovation & Expansion', amount: 6.2, status: 'Planned', contractor: 'TBD — Bid Q3 2026', note: 'New council chambers, 180-seat public gallery, AV upgrade. Design phase underway' },
          { name: 'Administrative Salaries & Benefits', amount: 18.4, status: 'Active', contractor: 'City Employees', note: '312 full-time city staff across all departments' },
          { name: 'Information Technology', amount: 4.8, status: 'Active', contractor: 'Various / City IT', note: 'Cybersecurity, fiber network, ERP system, GIS mapping' },
          { name: 'Legal Services', amount: 1.9, status: 'Active', contractor: 'Garganese Weiss et al.', note: 'City attorney contract, litigation, code enforcement support' },
          { name: 'Communications & Public Outreach', amount: 1.4, status: 'Active', contractor: 'City Operations', note: 'Website, social media, PalmCoastConnect app, Council meeting streaming' },
          { name: 'Elections & Clerk Operations', amount: 0.82, status: 'Active', contractor: 'City Clerk Office', note: 'Municipal elections administration, public records, City Council support' },
          { name: 'Financial Services & Audit', amount: 2.1, status: 'Active', contractor: 'City Finance + CliftonLarsonAllen', note: 'Annual independent CAFR audit, financial management, grant administration' },
          { name: 'Insurance & Risk Management', amount: 3.24, status: 'Active', contractor: 'Various Carriers', note: 'Property, liability, workers comp for all city operations and fleet' },
        ]
      },
      { name: 'Community Development', amount: 31.2, color: '#0f766e', icon: '🏗️',
        projects: [
          { name: 'Building Permits & Inspections', amount: 4.6, status: 'Active', contractor: 'City Operations', note: '4,200+ permits issued FY2025. 14 inspectors, 3 plan reviewers' },
          { name: 'Affordable Housing Programs', amount: 2.8, status: 'Active', contractor: 'Various Non-Profits', note: 'SHIP program, down payment assistance, density bonus incentive program' },
          { name: 'Economic Development Initiatives', amount: 1.9, status: 'Active', contractor: 'Palm Coast Dev. Corp.', note: 'Business recruitment, employer incentive grants, workforce development' },
          { name: 'Planning & Zoning Division', amount: 3.2, status: 'Active', contractor: 'City Operations', note: 'Comprehensive Plan, LDC administration, DRC reviews, annexations' },
          { name: 'Community Redevelopment Agency', amount: 8.4, status: 'Active', contractor: 'CRA Board / City', note: 'Town Center CRA — infrastructure improvements, facade grants, streetscaping' },
          { name: 'Neighborhood Services', amount: 2.1, status: 'Active', contractor: 'City Operations', note: 'HOA liaison, neighborhood grants, community events, volunteer programs' },
          { name: 'Grant Administration', amount: 8.2, status: 'Active', contractor: 'Various Federal / State', note: 'CDBG, FDOT LAP grants, DEP grants — managed through Community Development' },
        ]
      },
      { name: 'Debt Service', amount: 19.4, color: '#64748b', icon: '📋',
        projects: [
          { name: '2021 Utility Revenue Bond', amount: 8.2, status: 'Active', contractor: 'Bank of America / Bondholders', note: '$62M bond for water/wastewater plant upgrades. 20-year term, 2.1% fixed rate' },
          { name: '2019 Capital Improvement Bond', amount: 6.4, status: 'Active', contractor: 'Various Bondholders', note: '$48M for road and stormwater infrastructure. 25-year term, 2.85% fixed rate' },
          { name: '2023 Equipment Financing', amount: 2.1, status: 'Active', contractor: 'Stifel Financial', note: 'Heavy equipment and fleet purchases. 5-year term' },
          { name: 'COPS Lease — Public Safety Equipment', amount: 2.7, status: 'Active', contractor: 'PNC Equipment Finance', note: 'Police vehicles, body cameras, radios. 7-year lease program' },
        ]
      },
      { name: 'Other', amount: 13.1, color: '#94a3b8', icon: '📌',
        projects: [
          { name: 'Contingency Reserve', amount: 4.2, status: 'Active', contractor: 'City Reserve', note: 'Unallocated reserve for emergency expenditures and unexpected costs' },
          { name: 'Intergovernmental Services', amount: 3.8, status: 'Active', contractor: 'Flagler County / State', note: 'Cost-sharing agreements: animal control, library, transit, health services' },
          { name: 'Special Events & Tourism', amount: 1.6, status: 'Active', contractor: 'Various Vendors', note: 'Arts in the Park, Fourth of July, Farmers Market operations' },
          { name: 'Veterans Services Contribution', amount: 0.4, status: 'Active', contractor: 'Flagler County VSO', note: 'Annual contribution to county veterans services office' },
          { name: 'Non-Departmental Expenses', amount: 3.1, status: 'Active', contractor: 'Various', note: 'Memberships, dues, county cost-sharing, miscellaneous' },
        ]
      },
    ],
    highlights: [
      { label: 'Budget increase vs prior year', value: '+6.9%', positive: true },
      { label: 'Property tax rate (per $1,000)', value: '$4.6871', positive: null },
      { label: 'General fund reserve', value: '$8.2M', positive: true },
      { label: 'Capital projects funded', value: '14 active', positive: null },
    ]
  },
  // County Commission — Andy Dance (6) and Donald O'Brien (13) share county budget
  6: {
    fiscalYear: 'FY 2025–2026',
    total: 248.0,
    prevTotal: 233.5,
    propertyTaxRate: 5.37,
    surplus: 14.2,
    source: "Flagler County Adopted Budget FY2025-26",
    sourceUrl: 'https://www.flaglercounty.gov/finance',
    // Year-over-year history (3 years)
    yearHistory: [
      { year: 'FY2023-24', total: 207.4, change: null },
      { year: 'FY2024-25', total: 233.5, change: +12.6 },
      { year: 'FY2025-26', total: 248.0, change: +6.2, current: true },
    ],
    // Approved vs actual spend for prior fiscal year (FY2024-25)
    priorYearComparison: {
      label: 'FY2024-25 Approved vs Actual',
      note: 'Actuals are estimated from county quarterly reports. Final CAFR audit pending.',
      categories: [
        { name: 'Public Safety',           approved: 78.1,  actual: 79.4,  variance: +1.7 },
        { name: 'Infrastructure',          approved: 51.4,  actual: 48.2,  variance: -6.2 },
        { name: 'Health & Human Services', approved: 41.8,  actual: 42.6,  variance: +1.9 },
        { name: 'General Government',      approved: 32.6,  actual: 33.1,  variance: +1.5 },
        { name: 'Parks & Recreation',      approved: 16.4,  actual: 15.9,  variance: -3.0 },
        { name: 'Other',                   approved: 13.2,  actual: 14.3,  variance: +8.3 },
      ],
    },
    // Revenue sources — where the money comes from
    revenueSources: [
      { label: 'Property Taxes',            pct: 54, amount: 133.9, color: '#dc2626', icon: '🏠', note: 'Ad valorem tax at 5.37 mills. Largest single revenue source. Funds general county operations' },
      { label: 'State Grants & Revenue',    pct: 17, amount: 42.2,  color: '#7c3aed', icon: '🏛️', note: 'Revenue sharing, gas tax, SHIP housing funds, state agency grants, FDOT project funding' },
      { label: 'Federal Grants',            pct: 11, amount: 27.3,  color: '#d97706', icon: '🤝', note: 'FEMA reimbursements, Title I/IDEA pass-through, CDBG, FAA airport grants, public health funding' },
      { label: 'Fees & Charges',            pct: 9,  amount: 22.3,  color: '#16a34a', icon: '📋', note: 'Court fees, permit fees, park admissions, library fines, ambulance billing, animal services' },
      { label: 'Intergovernmental',         pct: 5,  amount: 12.4,  color: '#0891b2', icon: '🔄', note: 'Payments from municipalities for shared services, county health dept reimbursements' },
      { label: 'Other Revenue',             pct: 4,  amount: 9.9,   color: '#64748b', icon: '📌', note: 'Interest earnings, sale of assets, insurance recoveries, miscellaneous' },
    ],
    categories: [
      { name: 'Public Safety', amount: 84.3, color: '#dc2626', icon: '🚔',
        projects: [
          { name: "Sheriff's Office Operations", amount: 37.2, status: 'Active', contractor: "Flagler County Sheriff's Office", note: '184 sworn deputies, 62 civilian staff, patrol, investigations, school resource officers' },
          { name: 'Flagler County Fire Rescue', amount: 28.6, status: 'Active', contractor: 'FCFR / County Operations', note: '6 stations, 92 firefighter/paramedics, ALS engine and rescue response' },
          { name: 'Emergency Medical Services', amount: 8.4, status: 'Active', contractor: 'County EMS / FCFR', note: 'County-wide ALS transport. 4 units, mutual aid agreements with adjacent counties' },
          { name: 'E911 Communications Center', amount: 4.2, status: 'Active', contractor: 'County Operations', note: 'Consolidated 911 dispatch. NextGen 911 upgrade in progress' },
          { name: 'Emergency Management Division', amount: 2.1, status: 'Active', contractor: 'County Operations', note: 'FEMA compliance, hurricane preparedness, LEPC, EOC operations' },
          { name: 'Jail / Detention Facility', amount: 3.8, status: 'Active', contractor: 'Flagler County Detention', note: '252-bed facility. Current occupancy 218. Medical and program services' },
        ]
      },
      { name: 'Infrastructure', amount: 54.6, color: '#d97706', icon: '🛣️',
        projects: [
          { name: 'Countrywide Road Resurfacing Program', amount: 6.8, status: 'Active', contractor: 'Hubbard Group / Multiple', note: '38 lane miles of unincorporated county roads. PCI-rated priority list' },
          { name: 'Old Kings Road Widening Phase 2', amount: 4.2, status: 'Active', contractor: 'DRMP / FDOT LAP', note: '4-lane widening, SR 100 to Matanzas Woods Pkwy. 60% FDOT funded' },
          { name: 'Flagler Beach Dune Restoration', amount: 3.1, status: 'Active', contractor: 'Great Lakes Dredge & Dock', note: '3.2 miles of dune restoration. FEMA-funded post-hurricane repair component' },
          { name: 'Canopy Road Preservation', amount: 0.94, status: 'Active', contractor: 'County Operations', note: 'Trimming, removal, preservation along 14 designated canopy roads' },
          { name: 'Stormwater Master Plan Implementation', amount: 3.4, status: 'Active', contractor: 'Atkins Global / County', note: 'Phase 2 of 5-phase master plan. Retention pond construction in unincorporated areas' },
          { name: 'Bulow Creek Preserve — Land Mgmt.', amount: 0.62, status: 'Active', contractor: 'County / SJRWMD', note: 'Management of newly preserved 153 acres. Trail, wildlife monitoring, maintenance' },
          { name: 'County-Wide Sidewalk Gap Closures', amount: 1.8, status: 'Active', contractor: 'Anzac Inc.', note: 'Safe routes to school priority. 12 gap locations, FDOT-funded 80%' },
          { name: 'SR 100 Corridor Study', amount: 0.48, status: 'Design', contractor: 'Jacobs Engineering', note: 'Multimodal corridor study from I-95 to US-1. Final recommendations Q3 2026' },
          { name: 'Fleet Replacement Program', amount: 4.8, status: 'Active', contractor: 'Various Dealers', note: '22 vehicles across departments — roadway, utilities, building' },
          { name: 'Airport Infrastructure — Flagler Executive', amount: 2.6, status: 'Active', contractor: 'FAA/FDOT Funded 90%', note: 'Taxiway rehabilitation, lighting upgrade, AWOS replacement' },
          { name: 'Fiber Network Expansion', amount: 1.4, status: 'Active', contractor: 'GreyWolf / County IT', note: 'Connecting county facilities and parks to fiber backbone' },
        ]
      },
      { name: 'Health & Human Services', amount: 44.6, color: '#0891b2', icon: '🏥',
        projects: [
          { name: 'Flagler County Health Department', amount: 12.8, status: 'Active', contractor: 'FDOH Flagler / County', note: 'Primary care, immunizations, environmental health, WIC program' },
          { name: 'Social Services / Human Services', amount: 8.4, status: 'Active', contractor: 'County Operations', note: 'SNAP outreach, rental assistance, senior services, utility assistance' },
          { name: 'Mental Health Services', amount: 5.2, status: 'Active', contractor: 'Flagler County / Stewart-Marchman', note: 'Co-responder program with FCSO, Baker Act transport, crisis stabilization' },
          { name: 'Veterans Services Office', amount: 1.1, status: 'Active', contractor: 'County VSO', note: '4 accredited VSO reps. VA claims, benefits navigation, emergency assistance' },
          { name: 'Affordable Housing Programs', amount: 4.6, status: 'Active', contractor: 'SHIP Program / County', note: 'State Housing Initiatives Partnership — down payment assistance, rehab loans' },
          { name: 'Library System', amount: 6.8, status: 'Active', contractor: 'Flagler County Library', note: '3 branches, 52,000 cardholders. Digital services, programming, maker spaces' },
          { name: 'Animal Services', amount: 2.4, status: 'Active', contractor: 'Flagler County Animal Shelter', note: '85% live release rate. Adoption, TNR, enforcement for unincorporated county' },
          { name: 'Senior Services', amount: 3.3, status: 'Active', contractor: 'Flagler County / Senior Center', note: 'Meals on Wheels, transportation, senior center programming, caregiver support' },
        ]
      },
      { name: 'General Government', amount: 34.7, color: '#7c3aed', icon: '🏛️',
        projects: [
          { name: 'Board of County Commissioners Office', amount: 2.1, status: 'Active', contractor: 'County Operations', note: '5 commissioners, 8 staff. Legislative, constituent services, outreach' },
          { name: 'County Administrator Office', amount: 3.8, status: 'Active', contractor: 'County Operations', note: 'Executive management, strategic plan, intergovernmental relations' },
          { name: 'Clerk of Courts', amount: 4.2, status: 'Active', contractor: 'Flagler Clerk Operations', note: 'Court records, board minutes, finance, payroll — partially fee-funded' },
          { name: 'Property Appraiser', amount: 3.4, status: 'Active', contractor: 'Flagler Property Appraiser', note: 'Annual property valuation for 87,000+ parcels' },
          { name: 'Tax Collector', amount: 2.8, status: 'Active', contractor: 'Flagler Tax Collector', note: 'Property tax collection, vehicle registration, DMV services' },
          { name: 'Supervisor of Elections', amount: 2.1, status: 'Active', contractor: 'Flagler Elections Office', note: 'Voter registration, early voting, election administration' },
          { name: 'County Attorney Office', amount: 1.6, status: 'Active', contractor: 'Wadsworth Huerta Law', note: 'County legal representation, contracts, litigation, code enforcement' },
          { name: 'Information Technology', amount: 4.8, status: 'Active', contractor: 'County IT / Various', note: 'Network, cybersecurity, GIS, Tyler ERP, public safety systems' },
          { name: 'Finance & Budget', amount: 2.6, status: 'Active', contractor: 'County Finance Dept.', note: 'Budget preparation, CAFR audit (Cherry Bekaert LLP), grant management' },
          { name: 'Human Resources', amount: 2.4, status: 'Active', contractor: 'County HR Dept.', note: '630+ county employees, benefits, recruitment, training, labor relations' },
          { name: 'Risk Management & Insurance', amount: 4.9, status: 'Active', contractor: 'Various Carriers / FCRMA', note: 'General liability, property, workers comp through FL Risk Mgmt. Assoc.' },
        ]
      },
      { name: 'Parks & Recreation', amount: 17.4, color: '#16a34a', icon: '🌳',
        projects: [
          { name: 'Park Operations & Maintenance', amount: 6.8, status: 'Active', contractor: 'County Parks Dept.', note: '14 county parks, 22,000 acres of public land, beach access' },
          { name: 'Princess Place Preserve Restoration', amount: 1.2, status: 'Active', contractor: 'County / SJRWMD', note: 'Habitat restoration, longleaf pine reforestation, trail maintenance' },
          { name: "Bing's Landing Park Improvements", amount: 0.84, status: 'Active', contractor: 'DM Enterprises', note: 'Boat ramp rehab, dock replacement, parking expansion' },
          { name: 'Waterfront Park Improvements', amount: 0.62, status: 'Planned', contractor: 'TBD', note: 'Flagler Beach waterfront enhancements — pending FDEP permit' },
          { name: 'Mala Compra Greenway Trail', amount: 1.4, status: 'Active', contractor: 'County / Rails-to-Trails', note: 'Rail trail conversion, 4.2 miles, gravel path and signage' },
          { name: 'Beach Access Improvements', amount: 2.1, status: 'Active', contractor: 'Multiple', note: '6 beach access points, parking, boardwalks, ADA improvements' },
          { name: 'Recreation Programs', amount: 4.44, status: 'Active', contractor: 'County Recreation Dept.', note: 'Youth sports, senior fitness, aquatics, summer camp programming' },
        ]
      },
      { name: 'Other', amount: 12.4, color: '#94a3b8', icon: '📌',
        projects: [
          { name: 'Contingency Reserve', amount: 4.8, status: 'Active', contractor: 'County Reserve', note: 'Unallocated reserve per Board policy — minimum 5% of general fund' },
          { name: 'Debt Service Payments', amount: 4.2, status: 'Active', contractor: 'Various Bondholders', note: 'Infrastructure bonds and capital lease obligations' },
          { name: 'Intergovernmental Contributions', amount: 1.6, status: 'Active', contractor: 'Municipalities / Districts', note: 'Cost-sharing: regional planning, transit (VOTRAN), water management' },
          { name: 'Non-Departmental / Misc.', amount: 1.8, status: 'Active', contractor: 'Various', note: 'Memberships (FAC, NACo), dues, county-wide subscriptions' },
        ]
      },
    ],
    highlights: [
      { label: 'Budget increase vs prior year', value: '+6.2%', positive: true },
      { label: 'Property tax rate (per $1,000)', value: '5.37 mills', positive: null },
      { label: 'General fund reserve', value: '$14.2M', positive: true },
      { label: "Sheriff's Office increase", value: '+8%', positive: null },
    ]
  },
};
// Council members 15, 30, 31, 32 share city budget with Mayor (id 7)
BUDGETS[15] = BUDGETS[7];
BUDGETS[30] = BUDGETS[7];
BUDGETS[31] = BUDGETS[7];
BUDGETS[32] = BUDGETS[7];
// County commissioner O'Brien shares county budget with Dance
BUDGETS[13] = BUDGETS[6];

// ── Budget sub-components ────────────────────────────────────────────────────

function BudgetYoYPanel({ history }) {
  if (!history) return null;
  const max = Math.max(...history.map(h => h.total));
  return (
    <div className="bt-panel">
      <div className="bt-panel-title">📈 Year-Over-Year Budget Growth</div>
      <div className="bt-yoy-bars">
        {history.map((h, i) => (
          <div key={i} className="bt-yoy-row">
            <span className="bt-yoy-label">{h.year}</span>
            <div className="bt-yoy-track">
              <div
                className={`bt-yoy-fill ${h.current ? 'bt-yoy-current' : ''}`}
                style={{ width: `${(h.total / max) * 100}%` }}
              />
            </div>
            <div className="bt-yoy-right">
              <span className="bt-yoy-total">${h.total}M</span>
              {h.change !== null && h.change !== undefined && (
                <span className={`bt-yoy-change ${h.change > 0 ? 'bt-yoy-up' : 'bt-yoy-down'}`}>
                  {h.change > 0 ? '+' : ''}{h.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetVsActualPanel({ data }) {
  if (!data) return null;
  const maxVal = Math.max(...data.categories.map(c => Math.max(c.approved, c.actual)));
  return (
    <div className="bt-panel">
      <div className="bt-panel-title">✅ Approved vs Actual Spend <span className="bt-panel-sub">{data.label}</span></div>
      <p className="bt-panel-note">{data.note}</p>
      <div className="bt-va-legend">
        <span className="bt-va-leg-approved">■ Approved</span>
        <span className="bt-va-leg-actual">■ Actual</span>
        <span className="bt-va-leg-variance">± Variance</span>
      </div>
      <div className="bt-va-rows">
        {data.categories.map((cat, i) => {
          const overBudget = cat.variance > 2;
          const underBudget = cat.variance < -2;
          const varColor = overBudget ? '#f87171' : underBudget ? '#34d399' : '#94a3b8';
          const approvedW = (cat.approved / maxVal) * 100;
          const actualW   = (cat.actual   / maxVal) * 100;
          return (
            <div key={i} className="bt-va-row">
              <div className="bt-va-name">{cat.name}</div>
              <div className="bt-va-bars">
                <div className="bt-va-bar-row">
                  <div className="bt-va-bar-approved" style={{ width: approvedW + '%' }} />
                  <span className="bt-va-bar-num">${cat.approved}M</span>
                </div>
                <div className="bt-va-bar-row">
                  <div className="bt-va-bar-actual" style={{ width: actualW + '%' }} />
                  <span className="bt-va-bar-num">${cat.actual}M</span>
                </div>
              </div>
              <div className="bt-va-variance-col">
                <span className="bt-va-variance" style={{ color: varColor }}>
                  {cat.variance === 0 ? '0%' : (cat.variance > 0 ? '+' : '') + cat.variance + '%'}
                </span>
                {overBudget  && <span className="bt-va-flag">Over</span>}
                {underBudget && <span className="bt-va-flag bt-va-flag-under">Under</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="bt-va-footer">Green = under budget (unspent savings). Red = over budget. Within ±2% is normal variance.</p>
    </div>
  );
}

function BudgetRevenuePanel({ sources }) {
  const [expanded, setExpanded] = useState(null);
  if (!sources) return null;
  return (
    <div className="bt-panel">
      <div className="bt-panel-title">💰 Where the Money Comes From</div>
      <p className="bt-panel-note">Tap any source to understand how that revenue works and who pays it.</p>
      <div className="bt-rev-list">
        {sources.map((s, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className={`bt-rev-card ${isOpen ? 'bt-rev-card-open' : ''}`}>
              <button className="bt-rev-row" onClick={() => setExpanded(isOpen ? null : i)}>
                <span className="bt-rev-icon">{s.icon}</span>
                <div className="bt-rev-info">
                  <span className="bt-rev-label">{s.label}</span>
                  <div className="bt-rev-track">
                    <div className="bt-rev-fill" style={{ width: s.pct + '%', background: s.color }} />
                  </div>
                </div>
                <div className="bt-rev-nums">
                  <span className="bt-rev-pct" style={{ color: s.color }}>{s.pct}%</span>
                  <span className="bt-rev-amt">${s.amount}M</span>
                  <span className="bt-rev-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="bt-rev-detail">
                  <p className="bt-rev-note">{s.note}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BudgetProjectList({ projects, color }) {
  return (
    <div className="bcat-projects">
      <div className="bcat-projects-header">
        <span className="bcat-proj-col-name">Project / Line Item</span>
        <span className="bcat-proj-col-amt">Amount</span>
      </div>
      {projects.map((p, i) => {
        const sc = PROJECT_STATUS_COLORS[p.status] || PROJECT_STATUS_COLORS['Active'];
        return (
          <div key={i} className="bcat-project-row">
            <div className="bcat-proj-top">
              <span className="bcat-proj-name">{p.name}</span>
              <span className="bcat-proj-amt" style={{ color }}>
                ${p.amount >= 1 ? p.amount.toFixed(1) + 'M' : (p.amount * 1000).toFixed(0) + 'K'}
              </span>
            </div>
            <div className="bcat-proj-meta">
              <span className="bcat-proj-status" style={{ background: sc.bg, color: sc.color }}>{p.status}</span>
              <span className="bcat-proj-contractor">🏢 {p.contractor}</span>
            </div>
            {p.note && <p className="bcat-proj-note">{p.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

function BudgetTab({ official }) {
  const budget = BUDGETS[official.id];
  const [expandedCat, setExpandedCat] = useState(null);
  const [activeView, setActiveView] = useState('spending'); // 'spending' | 'revenue' | 'history' | 'actual'

  if (!budget) {
    return (
      <div className="budget-unavailable">
        <span className="budget-na-icon">📊</span>
        <h3>Budget data not available</h3>
        <p>Detailed budget information is only available for local officials. Federal and state budget data is coming soon.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...budget.categories.map(c => c.amount));
  const yoyChange = ((budget.total - budget.prevTotal) / budget.prevTotal * 100).toFixed(1);
  const isIncrease = budget.total > budget.prevTotal;
  const totalProjects = budget.categories.reduce((sum, c) => sum + (c.projects ? c.projects.length : 0), 0);

  const views = [
    { id: 'spending',  label: '💸 Spending',   available: true },
    { id: 'revenue',   label: '💰 Revenue',    available: !!budget.revenueSources },
    { id: 'actual',    label: '✅ Approved vs Actual', available: !!budget.priorYearComparison },
    { id: 'history',   label: '📈 YoY History', available: !!budget.yearHistory },
  ].filter(v => v.available);

  return (
    <div className="budget-tab">
      {/* Header card */}
      <div className="budget-header-card">
        <div className="budget-fy-label">{budget.fiscalYear}</div>
        <div className="budget-total-row">
          <div>
            <div className="budget-total-num">${budget.total}M</div>
            <div className="budget-total-label">Total Adopted Budget</div>
          </div>
          <div className={`budget-yoy ${isIncrease ? 'yoy-up' : 'yoy-down'}`}>
            <span className="yoy-arrow">{isIncrease ? '↑' : '↓'}</span>
            <span>{Math.abs(yoyChange)}%</span>
            <span className="yoy-sub">vs prior year</span>
          </div>
        </div>
        <div className="budget-meta-row">
          <div className="budget-meta-item">
            <span className="bmi-icon">💰</span>
            <div><div className="bmi-val">${budget.propertyTaxRate.toFixed(4)}</div><div className="bmi-lbl">Per $1,000 property value</div></div>
          </div>
          <div className="budget-meta-item">
            <span className="bmi-icon">🏦</span>
            <div><div className="bmi-val">${budget.surplus}M</div><div className="bmi-lbl">General fund reserve</div></div>
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div className="bt-view-tabs">
        {views.map(v => (
          <button key={v.id}
            className={`bt-view-tab ${activeView === v.id ? 'bt-view-tab-active' : ''}`}
            onClick={() => setActiveView(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* SPENDING VIEW */}
      {activeView === 'spending' && (
        <>
          <div className="budget-section-title">
            Where the money goes
            <span className="budget-drill-hint">Tap any category → {totalProjects} line items</span>
          </div>
          <div className="budget-categories">
            {budget.categories.map((cat) => {
              const isOpen = expandedCat === cat.name;
              const hasProjects = cat.projects && cat.projects.length > 0;
              return (
                <div key={cat.name} className={`bcat-card ${isOpen ? 'bcat-card-open' : ''}`}>
                  <button
                    className={`budget-cat-row ${hasProjects ? 'bcat-tappable' : ''}`}
                    onClick={() => hasProjects && setExpandedCat(isOpen ? null : cat.name)}
                    style={{ cursor: hasProjects ? 'pointer' : 'default' }}
                  >
                    <div className="bcat-left">
                      <span className="bcat-icon">{cat.icon}</span>
                      <div className="bcat-info">
                        <div className="bcat-name">{cat.name}</div>
                        <div className="bcat-amount" style={{ color: cat.color }}>${cat.amount}M</div>
                      </div>
                    </div>
                    <div className="bcat-bar-wrap">
                      <div className="bcat-bar-fill" style={{ width:`${(cat.amount/maxAmount)*100}%`, background:cat.color }} />
                    </div>
                    <div className="bcat-right">
                      <div className="bcat-pct">{((cat.amount/budget.total)*100).toFixed(1)}%</div>
                      {hasProjects && (
                        <div className="bcat-expand-hint" style={{ color: cat.color }}>
                          {isOpen ? '▲' : '▼'} {cat.projects.length}
                        </div>
                      )}
                    </div>
                  </button>
                  {isOpen && hasProjects && (
                    <BudgetProjectList projects={cat.projects} color={cat.color} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="budget-section-title">Key Highlights</div>
          <div className="budget-highlights">
            {budget.highlights.map((h) => (
              <div key={h.label} className="budget-highlight-row">
                <span className="bh-label">{h.label}</span>
                <span className="bh-val" style={{ color: h.positive===true?'#16a34a':h.positive===false?'#dc2626':'var(--text)' }}>{h.value}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* REVENUE VIEW */}
      {activeView === 'revenue' && (
        <BudgetRevenuePanel sources={budget.revenueSources} />
      )}

      {/* APPROVED vs ACTUAL VIEW */}
      {activeView === 'actual' && (
        <BudgetVsActualPanel data={budget.priorYearComparison} />
      )}

      {/* YOY HISTORY VIEW */}
      {activeView === 'history' && (
        <BudgetYoYPanel history={budget.yearHistory} />
      )}

      <div className="budget-source-row">
        <span className="budget-source">Source: {budget.source}</span>
        {budget.sourceUrl && <a href={budget.sourceUrl} target="_blank" rel="noreferrer" className="budget-source-link">View full budget →</a>}
      </div>
      <p className="budget-sample-note">⚠️ Project-level figures and actuals are estimated from public financial reports. Verify against official adopted budget and CAFR documents.</p>
    </div>
  );
}

// ─── OFFICIAL PROFILE (compact header) ───────────────────────────────────────

// ─── SCHOOL BOARD COMPONENTS ─────────────────────────────────────────────────

function SchoolBoardRoleCard({ onClose }) {
  return (
    <div className="role-card">
      <button className="role-close" onClick={onClose}>✕</button>
      <div className="role-title">🎓 What Does the School Board Do?</div>
      <p className="role-intro">The Flagler County School Board is the 5-member elected governing body for Flagler County's public schools. All 5 members are elected countywide — meaning every Flagler voter elects all 5 seats, regardless of which district you live in.</p>
      <div className="role-powers">
        <div className="role-power-item"><span className="role-power-icon">📜</span><div><strong>Set District Policy</strong><p>Curriculum standards, instructional materials, code of conduct, graduation requirements, and school calendar.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">💰</span><div><strong>Adopt the Budget</strong><p>Approves the annual budget and capital plan. Note: the school tax rate (millage) is set by the Florida DOE — the board cannot raise or lower it.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">👔</span><div><strong>Hire the Superintendent</strong><p>The board hires, evaluates, and can dismiss the Superintendent, who runs day-to-day district operations. Current superintendent: LaShakia Moore.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">🏫</span><div><strong>Approve School Principals</strong><p>Confirms the Superintendent's recommended principal appointments for all schools.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">📚</span><div><strong>Instructional Materials</strong><p>Reviews and approves textbooks and library books. Has authority to remove materials following a challenge process.</p></div></div>
      </div>
      <div className="role-vs-county">
        <div className="role-vs-title">⚠️ The Millage Trap — What Residents Often Misunderstand</div>
        <p style={{fontSize:'0.72rem',color:'var(--text-2)',lineHeight:1.6,margin:'0.4rem 0 0'}}>The school district's property tax rate is set by the Florida Department of Education, not your school board. As Flagler property values rise, state FEFP funding is reduced dollar-for-dollar — so higher home values do NOT mean more money for schools. The board's ability to raise additional funds is very limited.</p>
      </div>
      <div className="role-meetings">📅 Meets monthly · District Office, 1769 E. Moody Blvd, Bunnell · Open to the public</div>
    </div>
  );
}

function SchoolBoardScorecard({ officialId }) {
  const d = SCHOOL_BOARD_DATA.members[officialId];
  const o = OFFICIALS.find(off => off.id === officialId);
  const [showVotes, setShowVotes] = useState(false);
  const [activeVotePoll, setActiveVotePoll] = useState(null);
  if (!d || !o) return null;

  const catColor = { Budget:'#7c3aed', Curriculum:'#0891b2', Personnel:'#d97706', Facilities:'#16a34a', Policy:'#f59e0b' };
  const scoreColor = s => s >= 80 ? '#16a34a' : s >= 65 ? '#d97706' : '#dc2626';

  return (
    <div className="commissioner-scorecard">
      {activeVotePoll && <VotePollDrawer vote={activeVotePoll} official={o} onClose={() => setActiveVotePoll(null)} />}
      <div className="sc-disclaimer">⚠️ Scores are beta estimates based on available public records. Not independently verified.</div>

      <div className="sc-scores-row">
        {[
          { label:'Civic Score',        val: d.scores.civic,         tip:'Vote participation, attendance' },
          { label:'Transparency',       val: d.scores.transparency,  tip:'Records compliance, disclosure' },
          { label:'Responsiveness',     val: d.scores.responsiveness, tip:'Constituent communication' },
        ].map((s,i) => (
          <div key={i} className="sc-score-box">
            <span className="sc-score-num" style={{ color: scoreColor(s.val) }}>{s.val}</span>
            <span className="sc-score-label">{s.label}</span>
            <div className="sc-score-bar-wrap"><div className="sc-score-bar" style={{ width: s.val+'%', background: scoreColor(s.val) }} /></div>
          </div>
        ))}
      </div>

      <div className="sc-term-row">
        <span className="sc-term-item">🗓️ Term: {d.termStart}–{d.termEnd}</span>
        <span className="sc-term-item">🗳️ Next election: {d.nextElection}</span>
        <span className="sc-term-item">📍 {d.seat}</span>
      </div>

      <div className="sb-how-elected">
        ℹ️ {d.howElected}
      </div>

      <div className="sc-section-title">Key Positions</div>
      <div className="sc-positions">
        {d.keyPositions.map((p, i) => <div key={i} className="sc-position-pill">✓ {p}</div>)}
      </div>

      <div className="sc-section-title">Committee & Liaison Roles</div>
      <div className="sc-committees">
        {d.committeeRoles.map((r, i) => <div key={i} className="sc-committee-item">🏫 {r}</div>)}
      </div>

      <button className="sc-votes-toggle" onClick={() => setShowVotes(v => !v)}>
        {showVotes ? '▲ Hide' : '▼ Show'} Voting Record ({d.votingRecord.length} votes)
      </button>
      {showVotes && (
        <div className="sc-votes-list">
          <div className="sc-votes-hint">Tap any vote to see what your neighbors think</div>
          {d.votingRecord.map((v, i) => (
            <button key={i} className="sc-vote-row sc-vote-clickable" onClick={() => setActiveVotePoll(v)}>
              <span className={`sc-vote-badge ${v.vote === 'YES' ? 'sc-vote-yes' : 'sc-vote-no'}`}>{v.vote}</span>
              <div className="sc-vote-info">
                <span className="sc-vote-bill">{v.bill}</span>
                <div className="sc-vote-meta">
                  <span className="sc-vote-cat" style={{ color: catColor[v.category] || '#94a3b8' }}>{v.category}</span>
                  <span className="sc-vote-date">{v.date}</span>
                  <span className="sc-vote-impact" style={{ opacity: v.impact==='Critical'?1:v.impact==='High'?0.85:0.65 }}>● {v.impact}</span>
                </div>
              </div>
              <span className="sc-vote-poll-cta">Poll →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SchoolMetricsBar({ label, value, max, color, suffix = '%', context }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="sb-metric-row">
      <div className="sb-metric-header">
        <span className="sb-metric-label">{label}</span>
        <span className="sb-metric-val" style={{ color }}>{value}{suffix}</span>
      </div>
      <div className="sb-metric-track"><div className="sb-metric-fill" style={{ width: pct + '%', background: color }} /></div>
      {context && <span className="sb-metric-context">{context}</span>}
    </div>
  );
}

function SchoolBoardOverview() {
  const d = SCHOOL_BOARD_DATA.district;
  const fmt = n => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : '$' + (n/1000).toFixed(0) + 'K';
  const [expandedDecision, setExpandedDecision] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [budgetView, setBudgetView] = useState('spending'); // 'spending' | 'revenue' | 'schools'

  const impactColors = {
    Budget:    { bg:'#7c3aed22', color:'#a78bfa' },
    Curriculum:{ bg:'#0891b222', color:'#38bdf8' },
    Personnel: { bg:'#d9770622', color:'#fbbf24' },
    Facilities:{ bg:'#16a34a22', color:'#4ade80' },
  };

  const gradeColor = g => g === 'A' ? '#16a34a' : g === 'B' ? '#0891b2' : g === 'C' ? '#d97706' : '#dc2626';
  const typeIcon   = t => ({ High:'🎓', Middle:'📐', Elementary:'🏫', Virtual:'💻' }[t] || '🏫');

  return (
    <div className="commission-overview">
      <div className="co-header">
        <div className="co-title-block">
          <div className="co-title">Flagler County School Board</div>
          <div className="co-sub">Superintendent: {d.superintendent} · {d.schoolCount} schools · {d.totalStudents.toLocaleString()} students</div>
        </div>
        <div className="co-budget-badge">
          <span className="co-budget-num">{fmt(d.totalBudget)}</span>
          <span className="co-budget-label">FY2025-26 Budget</span>
        </div>
      </div>

      {/* District grade banner */}
      <div className="sb-district-grade-banner">
        <div className="sb-grade-block">
          <span className="sb-grade-letter" style={{ color: gradeColor(d.districtGrade) }}>{d.districtGrade}</span>
          <span className="sb-grade-label">District Grade</span>
        </div>
        <div className="sb-grade-context">{d.districtGradeNote}</div>
        <div className="sb-grade-state">Florida ranks 28 of 67 districts as A, 31 as B — Flagler holds B for 4th straight year</div>
      </div>

      {/* Key academic metrics */}
      <div className="co-section-title">Academic Outcomes <span style={{fontSize:'0.6rem',color:'#64748b',fontWeight:500}}>2024-25 school year</span></div>
      <div className="sb-metrics-block">
        <SchoolMetricsBar label="Graduation Rate"     value={d.graduationRate}     max={100} color="#16a34a" context={`+${d.graduationRateChange}pt vs prior year · State avg: ~88%`} />
        <SchoolMetricsBar label="ELA Pass Rate"       value={d.elaPassRate}        max={100} color="#0891b2" context={`+${d.elaPassChange}pt · Grade 3 reading: ${d.grade3ELARate}% (+${d.grade3ELAChange}pt)`} />
        <SchoolMetricsBar label="Math Pass Rate"      value={d.mathPassRate}        max={100} color="#d97706" context={`${d.mathPassChange}pt — only metric that declined in 2025`} />
        <SchoolMetricsBar label="Teacher Retention"   value={d.teacherRetentionRate} max={100} color="#7c3aed" context={`${100-d.teacherRetentionRate}% turnover rate · FL ranks 50th in teacher pay nationally`} />
        <SchoolMetricsBar label="Chronic Absenteeism" value={d.chronicAbsenteeism}  max={40}  color="#dc2626" suffix="%" context={`${d.chronicAbsenteeism}% of students miss 10+ days · National avg ~14%`} />
      </div>

      {/* Staff */}
      <div className="sb-staff-row">
        <div className="sb-staff-stat">
          <span className="sb-staff-val">{d.teacherVacancyRate}%</span>
          <span className="sb-staff-label">Teacher Vacancy Rate</span>
        </div>
        <div className="sb-staff-stat">
          <span className="sb-staff-val">{d.classroomVsAdminRatio}%</span>
          <span className="sb-staff-label">Budget to Classroom</span>
        </div>
        <div className="sb-staff-stat">
          <span className="sb-staff-val">${d.perPupilSpending.toLocaleString()}</span>
          <span className="sb-staff-label">Per-Pupil Spending</span>
          <span className="sb-staff-sub">State avg: ${d.stateAvgPerPupil.toLocaleString()}</span>
        </div>
      </div>

      {/* Voucher alert */}
      <div className="sb-voucher-alert">
        <div className="sb-voucher-header">
          <span className="sb-voucher-icon">⚠️</span>
          <span className="sb-voucher-title">Voucher Funding Impact — FY2025-26</span>
          <span className="sb-voucher-amt">{fmt(d.voucherImpact)}</span>
        </div>
        <p className="sb-voucher-text">
          {d.voucherStudents.toLocaleString()} Flagler students use Family Empowerment Scholarships (vouchers) to attend private schools or homeschool — redirecting {fmt(d.voucherImpact)} from the public school budget. Up from 136 students ($880K) in 2020-21. Board member Janie Ruddy is the most vocal critic on the board.
        </p>
      </div>

      {/* Budget section with 3-view toggle */}
      <div className="co-section-title">Budget Breakdown</div>
      <div className="sb-budget-tabs">
        {['spending','revenue','schools'].map(v => (
          <button key={v} className={`sb-budget-tab ${budgetView===v?'sb-budget-tab-active':''}`} onClick={() => setBudgetView(v)}>
            {v === 'spending' ? '💸 Where it Goes' : v === 'revenue' ? '💰 Where it Comes From' : '🏫 By School'}
          </button>
        ))}
      </div>

      {budgetView === 'spending' && (
        <div className="co-budget-bars">
          {d.spending.map((cat, i) => (
            <div key={i} className="co-budget-row">
              <span className="co-budget-cat">{cat.label}</span>
              <div className="co-budget-track"><div className="co-budget-fill" style={{ width: cat.pct + '%', background: cat.color }} /></div>
              <span className="co-budget-pct" style={{ color: cat.color }}>{cat.pct}%</span>
              <span className="co-budget-amt">{fmt(cat.amount)}</span>
            </div>
          ))}
          <p className="sb-budget-note">Salaries & benefits account for ~83% of the general fund. The board has limited ability to cut non-personnel costs.</p>
        </div>
      )}

      {budgetView === 'revenue' && (
        <div className="co-budget-bars">
          {d.revenue.map((src, i) => (
            <div key={i} className="sb-revenue-block">
              <div className="co-budget-row">
                <span className="co-budget-cat">{src.label}</span>
                <div className="co-budget-track"><div className="co-budget-fill" style={{ width: src.pct + '%', background: src.color }} /></div>
                <span className="co-budget-pct" style={{ color: src.color }}>{src.pct}%</span>
                <span className="co-budget-amt">{fmt(src.amount)}</span>
              </div>
              <p className="sb-revenue-note">{src.note}</p>
            </div>
          ))}
          <a href="https://www.flaglerschools.com/about-us/financial-transparency" target="_blank" rel="noreferrer" className="co-detail-source-link" style={{display:'block',marginTop:'0.75rem'}}>View full financial documents at Flagler Schools →</a>
        </div>
      )}

      {budgetView === 'schools' && (
        <div className="sb-schools-list">
          {d.schools.map((sch, i) => {
            const isOpen = expandedSchool === i;
            return (
              <div key={i} className={`sb-school-card ${isOpen ? 'sb-school-card-open' : ''}`}>
                <button className="sb-school-row" onClick={() => setExpandedSchool(isOpen ? null : i)}>
                  <span className="sb-school-icon">{typeIcon(sch.type)}</span>
                  <div className="sb-school-info">
                    <span className="sb-school-name">{sch.name}</span>
                    <span className="sb-school-type">{sch.type} · {sch.enrollment.toLocaleString()} students</span>
                  </div>
                  <div className="sb-school-right">
                    <span className="sb-school-grade" style={{ color: gradeColor(sch.grade) }}>{sch.grade}</span>
                    {sch.gradeChange !== '→' && sch.gradeChange !== '—' && (
                      <span className="sb-school-grade-change">{sch.gradeChange}</span>
                    )}
                    <span className="sb-school-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="sb-school-detail">
                    <div className="sb-school-budget-row">
                      <div className="sb-school-budget-stat">
                        <span className="sb-school-budget-val">{fmt(sch.budget)}</span>
                        <span className="sb-school-budget-label">Est. School Budget</span>
                      </div>
                      <div className="sb-school-budget-stat">
                        <span className="sb-school-budget-val">${sch.perPupil.toLocaleString()}</span>
                        <span className="sb-school-budget-label">Per Pupil</span>
                      </div>
                    </div>
                    <div className="sb-school-highlights">
                      {sch.highlights.map((h, j) => <span key={j} className="sb-school-highlight-pill">⭐ {h}</span>)}
                    </div>
                    <a href={sch.url} target="_blank" rel="noreferrer" className="sb-school-link">Visit {sch.name} website →</a>
                  </div>
                )}
              </div>
            );
          })}
          <p className="sb-budget-note">Per-pupil figures are estimates based on district budget allocation models. Actual allocations include weighted factors for special education, Title I, and ESE students. Source: Flagler Schools Financial Transparency portal.</p>
        </div>
      )}

      {/* Recent decisions */}
      <div className="co-section-title">Recent Decisions <span className="co-tap-hint">Tap to expand</span></div>
      <div className="co-decisions">
        {d.recentDecisions.map((dec, i) => {
          const ic = impactColors[dec.impact] || { bg:'#0891b222', color:'#38bdf8' };
          const isOpen = expandedDecision === i;
          return (
            <div key={i} className={`co-decision-card ${isOpen ? 'co-decision-card-open' : ''}`}>
              <button className="co-decision-row co-decision-clickable" onClick={() => setExpandedDecision(isOpen ? null : i)}>
                <div className="co-decision-info">
                  <span className="co-decision-title">{dec.title}</span>
                  <span className="co-decision-impact" style={{ background: ic.bg, color: ic.color }}>{dec.impact}</span>
                </div>
                <div className="co-decision-meta">
                  <span className={`co-decision-outcome ${dec.outcome==='5-0'?'co-unanimous':dec.outcome==='3-2'?'co-split':''}`}>{dec.outcome}</span>
                  <span className="co-decision-date">{dec.date}</span>
                  <span className="co-decision-expand-arrow">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="co-decision-detail">
                  <div className="co-detail-block"><div className="co-detail-label">📋 What was decided</div><p className="co-detail-text">{dec.what}</p></div>
                  <div className="co-detail-block"><div className="co-detail-label">📍 Why it matters to you</div><p className="co-detail-text">{dec.whyItMatters}</p></div>
                  <div className="co-detail-label co-voted-label">🗳️ How each member voted</div>
                  <div className="co-voted-list">
                    {dec.howTheyVoted.map((v, j) => (
                      <div key={j} className="co-voted-row">
                        <span className={`co-voted-badge ${v.vote==='YES'?'co-voted-yes':'co-voted-no'}`}>{v.vote}</span>
                        <div className="co-voted-info"><span className="co-voted-name">{v.name}</span><span className="co-voted-note">{v.note}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="co-detail-block"><div className="co-detail-label">💰 Fiscal impact</div><p className="co-detail-text">{dec.fiscalImpact}</p></div>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginTop:'0.75rem'}}>
                    <a href={dec.sourceUrl} target="_blank" rel="noreferrer" className="co-detail-source-link">Official record →</a>
                    {dec.mediaLink && <a href={dec.mediaLink} target="_blank" rel="noreferrer" className="co-detail-source-link" style={{background:'rgba(56,189,248,0.07)',borderColor:'rgba(56,189,248,0.18)',color:'#38bdf8'}}>📰 Media coverage →</a>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="co-next-meeting">
        📅 Next meeting: <strong>{d.nextMeeting}</strong> · <a href="https://www.flaglerschools.com/about-us/school-board/meeting-dates" target="_blank" rel="noreferrer" className="co-attend-link">Meeting dates & agendas →</a>
      </div>
    </div>
  );
}

// ─── CITY COUNCIL COMPONENTS ─────────────────────────────────────────────────

function CityCouncilRoleCard({ onClose }) {
  return (
    <div className="role-card">
      <button className="role-close" onClick={onClose}>✕</button>
      <div className="role-title">🏙️ What Does the City Council Do?</div>
      <p className="role-intro">The Palm Coast City Council is the 5-member legislative body governing the City of Palm Coast. The Mayor and all four Council Members are elected at-large by all Palm Coast voters to 4-year terms, limited to two consecutive terms.</p>
      <div className="role-powers">
        <div className="role-power-item"><span className="role-power-icon">📜</span><div><strong>Pass City Ordinances</strong><p>Local laws governing behavior, zoning, land use, and city services within Palm Coast city limits.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">💰</span><div><strong>Control the City Budget</strong><p>Approves the annual budget and sets Palm Coast's portion of your property tax rate — separate from county and school board taxes.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">👔</span><div><strong>Hire the City Manager</strong><p>Palm Coast uses a Council-Manager form of government. The council sets policy; the City Manager runs day-to-day operations.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">🏗️</span><div><strong>Approve Development</strong><p>Site plans, variances, and special use permits within city limits. All major development goes through the council.</p></div></div>
        <div className="role-power-item"><span className="role-power-icon">🌊</span><div><strong>Manage City Services</strong><p>Parks, roads, stormwater, utilities, code enforcement — the council funds and oversees all city-run services.</p></div></div>
      </div>
      <div className="role-vs-county">
        <div className="role-vs-title">City Council vs. County Commission</div>
        <div className="role-vs-row"><span className="role-vs-city">City Council</span><span className="role-vs-desc">Inside Palm Coast city limits — roads, stormwater, parks, building permits</span></div>
        <div className="role-vs-row"><span className="role-vs-county-lbl">County Commission</span><span className="role-vs-desc">Countywide — Sheriff, courts, health, unincorporated land</span></div>
      </div>
      <div className="role-meetings">📅 Meets every Tuesday · 160 Lake Ave, City Hall · Open to the public</div>
    </div>
  );
}

function CityCouncilScorecard({ officialId }) {
  const d = CITY_COUNCIL_DATA.members[officialId];
  const o = OFFICIALS.find(off => off.id === officialId);
  const [showVotes, setShowVotes] = useState(false);
  const [activeVotePoll, setActiveVotePoll] = useState(null);
  if (!d || !o) return null;

  const catColor = { Budget:'#7c3aed', Infrastructure:'#0891b2', Housing:'#d97706', 'Land Use':'#f59e0b', Environment:'#16a34a', 'Public Safety':'#dc2626' };
  const scoreColor = s => s >= 80 ? '#16a34a' : s >= 65 ? '#d97706' : '#dc2626';

  return (
    <div className="commissioner-scorecard">
      {activeVotePoll && <VotePollDrawer vote={activeVotePoll} official={o} onClose={() => setActiveVotePoll(null)} />}

      <div className="sc-disclaimer">⚠️ Scores are beta estimates based on available public records. Not independently verified.</div>

      {/* Scores */}
      <div className="sc-scores-row">
        {[
          { label:'Civic Score',          val: d.scores.civic,         tip:'Vote participation, attendance' },
          { label:'Transparency',         val: d.scores.transparency,  tip:'Records compliance, disclosure' },
          { label:'Responsiveness',       val: d.scores.responsiveness, tip:'Constituent communication' },
        ].map((s,i) => (
          <div key={i} className="sc-score-box">
            <span className="sc-score-num" style={{ color: scoreColor(s.val) }}>{s.val}</span>
            <span className="sc-score-label">{s.label}</span>
            <div className="sc-score-bar-wrap"><div className="sc-score-bar" style={{ width: s.val+'%', background: scoreColor(s.val) }} /></div>
          </div>
        ))}
      </div>

      {/* Term info */}
      <div className="sc-term-row">
        <span className="sc-term-item">🗓️ Term: {d.termStart}–{d.termEnd}</span>
        <span className="sc-term-item">🗳️ Next election: {d.nextElection}</span>
        <span className="sc-term-item">📍 {d.seat}</span>
      </div>

      {/* Key positions */}
      <div className="sc-section-title">Key Positions</div>
      <div className="sc-positions">
        {d.keyPositions && d.keyPositions.map((p, i) => (
          <div key={i} className="sc-position-pill">✓ {p}</div>
        ))}
      </div>

      {/* Committee roles */}
      <div className="sc-section-title">Committee & Liaison Roles</div>
      <div className="sc-committees">
        {d.committeeRoles.map((r, i) => <div key={i} className="sc-committee-item">🏛️ {r}</div>)}
      </div>

      {/* Voting record */}
      <button className="sc-votes-toggle" onClick={() => setShowVotes(v => !v)}>
        {showVotes ? '▲ Hide' : '▼ Show'} Voting Record ({d.votingRecord.length} votes)
      </button>
      {showVotes && (
        <div className="sc-votes-list">
          <div className="sc-votes-hint">Tap any vote to see what your neighbors think</div>
          {d.votingRecord.map((v, i) => (
            <button key={i} className="sc-vote-row sc-vote-clickable" onClick={() => setActiveVotePoll(v)}>
              <span className={`sc-vote-badge ${v.vote === 'YES' ? 'sc-vote-yes' : 'sc-vote-no'}`}>{v.vote}</span>
              <div className="sc-vote-info">
                <span className="sc-vote-bill">{v.bill}</span>
                <div className="sc-vote-meta">
                  <span className="sc-vote-cat" style={{ color: catColor[v.category] || '#94a3b8' }}>{v.category}</span>
                  <span className="sc-vote-date">{v.date}</span>
                  <span className="sc-vote-impact" style={{ opacity: v.impact==='Critical'?1:v.impact==='High'?0.85:0.65 }}>● {v.impact}</span>
                </div>
              </div>
              <span className="sc-vote-poll-cta">Poll →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CityCouncilOverview() {
  const c = CITY_COUNCIL_DATA.council;
  const fmt = (n) => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : '$' + (n/1000).toFixed(0) + 'K';
  const [expandedDecision, setExpandedDecision] = useState(null);

  const impactColors = {
    Budget:         { bg: '#7c3aed22', color: '#a78bfa' },
    Infrastructure: { bg: '#0891b222', color: '#38bdf8' },
    Housing:        { bg: '#d9770622', color: '#fbbf24' },
    'Land Use':     { bg: '#16a34a22', color: '#4ade80' },
  };

  return (
    <div className="commission-overview">
      <div className="co-header">
        <div className="co-title-block">
          <div className="co-title">Palm Coast City Council</div>
          <div className="co-sub">Board Overview · FY2026 · City Manager: {c.cityManager}</div>
        </div>
        <div className="co-budget-badge">
          <span className="co-budget-num">{fmt(c.fy2026Budget)}</span>
          <span className="co-budget-label">Annual Budget</span>
        </div>
      </div>

      <div className="co-stats-row">
        {[
          { val: '$' + c.propertyTaxRate.toFixed(4), label: 'Tax Rate per $1,000', sub: '▼ $' + Math.abs(c.propertyTaxRateChange).toFixed(2) + ' from prior year', good: true },
          { val: '$' + c.budgetPerResident.toLocaleString(), label: 'Budget Per Resident', sub: 'Per year' },
          { val: c.unanimousPct + '%', label: 'Unanimous Votes', sub: c.splitVotes + ' split votes this year', good: c.unanimousPct > 70 },
          { val: c.avgAttendance + '%', label: 'Avg Attendance', sub: c.votesThisYear + ' votes this year', good: c.avgAttendance > 90 },
        ].map((s, i) => (
          <div key={i} className="co-stat">
            <span className="co-stat-val" style={{ color: s.good === false ? '#dc2626' : s.good === true ? '#16a34a' : 'var(--accent)' }}>{s.val}</span>
            <span className="co-stat-label">{s.label}</span>
            {s.sub && <span className="co-stat-sub">{s.sub}</span>}
          </div>
        ))}
      </div>

      <div className="co-section-title">Where Your City Tax Dollars Go</div>
      <div className="co-budget-bars">
        {c.topSpendingCategories.map((cat, i) => (
          <div key={i} className="co-budget-row">
            <span className="co-budget-cat">{cat.label}</span>
            <div className="co-budget-track"><div className="co-budget-fill" style={{ width: cat.pct + '%', background: cat.color }} /></div>
            <span className="co-budget-pct" style={{ color: cat.color }}>{cat.pct}%</span>
            <span className="co-budget-amt">{fmt(cat.amount)}</span>
          </div>
        ))}
      </div>

      <div className="co-section-title">Recent Decisions <span className="co-tap-hint">Tap to expand</span></div>
      <div className="co-decisions">
        {c.recentDecisions.map((d, i) => {
          const ic = impactColors[d.impact] || { bg: '#0891b222', color: '#38bdf8' };
          const isOpen = expandedDecision === i;
          return (
            <div key={i} className={`co-decision-card ${isOpen ? 'co-decision-card-open' : ''}`}>
              <button className="co-decision-row co-decision-clickable" onClick={() => setExpandedDecision(isOpen ? null : i)}>
                <div className="co-decision-info">
                  <span className="co-decision-title">{d.title}</span>
                  <span className="co-decision-impact" style={{ background: ic.bg, color: ic.color }}>{d.impact}</span>
                </div>
                <div className="co-decision-meta">
                  <span className={`co-decision-outcome ${d.outcome==='5-0'?'co-unanimous':d.outcome==='3-2'?'co-split':''}`}>{d.outcome}</span>
                  <span className="co-decision-date">{d.date}</span>
                  <span className="co-decision-expand-arrow">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="co-decision-detail">
                  <div className="co-detail-block co-detail-what"><div className="co-detail-label">📋 What was decided</div><p className="co-detail-text">{d.what}</p></div>
                  <div className="co-detail-block co-detail-matters"><div className="co-detail-label">📍 Why it matters to you</div><p className="co-detail-text">{d.whyItMatters}</p></div>
                  <div className="co-detail-label co-voted-label">🗳️ How each member voted</div>
                  <div className="co-voted-list">
                    {d.howTheyVoted.map((v, j) => (
                      <div key={j} className="co-voted-row">
                        <span className={`co-voted-badge ${v.vote==='YES'?'co-voted-yes':'co-voted-no'}`}>{v.vote}</span>
                        <div className="co-voted-info"><span className="co-voted-name">{v.name}</span><span className="co-voted-note">{v.note}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="co-detail-block co-detail-fiscal"><div className="co-detail-label">💰 Fiscal impact</div><p className="co-detail-text">{d.fiscalImpact}</p></div>
                  <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="co-detail-source-link">View official record →</a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="co-next-meeting">
        📅 Next meeting: <strong>{c.nextMeeting}</strong> · <a href="https://www.palmcoast.gov/agendas" target="_blank" rel="noreferrer" className="co-attend-link">How to attend or comment →</a>
      </div>
    </div>
  );
}

// ─── SHERIFF METRICS PANEL ───────────────────────────────────────────────────

function SheriffMetricsPanel({ official }) {
  const m = official.sheriffMetrics;
  const [expandedLawsuit, setExpandedLawsuit] = useState(null);
  if (!m) return null;
  const fmt = (n) => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + n;
  const jailPct = Math.round((m.jailCurrentPop / m.jailCapacity) * 100);
  const statusColor = { Settled:'#d97706', Dismissed:'#16a34a', Pending:'#dc2626' };

  return (
    <div className="sheriff-panel">
      <div className="sheriff-disclaimer">
        ⚠️ <strong>Sample metrics</strong> — pending integration with FCSO public records. All figures are illustrative.
      </div>

      {/* Key stats grid */}
      <div className="sheriff-stats-grid">
        {[
          { icon:'📉', val: m.crimeRateTrend, label:'Crime Rate Trend', color:'#16a34a' },
          { icon:'⏱️', val: m.avgResponseTime, label:'Avg Response Time', color:'#60a5fa' },
          { icon:'🔍', val: m.caseClearanceRate, label:'Case Clearance Rate', color:'#a78bfa' },
          { icon:'⚡', val: m.useOfForceIncidents, label:'Use of Force Incidents', color:'#f87171' },
          { icon:'📋', val: m.complaintsFiledYTD, label:'Complaints Filed YTD', color:'#fbbf24' },
          { icon:'✅', val: m.complaintsSustained, label:'Complaints Sustained', color:'#f87171' },
          { icon:'📹', val: m.bodyCamera, label:'Body Cameras', color:'#4ade80' },
          { icon:'👮', val: m.deputies, label:'Sworn Deputies', color:'#94a3b8' },
        ].map((s, i) => (
          <div key={i} className="sheriff-stat-box">
            <span className="sheriff-stat-icon">{s.icon}</span>
            <span className="sheriff-stat-val" style={{ color: s.color }}>{s.val}</span>
            <span className="sheriff-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Jail capacity bar */}
      <div className="sheriff-jail-block">
        <div className="sheriff-jail-header">
          <span className="sheriff-jail-title">🏢 Jail Occupancy</span>
          <span className="sheriff-jail-nums" style={{ color: jailPct > 90 ? '#f87171' : jailPct > 75 ? '#fbbf24' : '#4ade80' }}>
            {m.jailCurrentPop} / {m.jailCapacity} beds ({jailPct}%)
          </span>
        </div>
        <div className="sheriff-jail-track">
          <div className="sheriff-jail-fill" style={{ width: jailPct + '%', background: jailPct > 90 ? '#dc2626' : jailPct > 75 ? '#d97706' : '#16a34a' }} />
        </div>
      </div>

      {/* Lawsuits & Judgments */}
      <div className="sheriff-section-title">⚖️ Lawsuits & Judgments <span className="sheriff-section-sub">Public record — Florida Sunshine Law</span></div>
      <div className="sheriff-lawsuits">
        {m.lawsuits.map((l, i) => {
          const isOpen = expandedLawsuit === i;
          return (
            <div key={i} className={`sheriff-lawsuit-card ${isOpen ? 'sheriff-lawsuit-card-open' : ''}`}>
              <button className="sheriff-lawsuit-row sheriff-lawsuit-btn" onClick={() => setExpandedLawsuit(isOpen ? null : i)}>
                <div className="sheriff-lawsuit-left">
                  <span className="sheriff-lawsuit-year">{l.year}</span>
                  <div className="sheriff-lawsuit-info">
                    <span className="sheriff-lawsuit-case">{l.case}</span>
                    <span className="sheriff-lawsuit-cat">{l.category}</span>
                  </div>
                </div>
                <div className="sheriff-lawsuit-right">
                  <span className="sheriff-lawsuit-status" style={{ color: statusColor[l.status] || '#94a3b8' }}>{l.status}</span>
                  {l.amount > 0 && <span className="sheriff-lawsuit-amt">{fmt(l.amount)}</span>}
                  {l.amount === null && <span className="sheriff-lawsuit-amt" style={{color:'#64748b'}}>TBD</span>}
                  <span className="sheriff-lawsuit-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="sheriff-lawsuit-detail">
                  {l.caseNote && (
                    <div className="sheriff-lawsuit-sample-note">⚠️ {l.caseNote}</div>
                  )}
                  <div className="sheriff-lawsuit-links">
                    <a href={l.docketUrl} target="_blank" rel="noreferrer" className="sheriff-docket-link">
                      🏛️ Search Court Docket (Flagler Clerk of Courts) →
                    </a>
                    {l.mediaLinks && l.mediaLinks.length > 0 && (
                      <div className="sheriff-media-links">
                        <div className="sheriff-media-label">📰 Related Media Coverage</div>
                        {l.mediaLinks.map((m, j) => (
                          <a key={j} href={m.url} target="_blank" rel="noreferrer" className="sheriff-media-link">
                            {m.label} →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="sheriff-lawsuit-note">
        Settlement data is sourced from public county records. Settlements do not constitute admission of wrongdoing. Case numbers should be verified against official court records before citing.
      </p>

      {/* Mental health diversions */}
      <div className="sheriff-mh-block">
        <span className="sheriff-mh-icon">🧠</span>
        <div>
          <div className="sheriff-mh-val">{m.mentalHealthDiversions}</div>
          <div className="sheriff-mh-label">Mental health crisis calls resolved without arrest this year</div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTRIBUTORS TAB ────────────────────────────────────────────────────────

function ContributorsTab({ official }) {
  const data = CONTRIBUTORS[official.id];
  const [expandedDonor, setExpandedDonor] = useState(null);
  const [expandedIndustry, setExpandedIndustry] = useState(null);

  if (!data) return (
    <div className="contrib-empty">
      <div className="contrib-empty-icon">📊</div>
      <div className="contrib-empty-title">Contributor data coming soon</div>
      <p className="contrib-empty-sub">
        Campaign finance records for {official.title} are being compiled from public filings.
        Data sourced from Florida Division of Elections and FEC.
      </p>
    </div>
  );

  const fmt = (n) => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + n.toLocaleString();

  return (
    <div className="contrib-tab">

      {/* Sample data disclaimer */}
      <div className="contrib-sample-warning">
        ⚠️ <strong>Sample Data</strong> — Contributor figures shown are illustrative placeholders pending backend integration with OpenSecrets.org and Florida Division of Elections public filings. Do not treat as verified campaign finance data.
      </div>

      {/* Cycle summary */}
      <div className="contrib-summary">
        <div className="contrib-total-block">
          <span className="contrib-total-num">{fmt(data.cycleTotal)}</span>
          <span className="contrib-total-label">Total raised · {data.cycle}</span>
        </div>
        <div className="contrib-small-donor">
          <div className="contrib-small-bar-wrap">
            <div className="contrib-small-bar" style={{ width: data.smallDonorPct + '%' }} />
          </div>
          <span className="contrib-small-label">{data.smallDonorPct}% from small donors (&lt;$200)</span>
        </div>
      </div>

      {/* Noteworthy flag — shown when there's a potential conflict */}
      {data.noteworthy && (
        <div className="contrib-flag">
          <span className="contrib-flag-icon">🚩</span>
          <div>
            <div className="contrib-flag-title">Noteworthy relationship</div>
            <p className="contrib-flag-text">{data.noteworthy}</p>
          </div>
        </div>
      )}

      {/* Industry breakdown — clickable drill-down */}
      <div className="contrib-section-title">💼 Top Contributing Industries <span className="contrib-tap-hint">Tap to see donors</span></div>
      <div className="contrib-industries">
        {data.topIndustries.map((ind, i) => {
          const meta = INDUSTRY_META[ind.name] || { color: '#64748b', icon: '🏢', why: '' };
          const isOpen = expandedIndustry === ind.name;
          // Donors in this industry
          const industryDonors = data.topDonors.filter(d => d.industry === ind.name);
          return (
            <div key={i} className={`contrib-industry-card ${isOpen ? 'contrib-industry-open' : ''}`} style={{ '--ind-color': meta.color }}>
              <button className="contrib-industry-row" onClick={() => setExpandedIndustry(isOpen ? null : ind.name)}>
                <div className="contrib-ind-left">
                  <span className="contrib-ind-icon">{meta.icon}</span>
                  <div className="contrib-ind-info">
                    <span className="contrib-ind-name">{ind.name}</span>
                    <span className="contrib-ind-why">{meta.why}</span>
                  </div>
                </div>
                <div className="contrib-ind-right">
                  <div className="contrib-ind-bar-wrap">
                    <div className="contrib-ind-bar" style={{ width: ind.pct + '%', background: meta.color }} />
                  </div>
                  <span className="contrib-ind-amt" style={{ color: meta.color }}>{fmt(ind.total)}</span>
                  <span className="contrib-ind-pct">{ind.pct}%</span>
                  <span className="contrib-ind-arrow">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Drill-down panel */}
              {isOpen && (
                <div className="contrib-ind-drilldown" style={{ borderColor: meta.color + '33' }}>
                  {/* Industry context */}
                  <div className="contrib-ind-context">
                    <div className="contrib-ind-context-label" style={{ color: meta.color }}>
                      {meta.icon} Why {ind.name} interests donate
                    </div>
                    <p className="contrib-ind-context-text">{meta.why}</p>
                    <div className="contrib-ind-context-stats">
                      <span>{fmt(ind.total)} total</span>
                      <span>·</span>
                      <span>{ind.pct}% of all contributions</span>
                      <span>·</span>
                      <span>{industryDonors.length > 0 ? industryDonors.length + ' named donor' + (industryDonors.length > 1 ? 's' : '') : 'PAC contributions'}</span>
                    </div>
                  </div>

                  {/* Named donors in this industry */}
                  {industryDonors.length > 0 ? (
                    <div className="contrib-ind-donors">
                      <div className="contrib-ind-donors-label">Named donors in this industry</div>
                      {industryDonors.map((donor, j) => (
                        <div key={j} className="contrib-ind-donor-row">
                          <div className="contrib-ind-donor-info">
                            <span className="contrib-ind-donor-name">{donor.name}</span>
                            <span className="contrib-ind-donor-emp">{donor.employer} · {donor.location}</span>
                            <span className="contrib-ind-donor-rel">{donor.relationship}</span>
                          </div>
                          <span className="contrib-ind-donor-amt" style={{ color: meta.color }}>{fmt(donor.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="contrib-ind-no-donors">
                      Individual donor names for this industry category are aggregated from FEC/state filings.
                      Full itemized records available at the source link below.
                    </div>
                  )}

                  {/* What to watch for */}
                  <div className="contrib-ind-watchfor">
                    <div className="contrib-ind-watchfor-label">👁️ What to watch for</div>
                    <p className="contrib-ind-watchfor-text">
                      {ind.name === 'Real Estate' && `Check whether ${official.name} has voted on any zoning changes, development approvals, or land use amendments that benefit real estate interests since receiving these donations.`}
                      {ind.name === 'Finance / Banking' && `Review whether ${official.name} has supported or opposed financial regulation, consumer protection measures, or banking oversight legislation.`}
                      {ind.name === 'Healthcare' && `Watch for ${official.name}'s positions on insurance regulation, hospital funding, and pharmaceutical pricing legislation.`}
                      {ind.name === 'Energy' && `Monitor votes on utility rate approvals, pipeline permits, environmental regulations, and renewable energy mandates.`}
                      {ind.name === 'Agriculture' && `Track positions on water rights, agricultural land protections, and farm subsidy programs.`}
                      {ind.name === 'Law / Legal' && `Note any positions on tort reform, judicial appointments, or regulatory enforcement that affect legal industry interests.`}
                      {ind.name === 'Defense' && `Watch for support of defense spending, military contracts, and veterans programs.`}
                      {ind.name === 'Individual' && `Large individual donors often represent business interests not captured by industry categories. Research each donor's employer and known interests.`}
                      {!['Real Estate','Finance / Banking','Healthcare','Energy','Agriculture','Law / Legal','Defense','Individual'].includes(ind.name) && `Review voting record for decisions that align with ${ind.name} industry interests.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Geographic split */}
      <div className="contrib-section-title">📍 Where the Money Came From</div>
      <div className="contrib-geo">
        {data.geographicSplit.map((g, i) => (
          <div key={i} className="contrib-geo-row">
            <span className="contrib-geo-region">{g.region}</span>
            <div className="contrib-geo-track">
              <div className="contrib-geo-fill" style={{ width: g.pct + '%' }} />
            </div>
            <span className="contrib-geo-pct">{g.pct}%</span>
          </div>
        ))}
      </div>
      <p className="contrib-geo-note">
        Money raised outside the official's district may indicate national party or industry coordination.
      </p>

      {/* Top donors list */}
      <div className="contrib-section-title">👤 Top Individual & PAC Donors</div>
      <div className="contrib-donors">
        {data.topDonors.map((donor, i) => {
          const meta = INDUSTRY_META[donor.industry] || { color: '#64748b', icon: '🏢' };
          const isOpen = expandedDonor === i;
          return (
            <div key={i} className={`contrib-donor-card ${isOpen ? 'contrib-donor-open' : ''}`}>
              <button className="contrib-donor-row" onClick={() => setExpandedDonor(isOpen ? null : i)}>
                <div className="contrib-donor-rank">#{i+1}</div>
                <div className="contrib-donor-info">
                  <span className="contrib-donor-name">{donor.name}</span>
                  <span className="contrib-donor-emp">
                    <span className="contrib-donor-ind-icon">{meta.icon}</span>
                    {donor.employer} · {donor.location}
                  </span>
                </div>
                <div className="contrib-donor-right">
                  <span className="contrib-donor-amt" style={{ color: meta.color }}>{fmt(donor.amount)}</span>
                  <span className="contrib-donor-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="contrib-donor-detail">
                  <div className="contrib-donor-detail-row">
                    <span className="contrib-detail-label">Industry</span>
                    <span className="contrib-detail-val" style={{ color: meta.color }}>
                      {meta.icon} {donor.industry}
                    </span>
                  </div>
                  <div className="contrib-donor-detail-row">
                    <span className="contrib-detail-label">Location</span>
                    <span className="contrib-detail-val">📍 {donor.location}</span>
                  </div>
                  <div className="contrib-donor-detail-row">
                    <span className="contrib-detail-label">Amount</span>
                    <span className="contrib-detail-val" style={{ color: meta.color }}>{fmt(donor.amount)}</span>
                  </div>
                  <div className="contrib-why-block">
                    <div className="contrib-why-label">❓ Why this industry donates</div>
                    <p className="contrib-why-text">{INDUSTRY_META[donor.industry]?.why || 'Industry relationship data pending.'}</p>
                  </div>
                  <div className="contrib-rel-block">
                    <div className="contrib-rel-label">🔗 Relationship to official</div>
                    <p className="contrib-rel-text">{donor.relationship}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Source */}
      <div className="contrib-source-row">
        <span className="contrib-source-label">Source: {data.source}</span>
        <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="contrib-source-link">
          Verify →
        </a>
      </div>
      <p className="contrib-disclaimer">
        Contribution data is sourced from public campaign finance filings. PolitiCard does not imply wrongdoing by listing donor relationships — this information is public record provided for transparency.
      </p>
    </div>
  );
}

function OfficialProfile({ official: o, onBack, likes, onLike }) {
  const [profTab, setProfTab] = useState('posts');
  const posts = FEED_ALL.filter(p => p.official.id === o.id);
  const mc = o.typologyMatch >= 65 ? '#16a34a' : o.typologyMatch >= 45 ? '#d97706' : '#dc2626';
  const hasBudget = !!BUDGETS[o.id];

  return (
    <div className="profile-page">
      {/* Compact header */}
      <div className="prof-compact-header" style={{ borderBottom: `3px solid ${o.color}` }}>
        <button className="prof-close-compact" onClick={onBack}>←</button>
        <div className="prof-compact-inner">
          <OfficialAvatar official={o} size={56} radius={14} fontSize="1.6rem" />
          <div className="prof-compact-info">
            <div className="prof-compact-name">
              {o.name}
              <span className="prof-compact-party" style={{ color: partyColor(o.party) }}> {o.party}</span>
            </div>
            <div className="prof-compact-role">{o.title}</div>
            <div className="prof-compact-badges">
              {o.typologyMatch > 0 && (
                <span className="prof-compact-match" style={{ color: mc }}>
                  {o.typologyMatch}% your match
                </span>
              )}
            </div>
          </div>
          <button className="prof-follow-compact">+ Follow</button>
        </div>
      </div>

      <p className="prof-bio">{o.bio}</p>

      {/* Inline donor snapshot — always visible in bio area */}
      {CONTRIBUTORS[o.id] && (() => {
        const d = CONTRIBUTORS[o.id];
        const fmt = (n) => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + n;
        const topInd = d.topIndustries[0];
        const topDonor = d.topDonors[0];
        const topMeta = INDUSTRY_META[topInd?.name] || { color: '#64748b', icon: '🏢' };
        return (
          <div className="prof-donor-snapshot">
            <div className="prof-donor-snap-header">
              <span className="prof-donor-snap-title">💵 Campaign Contributions · {d.cycle}</span>
              <span className="prof-donor-snap-total">{fmt(d.cycleTotal)} raised</span>
            </div>
            {d.noteworthy && (
              <div className="prof-donor-flag">
                🚩 <span>{d.noteworthy}</span>
              </div>
            )}
            <div className="prof-donor-snap-grid">
              <div className="prof-donor-snap-item">
                <span className="prof-donor-snap-label">Top Industry</span>
                <span className="prof-donor-snap-val" style={{ color: topMeta.color }}>
                  {topMeta.icon} {topInd?.name}
                </span>
                <span className="prof-donor-snap-sub">{fmt(topInd?.total)} · {topInd?.pct}% of total</span>
              </div>
              <div className="prof-donor-snap-item">
                <span className="prof-donor-snap-label">Largest Donor</span>
                <span className="prof-donor-snap-val">{topDonor?.name}</span>
                <span className="prof-donor-snap-sub">{fmt(topDonor?.amount)} · {topDonor?.employer}</span>
              </div>
              <div className="prof-donor-snap-item">
                <span className="prof-donor-snap-label">Small Donors</span>
                <span className="prof-donor-snap-val" style={{ color: d.smallDonorPct >= 50 ? '#16a34a' : '#d97706' }}>
                  {d.smallDonorPct}%
                </span>
                <span className="prof-donor-snap-sub">Under $200 donations</span>
              </div>
              <div className="prof-donor-snap-item">
                <span className="prof-donor-snap-label">Local Money</span>
                <span className="prof-donor-snap-val">{d.geographicSplit[0]?.pct}%</span>
                <span className="prof-donor-snap-sub">From {d.geographicSplit[0]?.region}</span>
              </div>
            </div>
            <div className="prof-donor-industry-bars">
              {d.topIndustries.slice(0, 4).map((ind, i) => {
                const m = INDUSTRY_META[ind.name] || { color: '#64748b' };
                return (
                  <div key={i} className="prof-donor-ind-row">
                    <span className="prof-donor-ind-name">{ind.name}</span>
                    <div className="prof-donor-ind-track">
                      <div className="prof-donor-ind-fill" style={{ width: ind.pct + '%', background: m.color }} />
                    </div>
                    <span className="prof-donor-ind-pct" style={{ color: m.color }}>{ind.pct}%</span>
                  </div>
                );
              })}
            </div>
            <p className="prof-donor-snap-note" style={{color:"#f59e0b"}}><strong>⚠️ Sample data</strong> — pending real API integration. 
              Full donor breakdown available in the Donors tab below. Source: {d.source}.
            </p>
          </div>
        );
      })()}

      {o.typologyMatch > 0 && (
        <div className="prof-stats-row">
          <div className="prof-stat"><span className="ps-num" style={{ color: mc }}>{o.typologyMatch}%</span><span className="ps-lbl">Your Match</span></div>
        </div>
      )}

      {o.typologyMatch > 0 && (
        <div className="typology-section">
          <div className="typo-header">
            <span>Preference Similarity</span>
            <span style={{ color: mc, fontWeight:600 }}>{o.typologyMatch}% match</span>
          </div>
          <div className="typo-track"><div className="typo-fill" style={{ width:`${o.typologyMatch}%`, background:mc }} /></div>
          <div className="typo-ends"><span>Low alignment</span><span>High alignment</span></div>
        </div>
      )}

      <div className="prof-tabs">
        <button className={`prof-tab-btn ${profTab==='posts'?'prof-tab-active':''}`} onClick={() => setProfTab('posts')}>📝 Posts</button>
        {hasBudget && <button className={`prof-tab-btn ${profTab==='budget'?'prof-tab-active':''}`} onClick={() => setProfTab('budget')}>💰 Budget</button>}
        {o.sheriffMetrics && <button className={`prof-tab-btn ${profTab==='sheriff'?'prof-tab-active':''}`} onClick={() => setProfTab('sheriff')}>🚔 Metrics</button>}
        {CITY_COUNCIL_DATA.members[o.id] && <button className={`prof-tab-btn ${profTab==='council'?'prof-tab-active':''}`} onClick={() => setProfTab('council')}>📋 Scorecard</button>}
        {SCHOOL_BOARD_DATA.members[o.id] && <button className={`prof-tab-btn ${profTab==='sbcard'?'prof-tab-active':''}`} onClick={() => setProfTab('sbcard')}>📋 Scorecard</button>}
        <button className={`prof-tab-btn ${profTab==='contributors'?'prof-tab-active':''}`} onClick={() => setProfTab('contributors')}>💵 Donors</button>
      </div>

      {profTab === 'posts' && (
        <div className="prof-posts">
          {posts.length > 0 ? posts.map(p => (
            <PostCard key={p.id} post={p} onProfile={() => {}} liked={likes.includes(p.id)} onLike={onLike} />
          )) : <p className="no-posts">No posts yet.</p>}
        </div>
      )}
      {profTab === 'budget' && <BudgetTab official={o} />}
      {profTab === 'sheriff' && <SheriffMetricsPanel official={o} />}
      {profTab === 'council' && <CityCouncilScorecard officialId={o.id} />}
      {profTab === 'sbcard' && <SchoolBoardScorecard officialId={o.id} />}
      {profTab === 'contributors' && <ContributorsTab official={o} />}
    </div>
  );
}

// ─── NAV & SHELL ────────────────────────────────────────────────────────────

function BottomNav({ active, onChange, unreadNotifs = 0 }) {
  const tabs = [
    { id:'feed', icon:'🏠', label:'Feed' },
    { id:'explore', icon:'🔍', label:'Explore' },
    { id:'notifications', icon:'🔔', label:'Activity', badge: unreadNotifs },
    { id:'profile', icon:'👤', label:'Profile' },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button key={t.id} className={`bnav-btn ${active===t.id?'bnav-active':''}`} onClick={() => onChange(t.id)}>
          <div className="bnav-icon-wrap">
            <span className="bnav-icon">{t.icon}</span>
            {t.badge > 0 && <span className="bnav-badge">{t.badge}</span>}
          </div>
          <span className="bnav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('politiscore_user');
    return saved ? JSON.parse(saved) : null;
  });
 const [zip, setZipState] = useState(() => localStorage.getItem('politiscore_zip') || null);

  const setZip = (z) => {
    localStorage.setItem('politiscore_zip', z);
    setZipState(z);
  };
  const [liveOfficials, setLiveOfficials] = useState([]);
  const [liveFeedItems, setLiveFeedItems] = useState([]);

React.useEffect(() => {
  if (!zip) return;
  fetchOfficialsByZip(zip).then(result => {
    if (result.success && result.officials.length > 0) {
      setLiveOfficials(result.officials);
    }
  });
  fetchFeedByZip(zip).then(result => {
    if (result.success && result.items.length > 0) {
      setLiveFeedItems(result.items);
    }
  });
}, [zip]);
  const [tab, setTab] = useState('feed');
  const [profile, setProfile] = useState(null);
  const [likes, setLikes] = useState([]);
  const [showZipModal, setShowZipModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [readPostIds, setReadPostIds] = useState(new Set());
  const [followedLocations, setFollowedLocations] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [pollVotes, setPollVotes] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);

  const togglePin = (post) => setPinnedPosts(prev => prev.some(p => p.id === post.id) ? prev.filter(p => p.id !== post.id) : [post, ...prev]);
  const handleLogout = () => {
    localStorage.removeItem('politiscore_user');
    localStorage.removeItem('politiscore_zip');
    setUser(null);
    setZipState(null);
  };
  const userName = 'Andrew';

  const recordPollVote = (pollId, choice) => setPollVotes(prev => prev.some(v => v.pollId === pollId) ? prev : [...prev, { pollId, choice }]);

  const INITIAL_UNREAD_NOTIFS = 2;
  const unreadNotifCount = Math.max(0, INITIAL_UNREAD_NOTIFS - readNotifIds.length);

  const addLocation = (loc) => {
    setFollowedLocations(prev => prev.some(l => l.zip === loc.zip) ? prev : [...prev, loc]);
  };
  const removeLocation = (zipCode) => {
    setFollowedLocations(prev => prev.filter(l => l.zip !== zipCode));
  };

  // Flatten all remote officials from followed locations
  const remoteOfficials = followedLocations.flatMap(loc => loc.officials);

  const toggleLike = (id) => setLikes(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const markPostRead = (id) => setReadPostIds(prev => { if (prev.has(id)) return prev; const s = new Set(prev); s.add(id); return s; });
  const openProfile = (o) => setProfile(o);
  const changeTab = (t) => { setTab(t); setProfile(null); };

  if (!user) return <Login onAuth={(u, z) => { localStorage.setItem('politiscore_user', JSON.stringify(u)); setUser(u); if (z) setZip(z); }} />;
  if (!zip) return <ZipOnboarding onComplete={setZip} />;

  const tabTitles = { feed:'PolitiCard', explore:'Explore', notifications:'Activity', profile:'My Profile' };
  const totalLocations = 1 + followedLocations.length;

  return (
    <div className="app-shell">
      {showZipModal && <ZipModal currentZip={zip} onClose={() => setShowZipModal(false)} onSave={setZip} />}
      {showLocModal && (
        <LocationSearchModal
          followedLocations={followedLocations}
          onAdd={addLocation}
          onRemove={removeLocation}
          onClose={() => setShowLocModal(false)}
        />
      )}
      {!profile && (
        <header className="top-bar">
          <div className="tb-left">
            {tab === 'feed' ? (
              <PolitiCardLogo height={28} />
            ) : (
              <>
                <PolitiCardIcon size={22} />
                <span className="tb-title">{tabTitles[tab]}</span>
              </>
            )}
          </div>
          <div className="tb-right">
            <button className="tb-add-location" onClick={() => setShowLocModal(true)} title="Follow another location">
              <span>🌐</span>
              {followedLocations.length > 0 && <span className="tb-loc-badge">{totalLocations}</span>}
            </button>
            <button className="tb-zip" onClick={() => setShowZipModal(true)}>
              <span>📍</span><span>{FL_ZIP_CITY[zip] || LOCATION_DB[zip]?.displayName || zip}</span>
            </button>
          </div>
        </header>
      )}
      <main className="app-main">
        {profile ? (
          <OfficialProfile official={profile} onBack={() => setProfile(null)} likes={likes} onLike={toggleLike} />
        ) : (
          <>
            {tab==='feed' && <FeedTab zip={zip} userName={userName} onProfile={openProfile} likes={likes} onLike={toggleLike} onPostRead={markPostRead} remoteOfficials={remoteOfficials} followedLocations={followedLocations} onAddLocation={() => setShowLocModal(true)} pollVotes={pollVotes} onPollVote={recordPollVote} pinnedPosts={pinnedPosts} onPin={togglePin} liveOfficials={liveOfficials} liveFeedItems={liveFeedItems} />}
{tab==='explore' && <ExploreTab onProfile={openProfile} liveOfficials={liveOfficials} zip={zip} />}
            {tab==='notifications' && <NotificationsTab onProfile={openProfile} readNotifIds={readNotifIds} onReadNotif={id => setReadNotifIds(prev => prev.includes(id) ? prev : [...prev, id])} />}
            {tab==='profile' && <MyProfileTab zip={zip} userName={userName} userPhoto={userPhoto} onPhotoChange={setUserPhoto} postsRead={readPostIds.size} likes={likes} followedLocations={followedLocations} onManageLocations={() => setShowLocModal(true)} pollVotesCount={pollVotes.length} pinnedPosts={pinnedPosts} onUnpin={(id) => setPinnedPosts(prev => prev.filter(p => p.id !== id))} onLogout={handleLogout} />}
          </>
        )}
      </main>
      <BottomNav active={tab} onChange={changeTab} unreadNotifs={unreadNotifCount} />
    </div>
  );
}

