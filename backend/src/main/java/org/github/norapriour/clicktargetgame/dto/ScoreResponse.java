package org.github.norapriour.clicktargetgame.dto;

import java.time.LocalDate;

public class ScoreResponse {
    private final int score;
    private final LocalDate date;

    public ScoreResponse(int score, LocalDate date) {
        this.score = score;
        this.date = date;
    }

    public int getScore() {
        return score;
    }

    public LocalDate getDate() {
        return date;
    }
}