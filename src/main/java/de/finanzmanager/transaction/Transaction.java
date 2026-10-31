package de.finanzmanager.transaction;

import de.finanzmanager.category.CategoryKind;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Eine Einnahme oder Ausgabe. Der Betrag ist immer positiv, die Richtung steht in {@link #getKind()}. */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CategoryKind kind;

    @Column(name = "occurred_on", nullable = false)
    private LocalDate occurredOn;

    @Column(length = 200)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Transaction() {
    }

    public Transaction(UUID userId, UUID categoryId, long amountCents, CategoryKind kind, LocalDate occurredOn,
            String note) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.categoryId = categoryId;
        this.amountCents = amountCents;
        this.kind = kind;
        this.occurredOn = occurredOn;
        this.note = note;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public CategoryKind getKind() {
        return kind;
    }

    public LocalDate getOccurredOn() {
        return occurredOn;
    }

    public String getNote() {
        return note;
    }
}
