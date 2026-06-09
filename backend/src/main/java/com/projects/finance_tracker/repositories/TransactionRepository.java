package com.projects.finance_tracker.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.projects.finance_tracker.entities.TransactionEntity;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    List<TransactionEntity> findByUserIdAndDeletedAtIsNullOrderByTransactionDateDescIdDesc(Long userId);

    List<TransactionEntity> findByDeletedAtIsNullOrderByTransactionDateDescIdDesc();

    @Query("""
            select t
            from TransactionEntity t
            where t.deletedAt is null
              and (:userId is null or t.user.id = :userId)
              and (:accountId is null or t.sourceAccount.id = :accountId or t.destinationAccount.id = :accountId)
              and (:transactionTypeCode is null or t.transactionType.code = :transactionTypeCode)
            order by t.transactionDate desc, t.id desc
            """)
    List<TransactionEntity> findByFilters(
            @Param("userId") Long userId,
            @Param("accountId") Long accountId,
            @Param("transactionTypeCode") String transactionTypeCode
    );
}
