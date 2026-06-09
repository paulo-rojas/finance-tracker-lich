package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.TransactionAttachmentEntity;

public interface TransactionAttachmentRepository extends JpaRepository<TransactionAttachmentEntity, Long> {

}
