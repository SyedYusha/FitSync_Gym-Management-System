import {
  getCurrentUser,
  getCurrentProfile
} from "./auth.service.js";

const dashboardRoutes = {
  owner: "/dashboards/owner.html",
  admin: "/dashboards/admin.html",
  trainer: "/dashboards/trainer.html",
  member: "/dashboards/member.html"
};

export async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser();

  if (!user) {
    window.location.replace("/login.html");
    return null;
  }

  const profile = await getCurrentProfile();

  if (!profile || !dashboardRoutes[profile.role]) {
    window.location.replace("/login.html");
    return null;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile.role)
  ) {
    window.location.replace(
      dashboardRoutes[profile.role]
    );
    return null;
  }

  return profile;
}