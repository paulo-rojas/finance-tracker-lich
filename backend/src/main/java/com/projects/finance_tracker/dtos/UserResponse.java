package com.projects.finance_tracker.dtos;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        LocalDateTime createdAt
) {
}
