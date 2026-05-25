package org.github.norapriour.clicktargetgame.dto;

import java.time.LocalDate;

public class LeaderboardResponse {
    private String username;
    private int score;
    private LocalDate date;

    public LeaderboardResponse(String username, int score, LocalDate date) {
        this.username = username;
        this.score = score;
        this.date = date;
    }

    public String getUsername() {
        return username;
    }

    public int getScore() {
        return score;
    }

    public LocalDate getDate() {
        return date;
    }
}