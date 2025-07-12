import axios from 'axios';

const SPORTMONKS_API_TOKEN = process.env.NEXT_PUBLIC_SPORTMONKS_API_TOKEN; // Store in .env.local

const api = axios.create({
  baseURL: 'https://api.sportmonks.com/v3/football',
  headers: {
    Authorization: SPORTMONKS_API_TOKEN ? SPORTMONKS_API_TOKEN : '',
  },
});

export async function fetchLiveFixtures() {
  const res = await api.get('/livescores/inplay');
  // The response structure may vary; check Sportmonks docs for details
  return res.data;
}

export default api;
