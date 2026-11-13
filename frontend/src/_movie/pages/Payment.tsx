import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
    ArrowLeftRegular,
    ClockRegular,
    CopyRegular,
    CheckmarkCircleRegular,
    MoneyRegular,
    LocationRegular,
    CalendarLtrRegular,
    ArrowSyncRegular,
    OpenRegular,
    ArrowClockwiseRegular,
} from "@fluentui/react-icons";

import { getBooking } from "../../app/modules/booking/core/bookingService";
import { startPayment, getPaymentStatus } from "../../app/modules/booking/core/bookingService";
import type { Booking } from "../../app/modules/booking/core/model";

// ─── Helpers ───────────────────────────────────────────────────────
const fmtPrice = (p: string | number) => {
    const n = typeof p === "string" ? parseFloat(p) : p;
    return `$${n.toFixed(2)}`;
};

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

// ─── Countdown hook ────────────────────────────────────────────────
function useCountdown(targetIso: string | null | undefined) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    if (!targetIso) return null;
    const diff = new Date(targetIso).getTime() - now;

    if (diff <= 0) {
        return { minutes: 0, seconds: 0, expired: true };
    }
    return {
        minutes: Math.floor(diff / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
        expired: false,
    };
}

// ─── Component ─────────────────────────────────────────────────────
export default function PaymentPage() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const id = Number(bookingId);

    const [copied, setCopied] = useState(false);

    // ── Fetch the booking (for header display) ──────────────────
    const {
        data: booking,
        isLoading: loadingBooking,
    } = useQuery<Booking>({
        queryKey: ["booking", id],
        queryFn: () => getBooking(id),
        enabled: !!id,
    });

    // ── Start payment session (creates QR if not existing) ─────
    const payMutation = useMutation({
        mutationFn: () => startPayment(id),
        onError: () => {
            // Stay on page — status query below will keep checking
        },
    });

    useEffect(() => {
        if (booking?.status === "PENDING" && !payMutation.data) {
            payMutation.mutate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking?.status, id]);

    // ── Poll payment status ────────────────────────────────────
    const { data: statusData } = useQuery({
        queryKey: ["payment-status", id],
        queryFn: () => getPaymentStatus(id),
        enabled: !!id,
        refetchInterval: (q) => {
            const data = q.state.data;
            if (!data) return 3000;
            if (data.status === "PENDING" && data.payment_status === "PENDING") {
                return 3000; // keep polling
            }
            return false; // stop once status changes
        },
    });

    // ── Redirect to success when CONFIRMED ────────────────────
    useEffect(() => {
        if (
            statusData?.status === "CONFIRMED" &&
            statusData.booking_code
        ) {
            navigate(`/booking/success/${statusData.booking_code}`, {
                replace: true,
            });
        }
    }, [statusData, navigate]);

    // ── Countdown ──────────────────────────────────────────────
    const expiresAt =
        payMutation.data?.expires_at ?? booking?.expires_at ?? null;
    const countdown = useCountdown(expiresAt);

    // ── Payment failure state ──────────────────────────────────
    const paymentFailed = statusData?.payment_status === "FAILED";
    const bookingExpired =
        statusData?.status === "EXPIRED" ||
        statusData?.status === "CANCELLED" ||
        countdown?.expired;

    // ── Copy handler ───────────────────────────────────────────
    const reference = payMutation.data
        ? `BK${id}-${payMutation.data.payment_id}`
        : "";

    const handleCopy = () => {
        if (!reference) return;
        navigator.clipboard.writeText(reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Retry payment ──────────────────────────────────────────
    const handleRetry = () => {
        payMutation.reset();
        payMutation.mutate();
    };

    // ── Loading ────────────────────────────────────────────────
    if (loadingBooking || !booking) {
        return (
            <div className="pay-page">
                <div className="hp-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading payment...</span>
                </div>
            </div>
        );
    }

    const movie = booking.showtime_detail?.movie_detail;
    const screen = booking.showtime_detail?.screen_detail;

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="pay-page">
            <button className="sd-back" onClick={() => navigate(-1)}>
                <ArrowLeftRegular fontSize={14} />
                Back
            </button>

            <header className="pay-hero">
                <div className="pay-badge">
                    <MoneyRegular fontSize={13} />
                    Payment
                </div>
                <h1 className="pay-title">Complete your booking</h1>
                <p className="pay-sub">
                    Scan the QR code with any Bakong-enabled app to pay.
                </p>
            </header>

            <div className="pay-grid">
                {/* ═══ Left: QR card ═══ */}
                <section className="pay-qr-card">
                    <div className="pay-qr-wrap">
                        {bookingExpired ? (
                            <div className="pay-qr-state">
                                <div className="pay-qr-state-icon">⏰</div>
                                <div className="pay-qr-state-title">
                                    Reservation expired
                                </div>
                                <div className="pay-qr-state-sub">
                                    Your seats have been released.
                                </div>
                            </div>
                        ) : paymentFailed ? (
                            <div className="pay-qr-state">
                                <div className="pay-qr-state-icon">⚠️</div>
                                <div className="pay-qr-state-title">
                                    Payment failed
                                </div>
                                <div className="pay-qr-state-sub">
                                    Try again with a different method.
                                </div>
                            </div>
                        ) : payMutation.isPending ? (
                            <div className="db-loading-spinner" />
                        ) : payMutation.isError ? (
                            <div className="pay-qr-state">
                                <div className="pay-qr-state-icon">❌</div>
                                <div className="pay-qr-state-title">
                                    Could not load QR
                                </div>
                                <div className="pay-qr-state-sub">
                                    Tap retry to try again.
                                </div>
                            </div>
                        ) : payMutation.data?.qr_data ? (
                            <QRCodeSVG
                                value={payMutation.data.qr_data}
                                size={240}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#0a0a0a"
                                includeMargin
                            />
                        ) : (
                            <div className="pay-qr-state">
                                <div className="pay-qr-state-icon">📱</div>
                                <div className="pay-qr-state-title">
                                    Preparing payment
                                </div>
                            </div>
                        )}
                    </div>

                    {!bookingExpired && !paymentFailed && payMutation.data && (
                        <>
                            <div className="pay-amount">
                                <span className="pay-amount-label">
                                    Amount to pay
                                </span>
                                <span className="pay-amount-value">
                                    {fmtPrice(payMutation.data.amount)}
                                </span>
                            </div>

                            <div className="pay-ref">
                                <span className="pay-ref-label">
                                    Reference
                                </span>
                                <div className="pay-ref-row">
                                    <span className="pay-ref-value">
                                        {reference}
                                    </span>
                                    <button
                                        className="pay-copy-btn"
                                        onClick={handleCopy}
                                    >
                                        {copied ? (
                                            <CheckmarkCircleRegular fontSize={14} />
                                        ) : (
                                            <CopyRegular fontSize={14} />
                                        )}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            {countdown && !countdown.expired && (
                                <div className="pay-timer">
                                    <ClockRegular fontSize={14} />
                                    <span>
                                        Expires in{" "}
                                        <strong>
                                            {String(countdown.minutes).padStart(2, "0")}:
                                            {String(countdown.seconds).padStart(2, "0")}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            {payMutation.data.checkout_url && (
                                <a
                                    className="pay-open-btn"
                                    href={payMutation.data.checkout_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <OpenRegular fontSize={14} />
                                    Open checkout in new tab
                                </a>
                            )}
                        </>
                    )}

                    {/* Retry button on failure */}
                    {(paymentFailed || payMutation.isError) && (
                        <button
                            className="pay-retry-btn"
                            onClick={handleRetry}
                        >
                            <ArrowClockwiseRegular fontSize={14} />
                            Retry payment
                        </button>
                    )}
                </section>

                {/* ═══ Right: Booking summary ═══ */}
                <section className="pay-summary">
                    <div className="pay-summary-head">
                        <h2 className="pay-summary-title">Your booking</h2>
                        <span
                            className={`badge-soft ${
                                statusData?.status === "CONFIRMED"
                                    ? "success"
                                    : paymentFailed
                                    ? "danger"
                                    : bookingExpired
                                    ? "danger"
                                    : "warning"
                            }`}
                        >
                            <ArrowSyncRegular
                                fontSize={11}
                                style={{ marginRight: 4 }}
                            />
                            {statusData?.status === "CONFIRMED"
                                ? "Confirmed"
                                : paymentFailed
                                ? "Failed"
                                : bookingExpired
                                ? "Expired"
                                : "Waiting for payment"}
                        </span>
                    </div>

                    {/* Movie */}
                    <div className="pay-movie">
                        {movie?.poster && (
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="pay-movie-poster"
                            />
                        )}
                        <div className="pay-movie-info">
                            <div className="pay-movie-title">
                                {movie?.title}
                            </div>
                            <div className="pay-movie-meta">
                                {movie?.genre} · {movie?.language} ·{" "}
                                {movie?.duration_min}m
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="pay-details">
                        <div className="pay-detail-row">
                            <LocationRegular fontSize={14} />
                            <span>
                                {screen?.theater_name} · {screen?.name}
                            </span>
                        </div>
                        <div className="pay-detail-row">
                            <CalendarLtrRegular fontSize={14} />
                            <span>
                                {fmtDateTime(
                                    booking.showtime_detail?.start_time
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="pay-seats">
                        <div className="pay-seats-label">Seats</div>
                        <div className="pay-seats-chips">
                            {booking.seats.map((s) => (
                                <span key={s.id} className="ss-seat-chip">
                                    {s.seat_detail.row}
                                    {s.seat_detail.number}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pay-total-row">
                        <span className="pay-total-label">Total</span>
                        <span className="pay-total-value">
                            {fmtPrice(booking.total_price)}
                        </span>
                    </div>

                    {/* Info note */}
                    <div className="pay-note">
                        <div className="pay-note-icon">ℹ️</div>
                        <div>
                            Don't close this page. It will refresh automatically
                            once your payment is confirmed.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}