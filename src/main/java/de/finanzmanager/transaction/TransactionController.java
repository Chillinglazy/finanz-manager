package de.finanzmanager.transaction;

import de.finanzmanager.category.Category;
import de.finanzmanager.category.CategoryKind;
import de.finanzmanager.category.CategoryService;
import de.finanzmanager.common.Months;
import de.finanzmanager.user.AppUserPrincipal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    public record TransactionDto(UUID id, CategoryKind kind, long amountCents, LocalDate occurredOn, String note,
            UUID categoryId, String categoryName) {
    }

    public record MonthResponse(String month, long incomeCents, long expenseCents, long balanceCents,
            List<TransactionDto> transactions) {
    }

    /** Betrag als Text wie "12,50"; das Backend rechnet in Cent um. */
    public record CreateRequest(CategoryKind kind, String amount, String occurredOn, UUID categoryId, String note) {
    }

    private final TransactionService service;
    private final CategoryService categories;

    public TransactionController(TransactionService service, CategoryService categories) {
        this.service = service;
        this.categories = categories;
    }

    @GetMapping
    public MonthResponse list(@AuthenticationPrincipal AppUserPrincipal user,
            @RequestParam(required = false) String month) {
        YearMonth ym = Months.parseOrCurrent(month);
        Map<UUID, String> names = categories.list(user.id()).stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
        List<TransactionDto> items = service.listMonth(user.id(), ym).stream()
                .map(t -> new TransactionDto(t.getId(), t.getKind(), t.getAmountCents(), t.getOccurredOn(),
                        t.getNote(), t.getCategoryId(), names.get(t.getCategoryId())))
                .toList();
        long income = sum(items, CategoryKind.INCOME);
        long expense = sum(items, CategoryKind.EXPENSE);
        return new MonthResponse(ym.toString(), income, expense, income - expense, items);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@AuthenticationPrincipal AppUserPrincipal user, @RequestBody CreateRequest request) {
        service.create(user.id(), request.kind(), request.amount(), request.occurredOn(), request.categoryId(),
                request.note());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AppUserPrincipal user, @PathVariable UUID id) {
        service.delete(user.id(), id);
    }

    private static long sum(List<TransactionDto> items, CategoryKind kind) {
        return items.stream().filter(t -> t.kind() == kind).mapToLong(TransactionDto::amountCents).sum();
    }
}
