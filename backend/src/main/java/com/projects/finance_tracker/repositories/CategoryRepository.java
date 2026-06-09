package com.projects.finance_tracker.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.finance_tracker.entities.CategoryEntity;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    List<CategoryEntity> findByIsActiveTrueOrderByNameAsc();
}
