package de.finanzmanager.category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByUserIdOrderByNameAsc(UUID userId);

    List<Category> findByUserIdAndKindOrderByNameAsc(UUID userId, CategoryKind kind);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCaseAndKind(UUID userId, String name, CategoryKind kind);
}
