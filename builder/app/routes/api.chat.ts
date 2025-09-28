// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { streamText, type Messages, type StreamingOptions } from '../lib/.server/llm/stream-text';
import SwitchableStream from '../lib/.server/llm/switchable-stream';
import { json } from '@remix-run/cloudflare';

const MAX_RESPONSE_SEGMENTS = 10;
const MAX_TOKENS = 8000;
const CONTINUE_PROMPT = '\n\nContinue the previous message. Do not repeat the previous content.';

export async function loader({ context }: ActionFunctionArgs) {
  // Handle both local development and Cloudflare environments
  const ollamaBaseUrl = context.cloudflare?.env?.OLLAMA_API_BASE_URL ||
                       process.env.OLLAMA_API_BASE_URL || 'not set';
  const openRouterApiKey = context.cloudflare?.env?.OPEN_ROUTER_API_KEY ||
                          process.env.OPEN_ROUTER_API_KEY || 'not set';

  let ollamaApiStatus = 'not tested';
  let ollamaApiError = null;
  let openRouterStatus = 'not tested';
  let openRouterError = null;

  // Test Ollama if configured
  if (ollamaBaseUrl !== 'not set') {
    try {
      const response = await fetch(`${ollamaBaseUrl}/api/tags`);
      if (response.ok) {
        ollamaApiStatus = 'success';
      } else {
        ollamaApiStatus = `failed: ${response.status} ${response.statusText}`;
        ollamaApiError = await response.text();
      }
    } catch (error) {
      ollamaApiStatus = 'error';
      ollamaApiError = error.message;
    }
  }

  // Test OpenRouter API key if configured
  if (openRouterApiKey && openRouterApiKey !== 'your-openrouter-api-key-here') {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        openRouterStatus = 'success';
      } else {
        openRouterStatus = `failed: ${response.status} ${response.statusText}`;
        openRouterError = await response.text();
      }
    } catch (error) {
      openRouterStatus = 'error';
      openRouterError = error.message;
    }
  } else {
    openRouterStatus = 'not configured';
  }

  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production',
    services: {
      ollama: {
        baseUrl: ollamaBaseUrl,
        status: ollamaApiStatus,
        error: ollamaApiError,
      },
      openRouter: {
        apiKeyConfigured: openRouterApiKey && openRouterApiKey !== 'your-openrouter-api-key-here',
        status: openRouterStatus,
        error: openRouterError,
      },
    },
  });
}

export async function action(args: ActionFunctionArgs) {
   return chatAction(args);
 }


// Handle CORS preflight requests
export async function options() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

