// src/services/flashMessageService.ts

import { showMessage } from "react-native-flash-message";

/**
 * Show success message.
 *
 * @param message Title (default "Success!")
 * @param description Detailed content (default "")
 */
export const showSuccess = (
  message: string = "Success!",
  description: string = ""
) => {
  showMessage({
    message,
    description,
    type: "success",
    icon: "success",
    duration: 2500,
    floating: true,
    position: "top",
  });
};

/**
 * Show warning message.
 *
 * @param message Title (default "Warning!")
 * @param description Detailed content (default "")
 */
export const showWarning = (
  message: string = "Warning!",
  description: string = ""
) => {
  showMessage({
    message,
    description,
    type: "warning",
    icon: "warning",
    duration: 2500,
    floating: true,
    position: "top",
  });
};

/**
 * Show error message.
 *
 * @param message Title (default "Error!")
 * @param description Detailed content (default "")
 */
export const showError = (
  message: string = "Error!",
  description: string = ""
) => {
  showMessage({
    message,
    description,
    type: "danger",
    icon: "danger",
    duration: 3000,
    floating: true,
    position: "bottom",
  });
};
