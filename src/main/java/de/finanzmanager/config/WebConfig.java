package de.finanzmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Schöne URLs wie /dashboard für die statischen Seiten in src/main/resources/static. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String[] PAGES = {"login", "registrieren", "dashboard", "transaktionen", "budgets",
            "kategorien"};

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String page : PAGES) {
            registry.addViewController("/" + page).setViewName("forward:/" + page + ".html");
        }
    }
}
