import { useQuery } from "@tanstack/react-query";
import { getCaseFees } from "../apis/CaseFeesApi";
import { getCaseExpenses } from "../apis/CaseExpensesApi";
import { getFeePayments } from "../apis/FeePaymentApi";
import type { CaseFeeDto } from "../types/CaseFeesTypes";
import type { CaseExpenseDto } from "../types/CaseExpensesTypes";
import type { FeePaymentDto } from "../types/FeePaymentTypes";

export interface CaseAccountingSummary {
  totalFees: number;
  totalExpenses: number;
  totalPayments: number;
  balance: number;
  paymentPercentage: number;
}

export function useCaseAccountingSummary(caseId: number) {
  // Fetch case fees
  const {
    data: feesData,
    isLoading: feesLoading,
    refetch: refetchFees,
  } = useQuery({
    queryKey: ["caseFees", { CaseId: caseId }],
    queryFn: () => getCaseFees({ CaseId: caseId }),
  });

  // Fetch case expenses
  const {
    data: expensesData,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ["caseExpenses", { CaseId: caseId }],
    queryFn: () => getCaseExpenses({ CaseId: caseId }),
  });

  // Fetch fee payments
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["feePayments", { CaseId: caseId }],
    queryFn: () => getFeePayments({ CaseId: caseId }),
  });

  const fees: CaseFeeDto[] = feesData?.data?.data ?? [];
  const expenses: CaseExpenseDto[] = expensesData?.data?.data ?? [];
  const payments: FeePaymentDto[] = paymentsData?.data?.data ?? [];

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPayments = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalAmount = totalFees + totalExpenses;
  const balance = totalAmount - totalPayments;
  const paymentPercentage =
    totalAmount > 0 ? Math.round((totalPayments / totalAmount) * 100) : 0;

  const refetchAll = async () => {
    await Promise.all([refetchFees(), refetchExpenses(), refetchPayments()]);
  };

  return {
    summary: {
      totalFees,
      totalExpenses,
      totalPayments,
      balance,
      paymentPercentage,
    },
    fees,
    expenses,
    payments,
    isLoading: feesLoading || expensesLoading || paymentsLoading,
    error: null as string | null,
    refetchAll,
  };
}
