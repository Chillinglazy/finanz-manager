package de.finanzmanager.common;

import java.util.regex.Pattern;

/** Euro-Beträge: Eingaben wie "12,50" in Cent umwandeln. Geld wird immer als long in Cent geführt. */
public final class Money {

    private static final Pattern THOUSANDS_DOT = Pattern.compile("\\.(?=\\d{3}(\\D|$))");
    private static final Pattern VALID = Pattern.compile("^\\d+(\\.\\d{1,2})?$");

    private Money() {
    }

    /**
     * Wandelt "12,50", "1.234,5", "7" oder "7 €" in Cent um.
     *
     * @return Cent oder {@code null} bei ungültiger Eingabe
     */
    public static Long parseEuroToCents(String input) {
        if (input == null) {
            return null;
        }
        String normalized = input.trim().replaceAll("\\s|€", "");
        normalized = THOUSANDS_DOT.matcher(normalized).replaceAll("").replace(',', '.');
        if (!VALID.matcher(normalized).matches() || normalized.length() > 15) {
            return null;
        }
        String[] parts = normalized.split("\\.");
        long whole = Long.parseLong(parts[0]);
        String fraction = parts.length > 1 ? parts[1] : "";
        while (fraction.length() < 2) {
            fraction += "0";
        }
        return whole * 100 + Long.parseLong(fraction);
    }
}
