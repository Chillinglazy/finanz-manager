package de.finanzmanager.budget;

import de.finanzmanager.common.ApiException;
import de.finanzmanager.common.Months;
import de.finanzmanager.user.AppUserPrincipal;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    public record BudgetsResponse(String month, long totalBudgetCents, long totalSpentCents,
            List<BudgetOverview.Row> rows) {
    }

    /** Betrag als Text wie "400" oder "12,50"; leer entfernt das Budget. */
    public record SaveRequest(UUID categoryId, String month, String amount) {
    }

    public record CopyResponse(int copied) {
    }

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public BudgetsResponse list(@AuthenticationPrincipal AppUserPrincipal user,
            @RequestParam(required = false) String month) {
        YearMonth ym = Months.parseOrCurrent(month);
        BudgetOverview overview = service.overview(user.id(), ym);
        long totalBudget = overview.rows().stream().filter(BudgetOverview.Row::hasBudget)
                .mapToLong(BudgetOverview.Row::budgetCents).sum();
        long totalSpent = overview.rows().stream().filter(BudgetOverview.Row::hasBudget)
                .mapToLong(BudgetOverview.Row::spentCents).sum();
        return new BudgetsResponse(ym.toString(), totalBudget, totalSpent, overview.rows());
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void save(@AuthenticationPrincipal AppUserPrincipal user, @RequestBody SaveRequest request) {
        if (request.categoryId() == null) {
            throw ApiException.badRequest("Kategorie fehlt.");
        }
        service.save(user.id(), request.categoryId(), Months.parseStrict(request.month()), request.amount());
    }

    @PostMapping("/copy-previous")
    public CopyResponse copyPrevious(@AuthenticationPrincipal AppUserPrincipal user, @RequestParam String month) {
        return new CopyResponse(service.copyPreviousMonth(user.id(), Months.parseStrict(month)));
    }
}
