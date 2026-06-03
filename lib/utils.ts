/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDDHHMISS-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${timestamp}-${random}`;
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(
  value: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format amount in INR with proper formatting
 * @param amount The amount in INR (can be number or string)
 * @returns Formatted string like ₹1,23,456.78
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  // Indian numbering system: 1,23,456.78
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

/**
 * Get display text for a unit
 * @param unit The unit to display
 * @returns Human-readable unit name
 */
export function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    g: "gram",
    kg: "kilogram",
    L: "litre",
    mL: "millilitre",
    unit: "piece",
  };

  return labels[unit] || unit;
}

/**
 * Get all supported units grouped by type
 */
export const UNIT_GROUPS = {
  weight: ["g", "kg"],
  volume: ["mL", "L"],
  count: ["unit"],
};
