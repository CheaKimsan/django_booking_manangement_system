import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useMemo} from "react";
import {useUsersStore} from "../core/store";
import {deleteUser, getUsers, updateUser} from "../core/userService";
import {columns} from "./table/Column";
import MainTable from "../../../_shared/MainTable";
import CreateUserPage from "./form/CreateUserPage";
import {PersonAddRegular} from "@fluentui/react-icons";

const UserPage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openEdit, openView, drawer, closeDrawer, openCreate,
    } = useUsersStore();
    const queryClient = useQueryClient();

    const {data: users, isLoading} = useQuery({
        queryKey: ["users", search],
        queryFn: () => getUsers(search),
    });

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (statusFilter === "all") return users;
        return users.filter((u) =>
            statusFilter === "active" ? u.is_active : !u.is_active
        );
    }, [users, statusFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    });
    
    const toggleActiveMutation = useMutation({
        mutationFn: ({id, active}: { id: number; active: boolean }) =>
            updateUser(id, {is_active: active}),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
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
            {/* Search Bar + Filter + Add User button */}
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
                            placeholder="Search users..."
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
                    <PersonAddRegular fontSize={18} />
                    Add User
                </button>
            </div>

            <MainTable
                columns={cols}
                rows={filteredUsers}
                rowKey={(u) => u.id}
                loading={isLoading}
                onRowClick={(u) => openView(u)}
            />

            <CreateUserPage
                open={drawer.open}
                mode={drawer.mode}
                user={drawer.user}
                onClose={closeDrawer}
            />
        </div>
    );
};

export default UserPage;