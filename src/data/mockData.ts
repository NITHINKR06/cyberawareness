import type { LearningModule, Quiz, Achievement, Badge, LeaderboardEntry } from '../types';

export const learningModules: LearningModule[] = [
  {
    id: 'beginner',
    title: 'Cybercrime & Scam Basics (Beginner)',
    description: 'Foundational concepts: phishing, identity theft, safe responses to suspicious messages',
    content: `# Cybercrime & Scam Basics (Beginner)

This module covers foundational cyber safety topics that your beginner quiz evaluates.

## Topics Covered
- What phishing is commonly used for
- Recognizing smishing (SMS phishing)
- Data most valuable to identity thieves
- Safe handling of unknown payment requests
- Common business scams (e.g., invoice fraud)

## Practical Tips
- Verify unexpected requests using official channels
- Avoid clicking links in unsolicited messages
- Guard personal and financial information
`,
    difficulty: 'beginner',
    pointsReward: 80,
    orderIndex: 0,
  },
  {
    id: 'intermediate',
    title: 'Financial Scams & Identity Protection (Intermediate)',
    description: 'Deeper dive into BEC, vishing, vendor/invoice fraud, and data breach risks',
    content: `# Financial Scams & Identity Protection (Intermediate)

This module aligns with your intermediate quiz content focused on fraud targeting people and businesses.

## Topics Covered
- Business Email Compromise (BEC) and invoice/vendor fraud
- Identity theft techniques (email spoofing, phishing)
- Vishing calls impersonating banks
- Red flags of fraudulent investment schemes
- Data breach risks when storing customer data insecurely

## Mitigations
- Strict verification for payment change requests
- Train for social engineering awareness
- Reduce data exposure; implement proper security controls
`,
    difficulty: 'intermediate',
    pointsReward: 120,
    orderIndex: 3,
  },
  {
    id: '1',
    title: 'Password Security Basics',
    description: 'Learn how to create and manage strong passwords',
    content: `# Password Security Basics

Strong passwords are your first line of defense against cyber attacks.

## Key Principles:
- Use at least 12 characters
- Mix uppercase, lowercase, numbers, and symbols
- Avoid common words and personal information
- Use unique passwords for each account
- Consider using a password manager

## Common Mistakes:
- Reusing passwords across multiple sites
- Using predictable patterns (e.g., Password123!)
- Sharing passwords with others
- Writing passwords on sticky notes`,
    difficulty: 'beginner',
    pointsReward: 100,
    orderIndex: 1,
  },
  {
    id: '2',
    title: 'Recognizing Phishing Attempts',
    description: 'Identify and avoid phishing scams',
    content: `# Recognizing Phishing Attempts

Phishing is a technique where attackers try to trick you into revealing sensitive information.

## Warning Signs:
- Urgent or threatening language
- Suspicious sender addresses
- Generic greetings ("Dear Customer")
- Requests for personal information
- Unexpected attachments or links
- Poor grammar and spelling

## How to Protect Yourself:
- Verify sender identity independently
- Hover over links before clicking
- Check for HTTPS on websites
- Report suspicious emails
- Never share sensitive info via email`,
    difficulty: 'beginner',
    pointsReward: 150,
    orderIndex: 2,
  },
  {
    id: '3',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your accounts',
    content: `# Two-Factor Authentication (2FA)

2FA adds an extra security layer beyond just passwords.

## Types of 2FA:
- SMS codes
- Authenticator apps (recommended)
- Hardware security keys
- Biometric verification

## Why It Matters:
Even if someone steals your password, they can't access your account without the second factor.

## Best Practices:
- Enable 2FA on all important accounts
- Use authenticator apps over SMS when possible
- Keep backup codes in a secure location
- Register multiple 2FA methods when available`,
    difficulty: 'intermediate',
    pointsReward: 200,
    orderIndex: 3,
  },
  {
    id: '4',
    title: 'Social Engineering Awareness',
    description: 'Understand psychological manipulation tactics',
    content: `# Social Engineering Awareness

Social engineering exploits human psychology rather than technical vulnerabilities.

## Common Tactics:
- Pretexting (creating fake scenarios)
- Baiting (offering something desirable)
- Quid pro quo (promising a benefit)
- Tailgating (physical unauthorized access)

## Red Flags:
- Unusual requests from known contacts
- Pressure to act immediately
- Requests to bypass normal procedures
- Too-good-to-be-true offers

## Defense Strategies:
- Verify identities through separate channels
- Question unusual requests
- Follow security protocols strictly
- Report suspicious interactions`,
    difficulty: 'intermediate',
    pointsReward: 200,
    orderIndex: 4,
  },
  {
    id: '5',
    title: 'Safe Online Shopping',
    description: 'Protect yourself while making online purchases',
    content: `# Safe Online Shopping

Online shopping safety prevents financial fraud and identity theft.

## Before You Buy:
- Verify website legitimacy
- Look for HTTPS and padlock icon
- Research seller reviews
- Check return policies
- Use secure payment methods

## Payment Security:
- Use credit cards over debit cards
- Consider virtual credit cards
- Enable purchase notifications
- Monitor statements regularly
- Avoid public WiFi for transactions

## Warning Signs of Fake Stores:
- Prices too good to be true
- Poor website design
- No contact information
- Limited payment options
- Pressure to buy immediately`,
    difficulty: 'beginner',
    pointsReward: 150,
    orderIndex: 5,
  },
];

