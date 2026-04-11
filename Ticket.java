package com.nexussupport.domain.entity;

import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.exception.InvalidStateTransitionException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Core domain aggregate for a support ticket.
 *
 * State machine logic is embedded here to honour the Single
 * Responsibility Principle at the aggregate root level:
 *   OPEN → IN_PROGRESS → CLOSED   (no reversals)
 */
@Entity
@Table(name = "tickets")
@Getter
@NoArgsConstructor
public class Ticket {

    @Id
    @Column(name = "ticket_id", length = 10)
    private String ticketId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ── Factory constructor ──────────────────────────────────

    public Ticket(final String ticketId,
                  final User user,
                  final String issueDescription,
                  final Priority priority) {
        this.ticketId         = ticketId;
        this.user             = user;
        this.issueDescription = issueDescription;
        this.priority         = priority;
        this.status           = TicketStatus.OPEN;
    }

    @PrePersist
    private void onPrePersist() {
        final LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Domain methods ───────────────────────────────────────

    /**
     * Advances the ticket through its lifecycle.
     * Throws {@link InvalidStateTransitionException} for illegal transitions.
     */
    public void advanceStatus(final TicketStatus requested) {
        if (!isValidTransition(this.status, requested)) {
            throw new InvalidStateTransitionException(
                String.format("Cannot transition ticket %s from %s to %s.",
                    ticketId, this.status, requested));
        }
        this.status    = requested;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePriority(final Priority newPriority) {
        this.priority  = newPriority;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Private helpers ──────────────────────────────────────

    private static boolean isValidTransition(final TicketStatus current,
                                              final TicketStatus next) {
        return switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == TicketStatus.CLOSED;
            case CLOSED      -> false;   // terminal state
        };
    }
}
