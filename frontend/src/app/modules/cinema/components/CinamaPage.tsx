import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useMemo} from "react";
import {useCinemaStore} from "../core/store";
import {deleteTheater, getTheaters, updateTheater} from "../core/cinemaService";
import {columns} from "./table/Column";
import MainTable from "../../../_shared/MainTable";
import CreateCinemaPage from "./form/CreateCinemaPage";
import { Building16Color } from "@fluentui/react-icons";

const CinemaPage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openEdit, openView, drawer, closeDrawer, openCreate,
    } = useCinemaStore();
    const queryClient = useQueryClient();

    const {data: theaters, isLoading} = useQuery({
        queryKey: ["theaters", search],
        queryFn: () => getTheaters(search),
    });

    const filteredTheaters = useMemo(() => {
        if (!theaters) return [];
        if (statusFilter === "all") return theaters;
        return theaters.filter((t) =>
            statusFilter === "active" ? t.is_active : !t.is_active
        );
    }, [theaters, statusFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTheater(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["theaters"]}),
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({id, active}: { id: number; active: boolean }) =>
            updateTheater(id, {is_active: active}),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["theaters"]}),
    });

    const cols = columns({
        onEdit: openEdit,
        onDelete: (id) => deleteMutation.mutateAsync(id).then(() => {
        }),
        onToggleActive: (id, active) => toggleActiveMutation.mutateAsync({id, active}).then(() => {
        }),
    });

    return (
        <div className="dash-content">
            {/* Search Bar + Filter + Add Cinema button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="search-bar-dark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search cinemas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
                    <Building16Color fontSize={18} />
                    Add Cinema
                </button>
            </div>

            <MainTable
                columns={cols}
                rows={filteredTheaters}
                rowKey={(t) => t.id}
                loading={isLoading}
                onRowClick={(t) => openView(t)}
            />

            <CreateCinemaPage
                open={drawer.open}
                mode={drawer.mode}
                theater={drawer.theater}
                onClose={closeDrawer}
            />
        </div>
    );
};

export default CinemaPage;