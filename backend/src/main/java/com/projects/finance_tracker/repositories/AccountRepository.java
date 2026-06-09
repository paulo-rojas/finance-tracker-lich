package com.projects.finance_tracker.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.AccountEntity;

public interface AccountRepository extends JpaRepository<AccountEntity, Long> {

    List<AccountEntity> findByDeletedAtIsNullOrderByNameAsc();

    List<AccountEntity> findByUserIdAndDeletedAtIsNullOrderByNameAsc(Long userId);
}
