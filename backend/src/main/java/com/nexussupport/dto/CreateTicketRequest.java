package com.nexussupport.dto;
import com.nexussupport.domain.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
public record CreateTicketRequest(@NotNull @Positive Long userId, @NotBlank String issueDescription, @NotNull Priority priority) {}
