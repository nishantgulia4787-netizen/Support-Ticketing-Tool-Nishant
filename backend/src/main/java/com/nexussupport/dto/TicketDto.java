package com.nexussupport.dto;
import com.nexussupport.domain.entity.Ticket;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import java.time.LocalDateTime;
public record TicketDto(String ticketId, Long userId, String userName, String issueDescription, Priority priority, TicketStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static TicketDto from(Ticket ticket) {
        return new TicketDto(ticket.getTicketId(), ticket.getUser().getUserId(), ticket.getUser().getName(), ticket.getIssueDescription(), ticket.getPriority(), ticket.getStatus(), ticket.getCreatedAt(), ticket.getUpdatedAt());
    }
}
