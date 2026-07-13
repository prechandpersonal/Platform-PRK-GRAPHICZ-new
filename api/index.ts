import express from 'express';
import cors from 'cors';
import { db } from '../src/db/index.js';
import { content_planner, requests, contact_submissions, users } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://prkgraphicz.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// Content Planner Routes
app.get('/api/content_planner/:userId', async (req, res) => {
  try {
    const data = await db.query.content_planner.findMany({
      where: eq(content_planner.user_id, Number(req.params.userId)),
      orderBy: desc(content_planner.created_at),
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/content_planner', async (req, res) => {
  try {
    const payload = { ...req.body, user_id: Number(req.body.user_id) };
    const newRow = await db.insert(content_planner).values(payload).returning();
    res.json({ data: newRow });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert' });
  }
});

app.put('/api/content_planner/:id', async (req, res) => {
  try {
    const updatedRow = await db.update(content_planner).set(req.body).where(eq(content_planner.id, req.params.id)).returning();
    res.json({ data: updatedRow[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.delete('/api/content_planner/:id', async (req, res) => {
  try {
    await db.delete(content_planner).where(eq(content_planner.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Requests Routes
app.get('/api/requests', async (req, res) => {
  try {
    const data = await db.query.requests.findMany({
      orderBy: desc(requests.created_at),
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const payload = { ...req.body, user_id: req.body.user_id ? Number(req.body.user_id) : undefined };
    const newRow = await db.insert(requests).values(payload).returning();
    res.json({ data: newRow });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert request' });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const updatedRow = await db.update(requests).set(req.body).where(eq(requests.id, req.params.id)).returning();
    res.json({ data: updatedRow[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await db.delete(requests).where(eq(requests.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Client Invoices Routes
app.get('/api/client_invoices', async (req, res) => {
  try {
    const data = await db.select().from(requests);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.put('/api/client_invoices/:id', async (req, res) => {
  try {
    const updatedRow = await db.update(requests).set(req.body).where(eq(requests.id, req.params.id)).returning();
    res.json({ data: updatedRow[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Contact Submissions Routes
app.get('/api/contact_submissions', async (req, res) => {
  try {
    const data = await db.query.contact_submissions.findMany({
      orderBy: desc(contact_submissions.created_at),
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

app.post('/api/contact_submissions', async (req, res) => {
  try {
    const newRow = await db.insert(contact_submissions).values(req.body).returning();
    res.json({ data: newRow });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert contact submission' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.insert(users).values({
      email,
      password_hash: passwordHash,
      full_name,
      role: role || 'client',
      subscription_status: 'free',
      is_verified: false
    }).returning();
    
    const userToReturn = { ...newUser[0] };
    delete (userToReturn as any).password_hash;
    
    const token = jwt.sign(
      { id: userToReturn.id, email: userToReturn.email, role: userToReturn.role },
      process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod',
      { expiresIn: '7d' }
    );
    
    res.json({ data: { token, user: userToReturn } });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: 'Failed to register user: ' + (error.message || String(error)) });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod',
      { expiresIn: '7d' }
    );
    
    const userToReturn = { ...user };
    delete (userToReturn as any).password_hash;
    
    res.json({ data: { token, user: userToReturn } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/sync-user', async (req, res) => {
  try {
    const { email, full_name, role } = req.body;
    let user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (!user) {
      const newUser = await db.insert(users).values({
        email,
        full_name,
        role: role || 'client',
        subscription_status: 'free',
        is_verified: false
      }).returning();
      user = newUser[0];
    } else {
      const updated = await db.update(users).set({ 
        full_name: full_name || user.full_name,
        role: role || user.role 
      }).where(eq(users.id, user.id)).returning();
      user = updated[0];
    }
    const userToReturn = { ...user };
    delete (userToReturn as any).password_hash;
    
    res.json({ data: userToReturn });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Users Routes
app.get('/api/users', async (req, res) => {
  try {
    const data = await db.query.users.findMany({
      orderBy: desc(users.created_at),
    });
    const sanitizedData = data.map(user => {
      const { password_hash, ...rest } = user;
      return rest;
    });
    res.json({ data: sanitizedData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedRow = await db.update(users).set(req.body).where(eq(users.id, Number(req.params.id))).returning();
    res.json({ data: updatedRow[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Vercel Serverless Function entry point
export default app;
