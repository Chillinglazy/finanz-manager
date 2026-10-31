package de.finanzmanager.common;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;

/** Monate werden in der API als "YYYY-MM" übergeben, z. B. ?month=2026-10. */
public final class Months {

    private Months() {
    }

    /** Liest "YYYY-MM"; leer oder ungültig ergibt den aktuellen Monat. */
    public static YearMonth parseOrCurrent(String value) {
        if (value == null || value.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(value.trim());
        } catch (DateTimeParseException e) {
            return YearMonth.now();
        }
    }

    /** Liest "YYYY-MM" streng; ungültig ergibt einen 400-Fehler. */
    public static YearMonth parseStrict(String value) {
        try {
            return YearMonth.parse(value == null ? "" : value.trim());
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("Ungültiger Monat.");
        }
    }

    public static LocalDate firstDay(YearMonth month) {
        return month.atDay(1);
    }
}
