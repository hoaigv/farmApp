// src/store/index.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./authSlice";
import todoReducer from "./todoSlice";

// Cấu hình redux-persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // chỉ persist authReducer
};

// Gộp reducers
const rootReducer = combineReducers({
  todo: todoReducer,
  auth: authReducer,
});

// Áp dụng persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // quan trọng để tránh lỗi redux-persist
    }),
});

// Tạo persistor
export const persistor = persistStore(store);

// Kiểu TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
