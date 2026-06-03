package org.github.norapriour.clicktargetgame.dto;

import java.time.LocalDateTime;

public class LeaderboardResponse {
    private String username;
    private int score;
    private LocalDateTime date;

    public LeaderboardResponse(String username, int score, LocalDateTime date) {
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

    public LocalDateTime getDate() {
        return date;
    }
}