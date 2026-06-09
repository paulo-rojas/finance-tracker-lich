package com.projects.finance_tracker.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long userId,
        String transactionTypeCode,
        Long categoryId,
        String categoryName,
        Long sourceAccountId,
        String sourceAccountName,
        Long destinationAccountId,
        String destinationAccountName,
        Long sourceContactId,
        String sourceContactName,
        Long destinationContactId,
        String destinationContactName,
        BigDecimal amount,
        Long currencyId,
        String currencyCode,
        LocalDate transactionDate,
        String description,
        String referenceCode,
        LocalDateTime createdAt
) {
}
