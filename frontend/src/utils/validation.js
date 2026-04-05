/**
 * Utility functions for form validation
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return re.test(phone);
};

export const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,}$/.test(username);
};

export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = data[field];

    if (fieldRules.required && !value) {
      errors[field] = `${field} is required`;
      return;
    }

    if (fieldRules.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Invalid email address';
    }

    if (fieldRules.type === 'password' && value && !validatePassword(value)) {
      errors[field] = 'Password must be at least 8 characters';
    }

    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `Minimum ${fieldRules.minLength} characters required`;
    }

    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `Maximum ${fieldRules.maxLength} characters allowed`;
    }
  });

  return errors;
};
