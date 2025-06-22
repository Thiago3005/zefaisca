
import { API_ENDPOINTS } from '../constants';
import { LeaderboardEntry } from '../types';

export async function fetchTop10(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(API_ENDPOINTS.GET_TOP10);
    if (!response.ok) {
      console.error('Failed to fetch top 10:', response.status, await response.text());
      return [];
    }
    const data = await response.json();
    return data as LeaderboardEntry[];
  } catch (error) {
    console.error('Network error fetching top 10:', error);
    return [];
  }
}

export async function submitScore(name: string, survivalSeconds: number): Promise<{ success: boolean; message: string }> {
  const totalHours = parseFloat((survivalSeconds / 3600).toFixed(2));
  try {
    const response = await fetch(API_ENDPOINTS.ADD_PLAYER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, total_hours: totalHours }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || "Score submitted successfully!" };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to submit score." };
    }
  } catch (error) {
    console.error('Network or API error submitting score:', error);
    return { success: false, message: "Network error. Could not connect to ranking server." };
  }
}