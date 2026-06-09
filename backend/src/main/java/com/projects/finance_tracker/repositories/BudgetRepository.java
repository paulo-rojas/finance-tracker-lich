package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.BudgetEntity;

public interface BudgetRepository extends JpaRepository<BudgetEntity, Long> {

}
