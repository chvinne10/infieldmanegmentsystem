import apiClient from "./api";

// ✅ REGISTER
export const registerUser = async (data) => {
  const res = await apiClient.post("/api/users/register/", data);

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// ✅ LOGIN
export const loginUser = async (username, password) => {
  const res = await apiClient.post("/token/", {
    username,
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// ✅ CURRENT USER
export const getCurrentUser = async () => {
  const res = await apiClient.get("/users/me/");
  return res.data;
};

// ✅ GET ALL EMPLOYEES (🔥 FIXED ERROR)
export const getAllEmployees = async () => {
  const res = await apiClient.get("/users/employees/");
  return res.data;
};

// ✅ GET ALL MANAGERS
export const getAllManagers = async () => {
  const res = await apiClient.get("/users/managers/");
  return res.data;
};

// ✅ GET ALL USERS (optional but useful)
export const getAllUsers = async () => {
  const res = await apiClient.get("/users/");
  return res.data;
};

// ✅ LOGOUT
export const logoutUser = () => {
  localStorage.clear();
};
