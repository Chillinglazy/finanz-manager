package de.finanzmanager.category;

import de.finanzmanager.user.AppUserPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    public record CategoryDto(UUID id, String name, CategoryKind kind, String color) {
        static CategoryDto of(Category c) {
            return new CategoryDto(c.getId(), c.getName(), c.getKind(), c.getColor());
        }
    }

    public record CreateRequest(String name, CategoryKind kind) {
    }

    public record RenameRequest(String name) {
    }

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoryDto> list(@AuthenticationPrincipal AppUserPrincipal user) {
        return service.list(user.id()).stream().map(CategoryDto::of).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto create(@AuthenticationPrincipal AppUserPrincipal user, @RequestBody CreateRequest request) {
        return CategoryDto.of(service.create(user.id(), request.name(), request.kind()));
    }

    @PutMapping("/{id}")
    public CategoryDto rename(@AuthenticationPrincipal AppUserPrincipal user, @PathVariable UUID id,
            @RequestBody RenameRequest request) {
        return CategoryDto.of(service.rename(user.id(), id, request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AppUserPrincipal user, @PathVariable UUID id) {
        service.delete(user.id(), id);
    }
}
