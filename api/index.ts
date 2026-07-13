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

// Helper functions for password security
function isPasswordStrong(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// Password Change Route
app.post('/api/change-password', authenticateToken, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    // Find user in the database
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(userId))
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    if (!user.password_hash) {
      return res.status(400).json({ error: 'Invalid current password configuration' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password hash in database
    await db.update(users).set({ password_hash: passwordHash }).where(eq(users.id, Number(userId)));

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ error: 'Failed to change password: ' + (error.message || String(error)) });
  }
});

// Content Planner Routes
app.get('/api/content_planner/:userId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = Number(req.params.userId);
    const authUserId = req.user.id;
    const isClient = req.user.role !== 'admin';

    // If client, force fetch only their own items
    const targetUserId = isClient ? authUserId : userId;

    const data = await db.select({
      id: content_planner.id,
      user_id: content_planner.user_id,
      client_id: content_planner.client_id,
      post_date: content_planner.post_date,
      content_pillar: content_planner.content_pillar,
      boost: content_planner.boost,
      concept: content_planner.concept,
      text_on_design: content_planner.text_on_design,
      design_description: content_planner.design_description,
      caption: content_planner.caption,
      notice: content_planner.notice,
      scheduled_date: content_planner.scheduled_date,
      title: content_planner.title,
      content_type: content_planner.content_type,
      description: content_planner.description,
      status: content_planner.status,
      created_at: content_planner.created_at,
      client_name: users.full_name,
      client_email: users.email
    })
    .from(content_planner)
    .leftJoin(users, eq(content_planner.client_id, users.id))
    .where(eq(content_planner.client_id, targetUserId))
    .orderBy(desc(content_planner.created_at));

    res.json({ data });
  } catch (error: any) {
    console.error("Fetch content planner error:", error);
    res.status(500).json({ error: 'Failed to fetch content planner: ' + error.message });
  }
});

app.post('/api/content_planner', authenticateToken, async (req: any, res: any) => {
  try {
    const isClient = req.user.role !== 'admin';
    let clientId = req.body.client_id ? Number(req.body.client_id) : undefined;
    
    if (isClient) {
      clientId = req.user.id;
    } else if (!clientId && req.body.user_id) {
      clientId = Number(req.body.user_id);
    }

    if (!clientId) {
      return res.status(400).json({ error: 'client_id is required' });
    }

    const payload = {
      user_id: req.user.id,
      client_id: clientId,
      post_date: req.body.post_date || null,
      content_pillar: req.body.content_pillar || null,
      boost: req.body.boost || null,
      concept: req.body.concept || null,
      text_on_design: req.body.text_on_design || null,
      design_description: req.body.design_description || null,
      caption: req.body.caption || null,
      notice: req.body.notice || null,
      scheduled_date: req.body.scheduled_date || null,
      title: req.body.title || null,
      content_type: req.body.content_type || null,
      description: req.body.description || null,
      status: req.body.status || 'pending',
    };

    const newRow = await db.insert(content_planner).values(payload).returning();
    
    const joinedRow = await db.select({
      id: content_planner.id,
      user_id: content_planner.user_id,
      client_id: content_planner.client_id,
      post_date: content_planner.post_date,
      content_pillar: content_planner.content_pillar,
      boost: content_planner.boost,
      concept: content_planner.concept,
      text_on_design: content_planner.text_on_design,
      design_description: content_planner.design_description,
      caption: content_planner.caption,
      notice: content_planner.notice,
      scheduled_date: content_planner.scheduled_date,
      title: content_planner.title,
      content_type: content_planner.content_type,
      description: content_planner.description,
      status: content_planner.status,
      created_at: content_planner.created_at,
      client_name: users.full_name,
      client_email: users.email
    })
    .from(content_planner)
    .leftJoin(users, eq(content_planner.client_id, users.id))
    .where(eq(content_planner.id, newRow[0].id));

    res.json({ data: joinedRow });
  } catch (error: any) {
    console.error("Create content planner error:", error);
    res.status(500).json({ error: 'Failed to insert: ' + error.message });
  }
});

app.put('/api/content_planner/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const isClient = req.user.role !== 'admin';
    const rowId = req.params.id;

    const existing = await db.query.content_planner.findFirst({
      where: eq(content_planner.id, rowId)
    });

    if (!existing) {
      return res.status(404).json({ error: 'Content planner item not found' });
    }

    if (isClient && existing.client_id !== req.user.id && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this item' });
    }

    const updatePayload: any = {};
    const allowedFields = [
      'post_date',
      'content_pillar',
      'boost',
      'concept',
      'text_on_design',
      'design_description',
      'caption',
      'notice',
      'scheduled_date',
      'title',
      'content_type',
      'description',
      'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    }

    if (!isClient && req.body.client_id !== undefined) {
      updatePayload.client_id = Number(req.body.client_id);
    }

    await db.update(content_planner)
      .set(updatePayload)
      .where(eq(content_planner.id, rowId));

    const joinedRow = await db.select({
      id: content_planner.id,
      user_id: content_planner.user_id,
      client_id: content_planner.client_id,
      post_date: content_planner.post_date,
      content_pillar: content_planner.content_pillar,
      boost: content_planner.boost,
      concept: content_planner.concept,
      text_on_design: content_planner.text_on_design,
      design_description: content_planner.design_description,
      caption: content_planner.caption,
      notice: content_planner.notice,
      scheduled_date: content_planner.scheduled_date,
      title: content_planner.title,
      content_type: content_planner.content_type,
      description: content_planner.description,
      status: content_planner.status,
      created_at: content_planner.created_at,
      client_name: users.full_name,
      client_email: users.email
    })
    .from(content_planner)
    .leftJoin(users, eq(content_planner.client_id, users.id))
    .where(eq(content_planner.id, rowId));

    res.json({ data: joinedRow });
  } catch (error: any) {
    console.error("Update content planner error:", error);
    res.status(500).json({ error: 'Failed to update: ' + error.message });
  }
});

app.delete('/api/content_planner/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const isClient = req.user.role !== 'admin';
    const rowId = req.params.id;

    if (isClient) {
      const existing = await db.query.content_planner.findFirst({
        where: eq(content_planner.id, rowId)
      });
      if (!existing || existing.client_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    await db.delete(content_planner).where(eq(content_planner.id, rowId));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete: ' + error.message });
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

    if (!isPasswordStrong(password)) {
      return res.status(400).json({ error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' });
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
      where: eq(users.role, 'client'),
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
