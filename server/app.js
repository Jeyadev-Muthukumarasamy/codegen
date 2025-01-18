import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CohereClient } from 'cohere-ai';
import { LRUCache } from 'lru-cache';
import { router } from './api/api.js';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port =  3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 
dotenv.config();
const api_key = process.env.GOOGLE_CLOUD_API_KEY;
console.log(api_key,"hi")

mongoose.connect('mongodb+srv://jeydev007:jeydev007@cluster0.hzfgg.mongodb.net/')
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
      - Description: <Brief explanation of the generated code>.give description such that it is not understabdanle to no  technicable person
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
        message,
        code
      };
    };
    
    // Modified response handling
    app.post("/cohere", async (req, res) => {
      try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    
        const cacheKey = `response_${prompt}`;
        if (cache.has(cacheKey)) return res.status(200).json({ message: cache.get(cacheKey) });
    
        const genAI = new GoogleGenerativeAI(api_key);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 8192,
          }
        });
    
        const chat = model.startChat({
          history: [],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 8192,
          },
          tools: [{ codeExecution: {} }],
        });
    
        const frontendResult = await fetchWithRetries(() =>
          chat.sendMessage(generateFrontendPrompt(prompt))
        );
    
        const { projectName, message: frontendMessage, code: frontendCode } = parseFrontendResponse(frontendResult.response.text());
        
        const response = {
          projectName,
          frontendMessage,
          code: frontendCode,
        };
    
        cache.set(cacheKey, response);
        res.status(200).json(response);
        
      } catch (error) {
        console.error("Error generating code:", error);
        res.status(500).json({ error: error.message || "An error occurred during code generation." });
      }
    });
    

app.post('/update', async (req, res) => {
  try {
    const { inputMessage, existingCode, aiMessage } = req.body;

    if (!inputMessage || !existingCode) {
      return res.status(400).json({ error: 'User prompt and existing code are required' });
    }

  

    const genAI = new GoogleGenerativeAI(api_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const updatePrompt = `
    You are a senior frontend developer focused on building high-quality, modern web pages. Your task is to improve the existing codebase based on user requests.

    Important:

****dont delete exisitig code.merge your resonse code with existing code and give it as rsponse.the existing code shoudlnot be delted very important.
    1. Return responses in this exact format:
    ---CODE---
    [Your HTML/CSS/JS code here]
    ---MESSAGE---
    [Brief explanation of changes.but it should be understandable to non technical preson.remember you are speaking with non technical person]
   
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

    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
      tools: [{ codeExecution: {} }]
    });

    const result = await chat.sendMessage(updatePrompt);
    const responseContent = result.response.candidates[0].content;

    let contentText = '';
    if (typeof responseContent === 'object' && responseContent.parts) {
      contentText = responseContent.parts.map(part => part.text).join('');
    } else {
      contentText = responseContent;
    }

    // Extract code and message using the new format
    const sections = contentText.split('---MESSAGE---');
    let code = '';
    let message = '';

    if (sections.length >= 2) {
      code = sections[0].replace('---CODE---', '').trim();
      message = sections[1].trim();
    } else {
      // Fallback to looking for code blocks if new format isn't found
      const codeMatch = contentText.match(/```(?:html|javascript|css)?([\s\S]*?)```/);
      code = codeMatch ? codeMatch[1].trim() : '';
      message = contentText.replace(/```(?:html|javascript|css)?[\s\S]*?```/g, '').trim();
    }

    return res.status(200).json({
      code: code,
      frontendMessage: message,
    });

  } catch (error) {
    console.error("Error in update-code handler:", error);
    return res.status(500).json({
      error: 'An error occurred',
      details: error.message
    });
  }
});

app.use('/api', router);

app.listen(port, () => console.log(`Server running on port ${port}`));