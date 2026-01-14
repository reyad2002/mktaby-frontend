"use client";

import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  RefreshCw,
  Loader2,
  AlertCircle,
  Briefcase,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCaseTotalFinance } from "@/features/cases/hooks/caseHooks";
import PageHeader from "@/shared/components/dashboard/PageHeader";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(
    amount
  );

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {formatCurrency(value)}
        </p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function CasesFinancePage() {
  const router = useRouter();
  const {
    data: financeData,
    isLoading,
    isFetching,
    refetch,
  } = useCaseTotalFinance();

  const cases = useMemo(
    () => financeData?.data?.data ?? [],
    [financeData?.data?.data]
  );
  const totalCount = financeData?.data?.count ?? 0;

  // Calculate aggregated totals from individual cases
  const totals = useMemo(() => {
    return cases.reduce(
      (acc, item) => ({
        totalFees: acc.totalFees + item.fees,
        totalPaid: acc.totalPaid + item.paid,
        totalRemaining: acc.totalRemaining + item.remaining,
        totalExpenses: acc.totalExpenses + item.expenses,
      }),
      { totalFees: 0, totalPaid: 0, totalRemaining: 0, totalExpenses: 0 }
    );
  }, [cases]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <PageHeader
        title="المحاسبة المالية للقضايا"
        subtitle="ملخص شامل للمالية للقضايا والأتعاب"
        icon={PieChart}
        isFetching={isFetching}
        countLabel={totalCount > 0 ? `${totalCount} قضية` : ""}
        onRefresh={handleRefresh}
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-teal-600" size={48} />
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Briefcase className="text-gray-500" size={24} />
          </div>
          <p className="text-gray-800 font-semibold">لا توجد بيانات مالية</p>
          <p className="text-sm text-gray-600 mt-1">
            لا توجد قضايا ببيانات مالية حالياً.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} />
            إعادة محاولة
          </button>
        </div>
      ) : (
        <>
          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الأتعاب"
              value={totals.totalFees}
              icon={DollarSign}
              color="bg-blue-50 text-blue-600"
              subtitle={`من ${totalCount} قضية`}
            />
            <StatCard
              title="إجمالي المصاريف"
              value={totals.totalExpenses}
              icon={TrendingDown}
              color="bg-orange-50 text-orange-600"
              subtitle="تكاليف إضافية"
            />
            <StatCard
              title="إجمالي المدفوع"
              value={totals.totalPaid}
              icon={TrendingUp}
              color="bg-emerald-50 text-emerald-600"
              subtitle={`${Math.round(
                (totals.totalPaid / Math.max(1, totals.totalFees)) * 100
              )}% من الأتعاب`}
            />
            <StatCard
              title="المتبقي"
              value={totals.totalRemaining}
              icon={Wallet}
              color="bg-purple-50 text-purple-600"
              subtitle="الأتعاب - المدفوع"
            />
          </div>

          {/* Cases Finance Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-teal-600" />
              تفاصيل القضايا المالية
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      رقم القضية
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      اسم القضية
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      العميل
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      الأتعاب
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      المدفوع
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      المتبقي
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                      المصاريف
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">
                      الإجراء
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr
                      key={caseItem.caseId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900 font-mono">
                        {caseItem.caseNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {caseItem.name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {caseItem.clientName}
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-bold">
                        {formatCurrency(caseItem.fees)}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">
                        {formatCurrency(caseItem.paid)}
                      </td>
                      <td className="py-3 px-4 text-orange-700 font-bold">
                        {formatCurrency(caseItem.remaining)}
                      </td>
                      <td className="py-3 px-4 text-purple-700 font-bold">
                        {formatCurrency(caseItem.expenses)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/cases/${caseItem.caseId}`)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors"
                        >
                          <Eye size={14} />
                          عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="font-semibold text-teal-900">ملاحظة مهمة</p>
                <p className="mt-1 text-sm text-teal-800">
                  تُحدث البيانات المالية تلقائياً كل دقيقة. اضغط على زر التحديث
                  للحصول على أحدث البيانات فوراً.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