async function chatAction({ context, request }: ActionFunctionArgs) {
   const maxRetries = 3;
   const retryDelay = 1000; // 1 second

   for (let attempt = 1; attempt <= maxRetries; attempt++) {
     try {
       // Validate request
       if (!request.body) {
         return new Response(JSON.stringify({ error: 'Request body is required' }), {
           status: 400,
           headers: {
             'Content-Type': 'application/json',
             'Access-Control-Allow-Origin': '*',
             'Access-Control-Allow-Methods': 'POST, OPTIONS',
             'Access-Control-Allow-Headers': 'Content-Type',
           },
         });
       }

       const { messages } = await request.json<{ messages: Messages }>();

       if (!messages || !Array.isArray(messages) || messages.length === 0) {
         return new Response(JSON.stringify({ error: 'Messages array is required' }), {
           status: 400,
           headers: {
             'Content-Type': 'application/json',
             'Access-Control-Allow-Origin': '*',
             'Access-Control-Allow-Methods': 'POST, OPTIONS',
             'Access-Control-Allow-Headers': 'Content-Type',
           },
         });
       }

       // Use the primary API key - handle both local and Cloudflare environments
       const openRouterApiKey = context.cloudflare?.env?.OPEN_ROUTER_API_KEY ||
                               process.env.OPEN_ROUTER_API_KEY ||
                               process.env.OPEN_ROUTER_API_KEY_2 ||
                               process.env.OPEN_ROUTER_API_KEY_3 ||
                               process.env.OPEN_ROUTER_API_KEY_4;

       // Use demo mode only if no valid API key is configured
       if (!openRouterApiKey || openRouterApiKey === 'your-openrouter-api-key-here') {
         console.log('Demo mode activated - no valid API key configured');

         // Return a simple demo response for demonstration
         const demoResponse = `🔧 **Demo Mode**: Welcome to THOR AI App Builder!

I can see you're testing the application. Here's what you can do:

✅ **File Management**: Create and edit project files
✅ **Code Editor**: Professional development environment
✅ **Live Preview**: See your applications in real-time
✅ **Modern UI**: Clean, responsive interface

To enable AI chat functionality:
1. Get an OpenRouter API key from https://openrouter.ai/
2. Add it to your environment configuration
3. Restart the development server

What would you like to build today?`;

         return new Response(
           new ReadableStream({
             start(controller) {
               // Send the response in proper SSE format
               controller.enqueue(new TextEncoder().encode(demoResponse));
               controller.close();
             }
           }),
           {
             status: 200,
             headers: {
               'Content-Type': 'text/plain; charset=utf-8',
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Methods': 'POST, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type',
             },
           }
         );
       }

       const stream = new SwitchableStream();

       const options: StreamingOptions = {
         toolChoice: 'none',
         onFinish: async ({ text: content, finishReason }) => {
           try {
             if (finishReason !== 'length') {
               return stream.close();
             }

             if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
               console.error('Maximum response segments reached');
               stream.close();
               return;
             }

             const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;
             console.log(`Continuing message (${switchesLeft} switches left)`);

             messages.push({ role: 'assistant', content });
             messages.push({ role: 'user', content: CONTINUE_PROMPT });

             try {
               const result = await streamText(messages, context.cloudflare.env, options);
               return stream.switchSource(result.toAIStream());
             } catch (continueError) {
               console.error('Continue stream error:', continueError);
               stream.close();
               return;
             }
           } catch (error) {
             console.error('Error in onFinish callback:', error);
             stream.close();
           }
         },
       };

       try {
         const result = await streamText(messages, context.cloudflare.env, options);
         stream.switchSource(result.toAIStream());
       } catch (streamError) {
         console.error('Stream error:', streamError);
         stream.close();
         throw streamError;
       }

       return new Response(stream.readable, {
         status: 200,
         headers: {
           'Content-Type': 'text/plain; charset=utf-8',
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'POST, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type',
           'Cache-Control': 'no-cache',
           'Connection': 'keep-alive',
         },
       });

     } catch (error) {
       console.error(`Chat API error (attempt ${attempt}):`, error);

       // Check if it's a rate limiting error
       const isRateLimit = error.message?.includes('rate limit') ||
                          error.message?.includes('429') ||
                          error.message?.includes('too many requests');

       // Check if it's an authentication error
       const isAuthError = error.message?.includes('API key') ||
                          error.message?.includes('401') ||
                          error.message?.includes('unauthorized');

       // Don't retry on authentication errors
       if (isAuthError || attempt === maxRetries) {
         let errorMessage = 'An unexpected error occurred';
         let statusCode = 500;

         if (isRateLimit) {
           errorMessage = '⚡ Rate limit exceeded! Add $10 credits to OpenRouter to unlock 1000 requests/day, or wait for daily reset.';
           statusCode = 429;
         } else if (isAuthError) {
           errorMessage = '🔑 Authentication failed. Please check API configuration.';
           statusCode = 401;
         } else if (error.message?.includes('model')) {
           errorMessage = '🤖 Selected model is not available. Please try another model.';
           statusCode = 400;
         } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
           errorMessage = '🌐 Network error. Please check your connection and try again.';
           statusCode = 503;
         } else {
           errorMessage = '🔧 Service temporarily unavailable. Please try again in a few moments.';
           statusCode = 503;
         }

         return new Response(JSON.stringify({
           error: errorMessage,
           timestamp: new Date().toISOString(),
           retryAfter: isRateLimit ? Math.pow(2, attempt) * 60 : undefined
         }), {
           status: statusCode,
           headers: {
             'Content-Type': 'application/json',
             'Access-Control-Allow-Origin': '*',
             'Access-Control-Allow-Methods': 'POST, OPTIONS',
             'Access-Control-Allow-Headers': 'Content-Type',
             ...(isRateLimit && { 'Retry-After': String(Math.pow(2, attempt) * 60) })
           },
         });
       }

       // Wait before retrying
       await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
     }
   }

  // If we've exhausted all retries, return a generic error
  return new Response(JSON.stringify({
    error: 'Service temporarily unavailable. Please try again later.',
    timestamp: new Date().toISOString()
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
