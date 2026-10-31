package de.finanzmanager.budget;

import de.finanzmanager.category.Category;
import de.finanzmanager.category.CategoryKind;
import de.finanzmanager.category.CategoryRepository;
import de.finanzmanager.category.CategoryService;
import de.finanzmanager.common.ApiException;
import de.finanzmanager.common.Money;
import de.finanzmanager.transaction.Transaction;
import de.finanzmanager.transaction.TransactionService;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BudgetService {

    private final BudgetRepository budgets;
    private final CategoryRepository categoryRepository;
    private final CategoryService categories;
    private final TransactionService transactions;

    public BudgetService(BudgetRepository budgets, CategoryRepository categoryRepository, CategoryService categories,
            TransactionService transactions) {
        this.budgets = budgets;
        this.categoryRepository = categoryRepository;
        this.categories = categories;
        this.transactions = transactions;
    }

    /** Budgets und Ausgaben pro Ausgaben-Kategorie für einen Monat (auch fürs Dashboard). */
    @Transactional(readOnly = true)
    public BudgetOverview overview(UUID userId, YearMonth month) {
        Map<UUID, Long> budgetByCategory = budgets.findByUserIdAndMonth(userId, month.atDay(1)).stream()
                .collect(Collectors.toMap(Budget::getCategoryId, Budget::getAmountCents));

        Map<UUID, Long> spentByCategory = new HashMap<>();
        long income = 0;
        long expense = 0;
        for (Transaction t : transactions.listMonth(userId, month)) {
            if (t.getKind() == CategoryKind.INCOME) {
                income += t.getAmountCents();
                continue;
            }
            expense += t.getAmountCents();
            if (t.getCategoryId() != null) {
                spentByCategory.merge(t.getCategoryId(), t.getAmountCents(), Long::sum);
            }
        }

        List<BudgetOverview.Row> rows = categoryRepository
                .findByUserIdAndKindOrderByNameAsc(userId, CategoryKind.EXPENSE).stream()
                .map(c -> new BudgetOverview.Row(c.getId(), c.getName(), budgetByCategory.get(c.getId()),
                        spentByCategory.getOrDefault(c.getId(), 0L)))
                .toList();
        return new BudgetOverview(rows, income, expense);
    }

    /** Setzt das Budget; ein leerer Betrag entfernt es. */
    @Transactional
    public void save(UUID userId, UUID categoryId, YearMonth month, String amount) {
        Category category = categories.get(userId, categoryId);
        if (category.getKind() != CategoryKind.EXPENSE) {
            throw ApiException.badRequest("Budgets gibt es nur für Ausgaben-Kategorien.");
        }
        LocalDate first = month.atDay(1);
        var existing = budgets.findByUserIdAndCategoryIdAndMonth(userId, categoryId, first);

        if (amount == null || amount.isBlank()) {
            existing.ifPresent(budgets::delete);
            return;
        }
        Long cents = Money.parseEuroToCents(amount);
        if (cents == null) {
            throw ApiException.badRequest("Ungültiger Betrag.");
        }
        existing.ifPresentOrElse(
                budget -> budget.setAmountCents(cents),
                () -> budgets.save(new Budget(userId, categoryId, first, cents)));
    }

    /** Übernimmt alle Budgets des Vormonats, ohne bestehende Budgets zu überschreiben. */
    @Transactional
    public int copyPreviousMonth(UUID userId, YearMonth month) {
        LocalDate first = month.atDay(1);
        var existing = budgets.findByUserIdAndMonth(userId, first).stream()
                .map(Budget::getCategoryId)
                .collect(Collectors.toSet());
        int copied = 0;
        for (Budget previous : budgets.findByUserIdAndMonth(userId, month.minusMonths(1).atDay(1))) {
            if (!existing.contains(previous.getCategoryId())) {
                budgets.save(new Budget(userId, previous.getCategoryId(), first, previous.getAmountCents()));
                copied++;
            }
        }
        return copied;
    }
}
