package de.finanzmanager.budget;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Monatliches Budget einer Ausgaben-Kategorie; {@code month} ist immer der erste Tag des Monats. */
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false, updatable = false)
    private UUID categoryId;

    @Column(nullable = false, updatable = false)
    private LocalDate month;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Budget() {
    }

    public Budget(UUID userId, UUID categoryId, LocalDate month, long amountCents) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.categoryId = categoryId;
        this.month = month;
        this.amountCents = amountCents;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public LocalDate getMonth() {
        return month;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public void setAmountCents(long amountCents) {
        this.amountCents = amountCents;
    }
}
