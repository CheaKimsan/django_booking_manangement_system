import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {useShowtimeStore} from "../core/store";
import {
    useShowtimes,
    useDeleteShowtime,
    useUpdateShowtime
} from "../core/showtimeService";
import {columns} from "./table/Column";
import MainTable from "../../../_shared/MainTable";
import CreateShowtimePage from "../components/form/CreateShowtime";
import {VideoAddRegular} from "@fluentui/react-icons";
import {getMovies} from "../../movies/core/movieService";
import {getScreens} from "../../cinema/core/cinemaService";

const ShowtimePage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openEdit, openView, drawer, closeDrawer, openCreate,
    } = useShowtimeStore();

    const {data, isLoading} = useShowtimes();

    const showtimes = useMemo(() => {
        const items = data ?? [];

        return items.filter((showtime) => {
            if (statusFilter === "active") {
                return showtime.is_active === true;
            }

            if (statusFilter === "inactive") {
                return showtime.is_active === false;
            }

            return true;
        });
    }, [data, statusFilter]);

    const {data: movies} = useQuery({
        queryKey: ["movies"],
        queryFn: () => getMovies(),
    });

    const {data: screens} = useQuery({
        queryKey: ["screens"],
        queryFn: () => getScreens(),
    });

    const deleteMutation = useDeleteShowtime();

    const updateMutation = useUpdateShowtime();

    const cols = columns({
        onEdit: openEdit,
        onDelete: async (id) => {
            await deleteMutation.mutateAsync(id);
        },
        onToggleActive: async (id, active) => {
            await updateMutation.mutateAsync({
                id,
                payload: {is_active: active}
            });
        },
    });

    return (
        <div className="dash-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="search-bar-dark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search showtimes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{width: 160}}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
                    <VideoAddRegular fontSize={18}/>
                    Add Showtime
                </button>
            </div>

            <MainTable
                columns={cols}
                rows={showtimes}
                rowKey={(m) => m.id}
                loading={isLoading}
                onRowClick={(m) => openView(m)}
            />

            <CreateShowtimePage
                open={drawer.open}
                mode={drawer.mode}
                showtime={drawer.showtime}
                movies={movies ?? []}   // FIX: Pass fetched movies
                screens={screens ?? []} // FIX: Pass fetched screens
                onClose={closeDrawer}
            />
        </div>
    );
};

export default ShowtimePage;