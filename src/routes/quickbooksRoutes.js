import express from 'express';
import { getAuthUrl, exchangeToken, getPayments } from '../services/quickbooksService.js';

const router = express.Router();

// STEP 1: Redirect user to QuickBooks auth page
router.get('/connect', (req, res) => {
  const authUrl = getAuthUrl(req);
  res.redirect(authUrl);
});

// STEP 2: OAuth2 callback
router.get('/callback', async (req, res) => {
    const { state, code } = req.query;
  
    // Validate the state parameter
    if (state !== req.session.oauthState) {
      return res.status(400).send('Invalid state parameter.');
    }
  
    try {
      // Exchange the authorization code for tokens
      const tokens = await exchangeToken(code);
      req.session.qbAccessToken = tokens.access_token;
      req.session.qbRefreshToken = tokens.refresh_token;
  
      res.send('✅ QuickBooks connected successfully!');
    } catch (error) {
      console.error('Error exchanging token:', error.response?.data || error.message);
      res.status(500).send('Failed to connect to QuickBooks.');
    }
  });

// STEP 3: Fetch user payments
router.get('/payments', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Invalid or missing Authorization header' });
  }
  const accessToken = req.headers.authorization?.split(' ')[1];
  const { realmId } = req.query;

  if (!accessToken || !realmId) {
    return res.status(400).json({ error: 'Missing access token or realmId' });
  }

  try {
    const data = await getPayments(accessToken, realmId);
    res.json(data);
  } catch (error) {
    console.error('Fetch Payments Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;
