export const jobsData = [
  {
    title: "Full Stack Developer Intern",
    department: "Engineering",
    location: "Bengaluru",
    employmentType: "Internship",
    status: "Open",
    description: "Build product features with React, Node.js, and MongoDB.",
  },
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Bengaluru",
    employmentType: "Full-time",
    status: "Open",
    description: "Own polished UI experiences for the EarlyJobs platform.",
  },
  {
    title: "Talent Operations Associate",
    department: "Recruiting",
    location: "Remote",
    employmentType: "Full-time",
    status: "Open",
    description: "Coordinate interviews and keep the hiring pipeline healthy.",
  },
];

const initialCandidatesData = [
  {
    name: "Ananya Sharma",
    email: "ananya.sharma@email.com",
    phone: "+91 98765 43210",
    role: "Full Stack Developer Intern",
    experienceYears: 1,
    skills: ["React", "Node.js", "MongoDB", "Express"],
    stage: "Interview",
    source: "LinkedIn",
    rating: 4,
    notes: [{ text: "Strong project portfolio. Schedule system design round." }],
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@email.com",
    phone: "+91 91234 56780",
    role: "Frontend Engineer",
    experienceYears: 2,
    skills: ["React", "TypeScript", "CSS", "Vite"],
    stage: "Screening",
    source: "Referral",
    rating: 3,
    notes: [{ text: "Referred by engineering lead. Good UI sensibility." }],
  },
  {
    name: "Priya Nair",
    email: "priya.nair@email.com",
    phone: "+91 99887 66554",
    role: "Full Stack Developer Intern",
    experienceYears: 0,
    skills: ["JavaScript", "React", "Express"],
    stage: "Applied",
    source: "Campus",
    rating: 0,
  },
  {
    name: "Vikram Joshi",
    email: "vikram.joshi@email.com",
    phone: "+91 90011 22334",
    role: "Frontend Engineer",
    experienceYears: 3,
    skills: ["React", "Redux", "Figma", "Testing"],
    stage: "Offer",
    source: "Career Page",
    rating: 5,
    notes: [{ text: "Offer drafted. Waiting on compensation confirmation." }],
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    phone: "+91 95555 44112",
    role: "Talent Operations Associate",
    experienceYears: 2,
    skills: ["ATS", "Sourcing", "Communication"],
    stage: "Hired",
    source: "LinkedIn",
    rating: 4,
  },
  {
    name: "Arjun Patel",
    email: "arjun.patel@email.com",
    phone: "+91 93333 77889",
    role: "Full Stack Developer Intern",
    experienceYears: 1,
    skills: ["MERN", "REST APIs", "Git"],
    stage: "Rejected",
    source: "Career Page",
    rating: 2,
    notes: [{ text: "Not enough backend depth for current openings." }],
  },
  {
    name: "Meera Iyer",
    email: "meera.iyer@email.com",
    phone: "+91 94444 55667",
    role: "Frontend Engineer",
    experienceYears: 1,
    skills: ["React", "Accessibility", "Tailwind"],
    stage: "Applied",
    source: "Other",
    rating: 0,
  },
  {
    name: "Karthik Rao",
    email: "karthik.rao@email.com",
    phone: "+91 97777 88990",
    role: "Full Stack Developer Intern",
    experienceYears: 2,
    skills: ["Node.js", "MongoDB", "React", "Docker"],
    stage: "Screening",
    source: "LinkedIn",
    rating: 4,
  },
];

const sampleFirstNames = [
  "Aditi",
  "Rahul",
  "Kavya",
  "Nikhil",
  "Isha",
  "Aditya",
  "Pooja",
  "Siddharth",
  "Divya",
  "Aman",
  "Neha",
  "Varun",
  "Tanvi",
  "Dev",
];
const sampleLastNames = ["Banerjee", "Kulkarni", "Kapoor"];
const sampleStages = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];
const sampleSources = ["LinkedIn", "Referral", "Career Page", "Campus", "Other"];
const sampleSkills = [
  ["JavaScript", "React", "CSS"],
  ["TypeScript", "React", "Vite"],
  ["Node.js", "Express", "MongoDB"],
  ["React", "Accessibility", "Tailwind"],
  ["Python", "REST APIs", "Git"],
  ["ATS", "Sourcing", "Communication"],
];

const additionalCandidatesData = Array.from({ length: 42 }, (_, index) => {
  const firstName = sampleFirstNames[index % sampleFirstNames.length];
  const lastName =
    sampleLastNames[Math.floor(index / sampleFirstNames.length)];
  const roleIndex = index % jobsData.length;

  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}${index + 1}@example.com`.toLowerCase(),
    phone: `+91 90000 ${String(10000 + index).padStart(5, "0")}`,
    role: jobsData[roleIndex].title,
    experienceYears: index % 7,
    skills: sampleSkills[index % sampleSkills.length],
    stage: sampleStages[index % sampleStages.length],
    source: sampleSources[index % sampleSources.length],
    rating: index % 6,
  };
});

export const candidatesData = [
  ...initialCandidatesData,
  ...additionalCandidatesData,
];
