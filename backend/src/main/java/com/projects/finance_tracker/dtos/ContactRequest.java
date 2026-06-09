package com.projects.finance_tracker.dtos;

public record ContactRequest(
        Long userId,
        Long contactTypeId,
        String name,
        String phone,
        String email,
        String notes
) {
}
