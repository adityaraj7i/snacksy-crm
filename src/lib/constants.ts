export const DEFAULT_COUNTRY = "Nepal";
export const DEFAULT_COUNTRY_CODE = "+977";
export const DEFAULT_CURRENCY = "NPR";
export const DEFAULT_CURRENCY_SYMBOL = "रू";
export const DEFAULT_TIMEZONE = "Asia/Kathmandu";
export const BUSINESS_NAME = "Snacksy Cafe And Restro";

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  isImplemented: boolean;
}

export const CRM_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", iconName: "LayoutDashboard", isImplemented: true },
  { title: "Customers 360", href: "/customers", iconName: "Users", isImplemented: true },
  { title: "Reservations & Tables", href: "/reservations", iconName: "Calendar", isImplemented: true },
  { title: "Loyalty & Rewards", href: "/loyalty", iconName: "Award", isImplemented: true },
  { title: "Feedback & Recovery", href: "/feedback", iconName: "MessageSquare", isImplemented: true },
  { title: "Staff Task Board", href: "/tasks", iconName: "CheckSquare", isImplemented: true },
  { title: "Executive Analytics", href: "/reports", iconName: "BarChart3", isImplemented: true },
  { title: "Staff Management", href: "/staff", iconName: "UserCheck", isImplemented: true },
  { title: "Digital Menu", href: "/menu", iconName: "Coffee", isImplemented: true },
  { title: "QR Codes", href: "/qr-codes", iconName: "Puzzle", isImplemented: true },
  { title: "Settings", href: "/settings", iconName: "Settings", isImplemented: true },
];
