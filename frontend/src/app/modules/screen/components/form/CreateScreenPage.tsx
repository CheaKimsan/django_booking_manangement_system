import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    GridRegular,
    AddRegular,
    EditRegular,
    InfoRegular,
} from "@fluentui/react-icons";
import type { Screen, ScreenPayload } from "../../core/model";
import type { Theater } from "../../../cinema/core/model";
import { createScreen, updateScreen } from "../../core/screenService";
import Drawer from "../../../../_shared/Drawer"; // ← adjust path

function buildSchema(isEdit: boolean) {
    const base = {
        name: Yup.string()
            .required("Screen name is required")
            .max(80, "Name is too long"),
        is_active: Yup.boolean(),
    };

    if (isEdit) return Yup.object(base);

    return Yup.object({
        ...base,
        theater: Yup.number()
            .typeError("Select a theater")
            .required("Theater is required"),
        total_rows: Yup.number()
            .typeError("Must be a number")
            .integer("Whole numbers only")
            .min(1, "At least 1 row")
            .max(50, "Max 50 rows")
            .required("Rows is required"),
        seats_per_row: Yup.number()
            .typeError("Must be a number")
            .integer("Whole numbers only")
            .min(1, "At least 1 seat per row")
            .max(50, "Max 50 seats per row")
            .required("Seats per row is required"),
    });
}

// ─── Types ─────────────────────────────────────────────────────────
export type ScreenDrawerProps = {
    open: boolean;
    mode: "create" | "edit" | "view";
    screen: Screen | null;
    theaterId: number | null;
    theaters?: Theater[];
    onClose: () => void;
    onSave?: () => void;
};

const DEFAULT_VALUES = {
    name: "",
    theater: "" as number | "",
    total_rows: 5,
    seats_per_row: 8,
    is_active: true,
};

