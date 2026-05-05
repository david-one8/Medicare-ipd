const DEFAULT_ERROR = 'Something went wrong. Please try again.';

const STATUS_MESSAGES = {
  400: 'The request was not valid. Please check the entered details.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested record was not found.',
  409: 'This record conflicts with existing data.',
  422: 'Please fix the highlighted fields and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'The server could not complete the request. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The request timed out on the server. Please try again later.',
};

export function isUnauthorizedError(error) {
  return error?.response?.status === 401 || error?.response?.data?.response === 401;
}

export function extractFieldErrors(message) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return {};
  }

  return Object.entries(message).reduce((errors, [field, value]) => {
    if (Array.isArray(value)) {
      errors[field] = value.map(String);
    } else if (value) {
      errors[field] = [String(value)];
    }

    return errors;
  }, {});
}

export function formatApiMessage(message, fallback = DEFAULT_ERROR) {
  if (!message) return fallback;
  if (typeof message === 'string') return message;

  if (Array.isArray(message)) {
    return message.filter(Boolean).map(String).join(' ');
  }

  if (typeof message === 'object') {
    const fieldMessages = Object.values(message)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .map(String);

    return fieldMessages.length > 0 ? fieldMessages.join(' ') : fallback;
  }

  return fallback;
}

export function getResponseErrorMessage(data, fallback = DEFAULT_ERROR) {
  if (!data) return fallback;

  if (data.response && data.response !== 200 && STATUS_MESSAGES[data.response]) {
    return formatApiMessage(data.message, STATUS_MESSAGES[data.response]);
  }

  return formatApiMessage(data.message, fallback);
}

export function getRequestErrorMessage(error, fallback = DEFAULT_ERROR) {
  if (error?.response) {
    const statusMessage = STATUS_MESSAGES[error.response.status] || fallback;
    return getResponseErrorMessage(error.response.data, statusMessage);
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }

  if (error?.request) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  return fallback;
}
