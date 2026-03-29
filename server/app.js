import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CohereClient } from 'cohere-ai';
import { LRUCache } from 'lru-cache';
import { router } from './api/api.js';
import bodyParser from 'body-parser';
import { Mistral } from '@mistralai/mistralai';

dotenv.config();

const app = express();
const port =  3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 
dotenv.config();
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))    
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
    const generateFrontendPrompt = (userMessage) => `
    You are a senior frontend developer, specializing in building modern, polished, and responsive web pages with high-quality design. Your task is to generate fully functional, production-grade HTML pages using **vanilla JavaScript** for interactivity and **Tailwind CSS** for styling, based on the user's request. Additionally, suggest a relevant project name for this work. The design should be elegant, user-friendly, and functional without relying on any backend logic.
    
    ### CONTEXT:
    - User Request: "${userMessage}"
    
    ### OUTPUT REQUIREMENTS:
    1. Provide a **Project Name** that suits the requested task.
    2. Generate the required **frontend code** (HTML, CSS, JavaScript) and a description of the generated code's functionality.
    3. Ensure the design is modern, polished, and user-friendly.
    
    ### INSTRUCTIONS:
    - Follow the specific requirements based on the user request (e.g., Login Page, Signup Page, Cart Page, etc.).
    - Use **Tailwind CSS** for all styling and **vanilla JavaScript** for interactivity.
    - Include a **semantic, structured, and maintainable layout**.
    - Provide the output in the following structure:
      - Project Name: Suggested Project Name
      - Description: <Brief explanation of the generated code in plain text only, no markdown formatting, no asterisks, no bullet points, no headers. Write it as simple sentences understandable to a non-technical person.>
      - Code: \`\`\`html
      <Generated HTML code here>
      \`\`\`
    
    ### DESIGN REQUIREMENTS:
    - Ensure the code is production-ready, professional, clean, and visually polished.
    - Emphasize **responsiveness**, **accessibility**, and **exceptional UX**.
    
    The output should include a suggested project name, a description of the functionality, and the generated code.`;
    
    const cache = new LRUCache({ max: 100, maxAge: 1000 * 60 * 5 });
    
    const fetchWithRetries = async (fn, retries = 3, delay = 1000) => {
      try {
        return await fn();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetries(fn, retries - 1, delay * 2);
        }
        throw error;
      }
    };
    
    const stripMarkdown = (text) => {
      return text
        .replace(/#{1,6}\s+/g, '')           // headers
        .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
        .replace(/\*([^*]+)\*/g, '$1')       // italic
        .replace(/__([^_]+)__/g, '$1')       // bold underscores
        .replace(/_([^_]+)_/g, '$1')         // italic underscores
        .replace(/~~([^~]+)~~/g, '$1')       // strikethrough
        .replace(/`([^`]+)`/g, '$1')         // inline code
        .replace(/^\s*[-*+]\s+/gm, '')       // bullet points
        .replace(/^\s*\d+\.\s+/gm, '')       // numbered lists
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .replace(/\n{3,}/g, '\n\n')          // excessive newlines
        .trim();
    };

    const parseFrontendResponse = (responseText) => {
      // Extract project name
      const projectNameMatch = responseText.match(/Project Name:\s*([^\n]+)/);
      const projectName = projectNameMatch ? projectNameMatch[1].trim() : "Unnamed Project";
    
      // Extract description/message
      const descriptionMatch = responseText.match(/Description:([\s\S]*?)(?=```|Code:|$)/i);
      const message = descriptionMatch ? descriptionMatch[1].trim() : "";
    
      // Extract code
      const codeMatch = responseText.match(/```(?:html)?([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : "";
    
      return {
        projectName,
        message: stripMarkdown(message),
        code
      };
    };
    
    // Modified response handling with streaming
    app.post("/cohere", async (req, res) => {
      try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const cacheKey = `response_${prompt}`;
        if (cache.has(cacheKey)) return res.status(200).json(cache.get(cacheKey));

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const stream = await mistral.chat.stream({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: generateFrontendPrompt(prompt) }],
          temperature: 0.3,
          topP: 0.9,
          maxTokens: 8192,
        });

        let fullText = '';
        for await (const event of stream) {
          const chunk = event.data.choices[0]?.delta?.content || '';
          if (chunk) {
            fullText += chunk;
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
          }
        }

        // Parse and send final structured result
        const { projectName, message: frontendMessage, code: frontendCode } = parseFrontendResponse(fullText);
        const finalData = { projectName, frontendMessage, code: frontendCode };
        cache.set(cacheKey, finalData);
        res.write(`data: ${JSON.stringify({ type: 'done', ...finalData })}\n\n`);
        res.end();

      } catch (error) {
        console.error("Error generating code:", error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
      }
    });
    

app.post('/update', async (req, res) => {
  try {
    const { inputMessage, existingCode, aiMessage } = req.body;

    if (!inputMessage || !existingCode) {
      return res.status(400).json({ error: 'User prompt and existing code are required' });
    }

    const updatePrompt = `
    You are a senior frontend developer focused on building high-quality, modern web pages. Your task is to improve the existing codebase based on user requests.

    Important:

****dont delete exisitig code.merge your resonse code with existing code and give it as rsponse.the existing code shoudlnot be delted very important.
    1. Return responses in this exact format:
    ---CODE---
    [Your HTML/CSS/JS code here]
    ---MESSAGE---
    [Brief explanation of changes in plain text only. No markdown, no asterisks, no bullet points, no headers, no numbered lists. Write simple sentences understandable to a non-technical person.]

    2. Only ask clarifying questions if absolutely necessary for critical functionality
    3. Use Tailwind CSS for all styling
    4. Ensure mobile-first, responsive design
    5. Focus on production-grade code quality

    Existing Code:
    ${existingCode}

    User Request:
    ${inputMessage}

    Previous AI Message:
    ${aiMessage}
    `;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = await mistral.chat.stream({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: updatePrompt }],
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 8192,
    });

    let fullText = '';
    for await (const event of stream) {
      const chunk = event.data.choices[0]?.delta?.content || '';
      if (chunk) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }
    }

    // Parse final result
    const sections = fullText.split('---MESSAGE---');
    let code = '';
    let message = '';

    if (sections.length >= 2) {
      code = sections[0].replace('---CODE---', '').trim();
      // Strip any remaining backtick wrappers from code
      const codeBlockMatch = code.match(/```(?:html|javascript|css)?([\s\S]*?)```/);
      if (codeBlockMatch) code = codeBlockMatch[1].trim();
      message = sections[1].trim();
    } else {
      const codeMatch = fullText.match(/```(?:html|javascript|css)?([\s\S]*?)```/);
      code = codeMatch ? codeMatch[1].trim() : '';
      message = fullText.replace(/```(?:html|javascript|css)?[\s\S]*?```/g, '').trim();
    }

    // Clean message: remove any leftover markers, code artifacts, and markdown
    message = stripMarkdown(
      message
        .replace(/---CODE---/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim()
    );

    res.write(`data: ${JSON.stringify({ type: 'done', code, frontendMessage: message })}\n\n`);
    res.end();

  } catch (error) {
    console.error("Error in update-code handler:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

app.use('/api', router);

app.listen(port, () => console.log(`Server running on port ${port}`));