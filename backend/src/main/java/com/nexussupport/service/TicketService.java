package com.nexussupport.service;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.dto.*;
import java.util.List;
public interface TicketService {
    TicketDto createTicket(CreateTicketRequest request);
    List<TicketDto> getTickets(TicketStatus status, Priority priority);
    TicketDto updateTicket(String ticketId, UpdateTicketRequest request);
    TicketStatsDto getStats();
}
