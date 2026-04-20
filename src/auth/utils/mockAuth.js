const AUTH_USERS_STORAGE_KEY = "skillnova-auth-users";

const DEFAULT_AUTH_USERS = [
  {
    name: "SkillNova Admin",
    email: "admin@skillnova.com",
    password: "admin",
    role: "admin",
  },
  {
    name: "SkillNova User",
    email: "user@skillnova.com",
    password: "user",
    role: "intern",
  },
];

const readCustomUsers = () => {
  try {
    const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCustomUsers = (users) => {
  localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getAuthUsers = () => [...DEFAULT_AUTH_USERS, ...readCustomUsers()];

export const findAuthUser = (email, password) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  return (
    getAuthUsers().find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail && user.password === password,
    ) || null
  );
};

export const createAuthUser = ({ name, email, password }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const customUsers = readCustomUsers();

  const alreadyExists = getAuthUsers().some(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (alreadyExists) {
    throw new Error("An account with this email already exists.");
  }

  const nextUser = {
    name: String(name || "").trim(),
    email: normalizedEmail,
    password,
    role: "intern",
  };

  writeCustomUsers([...customUsers, nextUser]);
  return nextUser;
};
