package com.nexussupport.controller;

import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.dto.CreateTicketRequest;
import com.nexussupport.dto.TicketDto;
import com.nexussupport.dto.TicketStatsDto;
import com.nexussupport.dto.UpdateTicketRequest;
import com.nexussupport.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for ticket lifecycle management.
 *
 * Endpoints:
 *   GET  /api/tickets/stats          → aggregated metrics
 *   GET  /api/tickets                → list with optional filters
 *   POST /api/tickets                → create new ticket
 *   PUT  /api/tickets/{id}           → advance state / update priority
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // ── Stats ─────────────────────────────────────────────────

    /**
     * GET /api/tickets/stats
     * Returns counts: total, open, inProgress, closed.
     * MUST be mapped before /{id} to avoid "stats" being treated as an ID.
     */
    @GetMapping("/stats")
    public ResponseEntity<TicketStatsDto> getStats() {
        return ResponseEntity.ok(ticketService.getStats());
    }

    // ── List ──────────────────────────────────────────────────

    /**
     * GET /api/tickets?status=OPEN&priority=HIGH
     * Both query params are optional; omitting either disables that filter.
     */
    @GetMapping
    public ResponseEntity<List<TicketDto>> getTickets(
            @RequestParam(required = false) final TicketStatus status,
            @RequestParam(required = false) final Priority priority) {
        return ResponseEntity.ok(ticketService.getTickets(status, priority));
    }

    // ── Create ────────────────────────────────────────────────

    /**
     * POST /api/tickets
     * Body: { "userId": 1, "issueDescription": "...", "priority": "HIGH" }
     */
    @PostMapping
    public ResponseEntity<TicketDto> createTicket(
            @Valid @RequestBody final CreateTicketRequest request) {
        final TicketDto created = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── Update ────────────────────────────────────────────────

    /**
     * PUT /api/tickets/{id}
     * Body: { "status": "IN_PROGRESS", "priority": "CRITICAL" }
     * Priority field is optional in the request body.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> updateTicket(
            @PathVariable final String id,
            @Valid @RequestBody final UpdateTicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }
}
