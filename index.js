import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const catalog = {
  'Frontend Developer': {
    skills:['HTML and semantic structure','CSS, Flexbox and Grid','JavaScript fundamentals','React and component design','API integration','Git, GitHub and deployment'],
    projects:['Responsive personal portfolio','Weather dashboard using a public API','Full-stack task manager'],
    roles:['Frontend Developer Intern','Junior React Developer','UI Engineer']
  },
  'Backend Developer': {
    skills:['Programming fundamentals','Data structures and algorithms','REST API design','Node.js and Express','SQL and database design','Authentication, testing and deployment'],
    projects:['Student management REST API','JWT authentication service','Job application tracking backend'],
    roles:['Backend Developer Intern','Node.js Developer','Junior Software Engineer']
  },
  'Full Stack Developer': {
    skills:['HTML, CSS and JavaScript','React and state management','Node.js and Express','SQL or MongoDB','Authentication and authorization','Testing, Git and deployment'],
    projects:['Responsive portfolio with contact form','Job portal with authentication','Full-stack e-commerce application'],
    roles:['Full Stack Developer Intern','MERN Stack Developer','Junior Web Developer']
  },
  'Java Developer': {
    skills:['Java syntax and OOP','Collections and exception handling','Data structures and algorithms','SQL and JDBC','Spring Boot and REST APIs','Testing, Git and deployment'],
    projects:['Library management system','Spring Boot employee API','Job application tracker'],
    roles:['Java Developer Intern','Associate Software Engineer','Spring Boot Developer']
  },
  'Data Analyst': {
    skills:['Excel and data cleaning','SQL queries and joins','Python fundamentals','Pandas and NumPy','Power BI or Tableau','Statistics and data storytelling'],
    projects:['Sales performance dashboard','Student result analysis','Customer churn exploration'],
    roles:['Data Analyst Intern','Junior Data Analyst','Business Intelligence Analyst']
  },
  'AI / ML Engineer': {
    skills:['Python programming','Linear algebra and statistics','NumPy and Pandas','Machine learning algorithms','Model evaluation and feature engineering','Deep learning and deployment basics'],
    projects:['Student performance predictor','Text classification model','End-to-end prediction web app'],
    roles:['AI/ML Intern','Junior Machine Learning Engineer','Python Developer']
  },
  'Cybersecurity Analyst': {
    skills:['Networking fundamentals','Linux command line','Security principles and threat types','Python scripting','SIEM and log analysis basics','Incident response and security labs'],
    projects:['Network traffic analysis report','Basic log anomaly detector','Security awareness mini-site'],
    roles:['Security Analyst Intern','SOC Analyst L1','Junior Cybersecurity Analyst']
  },
  'Cloud Engineer': {
    skills:['Linux and networking fundamentals','Cloud computing concepts','AWS or Azure core services','IAM and cloud security','Docker and CI/CD basics','Monitoring and deployment'],
    projects:['Host a static website in cloud storage','Deploy a containerized web app','Build a basic cloud monitoring setup'],
    roles:['Cloud Support Associate','Cloud Engineer Intern','Junior DevOps Engineer']
  },
  'UI/UX Designer': {
    skills:['Design principles and visual hierarchy','User research and personas','Wireframing and user flows','Figma components and prototyping','Usability testing','Design systems and portfolio storytelling'],
    projects:['Mobile app redesign case study','E-commerce user flow prototype','Responsive dashboard design'],
    roles:['UI/UX Design Intern','Junior Product Designer','UX Designer']
  }
};

