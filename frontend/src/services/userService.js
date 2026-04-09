import apiClient from "./api";

// ✅ REGISTRATION (Matches your link perfectly!)
export const registerUser = async (data) => {
  const res = await apiClient.post("/api/users/register/", data);

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// ✅ LOGIN
export const loginUser = async (username, password) => {
  const res = await apiClient.post("/api/token/", {
    username,
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// ✅ GET CURRENT USER PROFILE
export const getCurrentUser = async () => {
  const res = await apiClient.get("/api/users/me/");
  return res.data;
};

// ✅ GET ALL EMPLOYEES
export const getAllEmployees = async () => {
  const res = await apiClient.get("/api/users/employees/");
  return res.data;
};

// ✅ GET ALL MANAGERS
export const getAllManagers = async () => {
  const res = await apiClient.get("/api/users/managers/");
  return res.data;
};

// ✅ LOGOUT
export const logoutUser = () => {
  localStorage.clear();
};