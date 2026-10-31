package de.finanzmanager.budget;

import java.util.List;
import java.util.UUID;

/** Ausgaben-Kategorien eines Monats mit Budget (null = keins) und tatsächlichen Ausgaben. */
public record BudgetOverview(List<Row> rows, long incomeCents, long expenseCents) {

    public record Row(UUID categoryId, String categoryName, Long budgetCents, long spentCents) {

        public boolean hasBudget() {
            return budgetCents != null;
        }

        public boolean isOverBudget() {
            return budgetCents != null && spentCents > budgetCents;
        }
    }
}
