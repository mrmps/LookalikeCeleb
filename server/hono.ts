import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

interface CelebrityMatch {
  name: string;
  percentage: number;
  description: string;
}

// Yahoo Image Search function
const searchCelebrityImage = async (celebrityName: string): Promise<string> => {
  try {
    const query = `${celebrityName} face portrait`;
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://images.search.yahoo.com/search/images?p=${encodedQuery}&o=js&b=1`);
    const jsonResponse = await response.json();
    
    const htmlString = jsonResponse.html;
    
    // Use regex to extract image URLs from the HTML
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
    
    // Fallback to a placeholder if no image found
    return `https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80`;
  } catch (error) {
    console.error('Error fetching celebrity image:', error);
    return `https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80`;
  }
};

// Inference.net API call for celebrity matching with timeout and retry logic
const analyzeCelebrityMatch = async (imageBase64: string, retryCount = 0) => {
  // Check if API key is configured
  if (!process.env.INFERENCE_API_KEY) {
    throw new Error('INFERENCE_API_KEY not configured. Please set your API key in the .env file.');
  }

  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 60000; // 60 seconds timeout

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.inference.net/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INFERENCE_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'google/gemma-3-27b-instruct/bf-16',
        messages: [
          {
            role: 'system',
            content: 'You are an expert facial recognition specialist with advanced training in celebrity identification. Your sophisticated AI algorithms analyze facial geometry, bone structure, and distinctive features to detect precise celebrity matches. You ALWAYS identify exactly 3 matches with scientific confidence.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              },
              {
                type: 'text',
                text: `Analyze this facial image using advanced biometric detection algorithms. Identify the TOP 3 celebrity matches based on:

- apparent gender, age, ethnicity, and hair color
- Facial bone structure and geometry
- Eye shape, color,spacing, and proportions  
- Nose bridge and nostril configuration
- Jawline definition and chin structure
- Cheekbone prominence and facial symmetry

For each detected match:
- State your detection confidence based on facial feature analysis
- Provide a brief fact about why this celebrity is notable
- Use professional but engaging tone

CRITICAL: Return exactly 3 matches - no exceptions. Base matches on actual facial feature detection, not random selection. Return the matches as JSON and also return confidence and a short description of the match. DO NOT USE MARKDOWN, especially for descriptions. No more than 1-2 sentences for descriptions!`
              }
            ]
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'celebrity_matches',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                matches: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      percentage: { type: 'number', minimum: 70, maximum: 99 },
                      description: { type: 'string', maxLength: 500 }
                    },
                    required: ['name', 'percentage', 'description'],
                    additionalProperties: false
                  }
                }
              },
              required: ['matches'],
              additionalProperties: false
            }
          }
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a timeout error (524) and retry
      if (response.status === 524 && retryCount < MAX_RETRIES) {
        console.log(`API timeout, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
        return analyzeCelebrityMatch(imageBase64, retryCount + 1);
      }
      
      throw new Error(`Inference API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Add celebrity images to each match
    const matchesWithImages = await Promise.all(
      result.matches.map(async (match: CelebrityMatch) => ({
        ...match,
        image: await searchCelebrityImage(match.name)
      }))
    );

    return { 
      matches: matchesWithImages 
    };
  } catch (error) {
    console.error('Error analyzing celebrity match:', error);
    
    // Handle specific error types and provide fallback
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // If it's our timeout, try to retry
        if (retryCount < MAX_RETRIES) {
          console.log(`Request timeout, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1))); // Longer wait for timeout retries
          return analyzeCelebrityMatch(imageBase64, retryCount + 1);
        }
        throw new Error('Request timed out after multiple attempts. The AI service may be overloaded.');
      }
      
      if (error.message.includes('524') && retryCount < MAX_RETRIES) {
        console.log(`Server timeout (524), retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1))); // Even longer wait for 524 errors
        return analyzeCelebrityMatch(imageBase64, retryCount + 1);
      }
    }
    
    throw error; // Re-throw the error if we can't handle it
  }
};

// Create Hono app with CORS and proper route typing
const app = new Hono()
  .use('*', cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:8085'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }))

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
      return c.json(result);
    } catch (error) {
      console.error('Error processing matches request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle specific error types
      if (errorMessage.includes('INFERENCE_API_KEY not configured')) {
        return c.json({ 
          error: 'API Configuration Error',
          message: 'INFERENCE_API_KEY not configured. Please set your API key in the .env file.',
          instructions: 'Get your API key from https://inference.net and add it to your .env file'
        }, 503);
      }
      
      if (errorMessage.includes('Request timed out after multiple attempts')) {
        return c.json({ 
          error: 'Service Timeout',
          message: 'The AI service is currently overloaded and taking too long to respond.',
          instructions: 'Please try again in a few minutes. If the problem persists, the service may be experiencing high traffic.'
        }, 504);
      }
      
      if (errorMessage.includes('524') || errorMessage.includes('Inference API error')) {
        return c.json({ 
          error: 'AI Service Unavailable',
          message: 'The AI service is temporarily experiencing issues.',
          instructions: 'This is usually temporary. Please wait a few minutes and try again.'
        }, 502);
      }
      
      return c.json({ 
        error: 'Internal Server Error',
        message: errorMessage
      }, 500);
    }
  })

// Server-side image proxy → base64 (avoids browser CORS)
app.get('/api/base64', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ error: 'Missing url param' }, 400);

  try {
    const resp = await fetch(url);
    if (!resp.ok) return c.json({ error: 'Failed to fetch image' }, 502);

    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await resp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;
    return c.json({ data: dataUrl });
  } catch (err) {
    return c.json({ error: 'Error fetching image' }, 500);
  }
});

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static assets from the React build (JS, CSS, etc.)
  app.use('/assets/*', serveStatic({ root: './dist' }));
  
  // Serve public assets (favicon, logo, etc.)
  app.use('/*', serveStatic({ root: './public' }));
  
  // Serve the React app for all non-API routes (SPA fallback)
  app.get('*', serveStatic({ 
    root: './dist',
    rewriteRequestPath: (path) => {
      // Don't rewrite API routes
      if (path.startsWith('/api/')) return path;
      // For all other routes, serve index.html (SPA routing)
      return '/index.html';
    }
  }));
} else {
  // In development, serve public assets and let Vite handle the rest
  app.use('/*', serveStatic({ root: './public' }));
  
  // Simple 404 handler for development (no redirect loops)
  app.notFound((c) => {
    return c.json({ error: 'Route not found', path: c.req.path }, 404);
  });
}

export { routes as app };

// Convenience bootstrap if run directly with tsx/bun/node
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
  serve({ fetch: app.fetch, port: PORT });
  console.log(`🚀 Hono server running on http://localhost:${PORT}`);
}

// Export the app type for RPC client
export type AppType = typeof routes;