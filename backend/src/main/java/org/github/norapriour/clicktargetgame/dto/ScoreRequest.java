package org.github.norapriour.clicktargetgame.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class ScoreRequest {
    @Min(0)
    @Max(300)
    private int score;

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}