"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  User as UserIcon,
  Loader2,
  X,
  Edit,
  Archive,
  Trash2,
  UserPlus,
  Briefcase,
  IdCard,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getClientById,
  softDeleteClient,
  hardDeleteClient,
  addCompanyEmployee,
  updateCompanyEmployee,
  softDeleteEmployee,
} from "@/features/clients/apis/clientsApi";
import EditClientForm from "@/features/clients/components/EditClientForm";

type EmployeeFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  nationalIdCard: string;
  position: string;
};

const EMPTY_EMPLOYEE: EmployeeFormState = {
  name: "",
  email: "",
  phoneNumber: "",
  nationalIdCard: "",
  position: "",
};

const formatDateShortAr = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const clientId = Number(params.id);

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );

  const [employeeForm, setEmployeeForm] =
    useState<EmployeeFormState>(EMPTY_EMPLOYEE);

  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(
    null
  );

  const {
    data: clientResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId),
    enabled: Number.isFinite(clientId) && clientId > 0,
  });

  const client = clientResponse?.data;

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
        setTimeout(() => router.push("/dashboard/clients"), 900);
      } else {
        toast.error(response?.message || "تعذر أرشفة العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة العميل");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف العميل نهائياً");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        setTimeout(() => router.push("/dashboard/clients"), 900);
      } else {
        toast.error(response?.message || "تعذر حذف العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف العميل");
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: (data: EmployeeFormState) => addCompanyEmployee(clientId, data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة الموظف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
        setShowAddEmployeeModal(false);
        setEmployeeForm(EMPTY_EMPLOYEE);
      } else {
        toast.error(response?.message || "تعذر إضافة الموظف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء إضافة الموظف");
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: (data: EmployeeFormState & { id: number }) =>
      updateCompanyEmployee(data.id, data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث الموظف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
        setShowEditEmployeeModal(false);
        setEditingEmployeeId(null);
        setEmployeeForm(EMPTY_EMPLOYEE);
      } else {
        toast.error(response?.message || "تعذر تحديث الموظف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء تحديث الموظف");
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: softDeleteEmployee,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الموظف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      } else {
        toast.error(response?.message || "تعذر حذف الموظف");
      }
      setDeletingEmployeeId(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الموظف");
      setDeletingEmployeeId(null);
    },
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployeeMutation.mutate(employeeForm);
  };

  const handleEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployeeId) {
      updateEmployeeMutation.mutate({ ...employeeForm, id: editingEmployeeId });
    }
  };

  const handleDeleteEmployee = (employeeId: number, employeeName: string) => {
    if (window.confirm(`هل تريد حذف الموظف "${employeeName}"؟`)) {
      setDeletingEmployeeId(employeeId);
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditEmployeeModal = (employee: any) => {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({
      name: employee.name ?? "",
      email: employee.email ?? "",
      phoneNumber: employee.phoneNumber ?? "",
      nationalIdCard: employee.nationalIdCard ?? "",
      position: employee.position ?? "",
    });
    setShowEditEmployeeModal(true);
  };

  const handleSoftDelete = () => {
    if (
      window.confirm(
        `هل تريد أرشفة العميل "${client?.name}"؟\nيمكن استعادته لاحقاً.`
      )
    ) {
      softDeleteMutation.mutate(clientId);
    }
  };

  const handleHardDelete = () => {
    if (
      window.confirm(
        `⚠️ تحذير: هل أنت متأكد من حذف العميل "${client?.name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`
      )
    ) {
      hardDeleteMutation.mutate(clientId);
    }
  };

  const isCompany = client?.clientType?.value === "Company";

  return (
    <section className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowRight size={18} />
          العودة
        </button>

        {client && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-cyan-800 text-sm font-medium hover:bg-cyan-100 transition-colors"
            >
              <Edit size={16} />
              تعديل
            </button>

            <button
              onClick={handleSoftDelete}
              disabled={softDeleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-orange-800 text-sm font-medium hover:bg-orange-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {softDeleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Archive size={16} />
              )}
              أرشفة
            </button>

            <button
              onClick={handleHardDelete}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-800 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {hardDeleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="text-red-700" size={22} />
          </div>
          <p className="text-red-800 font-semibold">خطأ في جلب البيانات</p>
          <p className="text-sm text-red-700/80 mt-1">
            {error instanceof Error ? error.message : "تعذر جلب بيانات العميل"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-red-700 hover:bg-red-100 transition-colors"
          >
            <ArrowRight size={16} />
            العودة
          </button>
        </div>
      )}

      {/* Content */}
      {client && (
        <>
          {/* Header (White) */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تفاصيل العميل</p>
                <h1 className="text-3xl font-semibold text-gray-900">
                  {client.name}
                </h1>
                <p className="text-sm text-gray-600">
                  تاريخ الإنشاء:{" "}
                  {client.createdAt ? formatDateShortAr(client.createdAt) : "—"}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border ${
                  client.clientType.value === "Individual"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                {client.clientType.value === "Individual" ? (
                  <UserIcon size={16} />
                ) : (
                  <Building2 size={16} />
                )}
                {client.clientType.label}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <Phone className="text-blue-700" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                  <p className="text-gray-900 font-medium mt-1" dir="ltr">
                    {client.phoneCode} {client.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <Mail className="text-blue-700" size={18} />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p
                    className="text-gray-900 font-medium mt-1 truncate"
                    // title={client.email}
                    dir="ltr"
                  >
                    {client.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  {client.clientType.value === "Individual" ? (
                    <UserIcon className="text-gray-700" size={18} />
                  ) : (
                    <Building2 className="text-gray-700" size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">نوع العميل</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {client.clientType.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <MapPin className="text-gray-700" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">العنوان</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {client.address || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {client.imageURL && (
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-3">صورة العميل</p>
              <img
                src={client.imageURL}
                alt={client.name}
                className="w-48 h-48 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}

          {/* Employees (Company only) */}
          {isCompany && (
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="text-blue-700" size={18} />
                  موظفي الشركة
                </h3>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-800 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <UserPlus size={16} />
                  إضافة موظف
                </button>
              </div>

              {client.companyEmployees?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.companyEmployees.map((employee, idx) => (
                    <div
                      key={employee.id ?? idx}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <UserIcon className="text-gray-700" size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {employee.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Briefcase size={14} className="text-gray-400" />
                            <span className="truncate">{employee.position}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate block" dir="ltr" title={employee.email}>
                            {employee.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={14} className="text-gray-400" />
                          <span dir="ltr">{employee.phoneNumber}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <IdCard size={14} className="text-gray-400" />
                          <span dir="ltr">{employee.nationalIdCard}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                        <button
                          onClick={() => openEditEmployeeModal(employee)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-800 text-xs font-medium hover:bg-cyan-100 transition-colors"
                        >
                          <Edit size={14} />
                          تعديل
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteEmployee(employee.id!, employee.name)
                          }
                          disabled={deletingEmployeeId === employee.id}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingEmployeeId === employee.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <Building2 className="mx-auto text-gray-400" size={32} />
                  <p className="mt-2 text-gray-700 font-medium">
                    لا يوجد موظفين مسجلين
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    اضغط على إضافة موظف لإضافة أول موظف.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddEmployeeModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-blue-600" size={22} />
                إضافة موظف جديد
              </h2>
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل اسم الموظف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  required
                  value={employeeForm.phoneNumber}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرقم القومي *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.nationalIdCard}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      nationalIdCard: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل الرقم القومي"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.position}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      position: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل المنصب"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addEmployeeMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {addEmployeeMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      إضافة الموظف
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmployeeModal(false);
                    setEmployeeForm(EMPTY_EMPLOYEE);
                  }}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowEditEmployeeModal(false);
              setEditingEmployeeId(null);
              setEmployeeForm(EMPTY_EMPLOYEE);
            }}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل الموظف
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingEmployeeId(null);
                  setEmployeeForm(EMPTY_EMPLOYEE);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل اسم الموظف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  required
                  value={employeeForm.phoneNumber}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرقم القومي *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.nationalIdCard}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      nationalIdCard: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل الرقم القومي"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.position}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      position: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل المنصب"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateEmployeeMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-white font-medium hover:bg-cyan-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updateEmployeeMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      تحديث الموظف
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployeeId(null);
                    setEmployeeForm(EMPTY_EMPLOYEE);
                  }}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل العميل
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <EditClientForm
              clientId={clientId}
              onSuccess={() => {
                setShowEditModal(false);
                queryClient.invalidateQueries({ queryKey: ["client", clientId] });
                queryClient.invalidateQueries({ queryKey: ["clients"] });
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
