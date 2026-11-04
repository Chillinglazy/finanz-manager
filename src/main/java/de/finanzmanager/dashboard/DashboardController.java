package de.finanzmanager.dashboard;

import de.finanzmanager.budget.BudgetOverview;
import de.finanzmanager.budget.BudgetService;
import de.finanzmanager.common.Months;
import de.finanzmanager.user.AppUserPrincipal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Monatsübersicht: Summen, Budget-Status und Ausgaben nach Kategorie. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    public record Spending(String name, long cents) {
    }

    /** {@code budgetLeftCents} ist null, wenn für den Monat keine Budgets festgelegt sind. */
    public record DashboardResponse(String month, long incomeCents, long expenseCents, long balanceCents,
            Long budgetLeftCents, List<BudgetOverview.Row> budgets, List<String> overBudget,
            List<Spending> spending) {
    }

    private final BudgetService budgets;

    public DashboardController(BudgetService budgets) {
        this.budgets = budgets;
    }

    @GetMapping
    public DashboardResponse get(@AuthenticationPrincipal AppUserPrincipal user,
            @RequestParam(required = false) String month) {
        YearMonth ym = Months.parseOrCurrent(month);
        BudgetOverview overview = budgets.overview(user.id(), ym);

        List<BudgetOverview.Row> budgeted = overview.rows().stream().filter(BudgetOverview.Row::hasBudget).toList();
        Long budgetLeft = budgeted.isEmpty() ? null
                : budgeted.stream().mapToLong(r -> r.budgetCents() - r.spentCents()).sum();
        List<String> overBudget = budgeted.stream().filter(BudgetOverview.Row::isOverBudget)
                .map(BudgetOverview.Row::categoryName).toList();

        List<Spending> spending = new ArrayList<>(overview.rows().stream()
                .filter(r -> r.spentCents() > 0)
                .map(r -> new Spending(r.categoryName(), r.spentCents()))
                .toList());
        long categorized = overview.rows().stream().mapToLong(BudgetOverview.Row::spentCents).sum();
        long uncategorized = overview.expenseCents() - categorized;
        if (uncategorized > 0) {
            spending.add(new Spending("Ohne Kategorie", uncategorized));
        }
        spending.sort(Comparator.comparingLong(Spending::cents).reversed());

        return new DashboardResponse(ym.toString(), overview.incomeCents(), overview.expenseCents(),
                overview.incomeCents() - overview.expenseCents(), budgetLeft, budgeted, overBudget, spending);
    }
}
