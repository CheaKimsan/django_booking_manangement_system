import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoAddRegular, VideoClipRegular, VideoRegular } from "@fluentui/react-icons";
import { Movie, MOVIE_GENRES, MOVIE_LANGUAGES } from "../../core/model";
import { createMovie, updateMovie } from "../../core/movieService";

// ─── Validation
function buildSchema() {
    return Yup.object({
        title: Yup.string().required("Title is required"),
        genre: Yup.string().required("Genre is required"),
        language: Yup.string().required("Language is required"),
        duration_min: Yup.number()
            .typeError("Must be a number")
            .positive("Must be positive")
            .integer("Whole minutes only")
            .required("Duration is required"),
        description: Yup.string().nullable(),
        release_date: Yup.string().nullable(),
        is_active: Yup.boolean(),
    });
}

// ─── Types
export type CreateMoviePageProps = {
    open: boolean;
    mode: "create" | "edit" | "view";
    movie: Movie | null;
    onClose: () => void;
    onSave?: () => void;
};

// ─── Component
export default function CreateMoviePage({ open, mode, movie, onClose, onSave }: CreateMoviePageProps) {
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";
    const queryClient = useQueryClient();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const titleIcon = isCreate ? (
        <VideoAddRegular fontSize={20} />
    ) : isEdit ? (
        <VideoClipRegular fontSize={20} />
    ) : (
        <VideoRegular fontSize={20} />
    );
    const titleText = isCreate ? "Add Movie" : isEdit ? "Edit Movie" : "Movie Detail";

    const createMutation = useMutation({
        mutationFn: createMovie,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies"] });
            onSave?.();
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: FormData) => updateMovie(movie!.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies"] });
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
            title: movie?.title ?? "",
            description: movie?.description ?? "",
            genre: movie?.genre ?? "",
            language: movie?.language ?? "",
            duration_min: movie?.duration_min ?? ("" as any),
            release_date: movie?.release_date ?? "",
            is_active: movie?.is_active ?? true,
        },
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("title", values.title.trim());
            formData.append("description", values.description?.trim() ?? "");
            formData.append("genre", values.genre.trim());
            formData.append("language", values.language.trim());
            formData.append("duration_min", String(values.duration_min));
            if (values.release_date) formData.append("release_date", values.release_date);
            formData.append("is_active", String(values.is_active));
            if (posterFile) formData.append("poster", posterFile);

            if (isCreate) {
                await createMutation.mutateAsync(formData);
            } else if (isEdit && movie) {
                await updateMutation.mutateAsync(formData);
            }
        },
    });

    useEffect(() => {
        if (open) {
            formik.resetForm();
            setPosterFile(null);
            setPreview(movie?.poster ?? null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, movie]);

    const handlePosterSelect = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
        setPosterFile(file);
    };

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

                    <form id="movie-form" onSubmit={formik.handleSubmit} className="d-grid gap-4">

                        {/* Section: Poster */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div
                                onClick={() => !isView && fileInputRef.current?.click()}
                                style={{
                                    width: 400, height: 250, borderRadius: 8,
                                    border: "1px dashed var(--border)",
                                    background: "var(--surface-2, #1e293b)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", cursor: isView ? "default" : "pointer",
                                }}
                            >
                                {preview ? (
                                    <img src={preview} alt="poster" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", padding: 8 }}>
                                        No poster
                                    </span>
                                )}
                            </div>
                            {!isView && (
                                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Click to upload poster</span>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handlePosterSelect(f);
                                }}
                            />
                        </div>

                        {/* Section: Movie Info */}
                        <div>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isView}
                                    placeholder="Inception"
                                />
                                {err("title") && <span className="form-error">{err("title")}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    name="description"
                                    rows={3}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    disabled={isView}
                                    placeholder="Short synopsis..."
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Genre</label>
                                        <select
                                            className="form-select"
                                            name="genre"
                                            value={formik.values.genre}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                        >
                                            <option value="">Select genre...</option>
                                            {MOVIE_GENRES.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                        {err("genre") && <span className="form-error">{err("genre")}</span>}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Language</label>
                                        <select
                                            className="form-select"
                                            name="language"
                                            value={formik.values.language}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                        >
                                            <option value="">Select language...</option>
                                            {MOVIE_LANGUAGES.map((l) => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
                                        {err("language") && <span className="form-error">{err("language")}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="duration_min"
                                            value={formik.values.duration_min}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isView}
                                            placeholder="148"
                                        />
                                        {err("duration_min") && <span className="form-error">{err("duration_min")}</span>}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label className="form-label">Release Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            name="release_date"
                                            value={formik.values.release_date ?? ""}
                                            onChange={formik.handleChange}
                                            disabled={isView}
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Status */}
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
                                        {formik.values.is_active ? "Active (shown to customers)" : "Inactive (hidden)"}
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
                        <button type="submit" form="movie-form" className="btn-save" disabled={saving}>
                            {saving ? "Saving..." : isCreate ? "Add Movie" : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}