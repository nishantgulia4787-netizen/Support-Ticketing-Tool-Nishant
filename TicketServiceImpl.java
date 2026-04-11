package com.nexussupport.service.impl;

import com.nexussupport.domain.entity.Ticket;
import com.nexussupport.domain.entity.User;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.dto.CreateTicketRequest;
import com.nexussupport.dto.TicketDto;
import com.nexussupport.dto.TicketStatsDto;
import com.nexussupport.dto.UpdateTicketRequest;
import com.nexussupport.exception.TicketNotFoundException;
import com.nexussupport.exception.UserNotFoundException;
import com.nexussupport.repository.TicketRepository;
import com.nexussupport.repository.UserRepository;
import com.nexussupport.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Concrete implementation of {@link TicketService}.
 *
 * Responsibilities:
 *  - Ticket ID generation (T-001 … T-999+)
 *  - Delegation of state transitions to the domain aggregate
 *  - Stats aggregation via repository count queries
 *
 * @Transactional boundaries ensure no partial writes escape
 * the service layer; readOnly hints optimise Hibernate's flush
 * mode for query-only operations.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository   userRepository;

    // ── Create ───────────────────────────────────────────────

    @Override
    @Transactional
    public TicketDto createTicket(final CreateTicketRequest request) {
        final User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new UserNotFoundException(request.userId()));

        final String ticketId = generateNextTicketId();
        final Ticket ticket   = new Ticket(ticketId, user,
                                           request.issueDescription(),
                                           request.priority());

        final Ticket saved = ticketRepository.save(ticket);
        log.info("Created ticket: id={}, user={}, priority={}",
                saved.getTicketId(), user.getName(), saved.getPriority());
        return TicketDto.from(saved);
    }

    // ── Read ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TicketDto> getTickets(final TicketStatus status, final Priority priority) {
        return ticketRepository.findAllWithFilters(status, priority)
                .stream()
                .map(TicketDto::from)
                .toList();
    }

    // ── Update (State Machine) ────────────────────────────────

    @Override
    @Transactional
    public TicketDto updateTicket(final String ticketId, final UpdateTicketRequest request) {
        final Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        // Domain aggregate enforces valid transition; throws on violation
        ticket.advanceStatus(request.status());

        if (request.priority() != null) {
            ticket.updatePriority(request.priority());
        }

        final Ticket updated = ticketRepository.save(ticket);
        log.info("Updated ticket: id={}, newStatus={}", ticketId, updated.getStatus());
        return TicketDto.from(updated);
    }

    // ── Stats ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TicketStatsDto getStats() {
        final long total      = ticketRepository.count();
        final long open       = ticketRepository.countByStatus(TicketStatus.OPEN);
        final long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        final long closed     = ticketRepository.countByStatus(TicketStatus.CLOSED);
        return new TicketStatsDto(total, open, inProgress, closed);
    }

    // ── Private helpers ───────────────────────────────────────

    /**
     * Generates the next T-XXX ID in a thread-safe manner
     * by reading the current maximum suffix from the database.
     * In a high-concurrency environment, a dedicated sequence
     * table (as in schema.sql) or a database sequence is preferred.
     */
    private String generateNextTicketId() {
        final int next = ticketRepository.findMaxTicketSequence() + 1;
        return String.format("T-%03d", next);
    }
}
