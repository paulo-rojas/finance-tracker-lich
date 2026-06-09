package com.projects.finance_tracker.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.TransactionTypeEntity;

public interface TransactionTypeRepository extends JpaRepository<TransactionTypeEntity, Long> {

    Optional<TransactionTypeEntity> findByCode(String code);
}
