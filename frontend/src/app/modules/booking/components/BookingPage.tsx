import {useMemo} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useAdminBookingStore} from "../core/store";
import MainTable from "../../../_shared/MainTable";
import {
    getBookings,
    confirmBooking,
    cancelBooking,
    deleteBooking,
} from "../core/bookingService";
import {columns} from "./table/Column";
import BookingDetailDrawer from "./table/BookingDetailDrawer";

const BookingPage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openView, drawer, closeDrawer,
    } = useAdminBookingStore();
    const queryClient = useQueryClient();

    const {data: bookings = [], isLoading} = useQuery({
        queryKey: ["bookings", search, statusFilter],
        queryFn: () =>
            getBookings({
                search: search || undefined,
                status: statusFilter === "all" ? undefined : statusFilter,
            }),
    });


    // ── Mutations ────────────────────────────────────────────────
    const confirmMutation = useMutation({
        mutationFn: (id: number) => confirmBooking(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["bookings"]}),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => cancelBooking(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["bookings"]}),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBooking(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["bookings"]}),
    });

    // ── Shared handlers (used by both cell + drawer) ─────────────
    const handleConfirm = async (id: number) => {
        await confirmMutation.mutateAsync(id);
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Cancel this booking?")) return;
        await cancelMutation.mutateAsync(id);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this booking permanently?")) return;
        await deleteMutation.mutateAsync(id);
    };

    const cols = columns({
        onView: openView,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        onDelete: handleDelete,
    });

    return (
        <div className="dash-content">
            {/* Header with search + filter */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="search-bar-dark">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by code, user, movie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{width: 180}}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            <MainTable
                columns={cols}
                rows={bookings}
                rowKey={(b) => b.id}
                loading={isLoading}
                onRowClick={(b) => openView(b)}
            />

            {/* ⬇ ADD THIS — Booking detail drawer */}
            <BookingDetailDrawer
                open={drawer.open}
                booking={drawer.booking}
                onClose={closeDrawer}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BookingPage;