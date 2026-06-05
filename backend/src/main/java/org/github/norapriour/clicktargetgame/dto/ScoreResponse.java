package org.github.norapriour.clicktargetgame.dto;

import java.time.LocalDateTime;

public class ScoreResponse {
    private final int score;
    private final LocalDateTime date;

    public ScoreResponse(int score, LocalDateTime date) {
        this.score = score;
        this.date = date;
    }

    public int getScore() {
        return score;
    }

    public LocalDateTime getDate() {
        return date;
    }
}