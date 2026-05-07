export const landingData = {
  navLinks: [
    { label: "Solutions", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Enterprise", href: "#" },
    { label: "Resources", href: "#" },
  ],
  hero: {
    badge: "Introducing AI-Powered Candidate Matching",
    titleLine1: "Hire Smarter.",
    titleLine2: "Interview Better.",
    description:
      "Transform your recruitment pipeline with enterprise-grade AI. Automate resume parsing, conduct intelligent mock interviews, and identify top talent faster than ever before.",
    ctaPrimary: "I am looking to hire",
    ctaSecondary: "I am looking for a job",
  },
  features: {
    title: "Intelligent workflows for modern HR teams",
    description:
      "Everything you need to scale your hiring process without compromising on quality.",
    items: [
      {
        icon: "document_scanner",
        title: "Resume Parsing",
        description:
          "Instantly extract key skills, experience, and education from thousands of applications using our advanced AI models. Standardize data effortlessly.",
      },
      {
        icon: "record_voice_over",
        title: "Mock Interviews",
        description:
          "Provide candidates with AI-driven preliminary interviews. Automatically assess communication skills, technical knowledge, and cultural fit before human intervention.",
      },
      {
        icon: "schema",
        title: "Applicant Pipeline",
        description:
          "Visualize your entire hiring funnel in a single, intuitive Kanban board. Automate stage progressions and trigger customized communications instantly.",
      },
    ],
  },
  footer: {
    companyDescription:
      "Empowering enterprise teams to build the future of work through intelligent hiring.",
    sections: [
      {
        title: "Product",
        links: ["Features", "Pricing", "Enterprise", "Security"],
      },
      {
        title: "Resources",
        links: ["Documentation", "Blog", "Help Center", "API Reference"],
      },
      {
        title: "Company",
        links: [
          "About Us",
          "Careers",
          "Privacy Policy",
          "Terms of Service",
        ],
      },
    ],
    copyright: "© 2026 RecruitFlow Inc. All rights reserved.",
  },
};

export const authData = {
  login: {
    title: "Sign in to your account",
    subtitle: "Or",
    subtitleAction: "start your 14-day free trial",
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPasswordText: "Forgot password?",
    rememberMeText: "Remember me",
    submitText: "Sign In",
    socialDividerText: "Or continue with",
    socialGoogleText: "Google",
    socialGithubText: "GitHub",
    footerText: "Don't have an account?",
    footerAction: "Sign up"
  },
  signup: {
    title: "Create your account",
    subtitle: "Or",
    subtitleAction: "sign in to your account",
    nameLabel: "Full Name",
    namePlaceholder: "Jane Doe",
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    termsText: "I agree to the",
    termsLink: "Terms of Service",
    submitText: "Sign Up",
    socialDividerText: "Or continue with",
    socialGoogleText: "Google",
    socialGithubText: "GitHub",
    footerText: "Already have an account?",
    footerAction: "Sign in"
  }
};

export const dashboardNav = {
  employer: [
    { icon: "dashboard", label: "Dashboard", href: "/employer/dashboard" },
    { icon: "work", label: "Jobs", href: "/employer/post-job" },
    { icon: "people", label: "Pipeline", href: "/employer/pipeline" },
    { icon: "analytics", label: "Analytics", href: "/employer/analytics" },
  ],
  seeker: [
    { icon: "dashboard", label: "Dashboard", href: "/seeker/dashboard" },
    { icon: "work", label: "Find Jobs", href: "/seeker/find-jobs" },
    { icon: "assignment", label: "Applications", href: "/seeker/applications" },
    { icon: "record_voice_over", label: "Mock Interview", href: "/seeker/interview" },
    { icon: "person", label: "My Profile", href: "/seeker/profile" },
  ],
  shared: [
    { icon: "settings", label: "Settings", href: "/settings" },
  ],
  quickActions: {
    employer: { label: "Post Job", href: "/employer/post-job" },
    seeker: { label: "Start Interview", href: "/seeker/interview" },
  }
};

export const employerDashboardData = {
  user: {
    initials: "R",
    name: "RecruitFlow",
    role: "Enterprise HR"
  },
  stats: [
    { title: "Active Listings", value: "24", icon: "work", trend: "+12%", trendUp: true, trendText: "" },
    { title: "Total Applicants", value: "1,482", icon: "group", trend: "+8%", trendUp: true, trendText: "" },
    { title: "Avg. Time-to-Hire", value: "18 Days", icon: "timer", trend: "3 days", trendUp: false, trendText: "" }
  ],
  activeJobs: [
    { title: "Senior Frontend Engineer", type: "Remote • Full-time", date: "Oct 12, 2023", department: "Engineering", applicants: 124, statusColor: "emerald" },
    { title: "Product Design Lead", type: "New York, NY • Hybrid", date: "Oct 10, 2023", department: "Design", applicants: 86, statusColor: "emerald" },
    { title: "Marketing Manager", type: "London, UK • On-site", date: "Oct 05, 2023", department: "Marketing", applicants: 215, statusColor: "amber" },
    { title: "Data Scientist", type: "Remote • Full-time", date: "Sep 28, 2023", department: "Engineering", applicants: 42, statusColor: "rose" }
  ],
  notifications: [
    { id: "1", title: "New Application", message: "Elena Smith applied for Senior Frontend Engineer", time: "2m ago", unread: true },
    { id: "2", title: "Interview Completed", message: "Marcus Johnson finished his AI Mock Interview", time: "1h ago", unread: true },
    { id: "3", title: "System Update", message: "Enterprise AI models have been updated to v4.2", time: "5h ago", unread: false }
  ]
};

export const seekerDashboardData = {
  user: {
    initials: "A",
    name: "Alex",
    role: "Job Seeker"
  },
  stats: [
    { title: "Total Applications", value: "42", icon: "send", trend: "12%", trendUp: true, trendText: "vs last month" },
    { title: "Interviews Scheduled", value: "5", icon: "calendar_month", trend: "Next: Tomorrow", trendUp: true, trendText: "at 2:00 PM" },
    { title: "Profile Views", value: "128", icon: "visibility", trend: "8%", trendUp: true, trendText: "vs last week" }
  ],
  recentActivity: [
    { company: "Stripe", initial: "S", role: "Senior Frontend Engineer", date: "Oct 24, 2023", status: "Shortlisted", statusColor: "emerald" },
    { company: "Airbnb", initial: "A", role: "Product Designer", date: "Oct 22, 2023", status: "Under Review", statusColor: "amber" },
    { company: "Netflix", initial: "N", role: "UX Researcher", date: "Oct 18, 2023", status: "Applied", statusColor: "slate" },
    { company: "Spotify", initial: "S", role: "Full Stack Developer", date: "Oct 15, 2023", status: "Rejected", statusColor: "rose" }
  ],
  notifications: [
    { id: "1", title: "Shortlisted!", message: "Stripe has shortlisted you for Senior Frontend Engineer", time: "5m ago", unread: true },
    { id: "2", title: "New Job Match", message: "A new role matches your profile: Frontend Lead @ Airbnb", time: "2h ago", unread: true },
    { id: "3", title: "Profile Viewed", message: "Netflix HR viewed your profile", time: "1d ago", unread: false }
  ]
};

export const pipelineData = {
  job: {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    posted: "14 days ago",
    status: "Active"
  },
  stats: {
    totalApplicants: 124,
    trend: "+12 this week",
    shortlisted: 28,
    conversion: "22% conversion",
    interviewing: 12,
    offers: "4 offers pending",
    aiMatchAverage: "84%"
  },
  candidates: [
    { initials: "ES", name: "Elena Smith", role: "Senior Engineer at TechCorp", applied: "Oct 24, 2023", match: 98, status: "Interviewing", color: "bg-primary" },
    { initials: "MJ", name: "Marcus Johnson", role: "Frontend Lead at StartupX", applied: "Oct 22, 2023", match: 92, status: "Shortlisted", color: "bg-green-500" },
    { initials: "SL", name: "Sarah Lee", role: "Web Developer at AgencyCo", applied: "Oct 26, 2023", match: 75, status: "Applied", color: "bg-amber-500" },
    { initials: "DC", name: "David Chen", role: "UI Engineer at Freelance", applied: "Oct 20, 2023", match: 45, status: "Rejected", color: "bg-rose-500" }
  ]
};

export const candidateAnalysisData = {
  candidate: {
    name: "Sarah Jenkins",
    role: "Senior Product Designer candidate",
    location: "San Francisco, CA • Willing to relocate",
    matchScore: 92,
    yoe: "8 YOE",
    education: "MFA Interaction Design",
    currentRole: "Lead Designer @ FinTech Corp",
    expectedSalary: "$150k - $170k",
    status: "Active"
  },
  aiSummary: "Sarah is a highly compelling candidate for the Senior Product Designer role. Her 8 years of experience align perfectly with the required seniority. She demonstrates exceptional proficiency in Figma and design systems, specifically noted in her recent project scaling a component library for 50+ engineers.\n\nHowever, her experience with direct managerial duties is limited, which was listed as a 'nice-to-have' for this position. Overall, her technical skills and portfolio indicate she would be a strong IC contributor immediately.",
  requirements: {
    matched: [
      { title: "5+ years UX/UI experience", detail: "Verified 8 years across 3 roles." },
      { title: "Expertise in Figma", detail: "Extensive portfolio demonstrating advanced prototyping." },
      { title: "Enterprise SaaS background", detail: "3 years at FinTech Corp (B2B)." }
    ],
    missing: [
      { title: "Direct people management", detail: "Has mentored juniors, but no official direct reports listed." }
    ]
  },
  resumeUrl: "Sarah_Jenkins_Resume_2023.pdf"
};

export const mockInterviewData = {
  messages: [
    {
      role: "ai",
      time: "10:00 AM",
      content: [
        "Hello! I'm the RecruitFlow HR Agent. Thank you for taking the time to interview for the Senior Frontend Developer position today.",
        "To begin, could you please walk me through your most recent project and highlight a specific technical challenge you overcame?"
      ]
    },
    {
      role: "user",
      time: "10:01 AM",
      content: [
        "Hi, thank you for having me. Yes, absolutely.",
        "In my last role, I led the migration of a legacy dashboard to a modern React architecture. The biggest challenge was ensuring state synchronization across multiple complex widgets without impacting performance. We solved this by implementing a centralized state management solution using Redux Toolkit and strategically memoizing heavy computational components."
      ]
    },
    {
      role: "ai",
      time: "10:01 AM",
      content: [
        "That sounds like a significant architectural improvement. Regarding the state synchronization, how did you handle real-time data updates within that Redux setup? Did you utilize WebSockets or long polling?"
      ]
    }
  ]
};

export const postJobData = {
  departments: ["Engineering", "Design", "Marketing", "Sales", "Operations", "Finance"],
  experienceLevels: ["Junior", "Mid-Level", "Senior", "Staff", "Principal"],
  jobTypes: ["Full-time", "Part-time", "Contract", "Freelance"],
  workModes: ["On-site", "Remote", "Hybrid"],
  exampleSkills: ["React", "TypeScript", "Node.js", "Python", "Figma", "AWS"]
};

export const findJobsData = {
  jobs: [
    {
      id: "1",
      title: "Senior Frontend Engineer",
      company: "TechNova Systems",
      companyInitials: "TN",
      location: "San Francisco, CA (Hybrid)",
      salary: "$140k - $180k",
      posted: "2h ago",
      match: 92,
      matchLevel: "high",
      skills: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "2",
      title: "Product Designer (UI/UX)",
      company: "GlobalData Analytics",
      companyInitials: "GD",
      location: "Remote",
      salary: "$120k - $150k",
      posted: "1d ago",
      match: 78,
      matchLevel: "medium",
      skills: ["Figma", "Design Systems", "Prototyping"],
    },
    {
      id: "3",
      title: "Full Stack Engineer",
      company: "Stripe",
      companyInitials: "ST",
      location: "New York, NY (Hybrid)",
      salary: "$160k - $200k",
      posted: "3d ago",
      match: 65,
      matchLevel: "medium",
      skills: ["Node.js", "React", "PostgreSQL"],
    }
  ]
};

export const profileData = {
  user: {
    name: "Alex Johnson",
    title: "Senior React Developer",
    location: "San Francisco, CA",
    initials: "AJ",
  },
  skills: [
    { name: "React", aiVerified: false },
    { name: "Tailwind CSS", aiVerified: false },
    { name: "Node.js", aiVerified: false },
    { name: "AI Integration", aiVerified: true },
    { name: "TypeScript", aiVerified: false },
    { name: "GraphQL", aiVerified: false },
  ],
  experience: [
    {
      title: "Senior Developer",
      company: "TechCorp Inc.",
      period: "2020 - Present",
      description: "Led the frontend migration to React 18 and implemented a robust design system using Tailwind CSS, improving developer velocity by 40%."
    },
    {
      title: "Frontend Engineer",
      company: "StartupX",
      period: "2017 - 2020",
      description: "Developed core user interfaces for a high-traffic SaaS platform. Optimized rendering performance and established comprehensive unit testing protocols."
    }
  ]
};
