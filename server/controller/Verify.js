import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();


const CLIENT_ID = '986047408520-sq5hns0e7ck9lo7gnuj8m4m5ooldehp2.apps.googleusercontent.com';

if (!CLIENT_ID) {
  console.error("Error: GOOGLE_CLIENT_ID environment variable is not set.");
  process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

export const verifyToken = async (req, res) => {
  const { idToken } = req.body;
  console.log(idToken)

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  try {
    const ticket = await client.verifyIdToken({ idToken });

    const payload = ticket.getPayload();
    const userDetails = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub,
    };

    res.json({ success: true, userDetails });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// module.exports = verifyToken
