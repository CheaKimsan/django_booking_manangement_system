from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin)


class IsAdminOrManagerOrReadOnly(BasePermission):
    """For future Show/Theater endpoints."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user and user.is_authenticated
            and (user.is_admin or user.is_theater_manager)
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class TheaterPermission(BasePermission):
    """
    Read: anyone.
    Create/Delete: admin only.
    Update: admin, or the manager assigned to that theater.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if view.action in ('create', 'destroy'):
            return user.is_admin
        return user.is_admin or user.is_theater_manager

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_admin:
            return True
        if not user.is_theater_manager:
            return False

        if hasattr(obj, 'manager_id'):
            theater = obj
        elif hasattr(obj, 'theater_id'):
            theater = obj.theater
        else:
            theater = obj.screen.theater

        return theater.manager_id == user.id