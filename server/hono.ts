import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Multiplexer } from '@upstash/model-multiplexer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import OpenAI from 'openai';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { metrics, registerMetrics } from './metrics';

// ==========================================
// Type Definitions & Schemas
// ==========================================

// Zod schema for celebrity matches
const CelebrityMatchSchema = z.object({
  name: z.string().describe('Full name of the celebrity'),
  percentage: z.number().min(70).max(99).describe('Match confidence percentage'),
  description: z.string().max(500).describe('Brief notable fact about the celebrity'),
});

const CelebrityMatchesSchema = z.object({
  matches: z.array(CelebrityMatchSchema).length(3).describe('Exactly 3 celebrity matches'),
});

// Infer TypeScript types from Zod schemas
type CelebrityMatch = z.infer<typeof CelebrityMatchSchema>;
type CelebrityMatchWithImage = CelebrityMatch & { image: string };

// ==========================================
// Configuration
// ==========================================

const config = {
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: '0.0.0.0',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

// ==========================================
// Model Multiplexer Setup
// ==========================================

// Create multiplexer instance
const multiplexer = new Multiplexer();

// Initialize providers
const initializeProviders = () => {
  // Inference.net Gemma 27B setup (PRIMARY)
  if (!process.env.INFERENCE_API_KEY) {
    throw new Error('INFERENCE_API_KEY not configured. Please set your Inference.net API key.');
  }
  const inference = new OpenAI({
    apiKey: process.env.INFERENCE_API_KEY,
    baseURL: 'https://api.inference.net/v1',
  });
  multiplexer.addModel(inference, 5, 'google/gemma-3-27b-instruct/bf-16');

  // OpenAI o3 setup (FALLBACK)
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not configured. Please set your OpenAI API key.');
  }
  const openai = new OpenAI({ apiKey: openaiKey });
  multiplexer.addFallbackModel(openai, 5, 'o3-mini'); // Using o3-mini as o3 might not be directly available

  console.log('✅ Multiplexer initialized with Inference.net Gemma 27B (primary) and OpenAI o3 (fallback)');
};

// Initialize on startup
initializeProviders();

// ==========================================
// Prompts
// ==========================================

const SYSTEM_PROMPT = `You are an expert facial recognition specialist with advanced training in celebrity identification. Your sophisticated AI algorithms analyze facial geometry, bone structure, and distinctive features to detect precise celebrity matches. You ALWAYS identify exactly 3 matches with scientific confidence.`;

const USER_ANALYSIS_PROMPT = `Analyze this facial image using advanced biometric detection algorithms. Identify the TOP 3 celebrity matches based on:

- apparent gender, age, ethnicity, and hair color
- Facial bone structure and geometry
- Eye shape, color, spacing, and proportions  
- Nose bridge and nostril configuration
- Jawline definition and chin structure
- Cheekbone prominence and facial symmetry

For each detected match:
- State your detection confidence based on facial feature analysis
- Provide a brief fact about why this celebrity is notable
- Use professional but engaging tone

CRITICAL: Return exactly 3 matches - no exceptions. Base matches on actual facial feature detection, not random selection. DO NOT USE MARKDOWN, especially for descriptions. No more than 1-2 sentences for descriptions!`;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Search for celebrity portrait images using Yahoo Image Search
 */
const searchCelebrityImage = async (celebrityName: string): Promise<string> => {
  const PLACEHOLDER_IMAGE = 'https://bitslog.com/wp-content/uploads/2013/01/unknown-person1.gif';
  
  try {
    const query = `${celebrityName} face portrait`;
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://images.search.yahoo.com/search/images?p=${encodedQuery}&o=js&b=1`);
    const jsonResponse = await response.json();
    
    const htmlString = jsonResponse.html;
    
    // Extract image URLs from the HTML
    const dataRegex = /data='({[^']+})'/g;
    let match;
    while ((match = dataRegex.exec(htmlString)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data.iurl || data.ith) {
          return data.iurl || data.ith;
        }
      } catch (e) {
        continue;
      }
    }
    
    return PLACEHOLDER_IMAGE;
  } catch (error) {
    console.error('Error fetching celebrity image:', error);
    return PLACEHOLDER_IMAGE;
  }
};

