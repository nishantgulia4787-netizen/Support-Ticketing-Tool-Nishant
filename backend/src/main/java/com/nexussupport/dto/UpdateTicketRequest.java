package com.nexussupport.dto;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
public record UpdateTicketRequest(@NotNull TicketStatus status, Priority priority) {}
