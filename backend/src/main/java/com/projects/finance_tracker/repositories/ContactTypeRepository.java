package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.ContactTypeEntity;

public interface ContactTypeRepository extends JpaRepository<ContactTypeEntity, Long> {

}
