package de.finanzmanager.user;

import de.finanzmanager.category.CategoryService;
import de.finanzmanager.common.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Registrierung, Login und aktueller Nutzer. Abmelden übernimmt Spring Security unter POST /api/auth/logout. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record Credentials(String email, String password) {
    }

    public record MeResponse(String email) {
    }

    private final AppUserRepository users;
    private final CategoryService categories;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(AppUserRepository users, CategoryService categories, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository) {
        this.users = users;
        this.categories = categories;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public MeResponse register(@RequestBody Credentials credentials, HttpServletRequest request,
            HttpServletResponse response) {
        String email = AppUserDetailsService.normalizeEmail(credentials.email());
        String password = credentials.password() == null ? "" : credentials.password();
        if (email.isEmpty() || !email.contains("@") || email.length() > 255) {
            throw ApiException.badRequest("Bitte eine gültige E-Mail-Adresse eingeben.");
        }
        if (password.length() < 8) {
            throw ApiException.badRequest("Das Passwort muss mindestens 8 Zeichen haben.");
        }
        if (password.length() > 72) {
            throw ApiException.badRequest("Das Passwort darf höchstens 72 Zeichen haben.");
        }
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("Für diese E-Mail-Adresse gibt es schon ein Konto.");
        }
        AppUser user = users.save(new AppUser(email, passwordEncoder.encode(password)));
        categories.createDefaults(user.getId());
        users.flush();

        signIn(email, password, request, response);
        return new MeResponse(email);
    }

    @PostMapping("/login")
    public MeResponse login(@RequestBody Credentials credentials, HttpServletRequest request,
            HttpServletResponse response) {
        String email = AppUserDetailsService.normalizeEmail(credentials.email());
        String password = credentials.password() == null ? "" : credentials.password();
        if (email.isEmpty() || password.isEmpty()) {
            throw ApiException.badRequest("Bitte E-Mail und Passwort eingeben.");
        }
        signIn(email, password, request, response);
        return new MeResponse(email);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal AppUserPrincipal user) {
        return new MeResponse(user.email());
    }

    private void signIn(String email, String password, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, password));
        } catch (AuthenticationException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "E-Mail oder Passwort ist falsch.");
        }
        // Neue Session-ID nach dem Login (Schutz vor Session Fixation).
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
