import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Todo } from "../types/todo";

interface TodoState {
  todos: Todo[];
}

const initialState: TodoState = {
  todos: [],
};
const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.todos.push(action.payload);
    },
    toggleComplete: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    editTodo: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      const todo = state.todos.find((todo) => todo.id === id);
      if (todo) {
        todo.title = title;
      }
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },
  },
});
export const { addTodo, toggleComplete, editTodo, deleteTodo } =
  todoSlice.actions;
export default todoSlice.reducer;
