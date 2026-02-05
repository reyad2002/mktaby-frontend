"use client";

import { DML_FLAGS, hasDmlFlag } from "../constants/permissionFlags";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";

interface DmlPermissionFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  error?: string;
}

/** Create, Update, Delete checkboxes for cases/tasks DML */
export default function DmlPermissionField<T extends FieldValues>({
  name,
  control,
  label,
  error,
}: DmlPermissionFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const currentValue = Number(field.value ?? 0);
          return (
            <div className="flex flex-wrap gap-3">
              {DML_FLAGS.map(({ value, label: flagLabel }) => {
                const checked = hasDmlFlag(currentValue, value);
                return (
                  <label
                    key={value}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        let newVal = currentValue;
                        if (e.target.checked) {
                          newVal |= value;
                        } else {
                          newVal &= ~value;
                        }
                        field.onChange(newVal);
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{flagLabel}</span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
