package com.projects.finance_tracker.dtos;

public record ContactUpdateRequest(
        Long contactTypeId,
        String name,
        String phone,
        String email,
        String notes,
        Boolean isActive
) {
}
