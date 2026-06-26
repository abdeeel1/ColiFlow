// Resolve the correct landing page for an authenticated user based on role/mode.
// - admin            -> admin dashboard
// - traveler mode    -> traveler dashboard
// - sender mode      -> sender dashboard
export const getHomePath = (user) => {
    if (user?.role === "admin") return "/admin/dashboard"
    if (user?.is_traveler) return "/traveler/dashboard"
    return "/sender/dashboard"
}
