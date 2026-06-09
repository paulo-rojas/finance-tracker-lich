package com.projects.finance_tracker.dtos;

public record ContactResponse(
        Long id,
        Long userId,
        Long contactTypeId,
        String contactTypeName,
        String name,
        String phone,
        String email,
        String notes,
        Boolean isActive
) {
}
