"use client";

import React, { memo } from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = "",
}) => {
  const allItems = showHome
    ? [{ label: "الرئيسية", href: "/dashboard" }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0 && showHome;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronLeft className="w-4 h-4 mx-1 text-gray-400" />
              )}
              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {isFirst && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="text-gray-500">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default memo(Breadcrumbs);
