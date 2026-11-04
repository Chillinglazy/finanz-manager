package de.finanzmanager.budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserIdAndMonth(UUID userId, LocalDate month);

    Optional<Budget> findByUserIdAndCategoryIdAndMonth(UUID userId, UUID categoryId, LocalDate month);

    @Modifying
    @Query("delete from Budget b where b.userId = :userId and b.categoryId = :categoryId")
    void deleteByUserIdAndCategoryId(@Param("userId") UUID userId, @Param("categoryId") UUID categoryId);
}
