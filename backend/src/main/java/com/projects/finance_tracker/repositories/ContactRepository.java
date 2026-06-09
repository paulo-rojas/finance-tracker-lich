package com.projects.finance_tracker.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.ContactEntity;

public interface ContactRepository extends JpaRepository<ContactEntity, Long> {

    List<ContactEntity> findByDeletedAtIsNullOrderByNameAsc();

    List<ContactEntity> findByUserIdAndDeletedAtIsNullOrderByNameAsc(Long userId);
}
