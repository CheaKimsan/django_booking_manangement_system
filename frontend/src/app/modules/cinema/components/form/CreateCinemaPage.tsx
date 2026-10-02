import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BuildingRegular, BuildingMultipleRegular, DeleteRegular, EditRegular } from "@fluentui/react-icons";
import { Theater, TheaterPayload, Screen, ScreenPayload } from "../../core/model";
import { createTheater, updateTheater, getScreens, createScreen, updateScreen, deleteScreen } from "../../core/cinemaService";
import { getUsers } from "../../../users/core/userService";

// ─── Validation
function buildSchema() {
    return Yup.object({
        name: Yup.string().required("Cinema name is required"),
        city: Yup.string().required("City is required"),
        address: Yup.string().required("Address is required"),
        phone_number: Yup.string().nullable(),
        manager: Yup.number().nullable(),
        is_active: Yup.boolean(),
    });
}

// ─── Types
export type CreateCinemaPageProps = {
    open: boolean;
    mode: "create" | "edit" | "view";
    theater: Theater | null;
    onClose: () => void;
    onSave?: () => void;
};

// ─── Component
export default function CreateCinemaPage({ open, mode, theater, onClose, onSave }: CreateCinemaPageProps) {
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";
    const queryClient = useQueryClient();

    const titleIcon = isCreate ? (
        <BuildingRegular fontSize={20} />
    ) : isEdit ? (
        <BuildingMultipleRegular fontSize={20} />
    ) : (
        <BuildingRegular fontSize={20} />
    );
    const titleText = isCreate ? "Add Cinema" : isEdit ? "Edit Cinema" : "Cinema Detail";

    // Only fetch the manager list while the drawer is actually open.
    const { data: allUsers } = useQuery({
        queryKey: ["users", ""],
        queryFn: () => getUsers(""),
        enabled: open && !isView,
    });
    const managers = (allUsers ?? []).filter((u) => u.role === "THEATER_MANAGER");

    const createMutation = useMutation({
        mutationFn: createTheater,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["theaters"] });
            onSave?.();
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: Partial<TheaterPayload>) => updateTheater(theater!.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["theaters"] });
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
        validationSchema: buildSchema(),
        validateOnBlur: true,
        validateOnChange: false,
        initialValues: {
            name: theater?.name ?? "",
            city: theater?.city ?? "",
            address: theater?.address ?? "",
            phone_number: theater?.phone_number ?? "",
            manager: theater?.manager ?? ("" as any),
            is_active: theater?.is_active ?? true,
        },
        onSubmit: async (values) => {
            const payload = {
                name: values.name.trim(),
                city: values.city.trim(),
                address: values.address.trim(),
                phone_number: values.phone_number?.trim() || undefined,
                manager: values.manager === "" ? null : Number(values.manager),
                is_active: values.is_active,
            };

            if (isCreate) {
                await createMutation.mutateAsync(payload);
            } else if (isEdit && theater) {
                await updateMutation.mutateAsync(payload);
            }
        },
    });

    useEffect(() => {
        if (open) formik.resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, theater]);

    const err = (f: keyof typeof formik.errors) =>
        formik.touched[f] ? (formik.errors[f] as string | undefined) : undefined;

    // ─── Screens section (only once the theater exists, i.e. not in create mode) ───
    const [addingScreen, setAddingScreen] = useState(false);
    const [editingScreenId, setEditingScreenId] = useState<number | null>(null);
    const [screenForm, setScreenForm] = useState({ name: "", total_rows: 5, seats_per_row: 8 });

    const { data: screens } = useQuery({
        queryKey: ["screens", theater?.id],
        queryFn: () => getScreens(theater!.id),
        enabled: !isCreate && !!theater,
    });

    const createScreenMutation = useMutation({
        mutationFn: (payload: ScreenPayload) => createScreen(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["screens", theater?.id] });
            setAddingScreen(false);
            setScreenForm({ name: "", total_rows: 5, seats_per_row: 8 });
        },
    });

    const updateScreenMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<ScreenPayload> }) =>
            updateScreen(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["screens", theater?.id] });
            setEditingScreenId(null);
        },
    });

    const deleteScreenMutation = useMutation({
        mutationFn: (id: number) => deleteScreen(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["screens", theater?.id] }),
    });

    const startEditScreen = (s: Screen) => {
        setEditingScreenId(s.id);
        setScreenForm({ name: s.name, total_rows: s.total_rows, seats_per_row: s.seats_per_row });
    };

    const submitScreenForm = () => {
        if (!theater) return;
        if (editingScreenId) {
            updateScreenMutation.mutate({ id: editingScreenId, payload: { name: screenForm.name } });
            // total_rows/seats_per_row are intentionally left out of the edit payload —
            // changing them wouldn't regenerate existing seats (see Screen.save() backend note),
            // so only the name is safely editable after creation.
        } else {
            createScreenMutation.mutate({ theater: theater.id, ...screenForm });
        }
    };

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

                    <form id="cinema-form" onSubmit={formik.handleSubmit} className="d-grid gap-4">

                        {/* Section: Basic Info */}
                        <div>
                            <div className="form-group">
                                <label className="form-label">Cinema Name</label>
                                <input
                                    className="form-input"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isView}
                                    placeholder="Legend Cinema"
                                />
                                {err("name") && <span className="form-error">{err("name")}</span>}
                            </div>

                            <div className="row g-3">
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            className="form-input"
                                            name="city"
                                            value={formik.values.city}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                            placeholder="Phnom Penh"
                                        />
                                        {err("city") && <span className="form-error">{err("city")}</span>}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            className="form-input"
                                            name="phone_number"
                                            value={formik.values.phone_number}
                                            onChange={formik.handleChange}
                                            disabled={isView}
                                            placeholder="012345678"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    name="address"
                                    rows={2}
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isView}
                                    placeholder="Street 271, Phnom Penh"
                                />
                                {err("address") && <span className="form-error">{err("address")}</span>}
                            </div>
                        </div>

                        {/* Section: Management */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                            <div className="form-group">
                                <label className="form-label">Theater Manager</label>
                                <select
                                    className="form-select"
                                    name="manager"
                                    value={formik.values.manager ?? ""}
                                    onChange={formik.handleChange}
                                    disabled={isView}
                                >
                                    <option value="">No manager assigned</option>
                                    {managers.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {`${m.first_name} ${m.last_name}`.trim() || m.username}
                                        </option>
                                    ))}
                                </select>
                                {managers.length === 0 && !isView && (
                                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                                        No users with THEATER_MANAGER role found yet.
                                    </span>
                                )}
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
                                        {formik.values.is_active ? "Active Cinema" : "Inactive Cinema"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Section: Screens — only once the theater already exists */}
                    {!isCreate && theater && (
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "20px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">Screens</label>
                                {!isView && !addingScreen && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            setEditingScreenId(null);
                                            setScreenForm({ name: "", total_rows: 5, seats_per_row: 8 });
                                            setAddingScreen(true);
                                        }}
                                    >
                                        + Add Screen
                                    </button>
                                )}
                            </div>

                            {(screens ?? []).length === 0 && (
                                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>No screens added yet.</span>
                            )}

                            {screens?.map((s) => (
                                <div key={s.id}>
                                    {editingScreenId === s.id ? (
                                        <div className="d-flex gap-2 align-items-center py-2">
                                            <input
                                                className="form-input"
                                                style={{ flex: 1 }}
                                                value={screenForm.name}
                                                onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                                            />
                                            <button type="button" className="btn btn-sm btn-primary" onClick={submitScreenForm}>
                                                Save
                                            </button>
                                            <button type="button" className="btn btn-sm btn-cancel" onClick={() => setEditingScreenId(null)}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="d-flex justify-content-between align-items-center py-2"
                                            style={{ borderBottom: "1px solid var(--border)" }}
                                        >
                                            <span style={{ fontSize: 13 }}>
                                                {s.name} — {s.total_rows}×{s.seats_per_row} ({s.seats.length} seats)
                                            </span>
                                            {!isView && (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link p-0"
                                                        onClick={() => startEditScreen(s)}
                                                        title="Rename"
                                                    >
                                                        <EditRegular fontSize={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link p-0 text-danger"
                                                        onClick={() => deleteScreenMutation.mutate(s.id)}
                                                        title="Delete"
                                                    >
                                                        <DeleteRegular fontSize={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {addingScreen && (
                                <div className="mt-2 p-2" style={{ border: "1px dashed var(--border)", borderRadius: 6 }}>
                                    <div className="form-group">
                                        <label className="form-label">Screen Name</label>
                                        <input
                                            className="form-input"
                                            value={screenForm.name}
                                            onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                                            placeholder="Screen 1"
                                        />
                                    </div>
                                    <div className="row g-2">
                                        <div className="col">
                                            <label className="form-label">Rows</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={screenForm.total_rows}
                                                onChange={(e) =>
                                                    setScreenForm({ ...screenForm, total_rows: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Seats per Row</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={screenForm.seats_per_row}
                                                onChange={(e) =>
                                                    setScreenForm({ ...screenForm, seats_per_row: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={submitScreenForm}
                                            disabled={!screenForm.name.trim() || createScreenMutation.isPending}
                                        >
                                            {createScreenMutation.isPending ? "Adding..." : "Add"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-cancel"
                                            onClick={() => setAddingScreen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isView && (
                    <div className="drawer-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" form="cinema-form" className="btn-save" disabled={saving}>
                            {saving ? "Saving..." : isCreate ? "Add Cinema" : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}