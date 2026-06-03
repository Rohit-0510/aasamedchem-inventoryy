import { Decimal } from "@prisma/client/runtime/library";
import type { BaseUnit, OrderUnit } from "@prisma/client";

// Conversion factors to base unit
const CONVERSION_FACTORS: Record<string, number> = {
  // Weight: base unit is g
  "g->g": 1,
  "kg->g": 1000,
  "g->kg": 1 / 1000,
  "kg->kg": 1,

  // Volume: base unit is mL
  "mL->mL": 1,
  "L->mL": 1000,
  "mL->L": 1 / 1000,
  "L->L": 1,

  // Unit (countable)
  "unit->unit": 1,
};

/**
 * Convert a quantity from one unit to another
 * @param quantity The quantity to convert
 * @param fromUnit The source unit
 * @param toUnit The target unit
 * @returns The converted quantity
 */
export function convertUnit(
  quantity: Decimal | number,
  fromUnit: string,
  toUnit: string
): Decimal {
  const qty = typeof quantity === "number" ? new Decimal(quantity) : quantity;

  const key = `${fromUnit}->${toUnit}`;
  const factor = CONVERSION_FACTORS[key];

  if (factor === undefined) {
    throw new Error(`Unsupported conversion: ${fromUnit} to ${toUnit}`);
  }

  return qty.mul(new Decimal(factor));
}

/**
 * Convert quantity from ordered unit to base unit
 * @param quantity The ordered quantity
 * @param orderedUnit The unit the seller chose
 * @param baseUnit The product's base unit
 * @returns The quantity in base unit
 */
export function convertToBase(
  quantity: Decimal | number,
  orderedUnit: OrderUnit,
  baseUnit: BaseUnit
): Decimal {
  return convertUnit(quantity, orderedUnit, baseUnit);
}

/**
 * Convert quantity from base unit to display unit
 * @param quantity The quantity in base unit
 * @param displayUnit The unit to convert to
 * @param baseUnit The product's base unit
 * @returns The quantity in display unit
 */
export function convertFromBase(
  quantity: Decimal | number,
  displayUnit: OrderUnit,
  baseUnit: BaseUnit
): Decimal {
  return convertUnit(quantity, baseUnit, displayUnit);
}

/**
 * Calculate the unit price for a specific ordered unit
 * When seller orders 1 kg but price is per gram, we need to adjust
 * @param basePricePerBaseUnit The price per base unit
 * @param orderedUnit The unit the seller chose
 * @param baseUnit The product's base unit
 * @returns The price per ordered unit
 */
export function getUnitPrice(
  basePricePerBaseUnit: Decimal | number,
  orderedUnit: OrderUnit,
  baseUnit: BaseUnit
): Decimal {
  const basePrice =
    typeof basePricePerBaseUnit === "number"
      ? new Decimal(basePricePerBaseUnit)
      : basePricePerBaseUnit;

  // If ordered unit is the same as base unit, return as is
  if (orderedUnit === baseUnit) {
    return basePrice;
  }

  // Calculate conversion factor: how many base units in 1 ordered unit?
  // e.g., if ordered unit is kg and base is g: 1 kg = 1000 g
  // so price per kg = price per g * 1000
  const factor = CONVERSION_FACTORS[`${orderedUnit}->${baseUnit}`];

  if (factor === undefined) {
    throw new Error(`Unsupported conversion: ${orderedUnit} to ${baseUnit}`);
  }

  return basePrice.mul(new Decimal(factor));
}

/**
 * Format amount in INR with proper formatting
 * @param amount The amount in INR (can be Decimal or number)
 * @returns Formatted string like ₹1,23,456.78
 */
export function formatINR(amount: Decimal | number): string {
  const num =
    typeof amount === "number" ? amount : parseFloat(amount.toString());

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
