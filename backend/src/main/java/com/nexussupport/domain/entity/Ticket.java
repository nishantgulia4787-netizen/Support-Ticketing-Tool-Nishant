package com.nexussupport.domain.entity;

import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.exception.InvalidStateTransitionException;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
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

    public Ticket() {}

    public Ticket(String ticketId, User user, String issueDescription, Priority priority) {
        this.ticketId = ticketId;
        this.user = user;
        this.issueDescription = issueDescription;
        this.priority = priority;
        this.status = TicketStatus.OPEN;
    }

    @PrePersist
    private void onPrePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onPreUpdate() { this.updatedAt = LocalDateTime.now(); }

    public String getTicketId() { return ticketId; }
    public User getUser() { return user; }
    public String getIssueDescription() { return issueDescription; }
    public Priority getPriority() { return priority; }
    public TicketStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void advanceStatus(TicketStatus requested) {
        if (!isValidTransition(this.status, requested))
            throw new InvalidStateTransitionException(
                "Cannot transition ticket " + ticketId + " from " + this.status + " to " + requested);
        this.status = requested;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePriority(Priority newPriority) {
        this.priority = newPriority;
        this.updatedAt = LocalDateTime.now();
    }

    private static boolean isValidTransition(TicketStatus current, TicketStatus next) {
        return switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == TicketStatus.CLOSED;
            case CLOSED -> false;
        };
    }
}
