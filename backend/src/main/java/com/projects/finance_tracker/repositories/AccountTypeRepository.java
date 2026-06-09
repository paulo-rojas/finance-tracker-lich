package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.AccountTypeEntity;

public interface AccountTypeRepository extends JpaRepository<AccountTypeEntity, Long> {

}
