/**
 * Admin section layout — bare, no app shell.
 * AppShell in root layout already excludes Navbar/Sidebar for /admin routes.
 */
export const metadata = {
    title: "Cashbook Admin",
    description: "Admin panel — restricted access",
};

export default function AdminLayout({ children }) {
    return children;
}