function fallbackRoadmap(input) {
  const data = catalog[input.career] || catalog['Full Stack Developer'];
  const months = Number(input.duration) || 4;
  const phaseCount = Math.min(months, 6);
  const phases = [];
  for (let i=0; i<phaseCount; i++) {
    const from = Math.floor(i*data.skills.length/phaseCount);
    const to = Math.floor((i+1)*data.skills.length/phaseCount);
    const skillChunk = data.skills.slice(from,to);
    const project = data.projects[Math.min(i,data.projects.length-1)];
    const tasks = skillChunk.map(s => `Learn ${s} and complete hands-on exercises.`);
    tasks.push(i===phaseCount-1
      ? 'Polish your resume, practice technical and HR interviews, and apply to relevant openings.'
      : `Build or improve this portfolio milestone: ${project}.`);
    phases.push({
      period: months <= 6 ? `Month ${i+1}` : `Months ${Math.floor(i*months/phaseCount)+1}–${Math.floor((i+1)*months/phaseCount)}`,
      title:['Build the foundation','Develop core skills','Build practical experience','Become job-ready','Polish your profile','Apply and improve'][i] || `Growth phase ${i+1}`,
      tasks
    });
  }
  const enteredSkills = String(input.existingSkills || '').split(',').map(s => s.trim()).filter(Boolean);
  const normalized = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const matched = data.skills.filter(required => enteredSkills.some(known => {
    const a = normalized(required), b = normalized(known);
    return a === b || a.includes(b) || b.includes(a);
  }));
  const missing = data.skills.filter(skill => !matched.includes(skill));
  const matchPercent = data.skills.length ? Math.round(matched.length / data.skills.length * 100) : 0;
  const certificationCatalog = {
    'Frontend Developer': [{name:'Meta Front-End Developer Professional Certificate',provider:'Coursera',url:'https://www.coursera.org/professional-certificates/meta-front-end-developer'},{name:'freeCodeCamp Responsive Web Design',provider:'freeCodeCamp',url:'https://www.freecodecamp.org/learn/2022/responsive-web-design/'}],
    'Data Analyst': [{name:'Google Data Analytics Professional Certificate',provider:'Coursera',url:'https://www.coursera.org/professional-certificates/google-data-analytics'},{name:'Power BI Data Analyst Associate (PL-300)',provider:'Microsoft',url:'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/'}],
    'AI / ML Engineer': [{name:'Machine Learning Specialization',provider:'DeepLearning.AI / Coursera',url:'https://www.coursera.org/specializations/machine-learning-introduction'},{name:'TensorFlow Developer resources',provider:'TensorFlow',url:'https://www.tensorflow.org/learn'}],
    'Cloud Engineer': [{name:'AWS Certified Cloud Practitioner',provider:'Amazon Web Services',url:'https://aws.amazon.com/certification/certified-cloud-practitioner/'},{name:'Azure Fundamentals (AZ-900)',provider:'Microsoft',url:'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/'}],
    'Cybersecurity Analyst': [{name:'Google Cybersecurity Professional Certificate',provider:'Coursera',url:'https://www.coursera.org/professional-certificates/google-cybersecurity'},{name:'CompTIA Security+',provider:'CompTIA',url:'https://www.comptia.org/certifications/security'}]
  };
  const suggestedCertifications = certificationCatalog[input.career] || [
    {name:'Career-focused learning paths',provider:'Microsoft Learn',url:'https://learn.microsoft.com/en-us/training/'},
    {name:'Professional courses and certificates',provider:'Coursera',url:'https://www.coursera.org/' }
  ];
  const resourceCatalog = {
    'Data Analyst': [
      {name:'Kaggle Learn',type:'Hands-on data and Python micro-courses',url:'https://www.kaggle.com/learn'},
      {name:'SQLBolt',type:'Interactive SQL lessons',url:'https://sqlbolt.com/'},
      {name:'Microsoft Learn: Power BI',type:'Power BI learning paths',url:'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/'}
    ],
    'AI / ML Engineer': [
      {name:'Google Machine Learning Crash Course',type:'Practical machine learning lessons',url:'https://developers.google.com/machine-learning/crash-course'},
      {name:'Kaggle Learn',type:'Python, Pandas and machine learning practice',url:'https://www.kaggle.com/learn'},
      {name:'PyTorch Tutorials',type:'Deep learning tutorials',url:'https://pytorch.org/tutorials/'}
    ],
    'Cybersecurity Analyst': [
      {name:'TryHackMe',type:'Guided cybersecurity learning labs',url:'https://tryhackme.com/paths'},
      {name:'OWASP Top 10',type:'Web application security awareness',url:'https://owasp.org/www-project-top-ten/'},
      {name:'Cisco Skills for All',type:'Networking and cybersecurity courses',url:'https://skillsforall.com/'}
    ],
    'Java Developer': [
      {name:'Dev.java',type:'Official Java learning resources',url:'https://dev.java/learn/'},
      {name:'Spring Guides',type:'Hands-on Spring Boot guides',url:'https://spring.io/guides'},
      {name:'SQLBolt',type:'Interactive SQL lessons',url:'https://sqlbolt.com/'}
    ],
    'Cloud Engineer': [
      {name:'AWS Skill Builder',type:'Official cloud training',url:'https://skillbuilder.aws/'},
      {name:'Microsoft Learn: Azure',type:'Azure learning paths',url:'https://learn.microsoft.com/en-us/training/azure/'},
      {name:'Docker Get Started',type:'Container fundamentals',url:'https://docs.docker.com/get-started/'}
    ]
  };
  const suggestedResources = resourceCatalog[input.career] || [
    {name:'freeCodeCamp',type:'Free interactive learning',url:'https://www.freecodecamp.org/learn/'},
    {name:'MDN Web Docs',type:'Documentation and practical guides',url:'https://developer.mozilla.org/'},
    {name:'The Odin Project',type:'Project-based learning curriculum',url:'https://www.theodinproject.com/'}
  ];
  return {
    title:`${input.career} roadmap${input.name ? ` for ${input.name}` : ''}`,
    summary:`A ${months}-month ${input.level.toLowerCase()} plan focused on: ${input.goal}. Designed around approximately ${input.hours} study hours per day.`,
    skills:data.skills, projects:data.projects, roles:data.roles, phases,
    skillGap:{ matched, missing, matchPercent },
    resources:suggestedResources,
    certifications:suggestedCertifications,
    interviewPrep:[
      'Explain one project you built and the technical decisions you made.',
      'Practice explaining core concepts in your selected career path.',
      'Prepare a concise introduction and examples of problem-solving.',
      'Review common behavioral questions using the STAR method.'
    ],
    alternativeCareers: data.roles.filter(role => !role.toLowerCase().includes('intern')).slice(0,2),
    weeklyPlan:[
      `Spend ${input.hours} hour(s) per day on focused learning and coding practice.`,
      'Reserve one session each week to build a project feature and update GitHub.',
      'At the end of each week, revise concepts, take a short assessment and plan the next week.'
    ],
    advice:input.level==='Beginner'
      ? 'Build strong fundamentals before jumping into advanced frameworks. Practice consistently and explain each concept in your own words.'
      : 'Prioritize depth, completed projects, clean code and interview practice over collecting more courses.'
  };
}

