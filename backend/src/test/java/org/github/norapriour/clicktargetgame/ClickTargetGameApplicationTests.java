package org.github.norapriour.clicktargetgame;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Objects;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class ClickTargetGameApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerAutomaticallyLogsUserIn() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "username": "test-user",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("User created"))
                .andReturn();

        mockMvc.perform(get("/api/me")
                        .session((MockHttpSession) Objects.requireNonNull(registerResult.getRequest().getSession(false))))
                .andExpect(status().isOk())
                .andExpect(content().string("test-user"));
    }

    @Test
    void registerRejectsInvalidUsername() throws Exception {
        mockMvc.perform(post("/api/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "username": "<script>",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(
                        "Le pseudo doit contenir entre 3 et 20 caractères : lettres, chiffres, _ ou -."
                ));
    }

    @Test
    void loginRejectsBadCredentials() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "username": "unknown-user",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(
                        "Pseudo ou mot de passe invalide."
                ));
    }

    @Test
    void authenticatedUserCanSaveAndReadScore() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "username": "score-user",
                                  "password": "password123"
                                }
                                """))
                .andReturn();

        MockHttpSession session = (MockHttpSession) Objects.requireNonNull(
                registerResult.getRequest().getSession(false)
        );

        mockMvc.perform(post("/api/scores")
                        .session(session)
                        .contentType("application/json")
                        .content("""
                                {
                                  "score": 42
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Score saved"));

        mockMvc.perform(get("/api/scores/me")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].score").value(42))
                .andExpect(jsonPath("$[0].date").exists())
                .andExpect(jsonPath("$[0].user").doesNotExist());
    }

    @Test
    void anonymousUserCannotSaveScore() throws Exception {
        mockMvc.perform(post("/api/scores")
                        .contentType("application/json")
                        .content("""
                                {
                                  "score": 42
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void logoutRemovesAccessToProtectedRoutes() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "username": "logout-user",
                                  "password": "password123"
                                }
                                """))
                .andReturn();

        MockHttpSession session = (MockHttpSession) Objects.requireNonNull(
                registerResult.getRequest().getSession(false)
        );

        mockMvc.perform(post("/api/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/scores/me").session(session))
                .andExpect(status().isForbidden());
    }
}