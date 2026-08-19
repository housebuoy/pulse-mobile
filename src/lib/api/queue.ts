import { isMockMode } from '@/lib/use-mock';
import { apiRequest, ApiError } from '@/lib/api/client';
import type { QueueTicket } from '@/stores/queue-store';

const MOCK_TICKET: QueueTicket = {
  hospitalName: 'KNUST University Hospital',
  department: 'General OPD',
  doctorName: 'Dr. Arhin',
  currentNumber: 4,
  userNumber: 12,
  waitTimeMins: 45,
  roomNumber: '302',
  estimatedTime: '10:15 AM',
};

export async function getMyTicket(): Promise<QueueTicket | null> {
  if (isMockMode()) return MOCK_TICKET;
  try {
    return await apiRequest<QueueTicket>('/queue/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function checkIn(): Promise<QueueTicket> {
  if (isMockMode()) return MOCK_TICKET;
  return apiRequest<QueueTicket>('/queue/me/check-in', { method: 'POST' });
}
