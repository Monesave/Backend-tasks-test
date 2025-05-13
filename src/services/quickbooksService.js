import axios from 'axios';
import qs from 'querystring';
import crypto from 'crypto';

const BASE_URL = 'https://quickbooks.api.intuit.com';

const tokenURL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const authURL = 'https://appcenter.intuit.com/connect/oauth2';

const generateState = () => crypto.randomBytes(16).toString('hex');

export const getAuthUrl = (req) => {
    const state = generateState(); // Generate a random state
    req.session.oauthState = state; 

  const params = new URLSearchParams({
    client_id: process.env.QB_CLIENT_ID,
    redirect_uri: process.env.QB_REDIRECT_URI,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting openid profile email',
    state, 
  });

  return `${authURL}?${params.toString()}`;
};

export const exchangeToken = async (code) => {
  const response = await axios.post(tokenURL, qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.QB_REDIRECT_URI,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')}`,
    },
  });

  return response.data;
};

export const getPayments = async (accessToken, realmId) => {
  const url = `${BASE_URL}/v3/company/${realmId}/query?query=select * from Payment&minorversion=65`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  return response.data;
};
