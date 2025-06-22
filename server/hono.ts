import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

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

// Inference.net API call for celebrity matching
const analyzeCelebrityMatch = async (imageBase64: string) => {
  // Check if API key is configured
  if (!process.env.INFERENCE_API_KEY) {
    throw new Error('INFERENCE_API_KEY not configured. Please set your API key in the .env file.');
  }

  try {
    const response = await fetch('https://api.inference.net/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INFERENCE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-instruct/bf-16',
        messages: [
          {
            role: 'system',
            content: `You are a world-class facial recognition and celebrity matching expert with deep knowledge of facial anatomy, biometrics, and entertainment industry figures. Your analysis should be precise, scientific, and highly detailed.

CRITICAL INSTRUCTIONS:
1. Analyze facial features with forensic-level precision
2. Each celebrity match MUST have completely unique descriptions - NO repetition of phrases
3. Focus on measurable, specific facial characteristics
4. Use varied, rich vocabulary for each description
5. Avoid generic terms like "similar facial structure" or "resemblance"

FACIAL ANALYSIS FRAMEWORK:
- Cranial proportions and skull shape
- Eye morphology (shape, spacing, tilt, lid structure)
- Nasal anatomy (bridge width, nostril shape, tip projection)
- Oral features (lip fullness, mouth width, cupid's bow)
- Mandibular structure (jaw angle, chin projection, width)
- Zygomatic bones (cheekbone height, prominence, width)
- Forehead dimensions and hairline patterns
- Ear shape and positioning
- Skin texture and complexion characteristics
- Facial symmetry and golden ratio measurements

For each match, provide DISTINCT analysis focusing on different feature combinations.`
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
                text: `Perform a comprehensive facial analysis of this person and identify the TOP 3 celebrity matches based on biometric similarity.

FOR EACH MATCH, YOU MUST PROVIDE:

1. UNIQUE FEATURE ANALYSIS: Focus on a different set of facial characteristics for each celebrity. For example:
   - Match 1: Focus on eye shape, brow ridge, and nasal profile
   - Match 2: Focus on jawline, chin, and mouth structure
   - Match 3: Focus on cheekbones, forehead, and overall proportions

2. SPECIFIC MEASUREMENTS: Include precise observations like:
   - "Almond-shaped eyes with a 15-degree upward tilt"
   - "Square jaw with 110-degree mandibular angle"
   - "High-set cheekbones creating a 2:3 facial ratio"

3. DISTINCTIVE COMPARISONS: Each comparison must highlight completely different aspects:
   - Don't repeat phrases across matches
   - Use varied anatomical terminology
   - Focus on unique distinguishing features for each celebrity

4. PROFESSIONAL BACKGROUND: Brief, relevant career highlights

5. CONFIDENCE SCORING: Base percentages on actual facial similarity, not just general appearance

IMPORTANT: Each description must be substantively different. If you mention "strong jawline" for one match, describe it differently for others (e.g., "angular mandible," "defined chin," "prominent jaw angle").`
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
                analysis: { type: 'string' },
                matches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      percentage: { type: 'number' },
                      description: { type: 'string' },
                      confidence: { type: 'string' },
                      category: { type: 'string' },
                      celebrity_info: { type: 'string' },
                      feature_comparison: { type: 'string' }
                    },
                    required: ['name', 'percentage', 'description', 'confidence', 'category', 'celebrity_info', 'feature_comparison'],
                    additionalProperties: false
                  }
                }
              },
              required: ['analysis', 'matches'],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inference API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Add celebrity images to each match
    const matchesWithImages = await Promise.all(
      result.matches.map(async (match: any) => ({
        ...match,
        image: await searchCelebrityImage(match.name)
      }))
    );

    return { 
      analysis: result.analysis,
      matches: matchesWithImages 
    };
  } catch (error) {
    console.error('Error analyzing celebrity match:', error);
    throw error; // Re-throw the error instead of returning dummy data
  }
};

// Create Hono app with CORS and proper route typing
const app = new Hono()
  .use('*', cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084'],
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
      
      if (errorMessage.includes('Inference API error')) {
        return c.json({ 
          error: 'AI Service Error',
          message: errorMessage,
          instructions: 'The AI service is temporarily unavailable. Please try again later.'
        }, 502);
      }
      
      return c.json({ 
        error: 'Internal Server Error',
        message: errorMessage
      }, 500);
    }
  })

export { routes as app };

// Convenience bootstrap if run directly with tsx/bun/node
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
  serve({ fetch: app.fetch, port: PORT });
  console.log(`🚀 Hono server running on http://localhost:${PORT}`);
}

// Export the app type for RPC client
export type AppType = typeof routes; 