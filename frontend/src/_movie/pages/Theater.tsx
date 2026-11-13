import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    LocationRegular,
    ArrowRightRegular,
    BuildingRegular,
    PhoneRegular,
} from "@fluentui/react-icons";
import { getTheaters } from "../../app/modules/cinema/core/cinemaService";
import type { Theater as TheaterType } from "../../app/modules/cinema/core/model";

// ─── Theater Card ──────────────────────────────────────────────────
const TheaterCard: React.FC<{ theater: TheaterType }> = ({ theater }) => {
    const navigate = useNavigate();

    const goToTheater = () => navigate(`/theaters/${theater.id}`);

    return (
        <div
            className="th-card"
            onClick={goToTheater}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goToTheater()}
        >
            <div className="th-card-head">
                <div className="th-card-icon">
                    <BuildingRegular fontSize={22} />
                </div>
                <div className="th-card-title-wrap">
                    <h3 className="th-card-title">{theater.name}</h3>
                    <div className="th-card-city">
                        <LocationRegular fontSize={12} />
                        <span>{theater.city}</span>
                    </div>
                </div>
            </div>

            <div className="th-card-body">
                <div className="th-card-row">
                    <LocationRegular fontSize={14} />
                    <span>{theater.address}</span>
                </div>

                {theater.phone_number && (
                    <div className="th-card-row">
                        <PhoneRegular fontSize={14} />
                        <span>{theater.phone_number}</span>
                    </div>
                )}
            </div>

            <div className="th-card-foot">
                <span
                    className={`badge-soft ${
                        theater.is_active ? "success" : "danger"
                    }`}
                >
                    {theater.is_active ? "Now Open" : "Closed"}
                </span>
                <span className="th-card-link">
                    View showtimes
                    <ArrowRightRegular fontSize={14} />
                </span>
            </div>
        </div>
    );
};

// ─── Theater Page ──────────────────────────────────────────────────
const Theater = () => {
    const {
        data: theaters = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["theaters"],
        queryFn: () => getTheaters(),
    });

    return (
        <div className="th-page">
            {/* ═══════════ HEADER ═══════════ */}
            <header className="th-hero">
                <span className="th-hero-badge">
                    <LocationRegular fontSize={13} />
                    Locations
                </span>
                <h1 className="th-hero-title">Our Theaters</h1>
                <p className="th-hero-sub">
                    Find a cinema near you and book your next movie experience.
                </p>
            </header>

            {/* ═══════════ LOADING ═══════════ */}
            {isLoading && (
                <div className="hp-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading theaters...</span>
                </div>
            )}

            {/* ═══════════ ERROR ═══════════ */}
            {isError && (
                <div className="hp-error">
                    Couldn't load theaters. Try refreshing the page.
                </div>
            )}

            {/* ═══════════ EMPTY ═══════════ */}
            {!isLoading && !isError && theaters.length === 0 && (
                <div className="hp-empty">No theaters available yet.</div>
            )}

            {/* ═══════════ GRID ═══════════ */}
            {!isLoading && !isError && theaters.length > 0 && (
                <div className="th-grid">
                    {theaters.map((t: TheaterType) => (
                        <TheaterCard key={t.id} theater={t} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Theater;