app.get('/api/health', (_req,res) => res.json({status:'ok'}));

app.post('/api/roadmap', async (req,res) => {
  const input = req.body || {};
  if (!input.career || !input.level || !input.duration || !input.goal) {
    return res.status(400).json({error:'Please provide career, level, duration and goal.'});
  }
  const fallback = fallbackRoadmap(input);
  if (!process.env.GEMINI_API_KEY) return res.json({roadmap:fallback, source:'built-in'});
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model:'gemini-1.5-flash'});
    const prompt = `Create a realistic, practical career roadmap as valid JSON only. Do not use markdown fences.
User profile: ${JSON.stringify(input)}
Return this exact structure:
{"title":"string","summary":"string","skills":["string"],"projects":["string"],"roles":["string"],"phases":[{"period":"string","title":"string","tasks":["string"]}],"weeklyPlan":["string"],"advice":"string","skillGap":{"matched":["string"],"missing":["string"],"matchPercent":0},"resources":[{"name":"string","type":"string","url":"https://..."}],"certifications":[{"name":"string","provider":"string","url":"https://..."}],"interviewPrep":["string"],"alternativeCareers":["string"]}
Create ${Math.min(Number(input.duration)||4,6)} phases. Make it appropriate for the stated education, degree, skill level, existing skills, goal and study hours. Compare existingSkills against required skills and calculate matchPercent as a whole number from 0 to 100. Tasks must be actionable. Include realistic projects.`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g,'').trim();
    const roadmap = JSON.parse(raw);
    if (!roadmap.phases || !Array.isArray(roadmap.phases)) throw new Error('Invalid AI response');
    for (const key of ['resources','certifications','interviewPrep','alternativeCareers']) {
      if (!Array.isArray(roadmap[key])) roadmap[key] = fallback[key];
    }
    if (!roadmap.skillGap) roadmap.skillGap = fallback.skillGap;
    return res.json({roadmap, source:'gemini'});
  } catch (error) {
    console.error('Gemini generation failed; using fallback:', error.message);
    return res.json({roadmap:fallback, source:'built-in-fallback'});
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`PathPilot API running at http://localhost:${port}`));
