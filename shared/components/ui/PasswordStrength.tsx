"use client";

import React, { memo, useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showRequirements = true,
  className = "",
}) => {
  const requirements = useMemo((): Requirement[] => {
    return [
      { label: "8 أحرف على الأقل", met: password.length >= 8 },
      { label: "حرف كبير واحد على الأقل", met: /[A-Z]/.test(password) },
      { label: "حرف صغير واحد على الأقل", met: /[a-z]/.test(password) },
      { label: "رقم واحد على الأقل", met: /[0-9]/.test(password) },
      {
        label: "رمز خاص واحد على الأقل (!@#$%)",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "bg-gray-200" };
    if (metCount <= 2) return { level: 1, label: "ضعيفة", color: "bg-red-500" };
    if (metCount <= 3)
      return { level: 2, label: "متوسطة", color: "bg-yellow-500" };
    if (metCount <= 4) return { level: 3, label: "جيدة", color: "bg-blue-500" };
    return { level: 4, label: "قوية", color: "bg-green-500" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                level <= strength.level ? strength.color : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        {strength.label && (
          <span
            className={`text-xs font-medium ${
              strength.level <= 1
                ? "text-red-600"
                : strength.level === 2
                ? "text-yellow-600"
                : strength.level === 3
                ? "text-blue-600"
                : "text-green-600"
            }`}
          >
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 text-xs ${
                req.met ? "text-green-600" : "text-gray-400"
              }`}
            >
              {req.met ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default memo(PasswordStrength);
