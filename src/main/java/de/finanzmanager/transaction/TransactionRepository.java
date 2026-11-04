package de.finanzmanager.transaction;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    /** Transaktionen im Zeitraum [start, end), neueste zuerst. */
    @Query("""
            select t from Transaction t
            where t.userId = :userId and t.occurredOn >= :start and t.occurredOn < :end
            order by t.occurredOn desc, t.createdAt desc
            """)
    List<Transaction> findInRange(@Param("userId") UUID userId, @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Query("update Transaction t set t.categoryId = null where t.userId = :userId and t.categoryId = :categoryId")
    void clearCategory(@Param("userId") UUID userId, @Param("categoryId") UUID categoryId);
}
