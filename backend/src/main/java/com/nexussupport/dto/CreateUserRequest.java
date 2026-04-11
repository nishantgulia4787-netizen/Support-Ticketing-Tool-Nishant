package com.nexussupport.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record CreateUserRequest(@NotBlank(message = "Name must not be blank") @Size(min = 2, max = 120) String name) {}