export const quizzes: Quiz[] = [
  // 🟢 Beginner Level – General Cybercrime & Business Scam Awareness
  {
    id: 'q1',
    moduleId: 'beginner',
    question: 'What is phishing commonly used for?',
    options: [
      'Sending email newsletters',
      'Tricking people into revealing personal or financial information',
      'Buying products online',
      'Installing antivirus software',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q2',
    moduleId: 'beginner',
    question: 'You receive a text claiming to be from your bank asking you to verify your account. What is this an example of?',
    options: ['Adware', 'Credential stuffing', 'Smishing', 'Whaling'],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q3',
    moduleId: 'beginner',
    question: 'What kind of information is most valuable to identity thieves?',
    options: [
      'Social media photos',
      'Bank account details and government ID numbers',
      'Favorite movies',
      'Public website URLs',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q4',
    moduleId: 'beginner',
    question: 'Which of the following is a safe practice when dealing with unknown payment requests via email?',
    options: [
      'Responding quickly to avoid penalties',
      'Clicking on any provided links',
      'Verifying the request through an official contact method',
      'Forwarding it to a friend',
    ],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q5',
    moduleId: 'beginner',
    question: 'A common business scam where attackers request fake invoice payments is called:',
    options: ['Credential theft', 'Ransomware', 'Invoice fraud', 'Credit card skimming'],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q6',
    moduleId: 'beginner',
    question: 'Which of the following is a cybercrime that affects both individuals and companies?',
    options: ['Social engineering', 'Two-factor authentication', 'File backup', 'Firewall configuration'],
    correctAnswer: 0,
    points: 10,
  },
  {
    id: 'q7',
    moduleId: 'beginner',
    question: 'A scammer posing as a government official demanding payment is using what tactic?',
    options: ['Encryption', 'Social engineering', 'Credential rotation', 'Penetration testing'],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q8',
    moduleId: 'beginner',
    question: 'What is identity theft?',
    options: [
      'Creating a social media profile',
      "Stealing someone's personal data to impersonate them",
      'Using a VPN to browse the web',
      'Backing up files to the cloud',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q9',
    moduleId: 'beginner',
    question: 'Which of the following is NOT a common target of personal cybercrime?',
    options: ['Social Security Numbers', 'Medical records', 'Online shopping history', 'Encrypted passwords'],
    correctAnswer: 3,
    points: 10,
  },
  {
    id: 'q10',
    moduleId: 'beginner',
    question: "When an attacker sends malware hidden in a job offer or resume, it's typically a:",
    options: [
      'Business Email Compromise',
      'Trojan horse attack',
      'Vishing scam',
      'CEO fraud',
    ],
    correctAnswer: 1,
    points: 10,
  },

  // 🟡 Intermediate Level – Financial Scams, Identity Theft & Common Threats
  {
    id: 'q11',
    moduleId: 'intermediate',
    question: 'A scammer tricks a company employee into transferring money to a fake account. This is called:',
    options: [
      'Man-in-the-middle fraud',
      'Business email compromise (BEC)',
      'SQL injection',
      'Credential stuffing',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q12',
    moduleId: 'intermediate',
    question: 'Which of the following is a common method used by identity thieves to steal personal data?',
    options: [
      'Using strong encryption',
      'Email spoofing and phishing',
      'Installing updates',
      'Two-factor authentication',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q13',
    moduleId: 'intermediate',
    question: 'You get a phone call from someone claiming to be from your bank, asking you to verify your account number. What is this?',
    options: ['Malware', 'Data leak', 'Vishing', 'Hacking'],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q14',
    moduleId: 'intermediate',
    question: 'A cybercriminal sends a fake payment request that appears to come from a trusted vendor. What is this known as?',
    options: ['Vendor fraud', 'Data harvesting', 'Fake DNS routing', 'Session hijacking'],
    correctAnswer: 0,
    points: 10,
  },
  {
    id: 'q15',
    moduleId: 'intermediate',
    question: 'Which practice can help prevent identity theft?',
    options: [
      'Using the same password for all accounts',
      'Ignoring software updates',
      'Shredding sensitive documents',
      'Clicking on pop-up alerts',
    ],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q16',
    moduleId: 'intermediate',
    question: 'What makes credential stuffing effective for attackers?',
    options: [
      'It encrypts credentials automatically',
      'Victims reuse the same passwords across websites',
      'It requires physical access',
      'It attacks firewalls directly',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q17',
    moduleId: 'intermediate',
    question: "An employee is tricked into changing a supplier's bank account number. This is an example of:",
    options: ['Insider attack', 'Account takeover', 'Payment redirection fraud', 'Virus infection'],
    correctAnswer: 2,
    points: 10,
  },
  {
    id: 'q18',
    moduleId: 'intermediate',
    question: 'Which is a red flag for identity theft on a personal bank account?',
    options: [
      'Small, unfamiliar transactions',
      'Receiving email receipts',
      'Viewing your bank balance',
      'Using a budgeting app',
    ],
    correctAnswer: 0,
    points: 10,
  },
  {
    id: 'q19',
    moduleId: 'intermediate',
    question: 'What is the purpose of a fraudulent investment scam targeting businesses or individuals?',
    options: [
      'To test financial literacy',
      'To trick people into funding fake opportunities',
      'To generate leads',
      'To promote legitimate services',
    ],
    correctAnswer: 1,
    points: 10,
  },
  {
    id: 'q20',
    moduleId: 'intermediate',
    question: 'A company storing customer data without proper security may be vulnerable to:',
    options: ['CEO fraud', 'Data breach', 'Bounced emails', 'Legal software use'],
    correctAnswer: 1,
    points: 10,
  },
];

export const achievements: Achievement[] = [
  {
    id: 'a1',
    name: 'First Steps',
    description: 'Complete your first learning module',
    icon: 'BookOpen',
    requirementType: 'modules',
    requirementValue: 1,
    pointsReward: 50,
  },
  {
    id: 'a2',
    name: 'Knowledge Seeker',
    description: 'Complete 3 learning modules',
    icon: 'GraduationCap',
    requirementType: 'modules',
    requirementValue: 3,
    pointsReward: 100,
  },
  {
    id: 'a3',
    name: 'Cyber Guardian',
    description: 'Complete all learning modules',
    icon: 'Shield',
    requirementType: 'modules',
    requirementValue: 5,
    pointsReward: 200,
  },
  {
    id: 'a4',
    name: 'Point Collector',
    description: 'Earn 500 points',
    icon: 'Star',
    requirementType: 'points',
    requirementValue: 500,
    pointsReward: 100,
  },
  {
    id: 'a5',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    requirementType: 'streak',
    requirementValue: 7,
    pointsReward: 150,
  },
  {
    id: 'a6',
    name: 'Community Protector',
    description: 'Report 5 scams',
    icon: 'AlertTriangle',
    requirementType: 'reports',
    requirementValue: 5,
    pointsReward: 100,
  },
];

export const badges: Badge[] = [
  {
    id: 'b1',
    name: 'Bronze Defender',
    description: 'Reach 100 points',
    icon: 'Award',
    tier: 'bronze',
    requirementPoints: 100,
  },
  {
    id: 'b2',
    name: 'Silver Guardian',
    description: 'Reach 500 points',
    icon: 'Award',
    tier: 'silver',
    requirementPoints: 500,
  },
  {
    id: 'b3',
    name: 'Gold Protector',
    description: 'Reach 1000 points',
    icon: 'Award',
    tier: 'gold',
    requirementPoints: 1000,
  },
  {
    id: 'b4',
    name: 'Platinum Champion',
    description: 'Reach 2000 points',
    icon: 'Trophy',
    tier: 'platinum',
    requirementPoints: 2000,
  },
];

export const leaderboardData: LeaderboardEntry[] = [
  { userId: '1', username: 'CyberNinja', totalPoints: 2450, level: 12, rank: 1 },
  { userId: '2', username: 'SecureUser', totalPoints: 2100, level: 11, rank: 2 },
  { userId: '3', username: 'SafetyFirst', totalPoints: 1850, level: 10, rank: 3 },
  { userId: '4', username: 'GuardianPro', totalPoints: 1600, level: 9, rank: 4 },
  { userId: '5', username: 'PhishHunter', totalPoints: 1400, level: 9, rank: 5 },
  { userId: '6', username: 'ShieldMaster', totalPoints: 1200, level: 8, rank: 6 },
  { userId: '7', username: 'CyberWatch', totalPoints: 1050, level: 7, rank: 7 },
  { userId: '8', username: 'DataDefender', totalPoints: 900, level: 7, rank: 8 },
  { userId: '9', username: 'SecureNet', totalPoints: 750, level: 6, rank: 9 },
  { userId: '10', username: 'SafeBrowse', totalPoints: 600, level: 5, rank: 10 },
];