/**
 * Add portrait images to celebrity matches
 */
const enrichMatchesWithImages = async (matches: CelebrityMatch[]): Promise<CelebrityMatchWithImage[]> => {
  return Promise.all(
    matches.map(async (match) => ({
      ...match,
      image: await searchCelebrityImage(match.name),
    }))
  );
};

// ==========================================
// AI Analysis
// ==========================================

/**
 * Analyze celebrity match using the multiplexer
 */
const analyzeCelebrityMatch = async (imageBase64: string): Promise<{ matches: CelebrityMatchWithImage[] }> => {
  const completion = await multiplexer.chat.completions.create({
    model: 'auto', // Multiplexer will override with selected model
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
          {
            type: 'text',
            text: USER_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
    response_format: zodResponseFormat(CelebrityMatchesSchema, 'celebrity_matches'),
  });

  // Parse and validate the response
  const result = JSON.parse(completion.choices[0].message.content || '{}');
  const validated = CelebrityMatchesSchema.parse(result);
  
  // Add images to matches
  const matchesWithImages = await enrichMatchesWithImages(validated.matches);
  
  return { matches: matchesWithImages };
};

// ==========================================
// HTTP Server
// ==========================================

const app = new Hono();

// Apply CORS only in development
if (!config.server.isProduction) {
  app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:8085'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }));
}

// Attach request metrics middleware and routes
registerMetrics(app);

// ==========================================
// API Routes
// ==========================================

const routes = app
  .post('/api/matches', async (c) => {
    try {
      const body = await c.req.json();
      const { imageBase64 } = body;
      
      if (!imageBase64) {
        return c.json({ 
          error: 'Image data is required',
          message: 'Please provide a base64 encoded image in the request body'
        }, 400);
      }
      
      const result = await analyzeCelebrityMatch(imageBase64);
      // Update celebrity occurrence metrics
      result.matches.forEach((match) => metrics.addCelebrity(match.name));
      return c.json(result);
    } catch (error) {
      console.error('Error processing matches:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Record failure in metrics
      metrics.addFailure('/api/matches', errorMessage, 500);
      
      // Check if it's a rate limit error from the multiplexer stats
      const stats = multiplexer.getStats();
      const totalRateLimited = Object.values(stats).reduce((sum, stat) => sum + stat.rateLimited, 0);
      
      if (totalRateLimited > 0) {
        return c.json({ 
          error: 'Rate Limit Exceeded',
          message: 'Both AI providers are currently rate limited. Please try again in a few minutes.'
        }, 429);
      }
      
      return c.json({ 
        error: 'Internal Server Error',
        message: errorMessage
      }, 500);
    }
  })
  .get('/api/base64', async (c) => {
    const url = c.req.query('url');
    if (!url) {
      return c.json({ error: 'Missing url param' }, 400);
    }

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        return c.json({ error: 'Failed to fetch image' }, 502);
      }

      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await resp.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;
      
      return c.json({ data: dataUrl });
    } catch (err) {
      console.error('Error fetching image:', err);
      return c.json({ error: 'Error fetching image' }, 500);
    }
  })
  .get('/api/stats', async (c) => {
    const stats = multiplexer.getStats();
    return c.json(stats);
  });

// ==========================================
// Static File Serving
// ==========================================

if (config.server.isProduction) {
  app.use('/assets/*', serveStatic({ root: './dist' }));
  app.use('/*', serveStatic({ root: './public' }));
  app.get('*', serveStatic({ 
    root: './dist',
    rewriteRequestPath: (path) => {
      if (path.startsWith('/api/')) return path;
      return '/index.html';
    }
  }));
} else {
  app.use('/*', serveStatic({ root: './public' }));
  app.notFound((c) => {
    return c.json({ error: 'Route not found', path: c.req.path }, 404);
  });
}

export { routes as app };
export type AppType = typeof routes;

// ==========================================
// Server Bootstrap
// ==========================================

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ 
    fetch: app.fetch, 
    port: config.server.port, 
    hostname: config.server.host 
  });
  console.log(`🚀 Server running on http://${config.server.host}:${config.server.port}`);
  console.log('📊 Provider stats at: /api/stats');
}