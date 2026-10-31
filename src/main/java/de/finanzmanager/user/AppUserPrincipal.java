package de.finanzmanager.user;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Angemeldeter Nutzer; in Controllern per {@code @AuthenticationPrincipal} verfügbar. */
public record AppUserPrincipal(UUID id, String email, String passwordHash) implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
