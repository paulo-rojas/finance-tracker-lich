package com.projects.finance_tracker.dtos;

import java.math.BigDecimal;

public record AccountResponse(
        Long id,
        Long userId,
        Long accountTypeId,
        String accountTypeName,
        Long currencyId,
        String currencyCode,
        String name,
        String description,
        BigDecimal initialBalance,
        BigDecimal currentBalance,
        Boolean isActive
) {
}
