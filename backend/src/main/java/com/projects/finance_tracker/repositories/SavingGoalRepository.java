package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.SavingGoalEntity;

public interface SavingGoalRepository extends JpaRepository<SavingGoalEntity, Long> {

}
