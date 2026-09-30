import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PersonAddRegular, PersonEditRegular, PersonRegular } from "@fluentui/react-icons";
import { User } from "../../core/model";
import { createUser, updateUser } from "../../core/userService";

// ─── Validation
function buildSchema(isCreate: boolean) {
  return Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    phone_number: Yup.string().nullable(),
    role: Yup.string()
      .oneOf(["ADMIN", "CUSTOMER", "THEATER_MANAGER"])
      .required("Role is required"),
    is_active: Yup.boolean(),
    password: isCreate
      ? Yup.string().min(8, "At least 8 characters").required("Password is required")
      : Yup.string().notRequired(),
  });
}

// ─── Types
export type CreateUserPageProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  user: User | null;
  onClose: () => void;
  onSave?: () => void;
};

// ─── Component
export default function CreateUserPage({ open, mode, user, onClose, onSave }: CreateUserPageProps) {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const queryClient = useQueryClient();

  const titleIcon = isCreate ? (
    <PersonAddRegular fontSize={20} />
  ) : isEdit ? (
    <PersonEditRegular fontSize={20} />
  ) : (
    <PersonRegular fontSize={20} />
  );
  const titleText = isCreate ? "Create User" : isEdit ? "Edit User" : "User Detail";

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSave?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<User>) => updateUser(user!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSave?.();
      onClose();
    },
  });

  const saving = createMutation.isPending || updateMutation.isPending;
  const apiError =
    (createMutation.error as any)?.response?.data ||
    (updateMutation.error as any)?.response?.data;

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: buildSchema(isCreate),
    validateOnBlur: true,
    validateOnChange: false,
    initialValues: {
      username: user?.username ?? "",
      email: user?.email ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone_number: user?.phone_number ?? "",
      role: user?.role ?? "CUSTOMER",
      is_active: user?.is_active ?? true,
      password: "",
    },
    onSubmit: async (values) => {
      if (isCreate) {
        await createMutation.mutateAsync({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          phone_number: values.phone_number?.trim() || undefined,
          role: values.role as User["role"],
          is_active: values.is_active,
        });
      } else if (isEdit && user) {
        await updateMutation.mutateAsync({
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          phone_number: values.phone_number?.trim() || null,
          role: values.role as User["role"],
          is_active: values.is_active,
        });
      }
    },
  });

  useEffect(() => {
    if (open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, user]);

  const err = (f: keyof typeof formik.errors) =>
    formik.touched[f] ? (formik.errors[f] as string | undefined) : undefined;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={onClose} />

      {/* Drawer Panel */}
      <div className={`drawer-panel ${open ? "open" : ""}`}>

        {/* Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">
            <span style={{ color: "var(--accent)" }}>{titleIcon}</span>
            {titleText}
          </h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {apiError && (
            <div className="error-box mb-4">
              {typeof apiError === "string" ? apiError : JSON.stringify(apiError)}
            </div>
          )}

          <form id="user-form" onSubmit={formik.handleSubmit} className="d-grid gap-4">

            {/* Section: Personal Info */}
            <div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isView || isEdit}
                  placeholder="johndoe123"
                />
                {err("username") && <span className="form-error">{err("username")}</span>}
              </div>

              <div className="row g-3">
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-input"
                      name="first_name"
                      value={formik.values.first_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isView}
                      placeholder="John"
                    />
                    {err("first_name") && <span className="form-error">{err("first_name")}</span>}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-input"
                      name="last_name"
                      value={formik.values.last_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isView}
                      placeholder="Doe"
                    />
                    {err("last_name") && <span className="form-error">{err("last_name")}</span>}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isView}
                  placeholder="john@example.com"
                />
                {err("email") && <span className="form-error">{err("email")}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  disabled={isView}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            {/* Section: Account Settings */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              {isCreate && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                  />
                  {err("password") && <span className="form-error">{err("password")}</span>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  disabled={isView}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="THEATER_MANAGER">Theater Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <div
                  className={`toggle-switch ${formik.values.is_active ? "active" : ""} ${isView ? "disabled" : ""}`}
                  onClick={() => !isView && formik.setFieldValue("is_active", !formik.values.is_active)}
                  style={{ opacity: isView ? 0.5 : 1, cursor: isView ? "not-allowed" : "pointer" }}
                >
                  <div className="toggle-track">
                    <div className="toggle-knob" />
                  </div>
                  <span className="toggle-label">
                    {formik.values.is_active ? "Active Account" : "Inactive Account"}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        {!isView && (
          <div className="drawer-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="user-form" className="btn-save" disabled={saving}>
              {saving ? "Saving..." : isCreate ? "Create User" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}