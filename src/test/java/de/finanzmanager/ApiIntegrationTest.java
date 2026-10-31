package de.finanzmanager;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.time.YearMonth;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    private MockHttpSession register(String email) throws Exception {
        MockHttpSession session = new MockHttpSession();
        mvc.perform(post("/api/auth/register").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"geheim123\"}"))
                .andExpect(status().isCreated());
        return session;
    }

    private String json(String body) {
        return body.replace('\'', '"');
    }

    private String categoryId(MockHttpSession session, String name) throws Exception {
        String body = mvc.perform(get("/api/categories").session(session))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.<java.util.List<String>>read(body, "$[?(@.name == '" + name + "')].id").getFirst();
    }

    @Test
    void apiRequiresLogin() throws Exception {
        mvc.perform(get("/api/categories")).andExpect(status().isUnauthorized());
    }

    @Test
    void writesRequireCsrfToken() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'email':'a@b.de','password':'x'}")))
                .andExpect(status().isForbidden());
    }

    @Test
    void pagesHaveCleanUrls() throws Exception {
        mvc.perform(get("/dashboard")).andExpect(forwardedUrl("/dashboard.html"));
    }

    @Test
    void registerCreatesDefaultCategoriesAndLoginWorks() throws Exception {
        MockHttpSession session = register("Neu@Example.de");
        mvc.perform(get("/api/auth/me").session(session)).andExpect(jsonPath("$.email").value("neu@example.de"));
        mvc.perform(get("/api/categories").session(session)).andExpect(jsonPath("$", hasSize(8)));

        mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'email':'neu@example.de','password':'geheim123'}")))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'email':'neu@example.de','password':'falsch123'}")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("E-Mail oder Passwort ist falsch."));

        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'email':'neu@example.de','password':'geheim123'}")))
                .andExpect(status().isOk());
    }

    @Test
    void transactionsBudgetsAndDashboard() throws Exception {
        MockHttpSession session = register("budget@example.de");
        String month = "2026-10";
        String food = categoryId(session, "Lebensmittel");
        String fun = categoryId(session, "Freizeit");
        String salary = categoryId(session, "Gehalt");

        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'INCOME','amount':'2.500','occurredOn':'2026-10-01','categoryId':'"
                                + salary + "'}")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'120,50','occurredOn':'2026-10-05','categoryId':'"
                                + food + "','note':'Wocheneinkauf'}")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'60','occurredOn':'2026-10-06','categoryId':'"
                                + fun + "'}")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'10','occurredOn':'2026-10-07'}")))
                .andExpect(status().isCreated());

        // Ungültige Eingaben
        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'abc','occurredOn':'2026-10-07'}")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/transactions").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'INCOME','amount':'5','occurredOn':'2026-10-07','categoryId':'"
                                + food + "'}")))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/transactions?month=" + month).session(session))
                .andExpect(jsonPath("$.transactions", hasSize(4)))
                .andExpect(jsonPath("$.incomeCents").value(250000))
                .andExpect(jsonPath("$.expenseCents").value(19050))
                .andExpect(jsonPath("$.transactions[0].categoryName").doesNotExist());

        mvc.perform(put("/api/budgets").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'categoryId':'" + food + "','month':'" + month + "','amount':'400'}")))
                .andExpect(status().isNoContent());
        mvc.perform(put("/api/budgets").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'categoryId':'" + fun + "','month':'" + month + "','amount':'50'}")))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/dashboard?month=" + month).session(session))
                .andExpect(jsonPath("$.balanceCents").value(250000 - 19050))
                .andExpect(jsonPath("$.budgetLeftCents").value(45000 - 18050))
                .andExpect(jsonPath("$.overBudget", contains("Freizeit")))
                .andExpect(jsonPath("$.spending[0].name").value("Lebensmittel"))
                .andExpect(jsonPath("$.spending[2].name").value("Ohne Kategorie"));

        // Vormonat übernehmen, dann ein Budget mit leerem Betrag entfernen
        String next = YearMonth.parse(month).plusMonths(1).toString();
        mvc.perform(post("/api/budgets/copy-previous?month=" + next).session(session).with(csrf()))
                .andExpect(jsonPath("$.copied").value(2));
        mvc.perform(put("/api/budgets").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'categoryId':'" + fun + "','month':'" + next + "','amount':''}")))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/budgets?month=" + next).session(session))
                .andExpect(jsonPath("$.totalBudgetCents").value(40000));

        // Kategorie löschen: Transaktion bleibt, Budget verschwindet
        mvc.perform(delete("/api/categories/" + food).session(session).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/transactions?month=" + month).session(session))
                .andExpect(jsonPath("$.transactions", hasSize(4)));
        mvc.perform(get("/api/budgets?month=" + next).session(session))
                .andExpect(jsonPath("$.totalBudgetCents").value(0));
    }

    @Test
    void usersCannotSeeOrChangeOtherUsersData() throws Exception {
        MockHttpSession alice = register("alice@example.de");
        MockHttpSession bob = register("bob@example.de");
        String aliceFood = categoryId(alice, "Lebensmittel");

        mvc.perform(post("/api/transactions").session(alice).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'5','occurredOn':'2026-10-07'}")))
                .andExpect(status().isCreated());
        String body = mvc.perform(get("/api/transactions?month=2026-10").session(alice))
                .andReturn().getResponse().getContentAsString();
        String aliceTransaction = JsonPath.read(body, "$.transactions[0].id");

        mvc.perform(get("/api/transactions?month=2026-10").session(bob))
                .andExpect(jsonPath("$.transactions", hasSize(0)));
        mvc.perform(delete("/api/transactions/" + aliceTransaction).session(bob).with(csrf()))
                .andExpect(status().isNotFound());
        mvc.perform(put("/api/categories/" + aliceFood).session(bob).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(json("{'name':'Gehackt'}")))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/transactions").session(bob).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'kind':'EXPENSE','amount':'5','occurredOn':'2026-10-07','categoryId':'"
                                + aliceFood + "'}")))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/categories/" + UUID.randomUUID()).session(bob).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void duplicateCategoryIsRejected() throws Exception {
        MockHttpSession session = register("kat@example.de");
        mvc.perform(post("/api/categories").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'name':'miete','kind':'EXPENSE'}")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Diese Kategorie gibt es schon."));
        mvc.perform(post("/api/categories").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'name':'Haustier','kind':'EXPENSE'}")))
                .andExpect(status().isCreated());
    }
}
