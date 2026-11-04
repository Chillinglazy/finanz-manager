package de.finanzmanager.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class MoneyTest {

    @Test
    void parsesGermanAmounts() {
        assertEquals(1250L, Money.parseEuroToCents("12,50"));
        assertEquals(123450L, Money.parseEuroToCents("1.234,5"));
        assertEquals(700L, Money.parseEuroToCents("7"));
        assertEquals(700L, Money.parseEuroToCents(" 7 € "));
        assertEquals(1999L, Money.parseEuroToCents("19.99"));
        assertEquals(100000000L, Money.parseEuroToCents("1.000.000"));
    }

    @Test
    void rejectsInvalidAmounts() {
        assertNull(Money.parseEuroToCents(null));
        assertNull(Money.parseEuroToCents(""));
        assertNull(Money.parseEuroToCents("abc"));
        assertNull(Money.parseEuroToCents("-5"));
        assertNull(Money.parseEuroToCents("1,234"));
        assertNull(Money.parseEuroToCents("99999999999999999999"));
    }
}