export default function ScreenDrawer({
    open,
    mode,
    screen,
    theaterId,
    theaters = [],
    onClose,
    onSave,
}: ScreenDrawerProps) {
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";
    const queryClient = useQueryClient();

    const titleIcon = isCreate ? (
        <AddRegular fontSize={20} />
    ) : isEdit ? (
        <EditRegular fontSize={20} />
    ) : (
        <GridRegular fontSize={20} />
    );

    const titleText = isCreate
        ? "Add Screen"
        : isEdit
        ? "Edit Screen"
        : "Screen Detail";

    const createMutation = useMutation({
        mutationFn: (payload: ScreenPayload) => createScreen(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["screens"], exact: false });
            onSave?.();
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: Partial<ScreenPayload>) =>
            updateScreen(screen!.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["screens"], exact: false });
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
        validationSchema: buildSchema(isEdit),
        validateOnBlur: true,
        validateOnChange: false,
        initialValues: {
            name: screen?.name ?? DEFAULT_VALUES.name,
            theater: (screen?.theater ?? theaterId ?? "") as number | "",
            total_rows: screen?.total_rows ?? DEFAULT_VALUES.total_rows,
            seats_per_row: screen?.seats_per_row ?? DEFAULT_VALUES.seats_per_row,
            is_active: screen?.is_active ?? DEFAULT_VALUES.is_active,
        },
        onSubmit: async (values) => {
            if (isCreate) {
                if (!values.theater) {
                    formik.setFieldError("theater", "Please select a theater");
                    return;
                }
                await createMutation.mutateAsync({
                    theater: Number(values.theater),
                    name: values.name.trim(),
                    total_rows: Number(values.total_rows),
                    seats_per_row: Number(values.seats_per_row),
                });
            } else if (isEdit && screen) {
                await updateMutation.mutateAsync({
                    name: values.name.trim(),
                    is_active: values.is_active,
                });
            }
        },
    });

    useEffect(() => {
        if (open) formik.resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, screen]);

    const err = (f: keyof typeof formik.errors) =>
        formik.touched[f] ? (formik.errors[f] as string | undefined) : undefined;

    // Preview calculations
    const previewRows = Math.min(Number(formik.values.total_rows) || 0, 8);
    const previewCols = Math.min(Number(formik.values.seats_per_row) || 0, 12);
    const totalSeats =
        (Number(formik.values.total_rows) || 0) *
        (Number(formik.values.seats_per_row) || 0);

    // Resolve theater name for banner
    const theaterName = screen
        ? theaters.find((t) => t.id === screen.theater)?.name
        : theaters.find((t) => t.id === Number(formik.values.theater))?.name;

    return (
        <Drawer
            open={open}
            title={titleText}
            icon={titleIcon}
            onClose={onClose}
            resetScrollKey={`${mode}-${screen?.id ?? "new"}`}
            footer={
                !isView ? (
                    <>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="screen-form"
                            className="btn-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isCreate
                                ? "Add Screen"
                                : "Save Changes"}
                        </button>
                    </>
                ) : null
            }
        >
            {apiError && (
                <div className="error-box mb-4">
                    {typeof apiError === "string"
                        ? apiError
                        : JSON.stringify(apiError)}
                </div>
            )}

            <form
                id="screen-form"
                onSubmit={formik.handleSubmit}
                className="d-grid gap-4"
            >
                {/* Theater dropdown — CREATE mode */}
                {isCreate && (
                    <div className="form-group">
                        <label className="form-label">Theater</label>
                        <select
                            className="form-select"
                            name="theater"
                            value={formik.values.theater}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select a theater...</option>
                            {theaters.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                    {t.city ? ` · ${t.city}` : ""}
                                </option>
                            ))}
                        </select>
                        {err("theater") && (
                            <span className="form-error">{err("theater")}</span>
                        )}
                        {theaters.length === 0 && (
                            <span className="form-hint">
                                No theaters available. Create one first.
                            </span>
                        )}
                    </div>
                )}

                {/* Theater banner — EDIT/VIEW mode */}
                {!isCreate && theaterName && (
                    <div className="screen-drawer-theater">
                        <InfoRegular fontSize={14} />
                        <span>
                            Attached to <strong>{theaterName}</strong>
                        </span>
                    </div>
                )}

                {/* Screen Name */}
                <div className="form-group">
                    <label className="form-label">Screen Name</label>
                    <input
                        className="form-input"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isView}
                        placeholder="Screen 1"
                        autoFocus={isCreate || isEdit}
                    />
                    {err("name") && (
                        <span className="form-error">{err("name")}</span>
                    )}
                </div>

                {/* Layout */}
                <div className="row g-3">
                    <div className="col">
                        <div className="form-group">
                            <label className="form-label">Rows</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                className="form-input"
                                name="total_rows"
                                value={formik.values.total_rows}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isView || isEdit}
                                placeholder="5"
                            />
                            {err("total_rows") && (
                                <span className="form-error">
                                    {err("total_rows")}
                                </span>
                            )}
                            {isEdit && (
                                <span className="form-hint">
                                    Layout locked after creation
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-group">
                            <label className="form-label">Seats per Row</label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                className="form-input"
                                name="seats_per_row"
                                value={formik.values.seats_per_row}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isView || isEdit}
                                placeholder="8"
                            />
                            {err("seats_per_row") && (
                                <span className="form-error">
                                    {err("seats_per_row")}
                                </span>
                            )}
                            {isEdit && (
                                <span className="form-hint">
                                    Layout locked after creation
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {previewRows > 0 && previewCols > 0 && (
                    <div className="screen-add-preview">
                        <div className="screen-add-preview-label">
                            Layout Preview ·{" "}
                            <strong>{totalSeats} seats total</strong>
                        </div>
                        <div className="screen-add-preview-grid">
                            {Array.from({ length: previewRows }).map((_, r) => (
                                <div key={r} className="screen-preview-row">
                                    {Array.from({
                                        length: previewCols,
                                    }).map((__, c) => (
                                        <span
                                            key={c}
                                            className="screen-preview-seat"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                        {(formik.values.total_rows > 8 ||
                            formik.values.seats_per_row > 12) && (
                            <div className="screen-add-preview-more">
                                Preview limited to 8×12
                            </div>
                        )}
                    </div>
                )}

                {/* Active toggle — only for edit/view */}
                {!isCreate && (
                    <div
                        style={{
                            borderTop: "1px solid var(--border)",
                            paddingTop: "20px",
                        }}
                    >
                        <div className="form-group">
                            <div
                                className={`toggle-switch ${
                                    formik.values.is_active ? "active" : ""
                                } ${isView ? "disabled" : ""}`}
                                onClick={() =>
                                    !isView &&
                                    formik.setFieldValue(
                                        "is_active",
                                        !formik.values.is_active
                                    )
                                }
                                style={{
                                    opacity: isView ? 0.5 : 1,
                                    cursor: isView
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                            >
                                <div className="toggle-track">
                                    <div className="toggle-knob" />
                                </div>
                                <span className="toggle-label">
                                    {formik.values.is_active
                                        ? "Active (bookable)"
                                        : "Inactive (hidden)"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Drawer>
    );
}