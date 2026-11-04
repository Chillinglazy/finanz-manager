package de.finanzmanager.category;

import de.finanzmanager.budget.BudgetRepository;
import de.finanzmanager.common.ApiException;
import de.finanzmanager.transaction.TransactionRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private static final List<String> DEFAULT_INCOME = List.of("Gehalt", "Sonstige Einnahmen");
    private static final List<String> DEFAULT_EXPENSE =
            List.of("Miete", "Lebensmittel", "Transport", "Freizeit", "Versicherungen", "Sonstiges");

    private final CategoryRepository categories;
    private final TransactionRepository transactions;
    private final BudgetRepository budgets;

    public CategoryService(CategoryRepository categories, TransactionRepository transactions, BudgetRepository budgets) {
        this.categories = categories;
        this.transactions = transactions;
        this.budgets = budgets;
    }

    @Transactional(readOnly = true)
    public List<Category> list(UUID userId) {
        return categories.findByUserIdOrderByNameAsc(userId);
    }

    /** Legt die Standard-Kategorien für einen neuen Nutzer an. */
    @Transactional
    public void createDefaults(UUID userId) {
        DEFAULT_INCOME.forEach(name -> categories.save(new Category(userId, name, CategoryKind.INCOME)));
        DEFAULT_EXPENSE.forEach(name -> categories.save(new Category(userId, name, CategoryKind.EXPENSE)));
    }

    @Transactional
    public Category create(UUID userId, String rawName, CategoryKind kind) {
        String name = validateName(rawName);
        CategoryKind safeKind = kind == null ? CategoryKind.EXPENSE : kind;
        ensureUnique(userId, name, safeKind);
        return categories.save(new Category(userId, name, safeKind));
    }

    @Transactional
    public Category rename(UUID userId, UUID id, String rawName) {
        Category category = get(userId, id);
        String name = validateName(rawName);
        if (!name.equalsIgnoreCase(category.getName())) {
            ensureUnique(userId, name, category.getKind());
        }
        category.setName(name);
        return category;
    }

    /** Transaktionen behalten ihren Betrag und verlieren nur die Kategorie; Budgets werden mitgelöscht. */
    @Transactional
    public void delete(UUID userId, UUID id) {
        Category category = get(userId, id);
        transactions.clearCategory(userId, category.getId());
        budgets.deleteByUserIdAndCategoryId(userId, category.getId());
        categories.delete(category);
    }

    public Category get(UUID userId, UUID id) {
        return categories.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Kategorie nicht gefunden."));
    }

    private void ensureUnique(UUID userId, String name, CategoryKind kind) {
        if (categories.existsByUserIdAndNameIgnoreCaseAndKind(userId, name, kind)) {
            throw ApiException.conflict("Diese Kategorie gibt es schon.");
        }
    }

    private static String validateName(String rawName) {
        String name = rawName == null ? "" : rawName.trim();
        if (name.isEmpty()) {
            throw ApiException.badRequest("Bitte einen Namen eingeben.");
        }
        if (name.length() > 50) {
            throw ApiException.badRequest("Der Name darf höchstens 50 Zeichen haben.");
        }
        return name;
    }
}
