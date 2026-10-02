import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VideoAddRegular, VideoClipRegular, VideoRegular } from "@fluentui/react-icons";
import { Showtime, ShowtimePayload } from "../../core/model"; // Adjust path
import { Movie } from "../../../movies/core/model"; // Adjust path to your Movie model
import { Screen } from "../../../cinema/core/model"; // Adjust path to your Screen model
import { useCreateShowtime, useUpdateShowtime } from "../../core/showtimeService"; // Adjust path

// ─── Validation
function buildSchema() {
    return Yup.object({
        movie: Yup.number()
            .typeError("Movie is required")
            .required("Movie is required"),
        screen: Yup.number()
            .typeError("Screen is required")
            .required("Screen is required"),
        start_time: Yup.string()
            .required("Start time is required"),
        price: Yup.number()
            .typeError("Must be a number")
            .positive("Must be positive")
            .required("Price is required"),
        is_active: Yup.boolean(),
    });
}

// ─── Types
export type CreateShowtimePageProps = {
    open: boolean;
    mode: "create" | "edit" | "view";
    showtime: Showtime | null;
    movies: Movie[];
    screens: Screen[]; // <-- Changed from ShowtimeScreen[] to Screen[]
    onClose: () => void;
    onSave?: () => void;
};

// ─── Component
export default function CreateShowtimePage({
    open, mode, showtime, movies, screens, onClose, onSave
}: CreateShowtimePageProps) {
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";

    const createMutation = useCreateShowtime();
    const updateMutation = useUpdateShowtime();

    const titleIcon = isCreate ? (
        <VideoAddRegular fontSize={20} />
    ) : isEdit ? (
        <VideoClipRegular fontSize={20} />
    ) : (
        <VideoRegular fontSize={20} />
    );
    const titleText = isCreate ? "Add Showtime" : isEdit ? "Edit Showtime" : "Showtime Detail";

    const saving = createMutation.isPending || updateMutation.isPending;
    const apiError =
        (createMutation.error as any)?.response?.data ||
        (updateMutation.error as any)?.response?.data;

    // Helper to format ISO string for datetime-local input
    const toLocalInputValue = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    const formik = useFormik({
        enableReinitialize: true,
        validationSchema: buildSchema(),
        validateOnBlur: true,
        validateOnChange: false,
        initialValues: {
            movie: showtime?.movie ?? ("" as any),
            screen: showtime?.screen ?? ("" as any),
            start_time: toLocalInputValue(showtime?.start_time),
            price: showtime?.price ? parseFloat(showtime.price) : ("" as any),
            is_active: showtime?.is_active ?? true,
        },
        onSubmit: async (values) => {
            const payload: ShowtimePayload = {
                movie: Number(values.movie),
                screen: Number(values.screen),
                start_time: new Date(values.start_time).toISOString(),
                price: Number(values.price),
                is_active: values.is_active,
            };

            if (isCreate) {
                await createMutation.mutateAsync(payload);
            } else if (isEdit && showtime) {
                await updateMutation.mutateAsync({ id: showtime.id, payload });
            }
            onSave?.();
            onClose();
        },
    });

    useEffect(() => {
        if (open) {
            formik.resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, showtime]);

    const err = (f: keyof typeof formik.errors) =>
        formik.touched[f] ? (formik.errors[f] as string | undefined) : undefined;

    const renderApiError = () => {
        if (!apiError) return null;
        if (typeof apiError === "string") return apiError;
        if (apiError.non_field_errors) return apiError.non_field_errors.join(", ");
        return Object.entries(apiError).map(([key, val]) => (
            <div key={key}><strong>{key}:</strong> {(val as string[]).join(", ")}</div>
        ));
    };

    if (!open) return null;

    return (
        <>
            <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={onClose} />

            <div className={`drawer-panel ${open ? "open" : ""}`}>
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

                <div className="drawer-body">
                    {apiError && (
                        <div className="error-box mb-4">
                            {renderApiError()}
                        </div>
                    )}

                    <form id="showtime-form" onSubmit={formik.handleSubmit} className="d-grid gap-4">
                        <div>
                            <div className="form-group">
                                <label className="form-label">Movie</label>
                                <select
                                    className="form-select"
                                    name="movie"
                                    value={formik.values.movie}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isView}
                                >
                                    <option value="">Select movie...</option>
                                    {movies.map((m) => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                                {err("movie") && <span className="form-error">{err("movie")}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Screen</label>
                                <select
                                    className="form-select"
                                    name="screen"
                                    value={formik.values.screen}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isView}
                                >
                                    <option value="">Select screen...</option>
                                    {screens.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {/* Show theater info if available, otherwise just the screen name */}
                                            {s.name
                                                ? `${s.name} — ${s.name}`
                                                : s.name}
                                        </option>
                                    ))}
                                </select>
                                {err("screen") && <span className="form-error">{err("screen")}</span>}
                            </div>
                        </div>

                        <div>
                            <div className="row g-3">
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            name="start_time"
                                            value={formik.values.start_time}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                            style={{ colorScheme: "dark" }}
                                        />
                                        {err("start_time") && <span className="form-error">{err("start_time")}</span>}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            name="price"
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                            placeholder="12.50"
                                        />
                                        {err("price") && <span className="form-error">{err("price")}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                            <div className="form-group">
                                <div
                                    className={`toggle-switch ${formik.values.is_active ? "active" : ""} ${isView ? "disabled" : ""}`}
                                    onClick={() => !isView && formik.setFieldValue("is_active", !formik.values.is_active)}
                                    style={{ opacity: isView ? 0.5 : 1, cursor: isView ? "not-allowed" : "pointer" }}
                                >
                                    <div className="toggle-track">
                                        <div className="toggle-knob" />
                                    </div>
                                    <span className="toggle-label">
                                        {formik.values.is_active ? "Active (bookable)" : "Inactive (hidden)"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {!isView && (
                    <div className="drawer-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" form="showtime-form" className="btn-save" disabled={saving}>
                            {saving ? "Saving..." : isCreate ? "Add Showtime" : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}