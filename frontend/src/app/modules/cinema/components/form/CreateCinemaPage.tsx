import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    BuildingRegular,
    BuildingMultipleRegular,
    InfoRegular,
} from "@fluentui/react-icons";
import { Theater, TheaterPayload } from "../../core/model";
import {
    createTheater,
    updateTheater,
} from "../../core/cinemaService";
import { getUsers } from "../../../users/core/userService";
import Drawer from "../../../../_shared/Drawer";

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

export type CreateCinemaPageProps = {
    open: boolean;
    mode: "create" | "edit" | "view";
    theater: Theater | null;
    onClose: () => void;
    onSave?: (newTheater?: Theater) => void;
};

export default function CreateCinemaPage({
    open,
    mode,
    theater,
    onClose,
    onSave,
}: CreateCinemaPageProps) {
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

    const { data: allUsers } = useQuery({
        queryKey: ["users", ""],
        queryFn: () => getUsers(""),
        enabled: open && !isView,
    });
    const managers = (allUsers ?? []).filter((u) => u.role === "THEATER_MANAGER");

    const createMutation = useMutation({
        mutationFn: createTheater,
        onSuccess: (newTheater: Theater) => {
            queryClient.invalidateQueries({ queryKey: ["theaters"] });
            onSave?.(newTheater);
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





    return (
        <Drawer
            open={open}
            title={titleText}
            icon={titleIcon}
            onClose={onClose}
            resetScrollKey={mode + "-" + (theater?.id ?? "new")}
            footer={
                !isView && (
                    <>
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" form="cinema-form" className="btn-save" disabled={saving}>
                            {saving ? "Saving..." : isCreate ? "Create & Add Screens" : "Save Changes"}
                        </button>
                    </>
                )
            }
        >
            {apiError && (
                <div className="error-box mb-4">
                    {typeof apiError === "string" ? apiError : JSON.stringify(apiError)}
                </div>
            )}

            <form id="cinema-form" onSubmit={formik.handleSubmit} className="d-grid gap-4">
                <div>
                    <div className="form-section-title">
                        <BuildingRegular fontSize={14} />
                        <span>Cinema Information</span>
                    </div>

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

                <div>
                    <div className="form-section-title">
                        <InfoRegular fontSize={14} />
                        <span>Management</span>
                    </div>

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
                                    {(m.first_name + " " + m.last_name).trim() || m.username}
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
                            className={"toggle-switch " + (formik.values.is_active ? "active" : "") + " " + (isView ? "disabled" : "")}
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

        </Drawer>
    );
}