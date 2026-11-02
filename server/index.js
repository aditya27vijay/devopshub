import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json());

const jobs = [
  { id: 'task7', task: 'Task 7', name: 'Dockerized Kubernetes CI/CD', job: process.env.TASK7_JOB || 'Task7-CICD-Pipeline', description: 'Build a Docker image, publish it to Minikube and roll out the Kubernetes deployment.', stages: ['Checkout / Verify', 'Build Docker Image', 'Deploy to Kubernetes'] },
  { id: 'task8', task: 'Task 8', name: 'Blue-Green Deployment', job: process.env.TASK8_JOB || 'Task8-BlueGreen-Pipeline', description: 'Deploy Blue and Green versions and switch the Kubernetes Service selector.', stages: ['Build Blue & Green', 'Load Images', 'Apply Deployments', 'Switch Traffic', 'Verify Rollout'] },
  { id: 'task9', task: 'Task 9', name: 'Healthcare DevSecOps', job: process.env.TASK9_JOB || 'Task9-DevSecOps-Pipeline', description: 'Build the healthcare portal image, scan it with Trivy and deploy it to Kubernetes.', stages: ['Verify Tools', 'Build Docker Image', 'Trivy Security Scan', 'Deploy to Kubernetes'] }
];

function config() {
  const base = process.env.JENKINS_URL?.replace(/\/$/, '');
  const user = process.env.JENKINS_USER;
  const token = process.env.JENKINS_API_TOKEN;
  if (!base || !user || !token) throw new Error('Jenkins is not configured. Set JENKINS_URL, JENKINS_USER and JENKINS_API_TOKEN in server/.env.');
  return { base, auth: 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64') };
}
async function jenkins(path, options = {}) {
  const { base, auth } = config();
  const response = await fetch(`${base}${path}`, { ...options, headers: { Authorization: auth, ...(options.headers || {}) }, redirect: 'manual' });
  if (!response.ok && response.status !== 201 && response.status !== 302) {
    const body = await response.text().catch(() => '');
    throw new Error(`Jenkins returned ${response.status}: ${body.slice(0, 240)}`);
  }
  return response;
}
function jobPath(name) { return `/job/${encodeURIComponent(name)}`; }

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'DevOpsHub API' }));
app.get('/api/pipelines', async (_req, res) => {
  try {
    const result = await Promise.all(jobs.map(async job => {
      const response = await jenkins(`${jobPath(job.job)}/api/json?tree=name,color,lastBuild[number,url,result,building,timestamp,duration]`);
      const data = await response.json();
      return { ...job, exists: true, color: data.color, lastBuild: data.lastBuild || null };
    }));
    res.json({ connected: true, pipelines: result, fetchedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ connected: false, error: error.message, pipelines: jobs.map(j => ({ ...j, exists: null, color: null, lastBuild: null })) });
  }
});
app.post('/api/pipelines/:id/build', async (req, res) => {
  const job = jobs.find(item => item.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Unknown pipeline.' });
  try {
    await jenkins(`${jobPath(job.job)}/build`, { method: 'POST' });
    res.status(202).json({ queued: true, message: `${job.job} build queued.` });
  } catch (error) { res.status(502).json({ error: error.message }); }
});
app.get('/api/pipelines/:id/console', async (req, res) => {
  const job = jobs.find(item => item.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Unknown pipeline.' });
  try {
    const metaResponse = await jenkins(`${jobPath(job.job)}/lastBuild/api/json?tree=number,url,result,building`);
    const meta = await metaResponse.json();
    if (!meta.number) return res.json({ console: 'No build has run yet.' });
    const logResponse = await jenkins(`${jobPath(job.job)}/${meta.number}/consoleText`);
    res.type('text/plain').send((await logResponse.text()).slice(-24000));
  } catch (error) { res.status(502).json({ error: error.message }); }
});
app.listen(process.env.PORT || 4000, () => console.log(`DevOpsHub API listening on ${process.env.PORT || 4000}`));
