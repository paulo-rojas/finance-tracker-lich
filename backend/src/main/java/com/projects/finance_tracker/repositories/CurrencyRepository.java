
package com.projects.finance_tracker.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projects.finance_tracker.entities.CurrencyEntity;


public interface CurrencyRepository extends JpaRepository<CurrencyEntity, Long> {

}
