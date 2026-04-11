package com.nexussupport.service.impl;

import com.nexussupport.domain.entity.Ticket;
import com.nexussupport.domain.entity.User;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.dto.*;
import com.nexussupport.exception.TicketNotFoundException;
import com.nexussupport.exception.UserNotFoundException;
import com.nexussupport.repository.TicketRepository;
import com.nexussupport.repository.UserRepository;
import com.nexussupport.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TicketDto createTicket(CreateTicketRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new UserNotFoundException(request.userId()));
        String ticketId = generateNextTicketId();
        Ticket saved = ticketRepository.save(
            new Ticket(ticketId, user, request.issueDescription(), request.priority()));
        return TicketDto.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDto> getTickets(TicketStatus status, Priority priority) {
        return ticketRepository.findAllWithFilters(status, priority)
            .stream().map(TicketDto::from).toList();
    }

    @Override
    @Transactional
    public TicketDto updateTicket(String ticketId, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException(ticketId));
        ticket.advanceStatus(request.status());
        if (request.priority() != null) ticket.updatePriority(request.priority());
        return TicketDto.from(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketStatsDto getStats() {
        return new TicketStatsDto(
            ticketRepository.count(),
            ticketRepository.countByStatus(TicketStatus.OPEN),
            ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
            ticketRepository.countByStatus(TicketStatus.CLOSED)
        );
    }

    private String generateNextTicketId() {
        return String.format("T-%03d", ticketRepository.findMaxTicketSequence() + 1);
    }
}
