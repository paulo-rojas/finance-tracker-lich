package com.projects.finance_tracker.dtos;

public record CategoryResponse(
        Long id,
        Long parentCategoryId,
        Long transactionTypeId,
        String transactionTypeCode,
        String name,
        String description,
        Boolean isActive
) {
}
