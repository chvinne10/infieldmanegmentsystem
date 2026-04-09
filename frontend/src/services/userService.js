import apiClient from "./api";

// REGISTER
export const registerUser = async (data) => {
  const res = await apiClient.post("/users/register/", data);

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// LOGIN
export const loginUser = async (username, password) => {
  const res = await apiClient.post("/token/", {
    username,
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

// CURRENT USER
export const getCurrentUser = async () => {
  const res = await apiClient.get("/users/me/");
  return res.data;
};

// LOGOUT
export const logoutUser = () => {
  localStorage.clear();
};