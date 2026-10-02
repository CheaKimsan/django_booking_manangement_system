import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMoviesStore } from "../core/store";
import { deleteMovie, getMovies, updateMovie } from "../core/movieService";
import { columns } from "./table/Column";
import MainTable from "../../../_shared/MainTable";
import CreateMoviePage from "./form/CreateMoviePage";
import { VideoAddRegular } from "@fluentui/react-icons";

const MoviePage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openEdit, openView, drawer, closeDrawer, openCreate,
    } = useMoviesStore();
    const queryClient = useQueryClient();

    const { data: movies, isLoading } = useQuery({
        queryKey: ["movies", search],
        queryFn: () => getMovies(search),
    });

    const filteredMovies = useMemo(() => {
        if (!movies) return [];
        if (statusFilter === "all") return movies;
        return movies.filter((m) =>
            statusFilter === "active" ? m.is_active : !m.is_active
        );
    }, [movies, statusFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteMovie(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies"] }),
    });

    // onToggleActive reuses updateMovie, but that expects FormData —
    // build a minimal one here since we're only flipping one field.
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, active }: { id: number; active: boolean }) => {
            const formData = new FormData();
            formData.append("is_active", String(active));
            return updateMovie(id, formData);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies"] }),
    });

    const cols = columns({
        onEdit: openEdit,
        onDelete: (id) => deleteMutation.mutateAsync(id).then(() => {
        }),
        onToggleActive: (id, active) => toggleActiveMutation.mutateAsync({ id, active }).then(() => {
        }),
    });

    return (
        <div className="dash-content">
            {/* Search Bar + Filter + Add Movie button */}
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
                            placeholder="Search movies..."
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
                    <VideoAddRegular fontSize={18} />
                    Add Movie
                </button>
            </div>

            <MainTable
                columns={cols}
                rows={filteredMovies}
                rowKey={(m) => m.id}
                loading={isLoading}
                onRowClick={(m) => openView(m)}
            />

            <CreateMoviePage
                open={drawer.open}
                mode={drawer.mode}
                movie={drawer.movie}
                onClose={closeDrawer}
            />
        </div>
    );
};

export default MoviePage;