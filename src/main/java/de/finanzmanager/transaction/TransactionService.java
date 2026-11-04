package de.finanzmanager.transaction;

import de.finanzmanager.category.Category;
import de.finanzmanager.category.CategoryKind;
import de.finanzmanager.category.CategoryService;
import de.finanzmanager.common.ApiException;
import de.finanzmanager.common.Money;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final CategoryService categories;

    public TransactionService(TransactionRepository transactions, CategoryService categories) {
        this.transactions = transactions;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<Transaction> listMonth(UUID userId, YearMonth month) {
        return transactions.findInRange(userId, month.atDay(1), month.plusMonths(1).atDay(1));
    }

    @Transactional
    public Transaction create(UUID userId, CategoryKind kind, String amount, String occurredOn, UUID categoryId,
            String rawNote) {
        CategoryKind safeKind = kind == null ? CategoryKind.EXPENSE : kind;
        Long amountCents = Money.parseEuroToCents(amount);
        if (amountCents == null || amountCents <= 0) {
            throw ApiException.badRequest("Bitte einen gültigen Betrag größer 0 eingeben, z. B. 12,50.");
        }
        LocalDate date = parseDate(occurredOn);
        String note = rawNote == null || rawNote.isBlank() ? null : rawNote.trim();
        if (note != null && note.length() > 200) {
            throw ApiException.badRequest("Die Notiz darf höchstens 200 Zeichen haben.");
        }
        if (categoryId != null) {
            Category category = categories.get(userId, categoryId);
            if (category.getKind() != safeKind) {
                throw ApiException.badRequest("Die Kategorie passt nicht zur Art (Einnahme/Ausgabe).");
            }
        }
        return transactions.save(new Transaction(userId, categoryId, amountCents, safeKind, date, note));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Transaction transaction = transactions.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Transaktion nicht gefunden."));
        transactions.delete(transaction);
    }

    private static LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value == null ? "" : value.trim());
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("Bitte ein gültiges Datum wählen.");
        }
    }
}
