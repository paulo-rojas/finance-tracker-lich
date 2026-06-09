package com.projects.finance_tracker.dtos;

public record AccountUpdateRequest(
        Long accountTypeId,
        String name,
        String description,
        Boolean isActive
) {
}
