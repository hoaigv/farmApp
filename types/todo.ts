export interface Todo {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format (e.g., "2025-05-18")
  time: string; // HH:mm format (e.g., "07:30")
  completed: boolean;
}
