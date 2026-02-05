/**
 * صلاحيات الـ 16 احتمال: عرض، إنشاء، تحديث، حذف
 * القيمة من 0 إلى 15 — جدول بحث بسيط بدل الـ bitwise
 */
export const PERM_CREATE = 1;
export const PERM_UPDATE = 2;
export const PERM_DELETE = 4;
export const PERM_VIEW = 8;

export const BITWISE_FLAGS = [
  { value: PERM_CREATE, label: "إنشاء" },
  { value: PERM_UPDATE, label: "تحديث" },
  { value: PERM_DELETE, label: "حذف" },
  { value: PERM_VIEW, label: "عرض" },
] as const;

/** جدول الـ 16 احتمال — كل قيمة (0-15) → { عرض، إنشاء، تحديث، حذف } */
export const PERMISSION_LOOKUP: Record<
  number,
  { view: boolean; create: boolean; update: boolean; delete: boolean }
> = {
  0: { view: false, create: false, update: false, delete: false },
  1: { view: false, create: true, update: false, delete: false },
  2: { view: false, create: false, update: true, delete: false },
  3: { view: false, create: true, update: true, delete: false },
  4: { view: false, create: false, update: false, delete: true },
  5: { view: false, create: true, update: false, delete: true },
  6: { view: false, create: false, update: true, delete: true },
  7: { view: false, create: true, update: true, delete: true },
  8: { view: true, create: false, update: false, delete: false },
  9: { view: true, create: true, update: false, delete: false },
  10: { view: true, create: false, update: true, delete: false },
  11: { view: true, create: true, update: true, delete: false },
  12: { view: true, create: false, update: false, delete: true },
  13: { view: true, create: true, update: false, delete: true },
  14: { view: true, create: false, update: true, delete: true },
  15: { view: true, create: true, update: true, delete: true },
};

/** تحويل القيمة لصلاحيات — استخدام if بسيط بدل bitwise */
export function getPermission(value: number) {
  const v = Math.max(0, Math.min(15, value));
  return PERMISSION_LOOKUP[v] ?? PERMISSION_LOOKUP[0];
}

/** للتوافق مع الكود القديم — استخدم getPermission بدلها */
export function hasFlag(value: number, flag: number): boolean {
  const p = getPermission(value);
  if (flag === PERM_VIEW) return p.view;
  if (flag === PERM_CREATE) return p.create;
  if (flag === PERM_UPDATE) return p.update;
  if (flag === PERM_DELETE) return p.delete;
  return false;
}

/** Add a flag to a permission value */
export function addFlag(value: number, flag: number): number {
  return value | flag;
}

/** Remove a flag from a permission value */
export function removeFlag(value: number, flag: number): number {
  return value & ~flag;
}

/** Toggle a flag in a permission value */
export function toggleFlag(value: number, flag: number): number {
  return value ^ flag;
}

/** Decode value to { view, create, update, delete } booleans */
export function decodeBitwise(value: number) {
  return getPermission(value);
}

/** Encode { view, create, update, delete } booleans to number */
export function encodeBitwise(flags: {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}): number {
  let value = 0;
  if (flags.view) value |= PERM_VIEW;
  if (flags.create) value |= PERM_CREATE;
  if (flags.update) value |= PERM_UPDATE;
  if (flags.delete) value |= PERM_DELETE;
  return value;
}

/** Get human-readable label for a bitwise permission value */
export function getBitwiseLabel(value: number): string {
  const p = getPermission(value);
  if (!p.view && !p.create && !p.update && !p.delete) return "لا يوجد";
  const parts: string[] = [];
  if (p.view) parts.push("عرض");
  if (p.create) parts.push("إنشاء");
  if (p.update) parts.push("تحديث");
  if (p.delete) parts.push("حذف");
  return parts.join("، ") || "—";
}

// ============ Cases & Tasks View Levels (0-3) ============
/** View: 0=no access, 1=metadata, 2=assigned, 3=all */
export const VIEW_LEVEL_OPTIONS = [
  { value: 0, label: "بدون وصول" },
  { value: 1, label: "عرض البيانات الوصفية" },
  { value: 2, label: "عرض المعين له" },
  { value: 3, label: "عرض الكل" },
] as const;

export function getViewLevelLabel(value: number): string {
  const opt = VIEW_LEVEL_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? "—";
}

// ============ Cases & Tasks DML (create, update, delete) ============
/** DML: إنشاء، تحديث، حذف — 8 احتمالات (0-7) */
export const DML_CREATE = 1;
export const DML_UPDATE = 2;
export const DML_DELETE = 4;

export const DML_FLAGS = [
  { value: DML_CREATE, label: "إنشاء" },
  { value: DML_UPDATE, label: "تحديث" },
  { value: DML_DELETE, label: "حذف" },
] as const;

/** جدول DML — القيم 0-7 → { إنشاء، تحديث، حذف } */
export const DML_PERMISSION_LOOKUP: Record<
  number,
  { create: boolean; update: boolean; delete: boolean }
> = {
  0: { create: false, update: false, delete: false },
  1: { create: true, update: false, delete: false },
  2: { create: false, update: true, delete: false },
  3: { create: true, update: true, delete: false },
  4: { create: false, update: false, delete: true },
  5: { create: true, update: false, delete: true },
  6: { create: false, update: true, delete: true },
  7: { create: true, update: true, delete: true },
};

/** تحويل قيمة DML لصلاحيات — if بسيط */
export function getDmlPermission(value: number) {
  const v = Math.max(0, Math.min(7, value));
  return DML_PERMISSION_LOOKUP[v] ?? DML_PERMISSION_LOOKUP[0];
}

/** للتوافق — استخدم getDmlPermission بدلها */
export function hasDmlFlag(value: number, flag: number): boolean {
  const p = getDmlPermission(value);
  if (flag === DML_CREATE) return p.create;
  if (flag === DML_UPDATE) return p.update;
  if (flag === DML_DELETE) return p.delete;
  return false;
}

export function getDmlLabel(value: number): string {
  const p = getDmlPermission(value);
  if (!p.create && !p.update && !p.delete) return "لا يوجد";
  const parts: string[] = [];
  if (p.create) parts.push("إنشاء");
  if (p.update) parts.push("تحديث");
  if (p.delete) parts.push("حذف");
  return parts.join("، ") || "—";
}
