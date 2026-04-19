// ===== Schedule HTTP Request/Response Models =====

export interface SaveScheduleRequest {
  startAt: Date;
  endAt: Date;
  clientId: number;
}

export interface SaveScheduleResponse {
  id: number;
  startAt: Date;
  endAt: Date;
  clientId: number;
  clientName: string;
}

export interface ScheduleAppointmentMonthResponse {
  year: number;
  month: number;
  scheduledAppointments: ScheduledAppointmentItemResponse[];
}

export interface ScheduledAppointmentItemResponse {
  id: number;
  day: number;
  startAt: Date;
  endAt: Date;
  clientId: number;
  clientName: string;
}
